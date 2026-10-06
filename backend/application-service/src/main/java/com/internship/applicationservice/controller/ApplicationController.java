package com.internship.applicationservice.controller;

import com.internship.applicationservice.entity.Application;
import com.internship.applicationservice.entity.WeeklyReport;
import com.internship.applicationservice.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/applications")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @PostMapping
    public ResponseEntity<Application> apply(@RequestBody Application application) {
        return ResponseEntity.ok(applicationService.applyForInternship(application));
    }

    @GetMapping("/student")
    public ResponseEntity<List<Application>> getByStudent(@RequestParam String email) {
        return ResponseEntity.ok(applicationService.getApplicationsByStudent(email));
    }

    @GetMapping("/internship/{internshipId}")
    public ResponseEntity<List<Application>> getByInternship(@PathVariable Long internshipId) {
        return ResponseEntity.ok(applicationService.getApplicationsByInternship(internshipId));
    }

    @GetMapping("/faculty")
    public ResponseEntity<?> getByFaculty(@RequestParam String email) {
        try {
            return ResponseEntity.ok(applicationService.getApplicationsByFaculty(email));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Application> updateStatus(
            @PathVariable Long id, 
            @RequestParam String status,
            @RequestParam(required = false) String rejectionReason) {
        return ResponseEntity.ok(applicationService.updateApplicationStatus(id, status, rejectionReason));
    }

    @PutMapping("/{id}/project-title")
    public ResponseEntity<Application> assignProject(@PathVariable Long id, @RequestParam String title, @RequestParam(required = false) String description) {
        return ResponseEntity.ok(applicationService.assignProjectTitle(id, title, description));
    }

    @PutMapping("/{id}/accept-project")
    public ResponseEntity<Application> acceptProject(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.acceptProjectTitle(id));
    }

    @PutMapping("/{id}/reject-project")
    public ResponseEntity<Application> rejectProject(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.rejectProjectTitle(id));
    }

    // Weekly Report Endpoints
    @PostMapping("/reports")
    public ResponseEntity<?> submitReport(
            @RequestParam Long applicationId,
            @RequestParam String studentEmail,
            @RequestParam String facultyEmail,
            @RequestParam Integer weekNumber,
            @RequestParam(required = false) String content,
            @RequestParam(required = false) org.springframework.web.multipart.MultipartFile file) {
        try {
            return ResponseEntity.ok(applicationService.submitWeeklyReport(
                applicationId, studentEmail, facultyEmail, weekNumber, content, file));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/reports/{id}/review")
    public ResponseEntity<WeeklyReport> reviewReport(@PathVariable Long id, @RequestParam String feedback) {
        return ResponseEntity.ok(applicationService.reviewWeeklyReport(id, feedback));
    }

    @PutMapping("/reports/{id}/request-revision")
    public ResponseEntity<WeeklyReport> requestRevision(@PathVariable Long id, @RequestParam String feedback) {
        return ResponseEntity.ok(applicationService.requestRevision(id, feedback));
    }
    
    @PutMapping("/{id}/refresh-internship-data")
    public ResponseEntity<Application> refreshInternshipData(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.refreshInternshipData(id));
    }

    @GetMapping("/reports/application/{applicationId}")
    public ResponseEntity<List<WeeklyReport>> getReportsByApp(@PathVariable Long applicationId) {
        return ResponseEntity.ok(applicationService.getReportsByApplication(applicationId));
    }

    @GetMapping("/reports/student/all")
    public ResponseEntity<List<WeeklyReport>> getReportsByStudent(@RequestParam String email) {
        return ResponseEntity.ok(applicationService.getReportsByStudent(email));
    }

    @GetMapping("/reports/faculty/all")
    public ResponseEntity<List<WeeklyReport>> getReportsByFaculty(@RequestParam String email) {
        return ResponseEntity.ok(applicationService.getReportsByFaculty(email));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Application>> getAllApplications() {
        return ResponseEntity.ok(applicationService.getAllApplications());
    }

    @PostMapping("/by-faculty-ids")
    public ResponseEntity<List<Application>> getApplicationsByFacultyEmails(@RequestBody List<String> facultyEmails) {
        return ResponseEntity.ok(applicationService.getApplicationsByFacultyEmails(facultyEmails));
    }

    @DeleteMapping("/clear-all")
    public ResponseEntity<Void> clearAllApplications() {
        applicationService.clearAll();
        return ResponseEntity.ok().build();
    }
}
