package com.humancloud.wims.repository;

import com.humancloud.wims.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface CustomerRepository extends JpaRepository<Customer, UUID> {
}
