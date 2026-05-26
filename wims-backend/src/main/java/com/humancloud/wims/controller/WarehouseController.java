package com.humancloud.wims.controller;
import com.humancloud.wims.entity.Warehouse;
import com.humancloud.wims.service.WarehouseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/warehouses")
@CrossOrigin(origins = "http://localhost:4200")
public class WarehouseController {
    @Autowired
    private WarehouseService warehouseService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER', 'STAFF_MANAGER', 'USER')")
    public List<Warehouse> getWarehouses() { return warehouseService.getAllWarehouses(); }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER', 'STAFF_MANAGER', 'USER')")
    public Warehouse getWarehouse(@PathVariable UUID id) { return warehouseService.getWarehouseById(id); }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Warehouse addWarehouse(@RequestBody Warehouse warehouse) { return warehouseService.createWarehouse(warehouse); }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Warehouse updateWarehouse(@PathVariable UUID id, @RequestBody Warehouse warehouse) {
        return warehouseService.updateWarehouse(id, warehouse);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteWarehouse(@PathVariable UUID id) { warehouseService.deleteWarehouse(id); }
}
