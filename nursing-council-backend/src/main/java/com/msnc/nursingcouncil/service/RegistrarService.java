package com.msnc.nursingcouncil.service;

public interface RegistrarService {
    Object getApplications();
    void approveApplication(
            String referenceNumber,
            String adminNotes
    );
    void completeApplication(String referenceNumber);
}