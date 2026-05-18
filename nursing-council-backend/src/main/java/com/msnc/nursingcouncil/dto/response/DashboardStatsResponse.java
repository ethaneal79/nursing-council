package com.msnc.nursingcouncil.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class DashboardStatsResponse {
    private long totalApplications;
    private long unprocessed;
    private long pendingApproval;
    private long approved;
    private long rejected;
    private long gnmCount;
    private long anmCount;
    private long newRegistrations;
    private long renewals;
}