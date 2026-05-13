package com.msnc.nursingcouncil.controller;

import com.msnc.nursingcouncil.dto.request.StatusTrackRequest;
import com.msnc.nursingcouncil.dto.response.ApiResponse;
import com.msnc.nursingcouncil.dto.response.ApplicationResponse;
import com.msnc.nursingcouncil.service.StatusService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * POST /api/status/track  — track an application by reference + mobile
 */
@RestController
@RequestMapping("/status")
@RequiredArgsConstructor
public class StatusController {

    private final StatusService statusService;

    @PostMapping("/track")
    public ResponseEntity<ApiResponse<ApplicationResponse>> trackStatus(
            @Valid @RequestBody StatusTrackRequest request) {

        ApplicationResponse response = statusService
                .trackByReferenceAndMobile(request.getReferenceNumber(), request.getMobile());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
