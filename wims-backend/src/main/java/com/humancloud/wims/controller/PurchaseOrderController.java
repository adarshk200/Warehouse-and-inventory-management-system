package com.humancloud.wims.controller;

import com.humancloud.wims.entity.PurchaseOrder;
import com.humancloud.wims.service.PurchaseOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/purchase-orders")
@CrossOrigin(origins = "http://localhost:4200")
public class PurchaseOrderController {

    @Autowired
    private PurchaseOrderService purchaseOrderService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER', 'STAFF_MANAGER')")
    public List<PurchaseOrder> getPurchaseOrders() {
        return purchaseOrderService.getAllPurchaseOrders();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER', 'STAFF_MANAGER')")
    public PurchaseOrder getPurchaseOrder(@PathVariable UUID id) {
        return purchaseOrderService.getPurchaseOrderById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER')")
    public PurchaseOrder createPurchaseOrder(@RequestBody PurchaseOrder purchaseOrder) {
        return purchaseOrderService.createPurchaseOrder(purchaseOrder);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER')")
    public PurchaseOrder updatePurchaseOrder(@PathVariable UUID id, @RequestBody PurchaseOrder purchaseOrder) {
        return purchaseOrderService.updatePurchaseOrder(id, purchaseOrder);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deletePurchaseOrder(@PathVariable UUID id) {
        purchaseOrderService.deletePurchaseOrder(id);
    }
}
