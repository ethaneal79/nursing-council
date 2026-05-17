package com.msnc.nursingcouncil.dto.request;

import com.msnc.nursingcouncil.enums.ApplicationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateApplicationStatusRequest {

    @NotNull
    private ApplicationStatus status;

    /** Required when status is REJECTED */
    private String rejectionReason;

    /** Optional internal note for any status change */
    private String adminNotes;
}
