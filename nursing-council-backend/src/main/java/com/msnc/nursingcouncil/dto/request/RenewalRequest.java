package com.msnc.nursingcouncil.dto.request;

import com.msnc.nursingcouncil.enums.PaymentMethod;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class RenewalRequest {

    // ── Step 1: Verify registration ──────────────────────────────────────────
    @NotBlank(message = "Registration number is required")
    private String registrationNumber;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Invalid mobile number")
    private String mobile;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotNull(message = "Date of birth is required")
    private LocalDate dateOfBirth;

    // ── Step 2: Refresher course (optional) ─────────────────────────────────
    private String refresherCourseTitle;
    private Short refresherYearAttended;
    private String refresherOrganisingBody;
    private String refresherDuration;

    // ── Step 3: Payment ──────────────────────────────────────────────────────
    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    private String transactionRef;
}
