package com.msnc.nursingcouncil.service;

import com.msnc.nursingcouncil.entity.Application;

public interface CertificateService {

    String generateCertificate(
            Application application,
            String registrationNumber
    );
}