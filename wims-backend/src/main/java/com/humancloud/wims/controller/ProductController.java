package com.humancloud.wims.controller;
import com.humancloud.wims.entity.Product;
import com.humancloud.wims.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products")
@CrossOrigin(origins = "http://localhost:4200")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER', 'STAFF_MANAGER', 'USER')")
    public List<Product> getProducts() { return productService.getAllProducts(); }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER', 'STAFF_MANAGER', 'USER')")
    public Product getProduct(@PathVariable UUID id) { return productService.getProductById(id); }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER')")
    public Product addProduct(@RequestBody Product product) { return productService.saveProduct(product); }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER')")
    public Product updateProduct(@PathVariable UUID id, @RequestBody Product product) {
        return productService.updateProduct(id, product);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER')")
    public void deleteProduct(@PathVariable UUID id) {
        productService.deleteProduct(id);
    }
}
