package com.msnc.nursingcouncil.dto.request;

import com.msnc.nursingcouncil.enums.CourseType;
import com.msnc.nursingcouncil.enums.Gender;
import com.msnc.nursingcouncil.enums.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class RegistrationRequest {

    // ── Step 1: Personal Details ────────────────────────────────────────────
    @NotBlank(message = "Full name is required")
    @Size(max = 200)
    private String fullName;

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    @NotNull(message = "Gender is required")
    private Gender gender;

    @Size(max = 100)
    private String nationality = "Indian";

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email address")
    private String email;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Invalid mobile number")
    private String mobile;

    @NotBlank(message = "Permanent address is required")
    private String permanentAddress;

    // ── Step 2: Course Details ───────────────────────────────────────────────
    @NotNull(message = "Course name is required")
    private CourseType courseName;

    @NotNull(message = "Year of passing is required")
    @Min(value = 1980) @Max(value = 2026)
    private Short yearOfPassing;

    @NotBlank(message = "Institution name is required")
    @Size(max = 300)
    private String institutionName;

    @NotBlank(message = "University or board is required")
    @Size(max = 300)
    private String universityOrBoard;

    @Size(max = 100)
    private String examRollNumber;

    @Size(max = 100)
    private String previousCouncilRegNo;

    // ── Step 4: Payment ──────────────────────────────────────────────────────
    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    @Size(max = 200)
    private String transactionRef;
}
