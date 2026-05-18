package com.msnc.nursingcouncil.controller;

import com.msnc.nursingcouncil.service.AdminService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin") 
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // Dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // Users list
    @GetMapping("/users")
    public ResponseEntity<?> getUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    // Create user
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, Object> payload) {
        adminService.createUser(payload);
        return ResponseEntity.ok("User created");
    }

    // Change role
    @PatchMapping("/users/{id}/role")
    public ResponseEntity<?> changeRole(@PathVariable Long id, @RequestParam String role) {
        adminService.changeRole(id, role);
        return ResponseEntity.ok("Role updated");
    }

    // Deactivate
    @PatchMapping("/users/{id}/deactivate")
    public ResponseEntity<?> deactivate(@PathVariable Long id) {
        adminService.deactivateUser(id);
        return ResponseEntity.ok("User deactivated");
    }

    // Activate
    @PatchMapping("/users/{id}/activate")
    public ResponseEntity<?> activate(@PathVariable Long id) {
        adminService.activateUser(id);
        return ResponseEntity.ok("User activated");
    }
}