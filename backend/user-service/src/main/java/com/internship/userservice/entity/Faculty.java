package com.internship.userservice.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "faculty")
public class Faculty {
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
    private String linkedin;
    private String github;
    
    @Column(columnDefinition = "TEXT")
    private String profilePhoto;
    private String designation;
    private String logoUrl;
    
    @Column(unique = true)
    private String employeeId;
    private String idProofUrl;
    private String role; // FACULTY or ADMIN
    private Boolean profileComplete = false;

    public Faculty() {}

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

    public String getLinkedin() { return linkedin; }
    public void setLinkedin(String linkedin) { this.linkedin = linkedin; }

    public String getGithub() { return github; }
    public void setGithub(String github) { this.github = github; }

    public String getProfilePhoto() { return profilePhoto; }
    public void setProfilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getIdProofUrl() { return idProofUrl; }
    public void setIdProofUrl(String idProofUrl) { this.idProofUrl = idProofUrl; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public Boolean getProfileComplete() { return profileComplete; }
    public void setProfileComplete(Boolean profileComplete) { this.profileComplete = profileComplete; }

    @Override
    public String toString() {
        return "Faculty{" +
                "id=" + id +
                ", email='" + email + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", department='" + department + '\'' +
                ", phone='" + phone + '\'' +
                ", gender='" + gender + '\'' +
                ", linkedin='" + linkedin + '\'' +
                ", github='" + github + '\'' +
                ", designation='" + designation + '\'' +
                ", logoUrl='" + logoUrl + '\'' +
                ", employeeId='" + employeeId + '\'' +
                ", idProofUrl='" + idProofUrl + '\'' +
                ", role='" + role + '\'' +
                ", profileComplete=" + profileComplete +
                '}';
    }
}
