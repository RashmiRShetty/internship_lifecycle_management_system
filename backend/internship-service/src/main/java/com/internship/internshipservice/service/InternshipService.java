package com.internship.internshipservice.service;

import com.internship.internshipservice.entity.Internship;
import com.internship.internshipservice.repository.InternshipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InternshipService {

    @Autowired
    private InternshipRepository repository;

    public Internship postInternship(Internship internship) {
        internship.setPostedDate(java.time.LocalDate.now());
        if (internship.getStatus() == null) {
            internship.setStatus("OPEN");
        }
        return repository.save(internship);
    }

    public List<Internship> getAllInternships() {
        return repository.findAll();
    }

    public List<Internship> getInternshipsByFaculty(String facultyId) {
        if (facultyId == null || facultyId.trim().isEmpty()) {
            return java.util.Collections.emptyList();
        }
        String cleanId = facultyId.trim();
        System.out.println("Fetching internships for faculty: " + cleanId);
        List<Internship> internships = repository.findByFacultyIdIgnoreCase(cleanId);
        System.out.println("Found " + internships.size() + " internships for faculty: " + cleanId);
        for (Internship internship : internships) {
            System.out.println("Internship: " + internship.getTitle() + ", Faculty ID: " + internship.getFacultyId());
        }
        return internships;
    }

    public List<Internship> getOpenInternships() {
        return repository.findByStatus("OPEN");
    }

    public List<Internship> getInternshipsByFacultyEmails(List<String> facultyEmails) {
        return repository.findByFacultyIdIn(facultyEmails);
    }

    public Internship updateStatus(Long id, String status) {
        Internship internship = repository.findById(id).orElseThrow(() -> new RuntimeException("Internship not found"));
        internship.setStatus(status);
        return repository.save(internship);
    }

    public Internship updateInternship(Long id, Internship updatedInternship) {
        Internship existing = repository.findById(id).orElseThrow(() -> new RuntimeException("Internship not found"));
        if (updatedInternship.getTitle() != null) existing.setTitle(updatedInternship.getTitle());
        if (updatedInternship.getCompany() != null) existing.setCompany(updatedInternship.getCompany());
        if (updatedInternship.getDescription() != null) existing.setDescription(updatedInternship.getDescription());
        if (updatedInternship.getSkillsRequired() != null) existing.setSkillsRequired(updatedInternship.getSkillsRequired());
        if (updatedInternship.getSkillsPreferred() != null) existing.setSkillsPreferred(updatedInternship.getSkillsPreferred());
        if (updatedInternship.getMode() != null) existing.setMode(updatedInternship.getMode());
        if (updatedInternship.getInternshipType() != null) existing.setInternshipType(updatedInternship.getInternshipType());
        if (updatedInternship.getDuration() != null) existing.setDuration(updatedInternship.getDuration());
        if (updatedInternship.getStipend() != null) existing.setStipend(updatedInternship.getStipend());
        if (updatedInternship.getLocation() != null) existing.setLocation(updatedInternship.getLocation());
        if (updatedInternship.getOpenings() != null) existing.setOpenings(updatedInternship.getOpenings());
        if (updatedInternship.getEligibilityCriteria() != null) existing.setEligibilityCriteria(updatedInternship.getEligibilityCriteria());
        if (updatedInternship.getApplicationDeadline() != null) existing.setApplicationDeadline(updatedInternship.getApplicationDeadline());
        if (updatedInternship.getStartDate() != null) existing.setStartDate(updatedInternship.getStartDate());
        if (updatedInternship.getEndDate() != null) existing.setEndDate(updatedInternship.getEndDate());
        if (updatedInternship.getWeeklySubmissionDay() != null) existing.setWeeklySubmissionDay(updatedInternship.getWeeklySubmissionDay());
        if (updatedInternship.getStatus() != null) existing.setStatus(updatedInternship.getStatus());
        return repository.save(existing);
    }

    public void deleteInternship(Long id) {
        repository.deleteById(id);
    }

    public void clearAll() {
        repository.deleteAll();
    }

    public Internship getInternshipById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Internship not found"));
    }
}
