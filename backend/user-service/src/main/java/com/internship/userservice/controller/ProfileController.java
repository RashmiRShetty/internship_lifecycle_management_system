package com.internship.userservice.controller;

import com.internship.userservice.entity.Faculty;
import com.internship.userservice.entity.Student;
import com.internship.userservice.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users/profile")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @GetMapping("/all/students")
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(profileService.getAllStudents());
    }

    @GetMapping("/all/faculty")
    public ResponseEntity<List<Faculty>> getAllFaculty() {
        return ResponseEntity.ok(profileService.getAllFaculty());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(Map.of(
            "students", profileService.getStudentCount(),
            "faculty", profileService.getFacultyCount()
        ));
    }

    @GetMapping("/check-admin")
    public ResponseEntity<Boolean> checkAdminExists(@RequestParam String department) {
        return ResponseEntity.ok(profileService.checkAdminExists(department));
    }

    @GetMapping("/faculty/department")
    public ResponseEntity<List<Faculty>> getFacultyByDepartment(@RequestParam String department) {
        return ResponseEntity.ok(profileService.getFacultyByDepartment(department));
    }

    @PostMapping("/student")
    public ResponseEntity<?> createStudent(@RequestBody Student student) {
        System.out.println("===============================================");
        System.out.println("=== POST /users/profile/student RECEIVED ===");
        System.out.println("Received Student object: " + student);
        System.out.println("Email: " + student.getEmail());
        System.out.println("First Name: " + student.getFirstName());
        System.out.println("Last Name: " + student.getLastName());
        System.out.println("===============================================");
        try {
            Student savedStudent = profileService.createStudentProfile(student);
            System.out.println("=== SAVED STUDENT TO DB: " + savedStudent);
            return ResponseEntity.ok(savedStudent);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/faculty")
    public ResponseEntity<?> createFaculty(@RequestBody Faculty faculty) {
        System.out.println("===============================================");
        System.out.println("=== POST /users/profile/faculty RECEIVED ===");
        System.out.println("Received Faculty object: " + faculty);
        System.out.println("Email: " + faculty.getEmail());
        System.out.println("First Name: " + faculty.getFirstName());
        System.out.println("Last Name: " + faculty.getLastName());
        System.out.println("Employee ID: " + faculty.getEmployeeId());
        System.out.println("===============================================");
        try {
            Faculty savedFaculty = profileService.createFacultyProfile(faculty);
            System.out.println("=== SAVED FACULTY TO DB: " + savedFaculty);
            return ResponseEntity.ok(savedFaculty);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/student")
    public ResponseEntity<Student> getStudent(@RequestParam String email) {
        System.out.println("=== GET /users/profile/student called for email: " + email + " ===");
        return profileService.getStudentByEmail(email)
                .map(student -> {
                    System.out.println("Found student: " + student.getEmail());
                    System.out.println("Profile Complete: " + student.getProfileComplete());
                    System.out.println("First Name: " + student.getFirstName());
                    System.out.println("Last Name: " + student.getLastName());
                    System.out.println("Phone: " + student.getPhone());
                    System.out.println("Department: " + student.getDepartment());
                    System.out.println("College Name: " + student.getCollegeName());
                    System.out.println("Registration Number: " + student.getRegistrationNumber());
                    return ResponseEntity.ok(student);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/faculty")
    public ResponseEntity<Faculty> getFaculty(@RequestParam String email) {
        return profileService.getFacultyByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/student")
    public ResponseEntity<Student> updateStudent(@RequestBody Student student) {
        System.out.println("========================================");
        System.out.println("=== PUT /users/profile/student called ===");
        System.out.println("========================================");
        System.out.println("Received student data:");
        System.out.println("Email: " + student.getEmail());
        System.out.println("First Name: '" + student.getFirstName() + "' (null: " + (student.getFirstName() == null) + ", blank: " + (student.getFirstName() != null && student.getFirstName().isBlank()) + ")");
        System.out.println("Last Name: '" + student.getLastName() + "' (null: " + (student.getLastName() == null) + ", blank: " + (student.getLastName() != null && student.getLastName().isBlank()) + ")");
        System.out.println("Phone: '" + student.getPhone() + "' (null: " + (student.getPhone() == null) + ", blank: " + (student.getPhone() != null && student.getPhone().isBlank()) + ")");
        System.out.println("Department: '" + student.getDepartment() + "' (null: " + (student.getDepartment() == null) + ", blank: " + (student.getDepartment() != null && student.getDepartment().isBlank()) + ")");
        System.out.println("College Name: '" + student.getCollegeName() + "' (null: " + (student.getCollegeName() == null) + ", blank: " + (student.getCollegeName() != null && student.getCollegeName().isBlank()) + ")");
        System.out.println("Registration Number: '" + student.getRegistrationNumber() + "' (null: " + (student.getRegistrationNumber() == null) + ", blank: " + (student.getRegistrationNumber() != null && student.getRegistrationNumber().isBlank()) + ")");
        System.out.println("Profile Complete (before update): " + student.getProfileComplete());
        Student result = profileService.updateStudentProfile(student);
        System.out.println("Profile Complete (after update): " + result.getProfileComplete());
        System.out.println("========================================");
        return ResponseEntity.ok(result);
    }

    @PutMapping("/faculty")
    public ResponseEntity<Faculty> updateFaculty(@RequestBody Faculty faculty) {
        return ResponseEntity.ok(profileService.updateFacultyProfile(faculty));
    }

    @PutMapping("/faculty/role")
    public ResponseEntity<?> updateFacultyRole(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String role = request.get("role");
            return ResponseEntity.ok(profileService.updateFacultyRole(email, role));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
