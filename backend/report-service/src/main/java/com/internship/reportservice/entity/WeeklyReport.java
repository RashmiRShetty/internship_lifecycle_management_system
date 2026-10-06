package com.internship.reportservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "weekly_reports")
public class WeeklyReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long internshipId;
    private String studentEmail;
    private int weekNumber;
    
    @Column(columnDefinition = "TEXT")
    private String workDone;
    
    @Column(columnDefinition = "TEXT")
    private String challenges;
    
    private String progressPercentage;
    private LocalDateTime submissionDate;
    
    private Integer score;
    private String feedback;

    public WeeklyReport() {}

    public WeeklyReport(Long id, Long internshipId, String studentEmail, int weekNumber, String workDone, String challenges, String progressPercentage, LocalDateTime submissionDate, Integer score, String feedback) {
        this.id = id;
        this.internshipId = internshipId;
        this.studentEmail = studentEmail;
        this.weekNumber = weekNumber;
        this.workDone = workDone;
        this.challenges = challenges;
        this.progressPercentage = progressPercentage;
        this.submissionDate = submissionDate;
        this.score = score;
        this.feedback = feedback;
    }

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

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public int getWeekNumber() {
        return weekNumber;
    }

    public void setWeekNumber(int weekNumber) {
        this.weekNumber = weekNumber;
    }

    public String getWorkDone() {
        return workDone;
    }

    public void setWorkDone(String workDone) {
        this.workDone = workDone;
    }

    public String getChallenges() {
        return challenges;
    }

    public void setChallenges(String challenges) {
        this.challenges = challenges;
    }

    public String getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(String progressPercentage) {
        this.progressPercentage = progressPercentage;
    }

    public LocalDateTime getSubmissionDate() {
        return submissionDate;
    }

    public void setSubmissionDate(LocalDateTime submissionDate) {
        this.submissionDate = submissionDate;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }
}
