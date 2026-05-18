package com.msnc.nursingcouncil.service.impl;

import com.msnc.nursingcouncil.dto.request.RenewalRequest;
import com.msnc.nursingcouncil.dto.response.ApplicationResponse;
import com.msnc.nursingcouncil.dto.response.VerificationResponse;
import com.msnc.nursingcouncil.entity.*;
import com.msnc.nursingcouncil.enums.*;
import com.msnc.nursingcouncil.exception.ResourceNotFoundException;
import com.msnc.nursingcouncil.exception.ValidationException;
import com.msnc.nursingcouncil.repository.*;
import com.msnc.nursingcouncil.service.RenewalService;
import com.msnc.nursingcouncil.util.ReferenceNumberGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RenewalServiceImpl implements RenewalService {

    private static final BigDecimal RENEWAL_FEE = new BigDecimal("850.00");

    private final RegisteredNurseRepository nurseRepo;
    private final ApplicationRepository     applicationRepo;
    private final ApplicantRepository       applicantRepo;
    private final ReferenceNumberGenerator  refGen;

    @Override
    public VerificationResponse verifyNurseForRenewal(String registrationNumber, String mobile, String fullName) {
        RegisteredNurse nurse = nurseRepo.findByRegistrationNumber(registrationNumber)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No nurse found with registration number: " + registrationNumber));

        Applicant applicant = nurse.getApplicant();

        String cleanedMobile = mobile.replaceAll("[^0-9]", "");

        boolean mobileMatches = applicant.getMobile()
                .replaceAll("[^0-9]", "")
                .endsWith(
                        cleanedMobile.substring(
                                Math.max(0, cleanedMobile.length() - 10)
                        )
                );

        boolean nameMatches = applicant.getFullName()
                .trim()
                .equalsIgnoreCase(fullName.trim());

        if (!mobileMatches) {
            throw new ValidationException(
                    "Mobile number does not match our records"
            );
        }

        if (!nameMatches) {
            throw new ValidationException(
                    "Full name does not match our records"
            );
        }

        boolean active = Boolean.TRUE.equals(nurse.getIsActive()) &&
                nurse.getValidUntil() != null &&
                !nurse.getValidUntil().isBefore(LocalDate.now());
        return VerificationResponse.builder()
                .valid(true)
                .registrationNumber(nurse.getRegistrationNumber())
                .name(applicant.getFullName())
                .course(
                        nurse.getCourseName() != null
                                ? nurse.getCourseName().getDisplayName()
                                : "Not Available"
                )
                .institution(nurse.getInstitutionName())
                .validUntil(
                        nurse.getValidUntil() != null
                                ? nurse.getValidUntil()
                                : LocalDate.now()
                )
                .status(active ? "Active" : "Expired")
                .build();
    }

    @Override
    @Transactional
    public ApplicationResponse submitRenewal(RenewalRequest req) {
        RegisteredNurse nurse = nurseRepo.findByRegistrationNumber(req.getRegistrationNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Nurse not found"));

        String refNumber;
        do { refNumber = refGen.generate(ApplicationType.RENEWAL); }
        while (applicationRepo.existsByReferenceNumber(refNumber));

        Application application = Application.builder()
                .referenceNumber(refNumber)
                .applicant(nurse.getApplicant())
                .applicationType(ApplicationType.RENEWAL)
                .status(ApplicationStatus.SUBMITTED)
                .build();

        if (req.getRefresherCourseTitle() != null && !req.getRefresherCourseTitle().isBlank()) {
            RefresherCourseDetail refresher = RefresherCourseDetail.builder()
                    .application(application)
                    .courseTitle(req.getRefresherCourseTitle())
                    .yearAttended(req.getRefresherYearAttended())
                    .organisingBody(req.getRefresherOrganisingBody())
                    .duration(req.getRefresherDuration())
                    .build();
            application.getRefresherCourseDetails().add(refresher);
        }

        Payment payment = Payment.builder()
                .application(application)
                .amount(RENEWAL_FEE)
                .paymentMethod(req.getPaymentMethod())
                .transactionRef(req.getTransactionRef())
                .status(PaymentStatus.PENDING)
                .build();
        application.setPayment(payment);

        ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                .application(application)
                .status(ApplicationStatus.SUBMITTED)
                .changedBy("SYSTEM")
                .notes("Renewal submitted via online portal")
                .build();
        application.getStatusHistory().add(history);

        applicationRepo.save(application);
        log.info("Renewal submitted: {}", refNumber);

        return mapToResponse(application);
    }

    private ApplicationResponse mapToResponse(Application app) {
        List<ApplicationStatus> orderedStatuses = Arrays.asList(ApplicationStatus.values());
        List<ApplicationResponse.StatusStep> steps = orderedStatuses.stream()
                .filter(s -> s != ApplicationStatus.REJECTED)
                .map(s -> ApplicationResponse.StatusStep.builder()
                        .label(s.getDisplayLabel())
                        .status(s)
                        .completed(orderedStatuses.indexOf(app.getStatus()) >= orderedStatuses.indexOf(s))
                        .build())
                .toList();

        return ApplicationResponse.builder()
                .id(app.getId())
                .referenceNumber(app.getReferenceNumber())
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
