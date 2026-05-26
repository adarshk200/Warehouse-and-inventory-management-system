package com.humancloud.wims.service;

import com.humancloud.wims.config.RabbitMQConfig;
import com.humancloud.wims.dto.OrderItemRequest;
import com.humancloud.wims.dto.OrderRequest;
import com.humancloud.wims.entity.*;
import com.humancloud.wims.repository.CustomerRepository;
import com.humancloud.wims.repository.OrderRepository;
import com.humancloud.wims.repository.ProductRepository;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private InventoryService inventoryService;
    @Autowired
    private RedisLockService redisLockService;
    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Transactional
    public Order createOrder(OrderRequest request) {
        // 0. Handle backward compatibility for single-item order requests
        if ((request.getItems() == null || request.getItems().isEmpty()) && request.getProductId() != null) {
            OrderItemRequest legacyItem = new OrderItemRequest();
            legacyItem.setProductId(request.getProductId());
            legacyItem.setQuantity(request.getQuantity() != null ? request.getQuantity() : 1);
            List<OrderItemRequest> legacyItems = new ArrayList<>();
            legacyItems.add(legacyItem);
            request.setItems(legacyItems);
        }

        // 1. Validate customer (with fallback for legacy frontend requests that don't send customerId)
        Customer customer;
        if (request.getCustomerId() == null) {
            List<Customer> allCustomers = customerRepository.findAll();
            if (!allCustomers.isEmpty()) {
                customer = allCustomers.get(0);
            } else {
                customer = new Customer();
                customer.setName("Default Customer");
                customer.setEmail("default.customer@humancloud.com");
                customer.setPhone("123-456-7890");
                customer.setAddress("123 Enterprise Way");
                customer = customerRepository.save(customer);
            }
        } else {
            customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + request.getCustomerId()));
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Order must contain at least one item.");
        }

        // 2. Create the Order shell
        Order order = new Order();
        order.setStatus("PROCESSING");
        order.setCustomer(customer);

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        // 3. Process each item
        for (OrderItemRequest itemReq : request.getItems()) {
            String lockKey = "LOCK_PRODUCT_" + itemReq.getProductId();
            boolean acquired = redisLockService.acquireLock(lockKey);
            if (!acquired) {
                throw new RuntimeException("High traffic: Could not process order for product " + itemReq.getProductId() + ". Please try again.");
            }

            try {
                // Allocate stock from inventory (returns the warehouse used)
                Warehouse warehouseUsed = inventoryService.allocateStock(itemReq.getProductId(), itemReq.getQuantity());

                // Get product details for pricing
                Product product = productRepository.findById(itemReq.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found: " + itemReq.getProductId()));

                BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));

                // Create OrderItem
                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(order);
                orderItem.setProduct(product);
                orderItem.setWarehouse(warehouseUsed);
                orderItem.setQuantity(itemReq.getQuantity());
                orderItem.setPrice(itemTotal);

                orderItems.add(orderItem);
                totalAmount = totalAmount.add(itemTotal);
            } finally {
                redisLockService.releaseLock(lockKey);
            }
        }

        order.setItems(orderItems);
        order.setTotalAmount(totalAmount);
        order = orderRepository.save(order);

        // 4. Send Async Notification
        try {
            rabbitTemplate.convertAndSend(RabbitMQConfig.NOTIFICATION_QUEUE,
                    "Order created successfully! ID: " + order.getId() + " | Items: " + orderItems.size() + " | Total: ₹" + totalAmount);
        } catch (Exception e) {
            System.err.println("RabbitMQ is offline. Order notification logged: Order created successfully! ID: " + order.getId());
        }

        return order;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order getOrderById(UUID id) {
        return orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
    }

    @Transactional
    public Order updateOrderStatus(UUID id, String status) {
        Order order = getOrderById(id);
        String oldStatus = order.getStatus();
        String newStatus = status.trim().toUpperCase();

        if (oldStatus.equals(newStatus)) {
            return order;
        }

        // Handle inventory release on SHIPPING — iterate all items
        if (newStatus.equals("SHIPPED") && !oldStatus.equals("SHIPPED")) {
            for (OrderItem item : order.getItems()) {
                if (item.getProduct() != null && item.getWarehouse() != null) {
                    inventoryService.releaseReservedStock(
                            item.getProduct().getId(),
                            item.getWarehouse().getId(),
                            item.getQuantity());
                }
            }
        }

        // Handle stock restoration on CANCELLATION — iterate all items
        if (newStatus.equals("CANCELLED") && !oldStatus.equals("CANCELLED") && !oldStatus.equals("SHIPPED")) {
            for (OrderItem item : order.getItems()) {
                if (item.getProduct() != null && item.getWarehouse() != null) {
                    inventoryService.restoreStock(
                            item.getProduct().getId(),
                            item.getWarehouse().getId(),
                            item.getQuantity());
                }
            }
        }

        order.setStatus(newStatus);
        Order updated = orderRepository.save(order);

        try {
            rabbitTemplate.convertAndSend(RabbitMQConfig.NOTIFICATION_QUEUE,
                    String.format("Order Status Updated to %s for Order ID: %s", newStatus, order.getId()));
        } catch (Exception e) {
            System.err.println("RabbitMQ offline. Logged Order Status Update event: " +
                    String.format("Order Status Updated to %s for Order ID: %s", newStatus, order.getId()));
        }

        return updated;
    }

    @Transactional
    public void deleteOrder(UUID id) {
        Order order = getOrderById(id);
        // If deleting a non-shipped and non-cancelled order, restore the stock for ALL items
        if (!order.getStatus().equals("SHIPPED") && !order.getStatus().equals("CANCELLED")) {
            for (OrderItem item : order.getItems()) {
                if (item.getProduct() != null && item.getWarehouse() != null) {
                    inventoryService.restoreStock(
                            item.getProduct().getId(),
                            item.getWarehouse().getId(),
                            item.getQuantity());
                }
            }
        }
        orderRepository.deleteById(id);
    }
}
