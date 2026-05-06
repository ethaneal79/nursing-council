package com.msnc.nursingcouncil.service;

import com.msnc.nursingcouncil.dto.response.ApplicationResponse;

public interface StatusService {
    ApplicationResponse trackByReferenceAndMobile(String referenceNumber, String mobile);
}
