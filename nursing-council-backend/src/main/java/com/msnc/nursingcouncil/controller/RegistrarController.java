package com.msnc.nursingcouncil.controller;

import com.msnc.nursingcouncil.service.RegistrarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/registrar")
@RequiredArgsConstructor
public class RegistrarController {

    private final RegistrarService registrarService;

    @GetMapping("/applications")
    public ResponseEntity<?> getApplications() {
        return ResponseEntity.ok(registrarService.getApplications());
    }
    @PatchMapping("/applications/{referenceNumber}/approve")
    public ResponseEntity<?> approveApplication(
            @PathVariable String referenceNumber,
            @RequestBody(required = false) java.util.Map<String, String> payload
    ) {

        registrarService.approveApplication(
                referenceNumber,
                payload != null ? payload.get("adminNotes") : null
        );

        return ResponseEntity.ok(
                java.util.Map.of(
                        "message", "Application sent for council approval"
                )
        );
    }
    @PatchMapping("/applications/{referenceNumber}/complete")
    public ResponseEntity<?> completeApplication(
            @PathVariable String referenceNumber
    ) {

        registrarService.completeApplication(referenceNumber);

        return ResponseEntity.ok(
                java.util.Map.of(
                        "message", "Application marked as completed"
                )
        );
    }
}