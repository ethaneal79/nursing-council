package com.msnc.nursingcouncil.service.impl;

import com.msnc.nursingcouncil.dto.request.VerifyRequest;
import com.msnc.nursingcouncil.dto.response.VerificationResponse;
import com.msnc.nursingcouncil.entity.RegisteredNurse;
import com.msnc.nursingcouncil.repository.RegisteredNurseRepository;
import com.msnc.nursingcouncil.service.VerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class VerificationServiceImpl implements VerificationService {

    private final RegisteredNurseRepository nurseRepo;

    @Override
    @Transactional(readOnly = true)
    public VerificationResponse verify(VerifyRequest request) {
        Optional<RegisteredNurse> result = (request.getFullName() != null && !request.getFullName().isBlank())
                ? nurseRepo.findByRegNoAndName(request.getRegistrationNumber(), request.getFullName())
                : nurseRepo.findByRegistrationNumber(request.getRegistrationNumber());

        if (result.isEmpty()) {
            log.info("Certificate not found: {}", request.getRegistrationNumber());
            return VerificationResponse.builder().valid(false).build();
        }

        RegisteredNurse nurse   = result.get();
        boolean         active  = nurse.getIsActive() && !nurse.getValidUntil().isBefore(LocalDate.now());

        log.info("Certificate verified: {} -> {}", request.getRegistrationNumber(), active ? "ACTIVE" : "EXPIRED");

        return VerificationResponse.builder()
                .valid(true)
                .registrationNumber(nurse.getRegistrationNumber())
                .name(nurse.getApplicant().getFullName())
                .course(nurse.getCourseName().getDisplayName())
                .institution(nurse.getInstitutionName())
                .validUntil(nurse.getValidUntil())
                .status(active ? "Active" : "Expired")
                .build();
    }
}
