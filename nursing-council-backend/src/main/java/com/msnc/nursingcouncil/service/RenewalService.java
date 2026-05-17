package com.msnc.nursingcouncil.service;

import com.msnc.nursingcouncil.dto.request.RenewalRequest;
import com.msnc.nursingcouncil.dto.response.ApplicationResponse;
import com.msnc.nursingcouncil.dto.response.VerificationResponse;

public interface RenewalService {
    /** Verify that the nurse exists and their details match */
    VerificationResponse verifyNurseForRenewal(String registrationNumber, String mobile, String fullName);
    /** Submit a complete renewal application */
    ApplicationResponse  submitRenewal(RenewalRequest request);
}
