package com.humancloud.wims.controller;

import com.humancloud.wims.dto.InventoryReceiveRequest;
import com.humancloud.wims.dto.InventoryTransferRequest;
import com.humancloud.wims.entity.Inventory;
import com.humancloud.wims.repository.InventoryRepository;
import com.humancloud.wims.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory")
@CrossOrigin(origins = "http://localhost:4200")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;
    @Autowired
    private InventoryRepository inventoryRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER', 'STAFF_MANAGER', 'STAFF', 'USER')")
    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    @PostMapping("/receive")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER', 'STAFF', 'STAFF_MANAGER')")
    public Inventory receiveStock(@RequestBody InventoryReceiveRequest request) {
        return inventoryService.receiveStock(request);
    }

    @PostMapping("/transfer")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER')")
    public void transferStock(@RequestBody InventoryTransferRequest request) {
        inventoryService.transferStock(
                request.getProductId(), 
                request.getFromWarehouseId(), 
                request.getToWarehouseId(), 
                request.getQuantity()
        );
    }
}
