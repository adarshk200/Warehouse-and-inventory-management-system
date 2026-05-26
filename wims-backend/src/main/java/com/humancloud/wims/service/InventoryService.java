package com.humancloud.wims.service;

import com.humancloud.wims.dto.InventoryReceiveRequest;
import com.humancloud.wims.entity.Inventory;
import com.humancloud.wims.entity.Product;
import com.humancloud.wims.entity.Warehouse;
import com.humancloud.wims.exception.InsufficientStockException;
import com.humancloud.wims.repository.InventoryRepository;
import com.humancloud.wims.repository.ProductRepository;
import com.humancloud.wims.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private WarehouseRepository warehouseRepository;
    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    @Transactional
    public Inventory receiveStock(InventoryReceiveRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));

        Optional<Inventory> optInventory = findInventoryEntry(product.getId(), warehouse.getId());
        Inventory inventory;
        if (optInventory.isPresent()) {
            inventory = optInventory.get();
            inventory.setAvailableQuantity((inventory.getAvailableQuantity() == null ? 0 : inventory.getAvailableQuantity()) + request.getQuantity());
        } else {
            inventory = new Inventory();
            inventory.setProduct(product);
            inventory.setWarehouse(warehouse);
            inventory.setAvailableQuantity(request.getQuantity());
            inventory.setReservedQuantity(0);
        }
        inventory.setUpdatedAt(LocalDateTime.now());
        return inventoryRepository.save(inventory);
    }

    @Transactional
    public Warehouse allocateStock(UUID productId, int quantityNeeded) {
        List<Inventory> inventories = inventoryRepository.findByProductId(productId);

        if (inventories.isEmpty()) {
            throw new InsufficientStockException("No inventory record found for product " + productId + ". Available: 0");
        }
        int totalAvailable = inventories.stream()
                .mapToInt(inv -> inv.getAvailableQuantity() == null ? 0 : inv.getAvailableQuantity())
                .sum();
        if (totalAvailable < quantityNeeded) {
            throw new InsufficientStockException("Not enough stock for product " + productId + ". Available: " + totalAvailable);
        }

        int remainingToAllocate = quantityNeeded;
        Warehouse firstWarehouseUsed = null;

        for (Inventory inv : inventories) {
            if (remainingToAllocate == 0) break;

            int availableHere = inv.getAvailableQuantity();
            if (availableHere > 0) {
                int toTake = Math.min(availableHere, remainingToAllocate);
                inv.setAvailableQuantity(inv.getAvailableQuantity() - toTake);
                inv.setReservedQuantity(inv.getReservedQuantity() + toTake);
                inv.setUpdatedAt(LocalDateTime.now());
                inventoryRepository.save(inv);
                
                if (firstWarehouseUsed == null) {
                    firstWarehouseUsed = inv.getWarehouse();
                }
                
                remainingToAllocate -= toTake;
                
                try {
                    kafkaTemplate.send("inventory_events", 
                        String.format("STOCK_ALLOCATED: %d units of %s reserved at Warehouse %s", toTake, productId, inv.getWarehouse().getId()));
                } catch (Exception e) {
                    System.err.println("Kafka is offline. Stock allocation event logged: " + 
                        String.format("STOCK_ALLOCATED: %d units of %s reserved at Warehouse %s", toTake, productId, inv.getWarehouse().getId()));
                }
                
                if (inv.getAvailableQuantity() < 10) {
                     try {
                         kafkaTemplate.send("inventory_events", "LOW_STOCK_ALERT: Warehouse " + inv.getWarehouse().getId() + " is running low on " + productId);
                     } catch (Exception e) {
                         System.err.println("Kafka is offline. Low stock alert logged: Warehouse " + inv.getWarehouse().getId() + " is running low on " + productId);
                     }
                }
            }
        }
        return firstWarehouseUsed;
    }

    @Transactional
    public void transferStock(UUID productId, UUID fromWarehouseId, UUID toWarehouseId, int quantity) {
        if (fromWarehouseId.equals(toWarehouseId)) {
            throw new RuntimeException("Source and destination warehouses cannot be the same");
        }

        Inventory fromInv = findInventoryEntry(productId, fromWarehouseId)
                .orElseThrow(() -> new RuntimeException("Inventory not found in source warehouse"));

        if ((fromInv.getAvailableQuantity() == null ? 0 : fromInv.getAvailableQuantity()) < quantity) {
            throw new InsufficientStockException("Insufficient stock in source warehouse. Available: " + fromInv.getAvailableQuantity());
        }

        // Deduct from source
        fromInv.setAvailableQuantity(fromInv.getAvailableQuantity() - quantity);
        fromInv.setUpdatedAt(LocalDateTime.now());
        inventoryRepository.save(fromInv);

        // Add to destination
        Inventory toInv = findInventoryEntry(productId, toWarehouseId)
                .orElseGet(() -> {
                    Inventory newInv = new Inventory();
                    newInv.setProduct(fromInv.getProduct());
                    newInv.setWarehouse(warehouseRepository.findById(toWarehouseId)
                            .orElseThrow(() -> new RuntimeException("Destination warehouse not found")));
                    newInv.setAvailableQuantity(0);
                    newInv.setReservedQuantity(0);
                    return newInv;
                });

        toInv.setAvailableQuantity(toInv.getAvailableQuantity() + quantity);
        toInv.setUpdatedAt(LocalDateTime.now());
        inventoryRepository.save(toInv);

        try {
            kafkaTemplate.send("inventory_events", 
                String.format("STOCK_TRANSFERRED: %d units of %s moved from Warehouse %s to %s", quantity, productId, fromWarehouseId, toWarehouseId));
        } catch (Exception e) {
            System.err.println("Kafka offline. Logged Stock Transfer event: " + 
                String.format("STOCK_TRANSFERRED: %d units of %s moved from Warehouse %s to %s", quantity, productId, fromWarehouseId, toWarehouseId));
        }
    }

    @Transactional
    public void releaseReservedStock(UUID productId, UUID warehouseId, int quantity) {
        Inventory inv = findInventoryEntry(productId, warehouseId)
                .orElseThrow(() -> new RuntimeException("Inventory record not found for stock release"));

        int currentReserved = inv.getReservedQuantity() != null ? inv.getReservedQuantity() : 0;
        int toRelease = Math.min(currentReserved, quantity);
        
        inv.setReservedQuantity(currentReserved - toRelease);
        inv.setUpdatedAt(LocalDateTime.now());
        inventoryRepository.save(inv);
        
        try {
            kafkaTemplate.send("inventory_events", 
                String.format("STOCK_RELEASED: %d units of reserved stock for product %s shipped from Warehouse %s", toRelease, productId, warehouseId));
        } catch (Exception e) {
            System.err.println("Kafka offline. Logged release event: " + 
                String.format("STOCK_RELEASED: %d units of reserved stock for product %s shipped from Warehouse %s", toRelease, productId, warehouseId));
        }
    }

    @Transactional
    public void restoreStock(UUID productId, UUID warehouseId, int quantity) {
        Inventory inv = findInventoryEntry(productId, warehouseId)
                .orElseThrow(() -> new RuntimeException("Inventory record not found for stock restoration"));

        int currentReserved = inv.getReservedQuantity() != null ? inv.getReservedQuantity() : 0;
        int toRestore = Math.min(currentReserved, quantity);

        inv.setReservedQuantity(currentReserved - toRestore);
        inv.setAvailableQuantity(inv.getAvailableQuantity() + toRestore);
        inv.setUpdatedAt(LocalDateTime.now());
        inventoryRepository.save(inv);

        try {
            kafkaTemplate.send("inventory_events", 
                String.format("STOCK_RESTORED: %d units of product %s returned to available stock at Warehouse %s", toRestore, productId, warehouseId));
        } catch (Exception e) {
            System.err.println("Kafka offline. Logged restore event: " + 
                String.format("STOCK_RESTORED: %d units of product %s returned to available stock at Warehouse %s", toRestore, productId, warehouseId));
        }
    }

    private Optional<Inventory> findInventoryEntry(UUID productId, UUID warehouseId) {
        List<Inventory> inventories = inventoryRepository.findAllByProductIdAndWarehouseId(productId, warehouseId);
        if (inventories.isEmpty()) {
            return Optional.empty();
        }
        if (inventories.size() == 1) {
            return Optional.of(inventories.get(0));
        }

        Inventory merged = inventories.get(0);
        int totalAvailable = merged.getAvailableQuantity() == null ? 0 : merged.getAvailableQuantity();
        int totalReserved = merged.getReservedQuantity() == null ? 0 : merged.getReservedQuantity();

        for (int i = 1; i < inventories.size(); i++) {
            Inventory duplicate = inventories.get(i);
            totalAvailable += duplicate.getAvailableQuantity() == null ? 0 : duplicate.getAvailableQuantity();
            totalReserved += duplicate.getReservedQuantity() == null ? 0 : duplicate.getReservedQuantity();
            inventoryRepository.delete(duplicate);
        }

        merged.setAvailableQuantity(totalAvailable);
        merged.setReservedQuantity(totalReserved);
        merged.setUpdatedAt(LocalDateTime.now());
        inventoryRepository.save(merged);
        return Optional.of(merged);
    }
}