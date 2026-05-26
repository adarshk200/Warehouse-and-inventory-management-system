package com.humancloud.wims.service;
import com.humancloud.wims.entity.Warehouse;
import com.humancloud.wims.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class WarehouseService {
    @Autowired
    private WarehouseRepository warehouseRepository;

    public List<Warehouse> getAllWarehouses() { return warehouseRepository.findAll(); }
    
    public Warehouse getWarehouseById(UUID id) {
        return warehouseRepository.findById(id).orElseThrow(() -> new RuntimeException("Warehouse not found"));
    }
    
    public Warehouse createWarehouse(Warehouse w) { return warehouseRepository.save(w); }

    public Warehouse updateWarehouse(UUID id, Warehouse w) {
        Warehouse existing = getWarehouseById(id);
        existing.setName(w.getName());
        existing.setLocation(w.getLocation());
        existing.setCapacity(w.getCapacity());
        return warehouseRepository.save(existing);
    }

    public void deleteWarehouse(UUID id) { warehouseRepository.deleteById(id); }
}
