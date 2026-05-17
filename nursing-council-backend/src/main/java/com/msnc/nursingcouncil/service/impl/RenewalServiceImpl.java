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
    public VerificationResponse verifyNurseForRenewal(
            String registrationNumber,
            String mobile,
            String fullName) {

        RegisteredNurse nurse = nurseRepo.findByRegistrationNumber(registrationNumber)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No nurse found with registration number: " + registrationNumber));

        Applicant applicant = nurse.getApplicant();

        // Clean mobile numbers
        String inputMobile = mobile.replaceAll("[^0-9]", "");
        String dbMobile = applicant.getMobile().replaceAll("[^0-9]", "");

        // Mobile validation
        if (!dbMobile.endsWith(
                inputMobile.substring(Math.max(0, inputMobile.length() - 10)))) {

            throw new ValidationException("Mobile number does not match our records");
        }

        // Full name validation
        if (fullName != null &&
                !applicant.getFullName().trim()
                        .equalsIgnoreCase(fullName.trim())) {

            throw new ValidationException("Full name does not match our records");
        }

        // Active/expired status
        boolean active =
                nurse.getIsActive() &&
                nurse.getValidUntil() != null &&
                !nurse.getValidUntil().isBefore(LocalDate.now());

        return VerificationResponse.builder()
                .valid(true)
                .registrationNumber(nurse.getRegistrationNumber())
                .name(applicant.getFullName())
                .course(nurse.getCourseName().getDisplayName())
                .institution(nurse.getInstitutionName())
                .validUntil(nurse.getValidUntil())
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
                .registrationNumber(nurse.getRegistrationNumber())
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
        nurse.setValidUntil(
                nurse.getValidUntil() != null
                        ? nurse.getValidUntil().plusYears(1)
                        : LocalDate.now().plusYears(1)
        );

        nurseRepo.save(nurse);
        
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
                .registrationNumber(app.getRegistrationNumber())
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
