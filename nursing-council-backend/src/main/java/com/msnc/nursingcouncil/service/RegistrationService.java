package com.msnc.nursingcouncil.service;

import com.msnc.nursingcouncil.dto.request.RegistrationRequest;
import com.msnc.nursingcouncil.dto.response.ApplicationResponse;
import com.msnc.nursingcouncil.enums.DocumentType;
import org.springframework.web.multipart.MultipartFile;

public interface RegistrationService {
    ApplicationResponse submitRegistration(RegistrationRequest request);
    void uploadDocument(String referenceNumber, DocumentType documentType, MultipartFile file);
}
