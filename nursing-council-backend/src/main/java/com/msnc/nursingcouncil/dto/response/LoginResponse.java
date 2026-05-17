package com.msnc.nursingcouncil.dto.response;

import com.msnc.nursingcouncil.enums.UserRole;
import lombok.Builder;
import lombok.Data;

@Data @Builder
public class LoginResponse {
    private String token;
    private String username;
    private String fullName;
    private UserRole role;
}
