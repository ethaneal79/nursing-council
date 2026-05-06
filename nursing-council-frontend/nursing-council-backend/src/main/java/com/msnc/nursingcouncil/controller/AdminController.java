package com.msnc.nursingcouncil.controller;

import com.msnc.nursingcouncil.dto.request.CreateUserRequest;
import com.msnc.nursingcouncil.dto.response.ApiResponse;
import com.msnc.nursingcouncil.dto.response.DashboardStatsResponse;
import com.msnc.nursingcouncil.dto.response.UserResponse;
import com.msnc.nursingcouncil.entity.CouncilUser;
import com.msnc.nursingcouncil.enums.UserRole;
import com.msnc.nursingcouncil.exception.ResourceNotFoundException;
import com.msnc.nursingcouncil.exception.ValidationException;
import com.msnc.nursingcouncil.repository.ApplicationRepository;
import com.msnc.nursingcouncil.repository.CouncilUserRepository;
import com.msnc.nursingcouncil.enums.ApplicationStatus;
import com.msnc.nursingcouncil.enums.ApplicationType;
import com.msnc.nursingcouncil.enums.CourseType;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Admin-only endpoints — ROLE_SUPERUSER required.
 *
 * POST   /admin/users              — create a new user (Registrar or DA)
 * GET    /admin/users              — list all users
 * PATCH  /admin/users/{id}/role    — grant / change role
 * PATCH  /admin/users/{id}/deactivate — revoke / deactivate
 * PATCH  /admin/users/{id}/activate   — re-activate
 * GET    /admin/dashboard          — summary statistics
 */
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final CouncilUserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    private final PasswordEncoder passwordEncoder;

    // ── Create user ──────────────────────────────────────────────────────────

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @Valid @RequestBody CreateUserRequest req) {

        if (userRepository.existsByUsername(req.getUsername())) {
            throw new ValidationException("Username already taken");
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ValidationException("Email already registered");
        }
        // Superuser cannot be created via API — only seeded
        if (req.getRole() == UserRole.SUPERUSER) {
            throw new ValidationException("Cannot create SUPERUSER via API");
        }

        CouncilUser user = CouncilUser.builder()
                .username(req.getUsername())
                .fullName(req.getFullName())
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role(req.getRole())
                .active(true)
                .build();

        userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("User created", UserResponse.from(user)));
    }

    // ── List users ───────────────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> listUsers() {
        List<UserResponse> users = userRepository.findAll()
                .stream().map(UserResponse::from).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok("Users fetched", users));
    }

    // ── Grant / change role ──────────────────────────────────────────────────

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<UserResponse>> changeRole(
            @PathVariable Long id,
            @RequestParam UserRole role) {

        if (role == UserRole.SUPERUSER) {
            throw new ValidationException("Cannot promote to SUPERUSER via API");
        }
        CouncilUser user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setRole(role);
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.ok("Role updated", UserResponse.from(user)));
    }

    // ── Deactivate (revoke) ──────────────────────────────────────────────────

    @PatchMapping("/users/{id}/deactivate")
    public ResponseEntity<ApiResponse<UserResponse>> deactivate(@PathVariable Long id) {
        CouncilUser user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setActive(false);
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.ok("User deactivated", UserResponse.from(user)));
    }

    // ── Activate ─────────────────────────────────────────────────────────────

    @PatchMapping("/users/{id}/activate")
    public ResponseEntity<ApiResponse<UserResponse>> activate(@PathVariable Long id) {
        CouncilUser user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setActive(true);
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.ok("User activated", UserResponse.from(user)));
    }

    // ── Dashboard stats ───────────────────────────────────────────────────────

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> dashboard() {
        long total       = applicationRepository.count();
        long unprocessed = applicationRepository.countByStatus(ApplicationStatus.SUBMITTED);
        long pending     = applicationRepository.countByStatus(ApplicationStatus.COUNCIL_REVIEW);
        long approved    = applicationRepository.countByStatus(ApplicationStatus.COMPLETED);
        long rejected    = applicationRepository.countByStatus(ApplicationStatus.REJECTED);
        long newReg      = applicationRepository.countByApplicationType(ApplicationType.NEW_REGISTRATION);
        long renewals    = applicationRepository.countByApplicationType(ApplicationType.RENEWAL);
        long gnm         = applicationRepository.countByCourseType(CourseType.GNM);
        long anm         = applicationRepository.countByCourseType(CourseType.ANM);

        DashboardStatsResponse stats = DashboardStatsResponse.builder()
                .totalApplications(total)
                .unprocessed(unprocessed)
                .pendingApproval(pending)
                .approved(approved)
                .rejected(rejected)
                .newRegistrations(newReg)
                .renewals(renewals)
                .gnmCount(gnm)
                .anmCount(anm)
                .build();

        return ResponseEntity.ok(ApiResponse.ok("Stats fetched", stats));
    }
}
