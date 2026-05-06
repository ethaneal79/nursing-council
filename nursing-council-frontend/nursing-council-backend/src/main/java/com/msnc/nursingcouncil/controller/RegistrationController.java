package com.msnc.nursingcouncil.controller;

import com.msnc.nursingcouncil.dto.request.RegistrationRequest;
import com.msnc.nursingcouncil.dto.response.ApiResponse;
import com.msnc.nursingcouncil.dto.response.ApplicationResponse;
import com.msnc.nursingcouncil.enums.DocumentType;
import com.msnc.nursingcouncil.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * POST /api/registration          — submit new registration (steps 1-2 + payment)
 * POST /api/registration/{ref}/documents — upload a document for an application
 */
@RestController
@RequestMapping("/registration")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;

    /**
     * Submit a new nurse registration.
     * Documents are uploaded separately via the /documents endpoint.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ApplicationResponse>> submitRegistration(
            @Valid @RequestBody RegistrationRequest request) {

        ApplicationResponse response = registrationService.submitRegistration(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Application submitted successfully", response));
    }

    /**
     * Upload a single document for an existing application.
     * The client makes one request per document (multipart/form-data).
     *
     * @param referenceNumber  e.g. MSNC-2026-04821
     * @param documentType     one of the DocumentType enum values
     * @param file             the file to upload (max 5 MB, PDF/JPG/PNG)
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
