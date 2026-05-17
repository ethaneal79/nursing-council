package com.msnc.nursingcouncil.controller;

import com.msnc.nursingcouncil.dto.request.UpdateApplicationStatusRequest;
import com.msnc.nursingcouncil.dto.response.ApiResponse;
import com.msnc.nursingcouncil.dto.response.ApplicationResponse;
import com.msnc.nursingcouncil.entity.Application;
import com.msnc.nursingcouncil.entity.ApplicationStatusHistory;
import com.msnc.nursingcouncil.enums.ApplicationStatus;
import com.msnc.nursingcouncil.exception.ResourceNotFoundException;
import com.msnc.nursingcouncil.exception.ValidationException;
import com.msnc.nursingcouncil.repository.ApplicationRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Registrar endpoints — ROLE_REGISTRAR, SUPERUSER.
 *
 * GET   /registrar/applications           — all applications pending review
 * PATCH /registrar/applications/{ref}/approve — move to COUNCIL_REVIEW (send for approval)
 * PATCH /registrar/applications/{ref}/reject  — reject with reason
 * PATCH /registrar/applications/{ref}/complete — mark as COMPLETED
 */
@RestController
@RequestMapping("/registrar")
@RequiredArgsConstructor
public class RegistrarController {

    private final ApplicationRepository applicationRepository;

    // ── All applications pending registrar action ─────────────────────────

    @GetMapping("/applications")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> pendingApplications() {
        List<ApplicationResponse> list = applicationRepository.findAllPendingApproval()
                .stream().map(this::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok("Applications fetched", list));
    }

    // ── Send for approval (Registrar advances to COUNCIL_REVIEW) ─────────

    @PatchMapping("/applications/{referenceNumber}/approve")
    public ResponseEntity<ApiResponse<ApplicationResponse>> sendForApproval(
            @PathVariable String referenceNumber,
            @RequestBody(required = false) UpdateApplicationStatusRequest req,
            Authentication auth) {

        Application app = applicationRepository.findByReferenceNumber(referenceNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + referenceNumber));

        if (app.getStatus() != ApplicationStatus.DOCUMENTS_VERIFIED) {
            throw new ValidationException("Application must be verified by DA before registrar approval");
        }

        app.setStatus(ApplicationStatus.COUNCIL_REVIEW);
        if (req != null) app.setAdminNotes(req.getAdminNotes());
        recordHistory(app, ApplicationStatus.COUNCIL_REVIEW, auth, req != null ? req.getAdminNotes() : null);
        applicationRepository.save(app);

        return ResponseEntity.ok(ApiResponse.ok("Application sent for approval", toResponse(app)));
    }

    // ── Reject ────────────────────────────────────────────────────────────

    @PatchMapping("/applications/{referenceNumber}/reject")
    public ResponseEntity<ApiResponse<ApplicationResponse>> reject(
            @PathVariable String referenceNumber,
            @Valid @RequestBody UpdateApplicationStatusRequest req,
            Authentication auth) {

        if (req.getRejectionReason() == null || req.getRejectionReason().isBlank()) {
            throw new ValidationException("Rejection reason is required");
        }

        Application app = applicationRepository.findByReferenceNumber(referenceNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + referenceNumber));

        app.setStatus(ApplicationStatus.REJECTED);
        app.setRejectionReason(req.getRejectionReason());
        recordHistory(app, ApplicationStatus.REJECTED, auth, req.getRejectionReason());
        applicationRepository.save(app);

        return ResponseEntity.ok(ApiResponse.ok("Application rejected", toResponse(app)));
    }

    // ── Complete (certificate issued) ─────────────────────────────────────

    @PatchMapping("/applications/{referenceNumber}/complete")
    public ResponseEntity<ApiResponse<ApplicationResponse>> complete(
            @PathVariable String referenceNumber,
            Authentication auth) {

        Application app = applicationRepository.findByReferenceNumber(referenceNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + referenceNumber));

        if (app.getStatus() != ApplicationStatus.COUNCIL_REVIEW) {
            throw new ValidationException("Application must be in COUNCIL_REVIEW before completion");
        }

        app.setStatus(ApplicationStatus.COMPLETED);

        // ✅ GENERATE REGISTRATION NUMBER HERE
        if (app.getRegistrationNumber() == null) {
            String regNo =
                    "MSNC-REG-" +
                    java.time.Year.now().getValue() +
                    "-" +
                    String.format("%05d", app.getId());

            app.setRegistrationNumber(regNo);
        }

        recordHistory(app, ApplicationStatus.COMPLETED, auth, "Certificate issued");
        applicationRepository.save(app);

        return ResponseEntity.ok(ApiResponse.ok("Application completed", toResponse(app)));
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private void recordHistory(Application app, ApplicationStatus status,
                                Authentication auth, String notes) {
        ApplicationStatusHistory h = ApplicationStatusHistory.builder()
                .application(app)
                .status(status)
                .changedAt(OffsetDateTime.now())
                .changedBy(auth != null ? auth.getName() : "system")
                .notes(notes)
                .build();
        app.getStatusHistory().add(h);
    }

    private ApplicationResponse toResponse(Application app) {
        return ApplicationResponse.builder()
                .referenceNumber(app.getReferenceNumber())
                .registrationNumber(app.getRegistrationNumber())
                .applicantName(app.getApplicant().getFullName())
                .applicantEmail(app.getApplicant().getEmail())
                .applicantMobile(app.getApplicant().getMobile())
                .applicationType(app.getApplicationType())
                .status(app.getStatus())
                .submittedAt(app.getSubmittedAt())
                .lastUpdatedAt(app.getLastUpdatedAt())
                .rejectionReason(app.getRejectionReason())
                .build();
    }
}
