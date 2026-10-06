package com.internship.certificateservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "certificates")
public class Certificate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true)
    private String certificateId;
    
    private String studentName;
    private String studentEmail;
    private String internshipTitle;
    private String facultyName;
    private String organizationName;
    private String duration;
    private LocalDate completionDate;
    
    private String qrCodeData;
    private String pdfUrl;

    public Certificate() {}

    public Certificate(Long id, String certificateId, String studentName, String studentEmail, String internshipTitle, String facultyName, String organizationName, String duration, LocalDate completionDate, String qrCodeData, String pdfUrl) {
        this.id = id;
        this.certificateId = certificateId;
        this.studentName = studentName;
        this.studentEmail = studentEmail;
        this.internshipTitle = internshipTitle;
        this.facultyName = facultyName;
        this.organizationName = organizationName;
        this.duration = duration;
        this.completionDate = completionDate;
        this.qrCodeData = qrCodeData;
        this.pdfUrl = pdfUrl;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCertificateId() {
        return certificateId;
    }

    public void setCertificateId(String certificateId) {
        this.certificateId = certificateId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public String getInternshipTitle() {
        return internshipTitle;
    }

    public void setInternshipTitle(String internshipTitle) {
        this.internshipTitle = internshipTitle;
    }

    public String getFacultyName() {
        return facultyName;
    }

    public void setFacultyName(String facultyName) {
        this.facultyName = facultyName;
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public LocalDate getCompletionDate() {
        return completionDate;
    }

    public void setCompletionDate(LocalDate completionDate) {
        this.completionDate = completionDate;
    }

    public String getQrCodeData() {
        return qrCodeData;
    }

    public void setQrCodeData(String qrCodeData) {
        this.qrCodeData = qrCodeData;
    }

    public String getPdfUrl() {
        return pdfUrl;
    }

    public void setPdfUrl(String pdfUrl) {
        this.pdfUrl = pdfUrl;
    }
}
