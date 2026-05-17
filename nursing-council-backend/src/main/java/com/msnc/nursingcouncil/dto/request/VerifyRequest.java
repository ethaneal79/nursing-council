package com.msnc.nursingcouncil.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyRequest {

    @NotBlank(message = "Registration number is required")
    private String registrationNumber;

    /** Optional – used to narrow the search */
    private String fullName;
}
