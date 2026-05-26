package com.humancloud.wims.controller;

import com.humancloud.wims.entity.ReturnRecord;
import com.humancloud.wims.service.ReturnRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/returns")
@CrossOrigin(origins = "http://localhost:4200")
public class ReturnController {

    @Autowired
    private ReturnRecordService returnRecordService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER', 'STAFF_MANAGER')")
    public List<ReturnRecord> getReturnRecords() {
        return returnRecordService.getAllReturns();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER', 'STAFF_MANAGER')")
    public ReturnRecord getReturnRecord(@PathVariable UUID id) {
        return returnRecordService.getReturnById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER', 'STAFF_MANAGER')")
    public ReturnRecord createReturnRecord(@RequestBody ReturnRecord returnRecord) {
        return returnRecordService.createReturn(returnRecord);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_MANAGER', 'STAFF_MANAGER')")
    public ReturnRecord updateReturnRecord(@PathVariable UUID id, @RequestBody ReturnRecord returnRecord) {
        return returnRecordService.updateReturn(id, returnRecord);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteReturnRecord(@PathVariable UUID id) {
        returnRecordService.deleteReturn(id);
    }
}
