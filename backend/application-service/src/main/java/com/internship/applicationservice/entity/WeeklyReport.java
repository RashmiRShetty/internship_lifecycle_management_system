package com.internship.applicationservice.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "weekly_reports")
public class WeeklyReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "application_id")
    private Long applicationId;
    
    @Column(name = "student_email")
    private String studentEmail;
    
    @Column(name = "faculty_email")
    private String facultyEmail;
    
    @Column(name = "week_number")
    private Integer weekNumber;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    @Column(columnDefinition = "TEXT")
    private String facultyFeedback;
    
    private String fileUrl; // For uploaded fileUrl;
    private String fileName; // Original file name
    private String fileType; // File type (IMAGE, DOCUMENT, etc.
    private String status; // SUBMITTED, REVIEWED
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
    private LocalDate deadlineDate;
    private Boolean reminderSentOneDayBefore = false;
    private Boolean reminderSentOnDay = false;

    public WeeklyReport() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

    public String getFacultyEmail() { return facultyEmail; }
    public void setFacultyEmail(String facultyEmail) { this.facultyEmail = facultyEmail; }

    public Integer getWeekNumber() { return weekNumber; }
    public void setWeekNumber(Integer weekNumber) { this.weekNumber = weekNumber; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public String getFacultyFeedback() { return facultyFeedback; }
    public void setFacultyFeedback(String facultyFeedback) { this.facultyFeedback = facultyFeedback; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public LocalDate getDeadlineDate() { return deadlineDate; }
    public void setDeadlineDate(LocalDate deadlineDate) { this.deadlineDate = deadlineDate; }

    public Boolean getReminderSentOneDayBefore() { return reminderSentOneDayBefore; }
    public void setReminderSentOneDayBefore(Boolean reminderSentOneDayBefore) { this.reminderSentOneDayBefore = reminderSentOneDayBefore; }

    public Boolean getReminderSentOnDay() { return reminderSentOnDay; }
    public void setReminderSentOnDay(Boolean reminderSentOnDay) { this.reminderSentOnDay = reminderSentOnDay; }
}
