package com.humancloud.wims.service;

import com.humancloud.wims.entity.ReturnRecord;
import com.humancloud.wims.entity.Product;
import com.humancloud.wims.entity.Warehouse;
import com.humancloud.wims.repository.ReturnRecordRepository;
import com.humancloud.wims.repository.ProductRepository;
import com.humancloud.wims.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ReturnRecordService {
    @Autowired
    private ReturnRecordRepository returnRecordRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    public List<ReturnRecord> getAllReturns() {
        return returnRecordRepository.findAll();
    }

    public ReturnRecord getReturnById(UUID id) {
        return returnRecordRepository.findById(id).orElseThrow(() -> new RuntimeException("Return record not found"));
    }

    public ReturnRecord createReturn(ReturnRecord returnRecord) {
        if (returnRecord.getProduct() == null || returnRecord.getProduct().getId() == null) {
            throw new RuntimeException("Product reference is required");
        }
        if (returnRecord.getWarehouse() == null || returnRecord.getWarehouse().getId() == null) {
            throw new RuntimeException("Warehouse reference is required");
        }

        Product product = productRepository.findById(returnRecord.getProduct().getId())
            .orElseThrow(() -> new RuntimeException("Product not found"));
        Warehouse warehouse = warehouseRepository.findById(returnRecord.getWarehouse().getId())
            .orElseThrow(() -> new RuntimeException("Warehouse not found"));

        returnRecord.setProduct(product);
        returnRecord.setWarehouse(warehouse);
        return returnRecordRepository.save(returnRecord);
    }

    public ReturnRecord updateReturn(UUID id, ReturnRecord returnRecord) {
        ReturnRecord existing = getReturnById(id);
        existing.setStatus(returnRecord.getStatus());
        existing.setReason(returnRecord.getReason());
        existing.setQuantity(returnRecord.getQuantity());

        if (returnRecord.getProduct() != null && returnRecord.getProduct().getId() != null) {
            existing.setProduct(productRepository.findById(returnRecord.getProduct().getId())
                .orElseThrow(() -> new RuntimeException("Product not found")));
        }
        if (returnRecord.getWarehouse() != null && returnRecord.getWarehouse().getId() != null) {
            existing.setWarehouse(warehouseRepository.findById(returnRecord.getWarehouse().getId())
                .orElseThrow(() -> new RuntimeException("Warehouse not found")));
        }

        return returnRecordRepository.save(existing);
    }

    public void deleteReturn(UUID id) {
        returnRecordRepository.deleteById(id);
    }
}
