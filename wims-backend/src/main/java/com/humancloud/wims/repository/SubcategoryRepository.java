package com.humancloud.wims.repository;

import com.humancloud.wims.entity.Subcategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubcategoryRepository extends JpaRepository<Subcategory, UUID> {
    List<Subcategory> findByCategoryId(UUID categoryId);
    Optional<Subcategory> findByNameAndCategoryId(String name, UUID categoryId);
}
