package com.humancloud.wims.repository;
import com.humancloud.wims.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, UUID> {
    Optional<Inventory> findByProductIdAndWarehouseId(UUID productId, UUID warehouseId);
    List<Inventory> findAllByProductIdAndWarehouseId(UUID productId, UUID warehouseId);
    List<Inventory> findByProductId(UUID productId);
}
