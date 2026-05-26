package com.humancloud.wims.repository;

import com.humancloud.wims.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface SupplierRepository extends JpaRepository<Supplier, UUID> {
}
