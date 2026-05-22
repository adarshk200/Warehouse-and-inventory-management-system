package com.humancloud.wims.controller;

import com.humancloud.wims.entity.Subcategory;
import com.humancloud.wims.repository.SubcategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/subcategories")
@CrossOrigin(origins = "http://localhost:4200")
public class SubcategoryController {

    @Autowired
    private SubcategoryRepository subcategoryRepository;

    @GetMapping
    public List<Subcategory> getSubcategories() {
        return subcategoryRepository.findAll();
    }

    @GetMapping("/{id}")
    public Subcategory getSubcategory(@PathVariable UUID id) {
        return subcategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subcategory not found"));
    }

    @GetMapping("/category/{categoryId}")
    public List<Subcategory> getSubcategoriesByCategory(@PathVariable UUID categoryId) {
        return subcategoryRepository.findByCategoryId(categoryId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER')")
    public Subcategory createSubcategory(@RequestBody Subcategory subcategory) {
        return subcategoryRepository.save(subcategory);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER')")
    public Subcategory updateSubcategory(@PathVariable UUID id, @RequestBody Subcategory subcategoryDetails) {
        Subcategory subcategory = subcategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subcategory not found"));
        subcategory.setName(subcategoryDetails.getName());
        subcategory.setDescription(subcategoryDetails.getDescription());
        if (subcategoryDetails.getCategory() != null) {
            subcategory.setCategory(subcategoryDetails.getCategory());
        }
        return subcategoryRepository.save(subcategory);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER')")
    public void deleteSubcategory(@PathVariable UUID id) {
        subcategoryRepository.deleteById(id);
    }
}
