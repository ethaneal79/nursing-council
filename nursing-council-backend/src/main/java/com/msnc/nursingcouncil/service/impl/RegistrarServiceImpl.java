package com.msnc.nursingcouncil.service.impl;

import com.msnc.nursingcouncil.repository.ApplicationRepository;
import com.msnc.nursingcouncil.service.CertificateService;
import com.msnc.nursingcouncil.service.RegistrarService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.msnc.nursingcouncil.repository.RegisteredNurseRepository;
import com.msnc.nursingcouncil.entity.RegisteredNurse;

@Service
@RequiredArgsConstructor
public class RegistrarServiceImpl implements RegistrarService {

    private final ApplicationRepository repo;
    private final RegisteredNurseRepository registeredNurseRepo;
    private final CertificateService certificateService;

    @Override
    public Object getApplications() {

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
    public void approveApplication(
            String referenceNumber,
            String adminNotes
    ) {

        var app = repo.findByReferenceNumber(referenceNumber)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        app.setStatus(
                com.msnc.nursingcouncil.enums.ApplicationStatus.COUNCIL_REVIEW
        );

        app.setAdminNotes(adminNotes);

        repo.save(app);
    }
    @Override
    public void completeApplication(String referenceNumber) {

        var app = repo.findByReferenceNumber(referenceNumber)
                .orElseThrow(() ->
                        new RuntimeException("Application not found"));

        app.setStatus(
                com.msnc.nursingcouncil.enums.ApplicationStatus.COMPLETED
        );

        // =========================================
        // NEW REGISTRATION
        // =========================================

        if (
            app.getApplicationType() ==
            com.msnc.nursingcouncil.enums.ApplicationType.NEW_REGISTRATION
        ) {

            // Generate registration number only once
            if (
                app.getRegistrationNumber() == null ||
                app.getRegistrationNumber().isBlank()
            ) {

                String regNo;

                do {

                    regNo = generateRegistrationNumber();

                } while (repo.existsByRegistrationNumber(regNo));

                app.setRegistrationNumber(regNo);
            }

            String regNo = app.getRegistrationNumber();

            // Generate certificate
            String certificateUrl =
                    certificateService.generateCertificate(
                            app,
                            regNo
                    );

            app.setCertificatePath(certificateUrl);

            // Create permanent nurse registry record
            RegisteredNurse nurse = RegisteredNurse.builder()
                    .registrationNumber(regNo)
                    .applicant(app.getApplicant())
                    .application(app)
                    .courseName(
                            app.getCourseDetail() != null
                                    ? app.getCourseDetail().getCourseName()
                                    : null
                    )
                    .institutionName(
                            app.getCourseDetail() != null
                                    ? app.getCourseDetail().getInstitutionName()
                                    : "Unknown"
                    )
                    .registeredOn(java.time.LocalDate.now())
                    .validUntil(java.time.LocalDate.now().plusYears(5))
                    .isActive(true)
                    .build();

            registeredNurseRepo.save(nurse);
        }

        // =========================================
        // RENEWAL
        // =========================================

        if (
        	    app.getApplicationType() ==
        	    com.msnc.nursingcouncil.enums.ApplicationType.RENEWAL
        	) {

        	    RegisteredNurse existingNurse =
        	            registeredNurseRepo
        	                    .findAll()
        	                    .stream()
        	                    .filter(n ->
        	                            n.getApplicant().getMobile()
        	                                    .equals(
        	                                            app.getApplicant().getMobile()
        	                                    )
        	                    )
        	                    .findFirst()
        	                    .orElseThrow(() ->
        	                            new RuntimeException(
        	                                    "Registered nurse not found"
        	                            )
        	                    );

        	 // DO NOT SAVE OLD REGISTRATION NUMBER INTO APPLICATION TABLE
        	 // ONLY USE IT FOR CERTIFICATE GENERATION

        	 String oldRegistrationNumber =
        	         existingNurse.getRegistrationNumber();

        	    // GENERATE CERTIFICATE
        	 String certificateUrl =
        		        certificateService.generateCertificate(
        		                app,
        		                oldRegistrationNumber
        		        );

        	    app.setCertificatePath(certificateUrl);

        	    // EXTEND VALIDITY
        	    existingNurse.setValidUntil(
        	            java.time.LocalDate.now().plusYears(5)
        	    );

        	    registeredNurseRepo.save(existingNurse);
        	}
        repo.save(app);
    }

    private String generateRegistrationNumber() {

        int year = java.time.Year.now().getValue();

        int random = new java.util.Random()
                .nextInt(900000) + 100000;

        return "MSNC-REG-" + year + "-" + random;
    }}
