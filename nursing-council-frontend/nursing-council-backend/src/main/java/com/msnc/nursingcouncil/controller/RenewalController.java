package com.msnc.nursingcouncil.controller;

import com.msnc.nursingcouncil.dto.request.RenewalRequest;
import com.msnc.nursingcouncil.dto.response.ApiResponse;
import com.msnc.nursingcouncil.dto.response.ApplicationResponse;
import com.msnc.nursingcouncil.dto.response.VerificationResponse;
import com.msnc.nursingcouncil.enums.DocumentType;
import com.msnc.nursingcouncil.service.RenewalService;
import com.msnc.nursingcouncil.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * GET  /api/renewal/verify                    — verify nurse exists before renewal
 * POST /api/renewal                           — submit renewal application
 * POST /api/renewal/{ref}/documents           — upload renewal document
 */
@RestController
@RequestMapping("/renewal")
@RequiredArgsConstructor
public class RenewalController {

    private final RenewalService      renewalService;
    private final RegistrationService registrationService; // reuse doc upload logic

    /**
     * Step 1 — verify that the nurse exists and the supplied details match.
     */
    @GetMapping("/verify")
    public ResponseEntity<ApiResponse<VerificationResponse>> verifyNurse(
            @RequestParam String registrationNumber,
            @RequestParam String mobile,
            @RequestParam String fullName) {

        VerificationResponse result =
                renewalService.verifyNurseForRenewal(registrationNumber, mobile, fullName);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    /**
     * Steps 2-3 — submit refresher details + payment.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ApplicationResponse>> submitRenewal(
            @Valid @RequestBody RenewalRequest request) {

        ApplicationResponse response = renewalService.submitRenewal(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Renewal submitted successfully", response));
    }

    /**
     * Upload documents for a renewal application (refresher cert, updated ID, etc.)
     */
    @PostMapping(
            value = "/{referenceNumber}/documents",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse<Void>> uploadDocument(
            @PathVariable String referenceNumber,
            @RequestParam DocumentType documentType,
            @RequestParam("file") MultipartFile file) {

        registrationService.uploadDocument(referenceNumber, documentType, file);
        return ResponseEntity.ok(ApiResponse.ok("Document uploaded successfully", null));
    }
}
