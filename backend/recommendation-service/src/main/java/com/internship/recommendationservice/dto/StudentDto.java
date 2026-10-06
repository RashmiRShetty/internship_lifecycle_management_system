package com.internship.recommendationservice.dto;

public class StudentDto {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String department;

    private String skills;
    private String technicalSkills;
    private String programmingLanguages;
    private String interestedDomain;
    private String completedCourseworks;
    private String projects;
    private String certificates;
    private String bio;

    public StudentDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }

    public String getTechnicalSkills() {
        return technicalSkills;
    }

    public void setTechnicalSkills(String technicalSkills) {
        this.technicalSkills = technicalSkills;
    }

    public String getProgrammingLanguages() {
        return programmingLanguages;
    }

    public void setProgrammingLanguages(String programmingLanguages) {
        this.programmingLanguages = programmingLanguages;
    }

    public String getInterestedDomain() {
        return interestedDomain;
    }

    public void setInterestedDomain(String interestedDomain) {
        this.interestedDomain = interestedDomain;
    }

    public String getCompletedCourseworks() {
        return completedCourseworks;
    }

    public void setCompletedCourseworks(String completedCourseworks) {
        this.completedCourseworks = completedCourseworks;
    }

    public String getProjects() {
        return projects;
    }

    public void setProjects(String projects) {
        this.projects = projects;
    }

    public String getCertificates() {
        return certificates;
    }

    public void setCertificates(String certificates) {
        this.certificates = certificates;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }
}