package com.msnc.nursingcouncil.dto.response;

import com.msnc.nursingcouncil.entity.CouncilUser;
import com.msnc.nursingcouncil.enums.UserRole;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;

@Data @Builder
public class UserResponse {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private UserRole role;
    private boolean active;
    private OffsetDateTime createdAt;

    public static UserResponse from(CouncilUser u) {
        return UserResponse.builder()
                .id(u.getId())
                .username(u.getUsername())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .role(u.getRole())
                .active(u.isActive())
                .createdAt(u.getCreatedAt())
                .build();
    }
}