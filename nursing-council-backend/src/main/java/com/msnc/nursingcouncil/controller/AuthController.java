package com.msnc.nursingcouncil.controller;

import com.msnc.nursingcouncil.dto.request.LoginRequest;
import com.msnc.nursingcouncil.dto.response.ApiResponse;
import com.msnc.nursingcouncil.dto.response.LoginResponse;
import com.msnc.nursingcouncil.entity.CouncilUser;
import com.msnc.nursingcouncil.exception.ResourceNotFoundException;
import com.msnc.nursingcouncil.repository.CouncilUserRepository;
import com.msnc.nursingcouncil.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final CouncilUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest req) {
        CouncilUser user = userRepository.findByUsername(req.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid credentials"));

        if (!user.isActive()) {
            return ResponseEntity.status(403)
                    .body(ApiResponse.error("Account is disabled"));
        }

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new ResourceNotFoundException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());

        LoginResponse response = LoginResponse.builder()
                .token(token)
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();

        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }
}
