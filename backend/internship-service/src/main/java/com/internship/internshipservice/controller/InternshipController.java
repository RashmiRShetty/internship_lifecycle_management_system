package com.internship.internshipservice.controller;

import com.internship.internshipservice.entity.Internship;
import com.internship.internshipservice.service.InternshipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/internships")
public class InternshipController {

    @Autowired
    private InternshipService internshipService;

    @PostMapping
    public ResponseEntity<Internship> postInternship(@RequestBody Internship internship) {
        return ResponseEntity.ok(internshipService.postInternship(internship));
    }

    @GetMapping
    public ResponseEntity<List<Internship>> getAllInternships() {
        return ResponseEntity.ok(internshipService.getAllInternships());
    }

    @GetMapping("/open")
    public ResponseEntity<List<Internship>> getOpenInternships() {
        return ResponseEntity.ok(internshipService.getOpenInternships());
    }

    @GetMapping("/faculty")
    public ResponseEntity<List<Internship>> getInternshipsByFaculty(@RequestParam String email) {
        return ResponseEntity.ok(internshipService.getInternshipsByFaculty(email));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Internship> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(internshipService.updateStatus(id, status));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Internship> updateInternship(@PathVariable Long id, @RequestBody Internship internship) {
        return ResponseEntity.ok(internshipService.updateInternship(id, internship));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInternship(@PathVariable Long id) {
        internshipService.deleteInternship(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/clear-all")
    public ResponseEntity<Void> clearAllInternships() {
        internshipService.clearAll();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Internship> getInternshipById(@PathVariable Long id) {
        return ResponseEntity.ok(internshipService.getInternshipById(id));
    }

    @PostMapping("/by-faculty-ids")
    public ResponseEntity<List<Internship>> getInternshipsByFacultyEmails(@RequestBody List<String> facultyEmails) {
        return ResponseEntity.ok(internshipService.getInternshipsByFacultyEmails(facultyEmails));
    }
}
