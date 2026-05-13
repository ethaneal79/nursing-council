package com.msnc.nursingcouncil.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data @Builder @JsonInclude(JsonInclude.Include.NON_NULL)
public class VerificationResponse {
    private boolean   valid;
    private String    registrationNumber;
    private String    name;
    private String    course;
    private String    institution;
    private LocalDate validUntil;
    private String    status;   // "Active" | "Expired"
}
