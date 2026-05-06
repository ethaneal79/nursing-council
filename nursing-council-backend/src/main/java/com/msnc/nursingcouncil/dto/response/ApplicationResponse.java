package com.msnc.nursingcouncil.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.msnc.nursingcouncil.enums.ApplicationStatus;
import com.msnc.nursingcouncil.enums.ApplicationType;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;

@Data @Builder @JsonInclude(JsonInclude.Include.NON_NULL)
public class ApplicationResponse {
    private Long              id;
    private String            referenceNumber;
    private ApplicationType   applicationType;
    private ApplicationStatus status;
    private String            applicantName;
    private String            applicantEmail;
    private String            applicantMobile;
    private String            email;
    private String            mobile;
    private String            rejectionReason;
    private OffsetDateTime    submittedAt;
    private OffsetDateTime    lastUpdatedAt;
    private List<StatusStep>  statusSteps;

    @Data @Builder
    public static class StatusStep {
        private String            label;
        private ApplicationStatus status;
        private boolean           completed;
        private OffsetDateTime    completedAt;
    }
}
