package com.msnc.nursingcouncil.controller;

import com.msnc.nursingcouncil.dto.request.VerifyRequest;
import com.msnc.nursingcouncil.dto.response.ApiResponse;
import com.msnc.nursingcouncil.dto.response.VerificationResponse;
import com.msnc.nursingcouncil.service.VerificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * POST /api/verify  — verify a nurse certificate by registration number (+ optional name)
 */
@RestController
@RequestMapping("/verify")
@RequiredArgsConstructor
public class VerifyController {

    private final VerificationService verificationService;

    @PostMapping
    public ResponseEntity<ApiResponse<VerificationResponse>> verify(
            @Valid @RequestBody VerifyRequest request) {

        VerificationResponse result = verificationService.verify(request);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }
}
