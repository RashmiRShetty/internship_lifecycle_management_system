package com.internship.userservice.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "students")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    private String firstName;
    private String lastName;
    private String department;
    private String phone;
    private String gender;
    private String dob;
    private String linkedin;
    private String github;
    
    @Column(columnDefinition = "TEXT")
    private String profilePhoto;
    
    // Student specific
    private String studying;
    private String status;
    private String collegeName;
    private String registrationNumber;
    private String semester;
    private String cgpa;
    private String experience;
    
    @Column(columnDefinition = "TEXT")
    private String skills;

    @Column(columnDefinition = "TEXT")
    private String programmingLanguages;
    
    private String interestedDomain;
    private String highestGraduation;
    private String workingField;
    private String resumeUrl;
    
    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(columnDefinition = "TEXT")
    private String certificates;

    @Column(columnDefinition = "TEXT")
    private String projects;

    @Column(columnDefinition = "TEXT")
    private String completedCourseworks;
    
    private Boolean profileComplete = false;

    public Student() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getDob() { return dob; }
    public void setDob(String dob) { this.dob = dob; }

    public String getLinkedin() { return linkedin; }
    public void setLinkedin(String linkedin) { this.linkedin = linkedin; }

    public String getGithub() { return github; }
    public void setGithub(String github) { this.github = github; }

    public String getProfilePhoto() { return profilePhoto; }
    public void setProfilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; }

    public String getStudying() { return studying; }
    public void setStudying(String studying) { this.studying = studying; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCollegeName() { return collegeName; }
    public void setCollegeName(String collegeName) { this.collegeName = collegeName; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }

    public String getCgpa() { return cgpa; }
    public void setCgpa(String cgpa) { this.cgpa = cgpa; }

    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public String getProgrammingLanguages() { return programmingLanguages; }
    public void setProgrammingLanguages(String programmingLanguages) { this.programmingLanguages = programmingLanguages; }
    
    public Boolean getProfileComplete() { return profileComplete; }
    public void setProfileComplete(Boolean profileComplete) { this.profileComplete = profileComplete; }

    public String getInterestedDomain() { return interestedDomain; }
    public void setInterestedDomain(String interestedDomain) { this.interestedDomain = interestedDomain; }

    public String getHighestGraduation() { return highestGraduation; }
    public void setHighestGraduation(String highestGraduation) { this.highestGraduation = highestGraduation; }

    public String getWorkingField() { return workingField; }
    public void setWorkingField(String workingField) { this.workingField = workingField; }

    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getCertificates() { return certificates; }
    public void setCertificates(String certificates) { this.certificates = certificates; }

    public String getProjects() { return projects; }
    public void setProjects(String projects) { this.projects = projects; }

    public String getCompletedCourseworks() { return completedCourseworks; }
    public void setCompletedCourseworks(String completedCourseworks) { this.completedCourseworks = completedCourseworks; }

    @Override
    public String toString() {
        return "Student{" +
                "id=" + id +
                ", email='" + email + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", department='" + department + '\'' +
                ", phone='" + phone + '\'' +
                ", gender='" + gender + '\'' +
                ", dob='" + dob + '\'' +
                ", linkedin='" + linkedin + '\'' +
                ", github='" + github + '\'' +
                ", studying='" + studying + '\'' +
                ", status='" + status + '\'' +
                ", collegeName='" + collegeName + '\'' +
                ", registrationNumber='" + registrationNumber + '\'' +
                ", semester='" + semester + '\'' +
                ", cgpa='" + cgpa + '\'' +
                ", experience='" + experience + '\'' +
                ", skills='" + skills + '\'' +
                ", programmingLanguages='" + programmingLanguages + '\'' +
                ", interestedDomain='" + interestedDomain + '\'' +
                ", highestGraduation='" + highestGraduation + '\'' +
                ", workingField='" + workingField + '\'' +
                ", resumeUrl='" + resumeUrl + '\'' +
                ", bio='" + bio + '\'' +
                ", profileComplete=" + profileComplete +
                '}';
    }
}
