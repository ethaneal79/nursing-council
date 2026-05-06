package com.msnc.nursingcouncil.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class StatusTrackRequest {

    @NotBlank(message = "Reference number is required")
    private String referenceNumber;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Invalid mobile number")
    private String mobile;
}
