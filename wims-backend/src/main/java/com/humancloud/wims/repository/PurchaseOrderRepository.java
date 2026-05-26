package com.humancloud.wims.repository;

import com.humancloud.wims.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, UUID> {
}
