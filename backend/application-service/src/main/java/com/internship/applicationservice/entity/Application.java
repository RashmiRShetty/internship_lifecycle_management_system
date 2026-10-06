package com.internship.applicationservice.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long internshipId;
    private String internshipTitle;
    private String studentEmail;
    private String facultyEmail;
    private String status; // APPLIED, SHORTLISTED, INTERVIEW, SELECTED, REJECTED
    private LocalDateTime appliedAt;
    private String resumeUrl;
    private String coverLetter;
    @Column(name = "project_title")
    private String projectTitle;
    
    @Column(name = "project_description", columnDefinition = "TEXT")
    private String projectDescription;
    
    @Column(name = "project_accepted")
    private Boolean projectAccepted = false;
    
    @Column(name = "project_rejected")
    private Boolean projectRejected = false;
    
    @Column(name = "internship_start_date")
    private LocalDate internshipStartDate;
    
    @Column(name = "internship_end_date")
    private LocalDate internshipEndDate;
    
    @Column(name = "weekly_submission_day")
    private Integer weeklySubmissionDay; // 1=Monday to 7=Sunday

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    public Application() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getInternshipId() {
        return internshipId;
    }

    public void setInternshipId(Long internshipId) {
        this.internshipId = internshipId;
    }

    public String getInternshipTitle() {
        return internshipTitle;
    }

    public void setInternshipTitle(String internshipTitle) {
        this.internshipTitle = internshipTitle;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public String getFacultyEmail() {
        return facultyEmail;
    }

    public void setFacultyEmail(String facultyEmail) {
        this.facultyEmail = facultyEmail;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getAppliedAt() {
        return appliedAt;
    }

    public void setAppliedAt(LocalDateTime appliedAt) {
        this.appliedAt = appliedAt;
    }

    public String getResumeUrl() {
        return resumeUrl;
    }

    public void setResumeUrl(String resumeUrl) {
        this.resumeUrl = resumeUrl;
    }

    public String getCoverLetter() {
        return coverLetter;
    }

    public void setCoverLetter(String coverLetter) {
        this.coverLetter = coverLetter;
    }

    public String getProjectTitle() {
        return projectTitle;
    }

    public void setProjectTitle(String projectTitle) {
        this.projectTitle = projectTitle;
    }

    public String getProjectDescription() {
        return projectDescription;
    }

    public void setProjectDescription(String projectDescription) {
        this.projectDescription = projectDescription;
    }

    public Boolean getProjectAccepted() {
        return projectAccepted;
    }

    public void setProjectAccepted(Boolean projectAccepted) {
        this.projectAccepted = projectAccepted;
    }

    public Boolean getProjectRejected() {
        return projectRejected != null ? projectRejected : false;
    }

    public void setProjectRejected(Boolean projectRejected) {
        this.projectRejected = projectRejected;
    }

    public LocalDate getInternshipStartDate() {
        return internshipStartDate;
    }

    public void setInternshipStartDate(LocalDate internshipStartDate) {
        this.internshipStartDate = internshipStartDate;
    }

    public LocalDate getInternshipEndDate() {
        return internshipEndDate;
    }

    public void setInternshipEndDate(LocalDate internshipEndDate) {
        this.internshipEndDate = internshipEndDate;
    }

    public Integer getWeeklySubmissionDay() {
        return weeklySubmissionDay;
    }

    public void setWeeklySubmissionDay(Integer weeklySubmissionDay) {
        this.weeklySubmissionDay = weeklySubmissionDay;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}
