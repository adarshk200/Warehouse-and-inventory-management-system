package com.humancloud.wims.service;

import com.humancloud.wims.entity.Supplier;
import com.humancloud.wims.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class SupplierService {
    @Autowired
    private SupplierRepository supplierRepository;

    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    public Supplier getSupplierById(UUID id) {
        return supplierRepository.findById(id).orElseThrow(() -> new RuntimeException("Supplier not found"));
    }

    public Supplier createSupplier(Supplier supplier) {
        return supplierRepository.save(supplier);
    }

    public Supplier updateSupplier(UUID id, Supplier supplier) {
        Supplier existing = getSupplierById(id);
        existing.setName(supplier.getName());
        existing.setEmail(supplier.getEmail());
        existing.setPhone(supplier.getPhone());
        existing.setAddress(supplier.getAddress());
        return supplierRepository.save(existing);
    }

    public void deleteSupplier(UUID id) {
        supplierRepository.deleteById(id);
    }
}
