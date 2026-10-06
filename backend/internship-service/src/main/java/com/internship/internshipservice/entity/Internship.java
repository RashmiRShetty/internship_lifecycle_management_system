package com.internship.internshipservice.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "internships")
public class Internship {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    private String company;
    @Column(length = 2000)
    private String description;
    @Column(length = 2000)
    private String skillsRequired;
    @ElementCollection
    @CollectionTable(name = "internship_skills_preferred", joinColumns = @JoinColumn(name = "internship_id"))
    @Column(name = "skill")
    private List<String> skillsPreferred;
    private String mode; // Remote, Hybrid, On-site
    private String internshipType; // Paid, Unpaid
    private String duration;
    private String stipend;
    private String location;
    private Integer openings;
    @Column(length = 1000)
    private String eligibilityCriteria;
    private LocalDate applicationDeadline;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate postedDate;
    private String facultyId; // Email of the faculty
    private String status; // OPEN, CLOSED
    private Integer weeklySubmissionDay; // 1=Monday, 2=Tuesday, ..., 7=Sunday

    public Internship() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSkillsRequired() { return skillsRequired; }
    public void setSkillsRequired(String skillsRequired) { this.skillsRequired = skillsRequired; }

    public List<String> getSkillsPreferred() { return skillsPreferred; }
    public void setSkillsPreferred(List<String> skillsPreferred) { this.skillsPreferred = skillsPreferred; }

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }

    public String getInternshipType() { return internshipType; }
    public void setInternshipType(String internshipType) { this.internshipType = internshipType; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public String getStipend() { return stipend; }
    public void setStipend(String stipend) { this.stipend = stipend; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Integer getOpenings() { return openings; }
    public void setOpenings(Integer openings) { this.openings = openings; }

    public String getEligibilityCriteria() { return eligibilityCriteria; }
    public void setEligibilityCriteria(String eligibilityCriteria) { this.eligibilityCriteria = eligibilityCriteria; }

    public LocalDate getApplicationDeadline() { return applicationDeadline; }
    public void setApplicationDeadline(LocalDate applicationDeadline) { this.applicationDeadline = applicationDeadline; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public LocalDate getPostedDate() { return postedDate; }
    public void setPostedDate(LocalDate postedDate) { this.postedDate = postedDate; }

    public String getFacultyId() { return facultyId; }
    public void setFacultyId(String facultyId) { this.facultyId = facultyId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public Integer getWeeklySubmissionDay() { return weeklySubmissionDay; }
    public void setWeeklySubmissionDay(Integer weeklySubmissionDay) { this.weeklySubmissionDay = weeklySubmissionDay; }
}
