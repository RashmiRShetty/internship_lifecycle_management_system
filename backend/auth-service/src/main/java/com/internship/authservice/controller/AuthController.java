package com.internship.authservice.controller;

import com.internship.authservice.dto.AdminCreationRequest;
import com.internship.authservice.dto.AuthRequest;
import com.internship.authservice.dto.RegistrationRequest;
import com.internship.authservice.dto.ResetPasswordRequest;
import com.internship.authservice.entity.ApprovalStatus;
import com.internship.authservice.entity.Role;
import com.internship.authservice.entity.UserCredential;
import com.internship.authservice.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private AuthService service;

    @Autowired
    private AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public ResponseEntity<String> addNewUser(@RequestBody RegistrationRequest request) {
        String result = service.saveUser(request);
        if (result.startsWith("Error:")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String purpose = request.get("purpose"); // "registration" or "forgot-password"
        try {
            if ("registration".equalsIgnoreCase(purpose)) {
                service.sendOtpForRegistration(email);
            } else {
                service.sendOtpForForgotPassword(email);
            }
            return ResponseEntity.ok(Collections.singletonMap("message", "OTP sent to " + email));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Collections.singletonMap("error", e.getMessage() != null ? e.getMessage() : "Failed to send OTP"));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        try {
            boolean isValid = service.checkOtpValidity(email, otp);
            if (isValid) {
                return ResponseEntity.ok(Collections.singletonMap("message", "OTP verified successfully"));
            } else {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Invalid or expired OTP"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Collections.singletonMap("error", e.getMessage() != null ? e.getMessage() : "Failed to verify OTP"));
        }
    }

    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String role = request.get("role"); // Get role from request
        try {
            String jwt = service.googleLogin(token, role);
            return ResponseEntity.ok(jwt);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            if (service.verifyOtp(request.getEmail(), request.getOtp())) {
                String result = service.resetPassword(request.getEmail(), request.getNewPassword());
                return ResponseEntity.ok(Collections.singletonMap("message", result));
            } else {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Invalid or expired OTP"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage() != null ? e.getMessage() : "Failed to reset password"));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Email is required"));
        }
        if (oldPassword == null || oldPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Old password is required"));
        }
        if (newPassword == null || newPassword.trim().length() < 6) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Password must be at least 6 characters"));
        }
        try {
            String result = service.changePasswordWithOldPassword(email, oldPassword, newPassword.trim());
            return ResponseEntity.ok(Collections.singletonMap("message", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage() != null ? e.getMessage() : "Failed to change password"));
        }
    }

    @PostMapping("/update-password")
    public ResponseEntity<?> updatePassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("newPassword");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Email is required"));
        }
        if (newPassword == null || newPassword.trim().length() < 6) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Password must be at least 6 characters"));
        }
        try {
            String result = service.updateUserPassword(email, newPassword.trim());
            return ResponseEntity.ok(Collections.singletonMap("message", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/token")
    public ResponseEntity<?> getToken(@RequestBody AuthRequest authRequest) {
        try {
            if (authRequest == null || authRequest.getEmail() == null || authRequest.getEmail().isBlank()) {
                return ResponseEntity.badRequest().body("Email address is required");
            }
            if (authRequest.getPassword() == null || authRequest.getPassword().isBlank()) {
                return ResponseEntity.badRequest().body("Password is required");
            }

            String normalizedEmail = normalizeEmail(authRequest.getEmail());
            String rawPassword = authRequest.getPassword();

            Authentication authenticate = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, rawPassword));

            if (authenticate.isAuthenticated()) {
                UserCredential user = service.getUserByEmail(normalizedEmail);
                
                // Double-check admin approval status before generating token
                if (user.getRole() == Role.ADMIN && user.getApprovalStatus() != ApprovalStatus.APPROVED) {
                    if (user.getApprovalStatus() == ApprovalStatus.PENDING) {
                        return ResponseEntity.status(403).body("Admin account pending approval from Super Admin");
                    } else if (user.getApprovalStatus() == ApprovalStatus.REJECTED) {
                        return ResponseEntity.status(403).body("Admin account has been rejected. Please contact Super Admin");
                    }
                }
                
                String token = service.generateToken(normalizedEmail, user.getRole().name());
                return ResponseEntity.ok(token);
            } else {
                return ResponseEntity.status(401).body("Authentication failed");
            }
        } catch (UsernameNotFoundException e) {
            System.err.println("Login failed - User not found: " + authRequest.getEmail() + " -> " + e.getMessage());
            return ResponseEntity.status(401).body("No account registered with email: " + authRequest.getEmail().trim());
        } catch (DisabledException e) {
            System.err.println("Login disabled for " + authRequest.getEmail() + ": " + e.getMessage());
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (BadCredentialsException e) {
            System.err.println("Login failed - Bad credentials for " + authRequest.getEmail());
            return ResponseEntity.status(401).body("Invalid email or password");
        } catch (Exception e) {
            System.err.println("Login error for " + authRequest.getEmail() + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(401).body(e.getMessage() != null ? e.getMessage() : "Invalid email or password");
        }
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        String trimmed = email.trim();
        return trimmed.isEmpty() ? null : trimmed.toLowerCase();
    }

    @PutMapping("/admin/users/role")
    public ResponseEntity<String> updateFacultyRole(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String role = request.get("role");
        String result = service.updateFacultyRole(email, role);
        if (result.startsWith("Error:")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    @PutMapping("/admin/departments/admin")
    public ResponseEntity<String> setDepartmentAdmin(@RequestBody Map<String, String> request) {
        String department = request.get("department");
        String email = request.get("email");
        String result = service.setDepartmentAdmin(department, email);
        if (result.startsWith("Error:")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/validate")
    public String validateToken(@RequestParam("token") String token) {
        service.validateToken(token);
        return "Token is valid";
    }

    // Admin Approval Endpoints (SUPER_ADMIN only)
    
    @GetMapping("/admin/pending-admins")
    public ResponseEntity<?> getPendingAdmins() {
        try {
            var pendingAdmins = service.getPendingAdmins();
            return ResponseEntity.ok(pendingAdmins);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                Collections.singletonMap("error", e.getMessage() != null ? e.getMessage() : "Failed to fetch pending admins"));
        }
    }

    @PostMapping("/admin/approve-admin")
    public ResponseEntity<?> approveAdmin(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        try {
            String result = service.approveAdmin(email);
            if (result.startsWith("Error:")) {
                return ResponseEntity.badRequest().body(result);
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                Collections.singletonMap("error", e.getMessage() != null ? e.getMessage() : "Failed to approve admin"));
        }
    }

    @PostMapping("/admin/reject-admin")
    public ResponseEntity<?> rejectAdmin(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        try {
            String result = service.rejectAdmin(email);
            if (result.startsWith("Error:")) {
                return ResponseEntity.badRequest().body(result);
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                Collections.singletonMap("error", e.getMessage() != null ? e.getMessage() : "Failed to reject admin"));
        }
    }

    // Temporary endpoint to clear all admins (except Super Admin) - for testing purposes
    @DeleteMapping("/admin/clear-all-admins")
    public ResponseEntity<?> clearAllAdmins() {
        try {
            String result = service.clearAllAdmins();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                Collections.singletonMap("error", e.getMessage() != null ? e.getMessage() : "Failed to clear admins"));
        }
    }

    // Super Admin: Create new admin directly
    @PostMapping("/admin/create-admin")
    public ResponseEntity<?> createAdmin(@RequestBody AdminCreationRequest request) {
        try {
            String result = service.createAdminBySuperAdmin(request);
            if (result.startsWith("Error:")) {
                return ResponseEntity.badRequest().body(result);
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                Collections.singletonMap("error", e.getMessage() != null ? e.getMessage() : "Failed to create admin"));
        }
    }
}
