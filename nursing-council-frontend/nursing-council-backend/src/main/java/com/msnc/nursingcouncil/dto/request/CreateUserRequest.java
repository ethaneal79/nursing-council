package com.msnc.nursingcouncil.dto.request;

import com.msnc.nursingcouncil.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateUserRequest {

    @NotBlank
    private String username;

    @NotBlank
    private String fullName;

    @Email @NotBlank
    private String email;

    @NotBlank
    private String password;

    @NotNull
    private UserRole role;
}
