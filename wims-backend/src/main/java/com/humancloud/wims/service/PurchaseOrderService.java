package com.humancloud.wims.service;

import com.humancloud.wims.entity.PurchaseOrder;
import com.humancloud.wims.entity.Product;
import com.humancloud.wims.entity.Warehouse;
import com.humancloud.wims.entity.Supplier;
import com.humancloud.wims.repository.PurchaseOrderRepository;
import com.humancloud.wims.repository.ProductRepository;
import com.humancloud.wims.repository.WarehouseRepository;
import com.humancloud.wims.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class PurchaseOrderService {
    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    public List<PurchaseOrder> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAll();
    }

    public PurchaseOrder getPurchaseOrderById(UUID id) {
        return purchaseOrderRepository.findById(id).orElseThrow(() -> new RuntimeException("Purchase order not found"));
    }

    public PurchaseOrder createPurchaseOrder(PurchaseOrder purchaseOrder) {
        if (purchaseOrder.getProduct() == null || purchaseOrder.getProduct().getId() == null) {
            throw new RuntimeException("Product reference is required");
        }
        if (purchaseOrder.getWarehouse() == null || purchaseOrder.getWarehouse().getId() == null) {
            throw new RuntimeException("Warehouse reference is required");
        }
        if (purchaseOrder.getSupplier() == null || purchaseOrder.getSupplier().getId() == null) {
            throw new RuntimeException("Supplier reference is required");
        }

        Product product = productRepository.findById(purchaseOrder.getProduct().getId())
            .orElseThrow(() -> new RuntimeException("Product not found"));
        Warehouse warehouse = warehouseRepository.findById(purchaseOrder.getWarehouse().getId())
            .orElseThrow(() -> new RuntimeException("Warehouse not found"));
        Supplier supplier = supplierRepository.findById(purchaseOrder.getSupplier().getId())
            .orElseThrow(() -> new RuntimeException("Supplier not found"));

        purchaseOrder.setProduct(product);
        purchaseOrder.setWarehouse(warehouse);
        purchaseOrder.setSupplier(supplier);
        return purchaseOrderRepository.save(purchaseOrder);
    }

    public PurchaseOrder updatePurchaseOrder(UUID id, PurchaseOrder purchaseOrder) {
        PurchaseOrder existing = getPurchaseOrderById(id);
        existing.setStatus(purchaseOrder.getStatus());
        existing.setQuantity(purchaseOrder.getQuantity());
        existing.setTotalAmount(purchaseOrder.getTotalAmount());

        if (purchaseOrder.getProduct() != null && purchaseOrder.getProduct().getId() != null) {
            existing.setProduct(productRepository.findById(purchaseOrder.getProduct().getId())
                .orElseThrow(() -> new RuntimeException("Product not found")));
        }
        if (purchaseOrder.getWarehouse() != null && purchaseOrder.getWarehouse().getId() != null) {
            existing.setWarehouse(warehouseRepository.findById(purchaseOrder.getWarehouse().getId())
                .orElseThrow(() -> new RuntimeException("Warehouse not found")));
        }
        if (purchaseOrder.getSupplier() != null && purchaseOrder.getSupplier().getId() != null) {
            existing.setSupplier(supplierRepository.findById(purchaseOrder.getSupplier().getId())
                .orElseThrow(() -> new RuntimeException("Supplier not found")));
        }

        return purchaseOrderRepository.save(existing);
    }

    public void deletePurchaseOrder(UUID id) {
        purchaseOrderRepository.deleteById(id);
    }
}
