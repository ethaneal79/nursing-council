package com.msnc.nursingcouncil.service;

import com.msnc.nursingcouncil.entity.CouncilUser;
import com.msnc.nursingcouncil.enums.ApplicationStatus;
import com.msnc.nursingcouncil.enums.ApplicationType;
import com.msnc.nursingcouncil.enums.CourseType;
import com.msnc.nursingcouncil.enums.UserRole;
import com.msnc.nursingcouncil.repository.ApplicationRepository;
import com.msnc.nursingcouncil.repository.CouncilUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class AdminService {

    private final ApplicationRepository repo;
    private final CouncilUserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    // ---------------- DASHBOARD ----------------
    public Map<String, Object> getDashboardStats() {
        return Map.of(
                "totalApplications", repo.count(),
                "unprocessed", repo.countByStatus(ApplicationStatus.SUBMITTED),
                "pendingApproval", repo.countByStatus(ApplicationStatus.COUNCIL_REVIEW),
                "approved", repo.countByStatus(ApplicationStatus.COMPLETED),
                "rejected", repo.countByStatus(ApplicationStatus.REJECTED),
                "newRegistrations", repo.countByApplicationType(ApplicationType.NEW_REGISTRATION),
                "renewals", repo.countByApplicationType(ApplicationType.RENEWAL),
                "gnmCount", repo.countByCourseType(CourseType.GNM),
                "anmCount", repo.countByCourseType(CourseType.ANM)
        );
    }

    // ---------------- USERS ----------------
    public List<Map<String, Object>> getAllUsers() {
        return userRepo.findAll().stream().map(u -> {
            Map<String, Object> userMap = new java.util.HashMap<>();

            userMap.put("id", u.getId());
            userMap.put("username", u.getUsername());
            userMap.put("fullName", u.getFullName());
            userMap.put("email", u.getEmail());
            userMap.put("role", u.getRole().name());
            userMap.put("active", u.isActive());

            return userMap;
        }).collect(Collectors.toList());
    }

    // ---------------- CREATE USER ----------------
    public void createUser(Map<String, Object> payload) {
        CouncilUser user = new CouncilUser();

        user.setUsername((String) payload.get("username"));
        user.setFullName((String) payload.get("fullName"));
        user.setEmail((String) payload.get("email"));

        String password = (String) payload.get("password");
        user.setPasswordHash(passwordEncoder.encode(password));

        user.setRole(UserRole.valueOf((String) payload.get("role")));
        user.setActive(true);

        userRepo.save(user);
    }

    // ---------------- CHANGE ROLE ----------------
    public void changeRole(Long id, String role) {
        CouncilUser user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setRole(UserRole.valueOf(role));
        userRepo.save(user);
    }

    // ---------------- ACTIVATE ----------------
    public void activateUser(Long id) {
        CouncilUser user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setActive(true);
        userRepo.save(user);
    }

    // ---------------- DEACTIVATE ----------------
    public void deactivateUser(Long id) {
        CouncilUser user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setActive(false);
        userRepo.save(user);
    }
}