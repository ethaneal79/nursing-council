package com.msnc.nursingcouncil.controller;

import com.msnc.nursingcouncil.service.DaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/da")
@RequiredArgsConstructor
public class DaController {

    private final DaService daService;

    @GetMapping("/applications")
    public ResponseEntity<?> getAllApplications() {
        return ResponseEntity.ok(
                daService.getAllApplications()
        );
    }

    @GetMapping("/applications/unprocessed")
    public ResponseEntity<?> getUnprocessedApplications() {
        return ResponseEntity.ok(
                daService.getUnprocessedApplications()
        );
    }
    @GetMapping("/reports/summary")
    public ResponseEntity<?> getSummaryReport() {
        return ResponseEntity.ok(
                daService.getSummaryReport()
        );
    }
    @PatchMapping("/applications/{referenceNumber}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable String referenceNumber,
            @RequestBody java.util.Map<String, String> payload
    ) {

        daService.updateStatus(
                referenceNumber,
                payload.get("status"),
                payload.get("rejectionReason"),
                payload.get("adminNotes")
        );

        return ResponseEntity.ok(
                java.util.Map.of("message", "Application updated successfully")
        );
    }
}