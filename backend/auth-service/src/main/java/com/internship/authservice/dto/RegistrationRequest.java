package com.internship.authservice.dto;

import com.internship.authservice.entity.Role;

public class RegistrationRequest {
    private String email;
    private String password;
    private Role role;
    private String firstName;
    private String lastName;
    private String department;
    private String otp;
    
    // Student specific
    private String studying;
    private String status;
    private String collegeName;
    private String registrationNumber;
    private String semester;
    
    // Faculty/Admin specific
    private String designation;
    private String logoUrl;
    private String employeeId;
    private String idProofUrl;
    private String profilePhoto;

    // Additional fields
    private String phone;
    private String gender;
    private String dob;
    private String cgpa;
    private String skills;
    private String interestedDomain;
    private String linkedin;
    private String github;
    private String highestGraduation;
    private String workingField;
    private String resumeUrl;
    private String experience;
    private String certificates;
    private String projects;

    public RegistrationRequest() {}

    public RegistrationRequest(String email, String password, Role role, String firstName, String lastName, String department, String studying, String status, String designation) {
        this.email = email;
        this.password = password;
        this.role = role;
        this.firstName = firstName;
        this.lastName = lastName;
        this.department = department;
        this.studying = studying;
        this.status = status;
        this.designation = designation;
    }

    // Getters and Setters
    public String getCollegeName() { return collegeName; }
    public void setCollegeName(String collegeName) { this.collegeName = collegeName; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getDob() { return dob; }
    public void setDob(String dob) { this.dob = dob; }

    public String getCgpa() { return cgpa; }
    public void setCgpa(String cgpa) { this.cgpa = cgpa; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public String getInterestedDomain() { return interestedDomain; }
    public void setInterestedDomain(String interestedDomain) { this.interestedDomain = interestedDomain; }

    public String getLinkedin() { return linkedin; }
    public void setLinkedin(String linkedin) { this.linkedin = linkedin; }

    public String getGithub() { return github; }
    public void setGithub(String github) { this.github = github; }

    public String getHighestGraduation() { return highestGraduation; }
    public void setHighestGraduation(String highestGraduation) { this.highestGraduation = highestGraduation; }

    public String getWorkingField() { return workingField; }
    public void setWorkingField(String workingField) { this.workingField = workingField; }

    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
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

    public String getStudying() {
        return studying;
    }

    public void setStudying(String studying) {
        this.studying = studying;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public String getExperience() {
        return experience;
    }

    public void setExperience(String experience) {
        this.experience = experience;
    }

    public String getCertificates() {
        return certificates;
    }

    public void setCertificates(String certificates) {
        this.certificates = certificates;
    }

    public String getProjects() {
        return projects;
    }

    public void setProjects(String projects) {
        this.projects = projects;
    }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getIdProofUrl() { return idProofUrl; }
    public void setIdProofUrl(String idProofUrl) { this.idProofUrl = idProofUrl; }

    public String getProfilePhoto() { return profilePhoto; }
    public void setProfilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; }
}
