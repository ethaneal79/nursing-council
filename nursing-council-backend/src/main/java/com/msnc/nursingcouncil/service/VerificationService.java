package com.msnc.nursingcouncil.service;

import com.msnc.nursingcouncil.dto.request.VerifyRequest;
import com.msnc.nursingcouncil.dto.response.VerificationResponse;

public interface VerificationService {
    VerificationResponse verify(VerifyRequest request);
}
