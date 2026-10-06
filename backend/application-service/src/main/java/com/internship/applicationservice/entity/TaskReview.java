package com.internship.applicationservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "task_reviews")
public class TaskReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "submission_id")
    private Long submissionId;

    private String facultyEmail;
    private String status; // ACCEPT, CORRECTION_REQUIRED
    private String score; // e.g. "9/10"

    @Column(columnDefinition = "TEXT")
    private String comments;

    private LocalDateTime reviewedAt;

    @PrePersist
    protected void onCreate() {
        this.reviewedAt = LocalDateTime.now();
    }

    public TaskReview() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSubmissionId() { return submissionId; }
    public void setSubmissionId(Long submissionId) { this.submissionId = submissionId; }

    public String getFacultyEmail() { return facultyEmail; }
    public void setFacultyEmail(String facultyEmail) { this.facultyEmail = facultyEmail; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getScore() { return score; }
    public void setScore(String score) { this.score = score; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
}
