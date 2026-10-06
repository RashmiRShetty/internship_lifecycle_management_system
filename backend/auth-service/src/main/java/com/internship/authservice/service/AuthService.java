package com.internship.authservice.service;

import com.internship.authservice.dto.AdminCreationRequest;
import com.internship.authservice.dto.RegistrationRequest;
import com.internship.authservice.entity.ApprovalStatus;
import com.internship.authservice.entity.Role;
import com.internship.authservice.entity.UserCredential;
import com.internship.authservice.repository.UserCredentialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import jakarta.annotation.PostConstruct;
import reactor.core.publisher.Mono;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AuthService {

    @Autowired
    private UserCredentialRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private WebClient.Builder webClientBuilder;

    @Autowired
    private WebClient.Builder loadBalancedWebClientBuilder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private OtpService otpService;

    @PostConstruct
    public void initAdmin() {
        try {
            String adminEmail = "admin@internsmart.com";
            String adminPassword = "Admin@Password123";
            Optional<UserCredential> existingAdmin = repository.findByEmailIgnoreCaseTrimmed(normalizeEmail(adminEmail));

            if (existingAdmin.isPresent()) {
                UserCredential admin = existingAdmin.get();
                admin.setPassword(passwordEncoder.encode(adminPassword));
                admin.setRole(Role.SUPER_ADMIN);
                admin.setApprovalStatus(ApprovalStatus.APPROVED);
                repository.save(admin);
                System.out.println("-------------------------------------------");
                System.out.println("ADMIN ACCOUNT VERIFIED / RESET");
                System.out.println("Email: " + adminEmail);
                System.out.println("Password: " + adminPassword);
                System.out.println("-------------------------------------------");
            } else {
                UserCredential admin = new UserCredential();
                admin.setEmail(adminEmail);
                admin.setPassword(passwordEncoder.encode(adminPassword));
                admin.setRole(Role.SUPER_ADMIN);
                admin.setApprovalStatus(ApprovalStatus.APPROVED);
                repository.save(admin);
                System.out.println("-------------------------------------------");
                System.out.println("DEFAULT ADMIN ACCOUNT CREATED");
                System.out.println("Email: " + adminEmail);
                System.out.println("Password: " + adminPassword);
                System.out.println("-------------------------------------------");
            }
        } catch (Exception e) {
            System.err.println("Error initializing admin account: " + e.getMessage());
            e.printStackTrace();
            // Don't fail the entire application if admin init fails
        }
    }

    public String saveUser(RegistrationRequest request) {
        System.out.println("===============================================");
        System.out.println("=== saveUser() CALLED ===");
        System.out.println("RegistrationRequest received:");
        System.out.println("  Email: " + request.getEmail());
        System.out.println("  First Name: " + request.getFirstName());
        System.out.println("  Last Name: " + request.getLastName());
        System.out.println("  Phone: " + request.getPhone());
        System.out.println("  Role: " + request.getRole());
        System.out.println("  OTP: " + request.getOtp());
        System.out.println("===============================================");

        request.setEmail(normalizeEmail(request.getEmail()));

        // 1. Mandatory Field Validation (Backend Safety)
        if (request.getEmail() == null || request.getEmail().isEmpty())
            return "Error: Email is required";
        if (request.getFirstName() == null || request.getFirstName().isEmpty())
            return "Error: First Name is required";
        if (request.getLastName() == null || request.getLastName().isEmpty())
            return "Error: Last Name is required";
        if (request.getPhone() == null || request.getPhone().isEmpty())
            return "Error: Phone is required";
        if (request.getOtp() == null || request.getOtp().trim().isEmpty())
            return "Error: OTP is required";

        request.setOtp(request.getOtp().trim());

        // 2. Verify OTP first (this is the ONE place the OTP is actually consumed)
        if (!otpService.validateOtp(request.getEmail(), request.getOtp())) {
            return "Error: Invalid or expired OTP. Please try again.";
        }

        // check user exists
        Optional<UserCredential> existingUser = repository.findByEmailIgnoreCaseTrimmed(request.getEmail());
        if (existingUser.isPresent()) {
            UserCredential user = existingUser.get();
            String existingRole = user.getRole() != null ? user.getRole().name() : "another role";
            return "Error: An account with email '" + request.getEmail() + "' is already registered as " + existingRole + ". An email address can only be registered for one role (Student, Faculty, or Admin).";
        }

        if (request.getRole() == Role.SUPER_ADMIN) {
            return "Error: SUPER_ADMIN cannot be registered.";
        }

        // 3. If role is ADMIN, check for existing admin in this department
        if (request.getRole() == Role.ADMIN) {
            try {
                Boolean adminExists = webClientBuilder.build()
                        .get()
                        .uri("http://localhost:8082/users/profile/check-admin?department="
                                + URLEncoder.encode(request.getDepartment(), StandardCharsets.UTF_8))
                        .retrieve()
                        .bodyToMono(Boolean.class)
                        .block();

                if (adminExists != null && adminExists) {
                    return "Error: Already registered admin for this department.";
                }
            } catch (Exception e) {
                System.err.println("Error checking admin existence: " + e.getMessage());
                return "Error: Could not verify admin availability for this department. Please ensure user-service is running and try again.";
            }
        }

        // create credential entity
        UserCredential credential = new UserCredential();
        credential.setEmail(request.getEmail());
        credential.setPassword(passwordEncoder.encode(request.getPassword()));
        credential.setRole(request.getRole());

        // Set ADMIN registrations to PENDING status
        if (credential.getRole() == Role.ADMIN) {
            credential.setApprovalStatus(ApprovalStatus.PENDING);
        } else {
            credential.setApprovalStatus(ApprovalStatus.APPROVED);
        }

        repository.save(credential);

        // decide user-service endpoint
        String profilePath;
        if (credential.getRole() == Role.ADMIN || credential.getRole() == Role.FACULTY
                || credential.getRole() == Role.SUPER_ADMIN) {
            profilePath = "/users/profile/faculty";
        } else {
            profilePath = "/users/profile/student";
        }

        Map<String, Object> profileData = new HashMap<>();
        profileData.put("email", request.getEmail());
        profileData.put("firstName", request.getFirstName());
        profileData.put("lastName", request.getLastName());
        profileData.put("department", request.getDepartment());
        profileData.put("phone", request.getPhone());
        profileData.put("gender", request.getGender());
        profileData.put("dob", request.getDob());
        profileData.put("linkedin", request.getLinkedin());
        profileData.put("github", request.getGithub());
        profileData.put("profilePhoto", request.getProfilePhoto());

        if (credential.getRole() == Role.STUDENT) {
            profileData.put("studying", request.getStudying());
            profileData.put("status", request.getStatus());
            profileData.put("collegeName", request.getCollegeName());
            profileData.put("registrationNumber", request.getRegistrationNumber());
            profileData.put("semester", request.getSemester());
            profileData.put("cgpa", request.getCgpa());
            profileData.put("skills", request.getSkills());
            profileData.put("interestedDomain", request.getInterestedDomain());
            profileData.put("highestGraduation", request.getHighestGraduation());
            profileData.put("workingField", request.getWorkingField());
            profileData.put("experience", request.getExperience());
            profileData.put("resumeUrl", request.getResumeUrl());
            profileData.put("certificates", request.getCertificates());
            profileData.put("projects", request.getProjects());
        } else {
            profileData.put("designation", request.getDesignation());
            profileData.put("logoUrl", request.getLogoUrl());
            profileData.put("employeeId", request.getEmployeeId());
            profileData.put("idProofUrl", request.getIdProofUrl());
            profileData.put("role", request.getRole().name());
        }

        try {
            System.out.println("Calling user-service to create profile for email: " + credential.getEmail());
            System.out.println("ProfileData being sent: " + profileData);
            System.out.println("Calling URL: http://localhost:8082" + profilePath);

            String response = webClientBuilder.build()
                    .post()
                    .uri("http://localhost:8082" + profilePath)
                    .bodyValue(profileData)
                    .retrieve()
                    .bodyToMono(String.class)
                    .onErrorResume(WebClientResponseException.class, ex -> {
                        String body = ex.getResponseBodyAsString();
                        return Mono.error(
                                new RuntimeException(body != null && !body.isBlank() ? body : ex.getMessage(), ex));
                    })
                    .block(); // Blocking call to ensure it finishes during registration

            System.out.println("User-service response: " + response);
            System.out.println("Profile created successfully for: " + credential.getEmail());

            // Send Welcome Notification
            String welcomeMessage;
            if (credential.getRole() == Role.ADMIN) {
                welcomeMessage = "Your admin registration has been submitted and is pending approval from the Super Admin. You will be notified once your account is approved.";

                // Send email to admin about pending registration
                emailService.sendEmail(credential.getEmail(), "Admin Registration Submitted - InternSmart",
                        "Thank you for registering as an admin on InternSmart.\n\n" +
                                "Your registration is currently pending approval from the Super Admin.\n" +
                                "You will receive an email notification once your account has been reviewed and approved.\n\n"
                                +
                                "For any queries, please contact: admin@internsmart.com");

                // Notify Super Admin about pending admin registration
                notifySuperAdminAboutPendingAdmin(request.getEmail(), request.getFirstName(), request.getLastName(),
                        request.getDepartment());
            } else {
                welcomeMessage = "Your account has been successfully created. Welcome aboard!";

                // Send welcome email to other users
                emailService.sendEmail(credential.getEmail(), "Welcome to InternSmart",
                        "Welcome to InternSmart!\n\n" +
                                "Your account has been successfully created.\n" +
                                "You can now login to the system using your credentials.\n\n" +
                                "Login URL: http://localhost:3000/login\n\n" +
                                "If you have any questions, feel free to contact support.");
            }
            notifyUser(credential.getEmail(), "Welcome to InternSmart", welcomeMessage, "ALL");
        } catch (WebClientResponseException e) {
            System.err.println("ERROR calling user-service: status=" + e.getStatusCode() + ", body="
                    + e.getResponseBodyAsString());
            e.printStackTrace();
            repository.delete(credential);
            String responseBody = e.getResponseBodyAsString();
            if (responseBody != null && !responseBody.isBlank()) {
                if (responseBody.contains("duplicate key") || responseBody.contains("already exists")) {
                    return "Error: An account with email '" + credential.getEmail() + "' is already registered. Please login to your account.";
                }
                return responseBody.startsWith("Error:") ? responseBody : "Error: " + responseBody;
            }
            return "Error: Failed to create profile. Please try again.";
        } catch (RuntimeException e) {
            System.err.println("ERROR calling user-service: " + e.getMessage());
            e.printStackTrace();
            repository.delete(credential);
            String message = e.getMessage();
            if (message != null && !message.isBlank()) {
                if (message.contains("duplicate key") || message.contains("already exists")) {
                    return "Error: An account with email '" + credential.getEmail() + "' is already registered. Please login to your account.";
                }
                return message.startsWith("Error:") ? message : "Error: " + message;
            }
            return "Error: Failed to create profile. Please try again.";
        } catch (Exception e) {
            System.err.println("ERROR calling user-service: " + e.getMessage());
            e.printStackTrace();
            repository.delete(credential);
            return "Error: Failed to create profile. Please try again.";
        }

        if (credential.getRole() == Role.ADMIN) {
            return "Admin registration submitted. Waiting for super admin approval.";
        }
        return "user added to the system";
    }

    private void notifyUser(String email, String title, String message, String type) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("recipientEmail", email);
            body.put("title", title);
            body.put("message", message);
            body.put("type", type);

            webClientBuilder.build()
                    .post()
                    .uri("http://localhost:8085/notifications") // Assuming notification-service runs on 8085
                    .bodyValue(body)
                    .retrieve()
                    .toBodilessEntity()
                    .subscribe();
        } catch (Exception e) {
            System.err.println("Failed to send notification: " + e.getMessage());
        }
    }

    private void notifySuperAdminAboutPendingAdmin(String email, String firstName, String lastName, String department) {
        try {
            // Get Super Admin email
            Optional<UserCredential> superAdmin = repository
                    .findByEmailIgnoreCase(normalizeEmail("admin@internsmart.com"));
            if (superAdmin.isPresent()) {
                String message = String.format(
                        "New admin registration pending approval:\n\nName: %s %s\nEmail: %s\nDepartment: %s\n\nPlease review and approve this registration.",
                        firstName, lastName, email, department);

                // Send email to Super Admin
                emailService.sendEmail("admin@internsmart.com",
                        "Pending Admin Registration Approval - InternSmart",
                        message + "\n\nLogin to Admin Dashboard to review: http://localhost:3000/admin");

                // Also send notification through notification service
                Map<String, Object> body = new HashMap<>();
                body.put("recipientEmail", "admin@internsmart.com");
                body.put("title", "Pending Admin Registration Approval");
                body.put("message", message);
                body.put("type", "ADMIN_APPROVAL");

                webClientBuilder.build()
                        .post()
                        .uri("http://localhost:8085/notifications")
                        .bodyValue(body)
                        .retrieve()
                        .toBodilessEntity()
                        .subscribe();

                System.out.println("Super Admin notified about pending admin registration: " + email);
            }
        } catch (Exception e) {
            System.err.println("Failed to notify Super Admin: " + e.getMessage());
        }
    }

    public String generateToken(String username, String role) {
        return jwtService.generateToken(username, role);
    }

    public void validateToken(String token) {
        jwtService.validateToken(token);
    }

    public UserCredential getUserByEmail(String email) {
        return repository.findByEmailIgnoreCaseTrimmed(normalizeEmail(email))
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public String updateFacultyRole(String email, String roleName) {
        String normalizedEmail = normalizeEmail(email);
        Role newRole;
        try {
            newRole = Role.valueOf(roleName.toUpperCase());
        } catch (Exception e) {
            return "Error: Invalid role.";
        }

        if (newRole == Role.SUPER_ADMIN || newRole == Role.STUDENT) {
            return "Error: Unsupported role change.";
        }

        UserCredential credential = repository.findByEmailIgnoreCaseTrimmed(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> facultyProfile;
        try {
            facultyProfile = webClientBuilder.build()
                    .get()
                    .uri("http://localhost:8082/users/profile/faculty?email="
                            + URLEncoder.encode(normalizedEmail, StandardCharsets.UTF_8))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
        } catch (Exception e) {
            return "Error: Faculty profile not found.";
        }

        if (facultyProfile == null) {
            return "Error: Faculty profile not found.";
        }

        String department = facultyProfile.get("department") != null ? String.valueOf(facultyProfile.get("department"))
                : null;
        if (newRole == Role.ADMIN) {
            if (department == null || department.isBlank()) {
                return "Error: Department is required to set ADMIN role.";
            }
            try {
                List<Map<String, Object>> departmentFaculty = webClientBuilder.build()
                        .get()
                        .uri("http://localhost:8082/users/profile/faculty/department?department="
                                + URLEncoder.encode(department, StandardCharsets.UTF_8))
                        .retrieve()
                        .bodyToMono(List.class)
                        .block();

                boolean otherAdminExists = departmentFaculty != null
                        && departmentFaculty.stream().anyMatch(f -> "ADMIN".equals(String.valueOf(f.get("role")))
                                && !email.equalsIgnoreCase(String.valueOf(f.get("email"))));

                if (otherAdminExists) {
                    return "Error: Already registered admin for this department.";
                }
            } catch (Exception e) {
                return "Error: Could not verify admin availability for this department.";
            }
        }

        Role previousRole = credential.getRole();
        ApprovalStatus previousApprovalStatus = credential.getApprovalStatus();
        credential.setRole(newRole);
        credential.setApprovalStatus(ApprovalStatus.APPROVED);
        repository.save(credential);

        try {
            Map<String, String> body = new HashMap<>();
            body.put("email", normalizedEmail);
            body.put("role", newRole.name());

            webClientBuilder.build()
                    .put()
                    .uri("http://localhost:8082/users/profile/faculty/role")
                    .bodyValue(body)
                    .retrieve()
                    .toBodilessEntity()
                    .block();
        } catch (Exception e) {
            credential.setRole(previousRole);
            credential.setApprovalStatus(previousApprovalStatus);
            repository.save(credential);
            return "Error: Failed to update profile role.";
        }

        return "Role updated successfully";
    }

    public String setDepartmentAdmin(String department, String email) {
        if (department == null || department.isBlank()) {
            return "Error: Department is required.";
        }

        List<Map<String, Object>> departmentFaculty;
        try {
            departmentFaculty = webClientBuilder.build()
                    .get()
                    .uri("http://localhost:8082/users/profile/faculty/department?department="
                            + URLEncoder.encode(department, StandardCharsets.UTF_8))
                    .retrieve()
                    .bodyToMono(List.class)
                    .block();
        } catch (Exception e) {
            return "Error: Could not load department faculty.";
        }

        String currentAdminEmail = (departmentFaculty != null) ? departmentFaculty.stream()
                .filter(f -> "ADMIN".equals(String.valueOf(f.get("role"))))
                .map(f -> String.valueOf(f.get("email")))
                .findFirst()
                .orElse(null) : null;

        // Handle Admin Removal Signal ("REMOVE" or "NONE")
        if (email == null || email.isBlank() || "REMOVE".equalsIgnoreCase(email) || "NONE".equalsIgnoreCase(email)) {
            if (currentAdminEmail != null) {
                String demote = updateFacultyRole(currentAdminEmail, "FACULTY");
                if (demote.startsWith("Error:")) {
                    return demote;
                }
                return "Department admin removed successfully";
            }
            return "No active admin found for this department.";
        }

        if (departmentFaculty == null || departmentFaculty.isEmpty()) {
            return "Error: No faculty found for this department.";
        }

        boolean targetExistsInDepartment = departmentFaculty.stream()
                .anyMatch(f -> email.equalsIgnoreCase(String.valueOf(f.get("email"))));
        if (!targetExistsInDepartment) {
            return "Error: Faculty not found in this department.";
        }

        if (currentAdminEmail != null && currentAdminEmail.equalsIgnoreCase(email)) {
            return "Department admin updated successfully";
        }

        if (currentAdminEmail != null) {
            String demote = updateFacultyRole(currentAdminEmail, "FACULTY");
            if (demote.startsWith("Error:")) {
                return demote;
            }
        }

        String promote = updateFacultyRole(email, "ADMIN");
        if (promote.startsWith("Error:")) {
            if (currentAdminEmail != null) {
                updateFacultyRole(currentAdminEmail, "ADMIN");
            }
            return promote;
        }

        return "Department admin updated successfully";
    }

    public void sendOtpForRegistration(String email) {
        String normalizedEmail = normalizeEmail(email);
        Optional<UserCredential> existingUser = repository.findByEmailIgnoreCaseTrimmed(normalizedEmail);
        if (existingUser.isPresent()) {
            UserCredential user = existingUser.get();
            String existingRole = user.getRole() != null ? user.getRole().name() : "another role";
            throw new RuntimeException("An account with email '" + normalizedEmail + "' is already registered as " + existingRole + ". An email address can only be registered for one role (Student, Faculty, or Admin).");
        }
        String otp = otpService.generateOtp(normalizedEmail);
        emailService.sendEmail(normalizedEmail, "InternSmart Registration OTP",
                "Your OTP for registration is: " + otp + ". It is valid for 15 minutes.");
    }

    public void sendOtpForForgotPassword(String email) {
        String normalizedEmail = normalizeEmail(email);
        if (repository.findByEmailIgnoreCaseTrimmed(normalizedEmail).isEmpty()) {
            throw new RuntimeException("Error: User not found");
        }
        String otp = otpService.generateOtp(normalizedEmail);
        emailService.sendEmail(normalizedEmail, "InternSmart Forgot Password OTP",
                "Your OTP for password reset is: " + otp + ". It is valid for 5 minutes.");
    }

    public boolean checkOtpValidity(String email, String otp) {
        return otpService.checkOtpValidity(email, otp);
    }

    // FIX: use the non-destructive check here.
    // Previously this called otpService.validateOtp(...), which REMOVES the OTP
    // from the store on success. That meant the "Verify OTP" step in the UI was
    // silently consuming the OTP, so the later /auth/register call (which also
    // calls validateOtp) always failed with "Invalid or expired OTP" even though
    // the user entered the correct code.
    public boolean verifyOtp(String email, String otp) {
        return otpService.checkOtpValidity(email, otp);
    }

    public String resetPassword(String email, String newPassword) {
        UserCredential credential = repository.findByEmailIgnoreCaseTrimmed(normalizeEmail(email))
                .orElseThrow(() -> new RuntimeException("User not found"));
        credential.setPassword(passwordEncoder.encode(newPassword));
        repository.save(credential);
        return "Password reset successful";
    }

    public String updateUserPassword(String email, String newPassword) {
        UserCredential credential = repository.findByEmailIgnoreCaseTrimmed(normalizeEmail(email))
                .orElseThrow(() -> new RuntimeException("User not found"));
        credential.setPassword(passwordEncoder.encode(newPassword));
        repository.save(credential);
        return "Password updated successfully";
    }

    public String changePasswordWithOldPassword(String email, String oldPassword, String newPassword) {
        String normalizedEmail = normalizeEmail(email);
        UserCredential credential = repository.findByEmailIgnoreCaseTrimmed(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        if (oldPassword == null || !passwordEncoder.matches(oldPassword, credential.getPassword())) {
            throw new RuntimeException("Incorrect old password. Please enter your correct old password or click 'Forgot Password?' to verify via OTP.");
        }
        if (newPassword == null || newPassword.trim().length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters long.");
        }
        credential.setPassword(passwordEncoder.encode(newPassword.trim()));
        repository.save(credential);
        return "Password changed successfully";
    }

    // Admin Approval Methods

    public List<UserCredential> getPendingAdmins() {
        return repository.findByRoleAndApprovalStatus(Role.ADMIN, ApprovalStatus.PENDING);
    }

    public String approveAdmin(String email) {
        Optional<UserCredential> userOpt = repository.findByEmailIgnoreCaseTrimmed(normalizeEmail(email));
        if (userOpt.isEmpty()) {
            return "Error: User not found";
        }

        UserCredential user = userOpt.get();
        if (user.getRole() != Role.ADMIN) {
            return "Error: User is not an admin";
        }

        if (user.getApprovalStatus() != ApprovalStatus.PENDING) {
            return "Error: Admin registration is not pending";
        }

        user.setApprovalStatus(ApprovalStatus.APPROVED);
        repository.save(user);

        // Send email notification to the admin
        emailService.sendEmail(email, "Admin Registration Approved - InternSmart",
                "Congratulations! Your admin registration has been approved by the Super Admin.\n\n" +
                        "You can now login to the InternSmart system using your credentials.\n\n" +
                        "Login URL: http://localhost:3000/login\n\n" +
                        "If you have any questions, please contact the Super Admin.");

        // Notify the admin about approval through notification service
        notifyUser(email, "Admin Registration Approved",
                "Your admin registration has been approved. You can now login to the system.", "ADMIN_APPROVAL");

        return "Admin approved successfully";
    }

    public String rejectAdmin(String email) {
        Optional<UserCredential> userOpt = repository.findByEmailIgnoreCaseTrimmed(normalizeEmail(email));
        if (userOpt.isEmpty()) {
            return "Error: User not found";
        }

        UserCredential user = userOpt.get();
        if (user.getRole() != Role.ADMIN) {
            return "Error: User is not an admin";
        }

        if (user.getApprovalStatus() != ApprovalStatus.PENDING) {
            return "Error: Admin registration is not pending";
        }

        Role previousRole = user.getRole();
        ApprovalStatus previousApprovalStatus = user.getApprovalStatus();

        user.setApprovalStatus(ApprovalStatus.REJECTED);
        user.setRole(Role.FACULTY);
        repository.save(user);

        try {
            Map<String, String> body = new HashMap<>();
            body.put("email", email);
            body.put("role", Role.FACULTY.name());

            webClientBuilder.build()
                    .put()
                    .uri("http://localhost:8082/users/profile/faculty/role")
                    .bodyValue(body)
                    .retrieve()
                    .toBodilessEntity()
                    .block();
        } catch (Exception e) {
            user.setApprovalStatus(previousApprovalStatus);
            user.setRole(previousRole);
            repository.save(user);
            return "Error: Failed to reject admin request.";
        }

        // Send email notification to the admin
        emailService.sendEmail(email, "Admin Registration Rejected - InternSmart",
                "We regret to inform you that your admin registration has been rejected by the Super Admin.\n\n" +
                        "If you believe this is an error or would like more information, please contact the Super Admin.\n\n"
                        +
                        "Email: admin@internsmart.com");

        // Notify the admin about rejection through notification service
        notifyUser(email, "Admin Registration Rejected",
                "Your admin registration has been rejected. Please contact the Super Admin for more information.",
                "ADMIN_APPROVAL");

        return "Admin rejected successfully";
    }

    // Method to clear all admins except Super Admin (for testing purposes)
    public String clearAllAdmins() {
        try {
            List<UserCredential> adminsToDelete = repository.findAll().stream()
                    .filter(user -> user.getRole() == Role.ADMIN)
                    .collect(Collectors.toList());

            int deletedCount = adminsToDelete.size();

            // Delete all ADMIN users (not SUPER_ADMIN)
            repository.deleteAll(adminsToDelete);

            System.out.println("Cleared " + deletedCount + " admin users (except Super Admin)");

            return "Successfully cleared " + deletedCount + " admin users. Super Admin account preserved.";
        } catch (Exception e) {
            System.err.println("Error clearing admins: " + e.getMessage());
            throw new RuntimeException("Failed to clear admins: " + e.getMessage());
        }
    }

    public String googleLogin(String accessToken, String requestedRole) {
        try {
            // 1. Get User Info from Google
            Map<String, Object> googleUser = webClientBuilder.build()
                    .get()
                    .uri("https://www.googleapis.com/oauth2/v3/userinfo")
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (googleUser == null || !googleUser.containsKey("email")) {
                throw new RuntimeException("Failed to get user info from Google");
            }

            String email = (String) googleUser.get("email");
            String firstName = (String) googleUser.get("given_name");
            String lastName = (String) googleUser.get("family_name");
            String normalizedEmail = normalizeEmail(email);

            // 2. Check if user exists
            Optional<UserCredential> userOpt = repository.findByEmailIgnoreCaseTrimmed(normalizeEmail(email));
            UserCredential user;

            if (userOpt.isEmpty()) {
                // 3. Create new user if not exists
                user = new UserCredential();
                user.setEmail(normalizedEmail);
                user.setPassword(passwordEncoder.encode("GOOGLE_AUTH_USER_" + System.currentTimeMillis())); // Placeholder

                // Use requested role or default to STUDENT
                Role role = Role.STUDENT;
                if ("FACULTY".equalsIgnoreCase(requestedRole)) {
                    role = Role.FACULTY;
                }
                user.setRole(role);
                repository.save(user);

                // Create Profile in user-service
                Map<String, Object> profileData = new HashMap<>();
                profileData.put("email", normalizedEmail);
                profileData.put("firstName", firstName != null ? firstName : "Google");
                profileData.put("lastName", lastName != null ? lastName : "User");
                profileData.put("role", role.name());

                try {
                    String profileEndpoint = (role == Role.FACULTY || role == Role.ADMIN) ? "/users/profile/faculty"
                            : "/users/profile/student";
                    loadBalancedWebClientBuilder.build()
                            .post()
                            .uri("http://user-service" + profileEndpoint)
                            .bodyValue(profileData)
                            .retrieve()
                            .toBodilessEntity()
                            .block();
                } catch (Exception e) {
                    System.err.println("Error creating Google user profile: " + e.getMessage());
                }
            } else {
                user = userOpt.get();

                // Check if admin account is approved before allowing Google login
                if (user.getRole() == Role.ADMIN && user.getApprovalStatus() != ApprovalStatus.APPROVED) {
                    if (user.getApprovalStatus() == ApprovalStatus.PENDING) {
                        throw new RuntimeException("Admin account pending approval from Super Admin");
                    } else if (user.getApprovalStatus() == ApprovalStatus.REJECTED) {
                        throw new RuntimeException("Admin account has been rejected. Please contact Super Admin");
                    }
                }
            }

            // 4. Generate and return JWT
            return generateToken(user.getEmail(), user.getRole().name());

        } catch (Exception e) {
            System.err.println("Google Login Error: " + e.getMessage());
            throw new RuntimeException("Google Authentication Failed: " + e.getMessage());
        }
    }

    public String createAdminBySuperAdmin(AdminCreationRequest request) {
        System.out.println("===============================================");
        System.out.println("=== createAdminBySuperAdmin() CALLED ===");
        System.out.println("AdminCreationRequest received:");
        System.out.println("  Email: " + request.getEmail());
        System.out.println("  First Name: " + request.getFirstName());
        System.out.println("  Last Name: " + request.getLastName());
        System.out.println("  Department: " + request.getDepartment());
        System.out.println("===============================================");

        String email = normalizeEmail(request.getEmail());

        // Validation
        if (email == null || email.isEmpty()) {
            return "Error: Email is required";
        }
        if (request.getFirstName() == null || request.getFirstName().isEmpty()) {
            return "Error: First Name is required";
        }
        if (request.getLastName() == null || request.getLastName().isEmpty()) {
            return "Error: Last Name is required";
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            return "Error: Password must be at least 6 characters";
        }
        if (request.getDepartment() == null || request.getDepartment().isEmpty()) {
            return "Error: Department is required";
        }

        // Check if user already exists
        Optional<UserCredential> existingUser = repository.findByEmailIgnoreCaseTrimmed(email);
        if (existingUser.isPresent()) {
            return "Error: An account with email '" + email + "' already exists";
        }

        // Check if admin already exists for this department
        try {
            Boolean adminExists = webClientBuilder.build()
                    .get()
                    .uri("http://localhost:8082/users/profile/check-admin?department="
                            + URLEncoder.encode(request.getDepartment(), StandardCharsets.UTF_8))
                    .retrieve()
                    .bodyToMono(Boolean.class)
                    .block();

            if (adminExists != null && adminExists) {
                return "Error: Already registered admin for this department";
            }
        } catch (Exception e) {
            System.err.println("Error checking admin existence: " + e.getMessage());
            return "Error: Could not verify admin availability for this department";
        }

        // Create user credential
        UserCredential credential = new UserCredential();
        credential.setEmail(email);
        credential.setPassword(passwordEncoder.encode(request.getPassword()));
        credential.setRole(Role.ADMIN);
        credential.setApprovalStatus(ApprovalStatus.APPROVED); // Auto-approve since created by Super Admin
        repository.save(credential);

        // Create faculty profile
        Map<String, Object> profileData = new HashMap<>();
        profileData.put("email", email);
        profileData.put("firstName", request.getFirstName());
        profileData.put("lastName", request.getLastName());
        profileData.put("department", request.getDepartment());
        profileData.put("phone", request.getPhone());
        profileData.put("gender", request.getGender());
        profileData.put("linkedin", request.getLinkedin());
        profileData.put("github", request.getGithub());
        profileData.put("designation", request.getDesignation());
        profileData.put("employeeId", request.getEmployeeId());
        profileData.put("role", "ADMIN");

        try {
            loadBalancedWebClientBuilder.build()
                    .post()
                    .uri("http://user-service/users/profile/faculty")
                    .bodyValue(profileData)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception e) {
            System.err.println("Error creating admin profile: " + e.getMessage());
            // Rollback credential creation if profile creation fails
            repository.delete(credential);
            return "Error: Failed to create admin profile: " + e.getMessage();
        }

        return "Admin account created successfully for " + email;
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        String trimmed = email.trim();
        return trimmed.isEmpty() ? null : trimmed.toLowerCase();
    }
}
