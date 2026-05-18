package com.msnc.nursingcouncil.dto.request;

import com.msnc.nursingcouncil.enums.ApplicationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateApplicationStatusRequest {

    @NotNull
    private ApplicationStatus status;

    private String rejectionReason;

    private String adminNotes;
}