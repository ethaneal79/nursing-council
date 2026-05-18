package com.msnc.nursingcouncil.service.impl;

import com.msnc.nursingcouncil.enums.ApplicationStatus;
import com.msnc.nursingcouncil.repository.ApplicationRepository;
import com.msnc.nursingcouncil.service.DaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DaServiceImpl implements DaService {

    private final ApplicationRepository repo;

    @Override
    public Object getUnprocessedApplications() {

        return repo.findAllByStatus(ApplicationStatus.SUBMITTED)
                .stream()
                .map(a -> java.util.Map.of(
                        "id", a.getId(),
                        "referenceNumber", a.getReferenceNumber(),
                        "status", a.getStatus(),
                        "applicationType", a.getApplicationType(),
                        "submittedAt", a.getSubmittedAt(),
                        "applicantName", a.getApplicant().getFullName(),
                        "applicantMobile", a.getApplicant().getMobile()
                ))
                .toList();
    }
    @Override
    public Object getAllApplications() {

        return repo.findAll()
                .stream()
                .map(a -> java.util.Map.of(
                        "id", a.getId(),
                        "referenceNumber", a.getReferenceNumber(),
                        "status", a.getStatus(),
                        "applicationType", a.getApplicationType(),
                        "submittedAt", a.getSubmittedAt(),
                        "applicantName", a.getApplicant().getFullName(),
                        "applicantMobile", a.getApplicant().getMobile()
                ))
                .toList();
    }
    @Override
    public Object getSummaryReport() {

        long total = repo.count();

        long submitted = repo.countByStatus(ApplicationStatus.SUBMITTED);

        long verified = repo.countByStatus(ApplicationStatus.DOCUMENTS_VERIFIED);

        long review = repo.countByStatus(ApplicationStatus.COUNCIL_REVIEW);

        long completed = repo.countByStatus(ApplicationStatus.COMPLETED);

        long rejected = repo.countByStatus(ApplicationStatus.REJECTED);

        long newRegs = repo.findAll().stream()
                .filter(a -> a.getApplicationType().name().equals("NEW_REGISTRATION"))
                .count();

        long renewals = repo.findAll().stream()
                .filter(a -> a.getApplicationType().name().equals("RENEWAL"))
                .count();

        return java.util.Map.of(
                "total", total,

                "byStatus", java.util.Map.of(
                        "submitted", submitted,
                        "verified", verified,
                        "review", review,
                        "completed", completed,
                        "rejected", rejected
                ),

                "byType", java.util.Map.of(
                        "newRegistrations", newRegs,
                        "renewals", renewals
                )
        );
    }
    @Override
    @Transactional
    public void updateStatus(
            String referenceNumber,
            String status,
            String rejectionReason,
            String adminNotes
    ) {

        var app = repo.findByReferenceNumber(referenceNumber)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        app.setStatus(
                com.msnc.nursingcouncil.enums.ApplicationStatus.valueOf(status)
        );

        app.setRejectionReason(rejectionReason);
        app.setAdminNotes(adminNotes);

        repo.save(app);
    }
}