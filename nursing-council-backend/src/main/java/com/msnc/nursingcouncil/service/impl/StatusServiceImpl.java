package com.msnc.nursingcouncil.service.impl;

import com.msnc.nursingcouncil.dto.response.ApplicationResponse;
import com.msnc.nursingcouncil.entity.Application;
import com.msnc.nursingcouncil.entity.ApplicationStatusHistory;
import com.msnc.nursingcouncil.enums.ApplicationStatus;
import com.msnc.nursingcouncil.exception.ResourceNotFoundException;
import com.msnc.nursingcouncil.repository.ApplicationRepository;
import com.msnc.nursingcouncil.service.StatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatusServiceImpl implements StatusService {

    private final ApplicationRepository applicationRepo;

    @Override
    @Transactional(readOnly = true)
    public ApplicationResponse trackByReferenceAndMobile(String referenceNumber, String mobile) {
        Application app = applicationRepo
                .findByReferenceNumberAndMobile(referenceNumber, mobile)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No application found for the given reference number and mobile"));

        // Build a map of status → timestamp from history
        Map<ApplicationStatus, java.time.OffsetDateTime> completedAt = app.getStatusHistory().stream()
                .collect(Collectors.toMap(
                        ApplicationStatusHistory::getStatus,
                        ApplicationStatusHistory::getChangedAt,
                        (a, b) -> b   // keep latest if duplicate
                ));

        List<ApplicationStatus> ordered = Arrays.asList(ApplicationStatus.values());
        List<ApplicationResponse.StatusStep> steps = ordered.stream()
                .filter(s -> s != ApplicationStatus.REJECTED)
                .map(s -> {
                    boolean done = ordered.indexOf(app.getStatus()) >= ordered.indexOf(s);
                    return ApplicationResponse.StatusStep.builder()
                            .label(s.getDisplayLabel())
                            .status(s)
                            .completed(done)
                            .completedAt(done ? completedAt.get(s) : null)
                            .build();
                })
                .toList();

        return ApplicationResponse.builder()
                .id(app.getId())
                .referenceNumber(app.getReferenceNumber())
                .registrationNumber(app.getRegistrationNumber())
                .certificateUrl(app.getCertificatePath())
                .applicationType(app.getApplicationType())
                .status(app.getStatus())
                .applicantName(app.getApplicant().getFullName())
                .email(app.getApplicant().getEmail())
                .mobile(app.getApplicant().getMobile())
                .submittedAt(app.getSubmittedAt())
                .lastUpdatedAt(app.getLastUpdatedAt())
                .statusSteps(steps)
                .build();
    }
}
