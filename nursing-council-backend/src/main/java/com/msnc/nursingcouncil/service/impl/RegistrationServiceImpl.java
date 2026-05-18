package com.msnc.nursingcouncil.service.impl;

import com.msnc.nursingcouncil.dto.request.RegistrationRequest;
import com.msnc.nursingcouncil.dto.response.ApplicationResponse;
import com.msnc.nursingcouncil.entity.*;
import com.msnc.nursingcouncil.enums.*;
import com.msnc.nursingcouncil.exception.ResourceNotFoundException;
import com.msnc.nursingcouncil.repository.*;
import com.msnc.nursingcouncil.service.RegistrationService;
import com.msnc.nursingcouncil.util.FileStorageService;
import com.msnc.nursingcouncil.util.ReferenceNumberGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RegistrationServiceImpl implements RegistrationService {

    private static final BigDecimal REGISTRATION_FEE = new BigDecimal("1550.00");

    private final ApplicantRepository      applicantRepo;
    private final ApplicationRepository    applicationRepo;
    private final DocumentRepository       documentRepo;
    private final ReferenceNumberGenerator refGen;
    private final FileStorageService       fileStorage;

    @Override
    @Transactional
    public ApplicationResponse submitRegistration(RegistrationRequest req) {
        // 1 – Create applicant record
        Applicant applicant = Applicant.builder()
                .fullName(req.getFullName())
                .dateOfBirth(req.getDateOfBirth())
                .gender(req.getGender())
                .nationality(req.getNationality() == null ? "Indian" : req.getNationality())
                .email(req.getEmail())
                .mobile(req.getMobile())
                .permanentAddress(req.getPermanentAddress())
                .build();
        applicantRepo.save(applicant);

        // 2 – Generate unique reference number
        String refNumber;
        do { refNumber = refGen.generate(ApplicationType.NEW_REGISTRATION); }
        while (applicationRepo.existsByReferenceNumber(refNumber));

        // 3 – Create application
        Application application = Application.builder()
                .referenceNumber(refNumber)
                .applicant(applicant)
                .applicationType(ApplicationType.NEW_REGISTRATION)
                .status(ApplicationStatus.SUBMITTED)
                .build();
        applicationRepo.save(application);

        // 4 – Course details
        CourseDetail course = CourseDetail.builder()
                .application(application)
                .courseName(req.getCourseName())
                .yearOfPassing(req.getYearOfPassing())
                .institutionName(req.getInstitutionName())
                .universityOrBoard(req.getUniversityOrBoard())
                .examRollNumber(req.getExamRollNumber())
                .previousCouncilRegNo(req.getPreviousCouncilRegNo())
                .build();
        application.setCourseDetail(course);

        // 5 – Payment record
        Payment payment = Payment.builder()
                .application(application)
                .amount(REGISTRATION_FEE)
                .paymentMethod(req.getPaymentMethod())
                .transactionRef(req.getTransactionRef())
                .status(PaymentStatus.PENDING)
                .build();
        application.setPayment(payment);

        // 6 – Persist status history
        ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                .application(application)
                .status(ApplicationStatus.SUBMITTED)
                .changedBy("SYSTEM")
                .notes("Initial submission via online portal")
                .build();
        application.getStatusHistory().add(history);

        applicationRepo.save(application);

        log.info("New registration submitted: {}", refNumber);
        return mapToResponse(application);
    }

    @Override
    @Transactional
    public void uploadDocument(String referenceNumber, DocumentType documentType, MultipartFile file) {
        Application application = applicationRepo.findByReferenceNumber(referenceNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + referenceNumber));

        String filePath;
        try {
            filePath = fileStorage.store(file, referenceNumber);
        } catch (IOException e) {
            throw new RuntimeException("File upload failed: " + e.getMessage(), e);
        }

        Document doc = Document.builder()
                .application(application)
                .documentType(documentType)
                .fileName(file.getOriginalFilename())
                .filePath(filePath)
                .mimeType(file.getContentType())
                .fileSizeBytes(file.getSize())
                .build();

        documentRepo.save(doc);
        log.info("Document {} uploaded for {}", documentType, referenceNumber);
    }

    // ─── Mapper ────────────────────────────────────────────────────────────────
    private ApplicationResponse mapToResponse(Application app) {
        List<ApplicationStatus> orderedStatuses = Arrays.asList(ApplicationStatus.values());

        List<ApplicationResponse.StatusStep> steps = orderedStatuses.stream()
                .filter(s -> s != ApplicationStatus.REJECTED)
                .map(s -> {
                    boolean completed = orderedStatuses.indexOf(app.getStatus()) >=
                                        orderedStatuses.indexOf(s);
                    return ApplicationResponse.StatusStep.builder()
                            .label(s.getDisplayLabel())
                            .status(s)
                            .completed(completed)
                            .build();
                })
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
