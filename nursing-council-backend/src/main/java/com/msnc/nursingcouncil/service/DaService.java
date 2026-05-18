package com.msnc.nursingcouncil.service;

public interface DaService {
    Object getUnprocessedApplications();
    Object getAllApplications();
    Object getSummaryReport();
    void updateStatus(
            String referenceNumber,
            String status,
            String rejectionReason,
            String adminNotes
    );
}