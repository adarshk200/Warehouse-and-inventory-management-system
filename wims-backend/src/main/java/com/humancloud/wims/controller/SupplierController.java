package com.humancloud.wims.controller;

import com.humancloud.wims.entity.Supplier;
import com.humancloud.wims.service.SupplierService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/suppliers")
@CrossOrigin(origins = "http://localhost:4200")
public class SupplierController {

    @Autowired
    private SupplierService supplierService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER', 'STAFF_MANAGER')")
    public List<Supplier> getSuppliers() {
        return supplierService.getAllSuppliers();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER', 'STAFF_MANAGER')")
    public Supplier getSupplier(@PathVariable UUID id) {
        return supplierService.getSupplierById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER')")
    public Supplier addSupplier(@RequestBody Supplier supplier) {
        return supplierService.createSupplier(supplier);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER')")
    public Supplier updateSupplier(@PathVariable UUID id, @RequestBody Supplier supplier) {
        return supplierService.updateSupplier(id, supplier);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteSupplier(@PathVariable UUID id) {
        supplierService.deleteSupplier(id);
    }
}
