package com.humancloud.wims.service;

import com.humancloud.wims.config.RabbitMQConfig;
import com.humancloud.wims.dto.OrderRequest;
import com.humancloud.wims.entity.Order;
import com.humancloud.wims.entity.Product;
import com.humancloud.wims.entity.Warehouse;
import com.humancloud.wims.repository.OrderRepository;
import com.humancloud.wims.repository.ProductRepository;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private InventoryService inventoryService;
    @Autowired
    private RedisLockService redisLockService;
    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Transactional
    public Order createOrder(OrderRequest request) {
        String lockKey = "LOCK_PRODUCT_" + request.getProductId();
        
        // 1. Acquire Distributed Lock
        boolean acquired = redisLockService.acquireLock(lockKey);
        if (!acquired) {
            throw new RuntimeException("High traffic: Could not process order for this product right now. Please try again in a few seconds.");
        }

        try {
            // 2. Smart Allocation (returns the warehouse from which stock was allocated)
            Warehouse warehouseUsed = inventoryService.allocateStock(request.getProductId(), request.getQuantity());

            // 3. Calculate Pricing & Create Order
            Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
            BigDecimal totalAmount = product.getPrice().multiply(BigDecimal.valueOf(request.getQuantity()));

            Order order = new Order();
            order.setStatus("PROCESSING");
            order.setTotalAmount(totalAmount);
            order.setCreatedAt(LocalDateTime.now());
            order.setProduct(product);
            order.setQuantity(request.getQuantity());
            order.setWarehouse(warehouseUsed);
            order = orderRepository.save(order);

            // 4. Send Async Notification
            try {
                rabbitTemplate.convertAndSend(RabbitMQConfig.NOTIFICATION_QUEUE, "Order created successfully! ID: " + order.getId());
            } catch (Exception e) {
                System.err.println("RabbitMQ is offline. Order notification logged: Order created successfully! ID: " + order.getId());
            }

            return order;
        } finally {
            // 5. Always Release Lock
            redisLockService.releaseLock(lockKey);
        }
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

        // Handle inventory release on SHIPPING
        if (newStatus.equals("SHIPPED") && !oldStatus.equals("SHIPPED")) {
            if (order.getProduct() != null && order.getWarehouse() != null) {
                inventoryService.releaseReservedStock(order.getProduct().getId(), order.getWarehouse().getId(), order.getQuantity());
            }
        }

        // Handle stock restoration on CANCELLATION
        if (newStatus.equals("CANCELLED") && !oldStatus.equals("CANCELLED") && !oldStatus.equals("SHIPPED")) {
            if (order.getProduct() != null && order.getWarehouse() != null) {
                inventoryService.restoreStock(order.getProduct().getId(), order.getWarehouse().getId(), order.getQuantity());
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
        // If deleting a non-shipped and non-cancelled order, restore the stock first
        if (!order.getStatus().equals("SHIPPED") && !order.getStatus().equals("CANCELLED")) {
            if (order.getProduct() != null && order.getWarehouse() != null) {
                inventoryService.restoreStock(order.getProduct().getId(), order.getWarehouse().getId(), order.getQuantity());
            }
        }
        orderRepository.deleteById(id); 
    }
}
