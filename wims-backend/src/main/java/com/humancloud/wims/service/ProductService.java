package com.humancloud.wims.service;
import com.humancloud.wims.entity.Inventory;
import com.humancloud.wims.entity.Product;
import com.humancloud.wims.entity.Warehouse;
import com.humancloud.wims.repository.InventoryRepository;
import com.humancloud.wims.repository.ProductRepository;
import com.humancloud.wims.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Cacheable(value = "products")
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    
    @Cacheable(value = "product", key = "#id")
    public Product getProductById(UUID id) {
        return productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
    }
    
    @CacheEvict(value = "products", allEntries = true) // Clear list cache on new item
    public Product saveProduct(Product p) {
        Product saved = productRepository.save(p);
        createDefaultInventoryForProduct(saved);
        return saved;
    }

    private void createDefaultInventoryForProduct(Product product) {
        if (!inventoryRepository.findByProductId(product.getId()).isEmpty()) {
            return;
        }
        List<Warehouse> warehouses = warehouseRepository.findAll();
        if (warehouses.isEmpty()) {
            return;
        }
        Warehouse warehouse = warehouses.get(0);
        Inventory inv = new Inventory();
        inv.setProduct(product);
        inv.setWarehouse(warehouse);
        inv.setAvailableQuantity(0);
        inv.setReservedQuantity(0);
        inv.setUpdatedAt(LocalDateTime.now());
        inventoryRepository.save(inv);
    }

    @CachePut(value = "product", key = "#id")
    @CacheEvict(value = "products", allEntries = true)
    public Product updateProduct(UUID id, Product p) {
        Product existing = getProductById(id);
        existing.setName(p.getName());
        existing.setPrice(p.getPrice());
        existing.setSku(p.getSku());
        existing.setWeightKg(p.getWeightKg());
        existing.setSubcategory(p.getSubcategory());
        return productRepository.save(existing);
    }
    
    @CacheEvict(value = {"product", "products"}, allEntries = true)
    public void deleteProduct(UUID id) {
        productRepository.deleteById(id);
    }
}
