package com.humancloud.wims.repository;

import com.humancloud.wims.entity.ReturnRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ReturnRecordRepository extends JpaRepository<ReturnRecord, UUID> {
}
