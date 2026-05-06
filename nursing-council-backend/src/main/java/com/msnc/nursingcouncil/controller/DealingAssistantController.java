package com.msnc.nursingcouncil.controller;

import com.msnc.nursingcouncil.dto.request.UpdateApplicationStatusRequest;
import com.msnc.nursingcouncil.dto.response.ApiResponse;
import com.msnc.nursingcouncil.dto.response.ApplicationResponse;
import com.msnc.nursingcouncil.entity.Application;
import com.msnc.nursingcouncil.entity.ApplicationStatusHistory;
import com.msnc.nursingcouncil.enums.ApplicationStatus;
import com.msnc.nursingcouncil.enums.ApplicationType;
import com.msnc.nursingcouncil.enums.CourseType;
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
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Dealing Assistant (DA) endpoints — ROLE_DEALING_ASSISTANT, REGISTRAR, SUPERUSER.
 *
 * GET    /da/applications              — all applications
 * GET    /da/applications/unprocessed  — SUBMITTED only
 * PATCH  /da/applications/{ref}/status — accept or reject
 * GET    /da/reports/summary           — counts by type/course/status
 */
@RestController
@RequestMapping("/da")
@RequiredArgsConstructor
public class DealingAssistantController {

    private final ApplicationRepository applicationRepository;

    // ── All applications ──────────────────────────────────────────────────

    @GetMapping("/applications")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> allApplications() {
        List<ApplicationResponse> list = applicationRepository.findAll()
                .stream().map(this::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok("Applications fetched", list));
    }

    // ── Unprocessed (SUBMITTED) ───────────────────────────────────────────

    @GetMapping("/applications/unprocessed")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> unprocessed() {
        List<ApplicationResponse> list =
                applicationRepository.findAllByStatus(ApplicationStatus.SUBMITTED)
                        .stream().map(this::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok("Unprocessed applications", list));
    }

    // ── Accept or Reject ──────────────────────────────────────────────────

    @PatchMapping("/applications/{referenceNumber}/status")
    public ResponseEntity<ApiResponse<ApplicationResponse>> updateStatus(
            @PathVariable String referenceNumber,
            @Valid @RequestBody UpdateApplicationStatusRequest req,
            Authentication auth) {

        Application app = applicationRepository.findByReferenceNumber(referenceNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + referenceNumber));

        ApplicationStatus newStatus = req.getStatus();

        // DA can only accept (DOCUMENTS_VERIFIED) or reject
        if (newStatus != ApplicationStatus.DOCUMENTS_VERIFIED && newStatus != ApplicationStatus.REJECTED) {
            throw new ValidationException("DA can only set status to DOCUMENTS_VERIFIED (accept) or REJECTED");
        }
        if (newStatus == ApplicationStatus.REJECTED && (req.getRejectionReason() == null || req.getRejectionReason().isBlank())) {
            throw new ValidationException("Rejection reason is required");
        }

        app.setStatus(newStatus);
        app.setRejectionReason(req.getRejectionReason());
        app.setAdminNotes(req.getAdminNotes());

        // Record status history
        ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                .application(app)
                .status(newStatus)
                .changedAt(OffsetDateTime.now())
                .changedBy(auth != null ? auth.getName() : "system")
                .notes(req.getAdminNotes())
                .build();
        app.getStatusHistory().add(history);

        applicationRepository.save(app);
        return ResponseEntity.ok(ApiResponse.ok("Status updated", toResponse(app)));
    }

    // ── Summary report ────────────────────────────────────────────────────

    @GetMapping("/reports/summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> summaryReport() {
        long total     = applicationRepository.count();
        long submitted = applicationRepository.countByStatus(ApplicationStatus.SUBMITTED);
        long verified  = applicationRepository.countByStatus(ApplicationStatus.DOCUMENTS_VERIFIED);
        long review    = applicationRepository.countByStatus(ApplicationStatus.COUNCIL_REVIEW);
        long completed = applicationRepository.countByStatus(ApplicationStatus.COMPLETED);
        long rejected  = applicationRepository.countByStatus(ApplicationStatus.REJECTED);
        long newReg    = applicationRepository.countByApplicationType(ApplicationType.NEW_REGISTRATION);
        long renewal   = applicationRepository.countByApplicationType(ApplicationType.RENEWAL);
        long gnm       = applicationRepository.countByCourseType(CourseType.GNM);
        long anm       = applicationRepository.countByCourseType(CourseType.ANM);

        Map<String, Object> report = Map.of(
            "total",            total,
            "byStatus", Map.of(
                "submitted",  submitted,
                "verified",   verified,
                "review",     review,
                "completed",  completed,
                "rejected",   rejected
            ),
            "byType", Map.of(
                "newRegistrations", newReg,
                "renewals",         renewal
            ),
            "byCourse", Map.of(
                "GNM", gnm,
                "ANM", anm
            )
        );

        return ResponseEntity.ok(ApiResponse.ok("Report generated", report));
    }

    // ── Fine calculation helper ───────────────────────────────────────────
    // From notes: fine = 5050 when DA processes late renewal (beyond deadline)

    @GetMapping("/applications/{referenceNumber}/fine")
    public ResponseEntity<ApiResponse<Map<String, Object>>> calculateFine(
            @PathVariable String referenceNumber) {

        Application app = applicationRepository.findByReferenceNumber(referenceNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        // Fine of ₹5050 applies to renewals submitted after the deadline (end of March)
        boolean isRenewal = app.getApplicationType() == ApplicationType.RENEWAL;
        OffsetDateTime submitted = app.getSubmittedAt();
        int month = submitted.getMonthValue();
        int day   = submitted.getDayOfMonth();

        // Late = after 31 March of the registration year
        boolean isLate = isRenewal && (month > 3 || (month == 3 && day > 31));
        long fineAmount = isLate ? 5050L : 0L;

        Map<String, Object> result = Map.of(
            "referenceNumber", referenceNumber,
            "isRenewal",       isRenewal,
            "isLate",          isLate,
            "fineAmount",      fineAmount,
            "currency",        "INR"
        );

        return ResponseEntity.ok(ApiResponse.ok("Fine calculated", result));
    }

    // ── Mapper ────────────────────────────────────────────────────────────

    private ApplicationResponse toResponse(Application app) {
        return ApplicationResponse.builder()
                .referenceNumber(app.getReferenceNumber())
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
