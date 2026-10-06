package com.internship.userservice.service;

import com.internship.userservice.entity.Faculty;
import com.internship.userservice.entity.Student;
import com.internship.userservice.repository.FacultyRepository;
import com.internship.userservice.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProfileService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    public Student createStudentProfile(Student student) {
        if (student.getEmail() != null && !student.getEmail().isBlank()) {
            Optional<Student> existing = studentRepository.findByEmail(student.getEmail().trim().toLowerCase());
            if (existing.isPresent()) {
                student.setId(existing.get().getId());
                return updateStudentProfile(student);
            }
        }
        boolean isComplete = isStudentProfileComplete(student);
        student.setProfileComplete(isComplete);
        return studentRepository.save(student);
    }

    public Faculty createFacultyProfile(Faculty faculty) {
        if (faculty.getEmail() != null && !faculty.getEmail().isBlank()) {
            Optional<Faculty> existing = facultyRepository.findByEmail(faculty.getEmail().trim().toLowerCase());
            if (existing.isPresent()) {
                faculty.setId(existing.get().getId());
                return updateFacultyProfile(faculty);
            }
        }
        // Validate unique employeeId if provided
        if (faculty.getEmployeeId() != null && !faculty.getEmployeeId().isBlank()) {
            Optional<Faculty> existingWithEmpId = facultyRepository.findByEmployeeId(faculty.getEmployeeId());
            if (existingWithEmpId.isPresent() && 
                (existingWithEmpId.get().getId() == null || 
                 !existingWithEmpId.get().getId().equals(faculty.getId()))) {
                throw new RuntimeException("Employee ID '" + faculty.getEmployeeId() + "' is already registered.");
            }
        }
        boolean isComplete = isFacultyProfileComplete(faculty);
        faculty.setProfileComplete(isComplete);
        return facultyRepository.save(faculty);
    }

    public Optional<Student> getStudentByEmail(String email) {
        if (email == null) return Optional.empty();
        return studentRepository.findByEmail(email.trim().toLowerCase());
    }

    public Optional<Faculty> getFacultyByEmail(String email) {
        if (email == null) return Optional.empty();
        return facultyRepository.findByEmail(email.trim().toLowerCase());
    }

    public Student updateStudentProfile(Student student) {
        if (student.getEmail() == null || student.getEmail().isBlank()) {
            throw new RuntimeException("Email is required for student profile update");
        }
        String cleanEmail = student.getEmail().trim().toLowerCase();
        student.setEmail(cleanEmail);

        // Check if student exists by email
        Optional<Student> existingStudent = studentRepository.findByEmail(cleanEmail);
        
        if (existingStudent.isPresent()) {
            // Update existing student without overwriting non-null existing data with nulls
            Student existing = existingStudent.get();
            if (student.getFirstName() != null) existing.setFirstName(student.getFirstName());
            if (student.getLastName() != null) existing.setLastName(student.getLastName());
            if (student.getDepartment() != null) existing.setDepartment(student.getDepartment());
            if (student.getPhone() != null) existing.setPhone(student.getPhone());
            if (student.getGender() != null) existing.setGender(student.getGender());
            if (student.getDob() != null) existing.setDob(student.getDob());
            if (student.getLinkedin() != null) existing.setLinkedin(student.getLinkedin());
            if (student.getGithub() != null) existing.setGithub(student.getGithub());
            if (student.getProfilePhoto() != null) existing.setProfilePhoto(student.getProfilePhoto());
            if (student.getStudying() != null) existing.setStudying(student.getStudying());
            if (student.getStatus() != null) existing.setStatus(student.getStatus());
            if (student.getCollegeName() != null) existing.setCollegeName(student.getCollegeName());
            if (student.getRegistrationNumber() != null) existing.setRegistrationNumber(student.getRegistrationNumber());
            if (student.getSemester() != null) existing.setSemester(student.getSemester());
            if (student.getCgpa() != null) existing.setCgpa(student.getCgpa());
            if (student.getExperience() != null) existing.setExperience(student.getExperience());
            if (student.getSkills() != null) existing.setSkills(student.getSkills());
            if (student.getProgrammingLanguages() != null) existing.setProgrammingLanguages(student.getProgrammingLanguages());
            if (student.getInterestedDomain() != null) existing.setInterestedDomain(student.getInterestedDomain());
            if (student.getHighestGraduation() != null) existing.setHighestGraduation(student.getHighestGraduation());
            if (student.getWorkingField() != null) existing.setWorkingField(student.getWorkingField());
            if (student.getResumeUrl() != null) existing.setResumeUrl(student.getResumeUrl());
            if (student.getBio() != null) existing.setBio(student.getBio());
            if (student.getCertificates() != null) existing.setCertificates(student.getCertificates());
            if (student.getProjects() != null) existing.setProjects(student.getProjects());
            if (student.getCompletedCourseworks() != null) existing.setCompletedCourseworks(student.getCompletedCourseworks());
            
            // Check if all required fields are present
            boolean isComplete = isStudentProfileComplete(existing);
            System.out.println("Student profile completeness check: " + isComplete);
            existing.setProfileComplete(isComplete);
            return studentRepository.save(existing);
        } else {
            // Create new student
            boolean isComplete = isStudentProfileComplete(student);
            System.out.println("New student profile completeness check: " + isComplete);
            student.setProfileComplete(isComplete);
            return studentRepository.save(student);
        }
    }

    public Faculty updateFacultyProfile(Faculty faculty) {
        if (faculty.getEmail() == null || faculty.getEmail().isBlank()) {
            throw new RuntimeException("Email is required for faculty profile update");
        }
        String cleanEmail = faculty.getEmail().trim().toLowerCase();
        faculty.setEmail(cleanEmail);

        // Check if faculty exists by email
        Optional<Faculty> existingFaculty = facultyRepository.findByEmail(cleanEmail);
        
        // Validate unique employeeId if provided
        if (faculty.getEmployeeId() != null && !faculty.getEmployeeId().isBlank()) {
            Optional<Faculty> existingWithEmpId = facultyRepository.findByEmployeeId(faculty.getEmployeeId());
            if (existingWithEmpId.isPresent()) {
                if (existingFaculty.isPresent() && 
                    !existingWithEmpId.get().getId().equals(existingFaculty.get().getId())) {
                    throw new RuntimeException("Employee ID '" + faculty.getEmployeeId() + "' is already registered.");
                }
                if (existingFaculty.isEmpty()) {
                    throw new RuntimeException("Employee ID '" + faculty.getEmployeeId() + "' is already registered.");
                }
            }
        }
        
        if (existingFaculty.isPresent()) {
            // Update existing faculty without wiping existing fields with nulls
            Faculty existing = existingFaculty.get();
            if (faculty.getFirstName() != null) existing.setFirstName(faculty.getFirstName());
            if (faculty.getLastName() != null) existing.setLastName(faculty.getLastName());
            if (faculty.getDepartment() != null) existing.setDepartment(faculty.getDepartment());
            if (faculty.getPhone() != null) existing.setPhone(faculty.getPhone());
            if (faculty.getGender() != null) existing.setGender(faculty.getGender());
            if (faculty.getLinkedin() != null) existing.setLinkedin(faculty.getLinkedin());
            if (faculty.getGithub() != null) existing.setGithub(faculty.getGithub());
            if (faculty.getProfilePhoto() != null) existing.setProfilePhoto(faculty.getProfilePhoto());
            if (faculty.getDesignation() != null) existing.setDesignation(faculty.getDesignation());
            if (faculty.getLogoUrl() != null) existing.setLogoUrl(faculty.getLogoUrl());
            if (faculty.getEmployeeId() != null) existing.setEmployeeId(faculty.getEmployeeId());
            if (faculty.getIdProofUrl() != null) existing.setIdProofUrl(faculty.getIdProofUrl());
            if (faculty.getRole() != null) existing.setRole(faculty.getRole());
            
            // Check if all required fields are present
            boolean isComplete = isFacultyProfileComplete(existing);
            System.out.println("Faculty profile completeness check: " + isComplete);
            existing.setProfileComplete(isComplete);
            return facultyRepository.save(existing);
        } else {
            // Create new faculty
            boolean isComplete = isFacultyProfileComplete(faculty);
            System.out.println("New faculty profile completeness check: " + isComplete);
            faculty.setProfileComplete(isComplete);
            return facultyRepository.save(faculty);
        }
    }

    public Faculty updateFacultyRole(String email, String role) {
        Faculty faculty = facultyRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Faculty not found"));

        if (role == null || role.isBlank()) {
            throw new RuntimeException("Role is required");
        }

        String normalizedRole = role.trim().toUpperCase();
        if (!"FACULTY".equals(normalizedRole) && !"ADMIN".equals(normalizedRole)) {
            throw new RuntimeException("Unsupported role change");
        }

        if ("ADMIN".equals(normalizedRole)) {
            Optional<Faculty> existingAdmin = facultyRepository.findByDepartmentAndRole(faculty.getDepartment(), "ADMIN");
            if (existingAdmin.isPresent() && !email.equalsIgnoreCase(existingAdmin.get().getEmail())) {
                throw new RuntimeException("Already registered admin for this department.");
            }
        }

        faculty.setRole(normalizedRole);
        return facultyRepository.save(faculty);
    }
    
    // Helper methods
    private boolean isStudentProfileComplete(Student student) {
        return student.getFirstName() != null && !student.getFirstName().isBlank() &&
               student.getLastName() != null && !student.getLastName().isBlank() &&
               student.getPhone() != null && !student.getPhone().isBlank() &&
               student.getDepartment() != null && !student.getDepartment().isBlank() &&
               student.getCollegeName() != null && !student.getCollegeName().isBlank() &&
               student.getRegistrationNumber() != null && !student.getRegistrationNumber().isBlank();
    }
    
    private boolean isFacultyProfileComplete(Faculty faculty) {
        return faculty.getFirstName() != null && !faculty.getFirstName().isBlank() &&
               faculty.getLastName() != null && !faculty.getLastName().isBlank() &&
               faculty.getPhone() != null && !faculty.getPhone().isBlank() &&
               faculty.getDepartment() != null && !faculty.getDepartment().isBlank() &&
               faculty.getDesignation() != null && !faculty.getDesignation().isBlank();
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public List<Faculty> getAllFaculty() {
        return facultyRepository.findAll();
    }

    public long getStudentCount() {
        return studentRepository.count();
    }

    public long getFacultyCount() {
        return facultyRepository.count();
    }

    public boolean checkAdminExists(String department) {
        return facultyRepository.findByDepartmentAndRole(department, "ADMIN").isPresent();
    }

    public List<Faculty> getFacultyByDepartment(String department) {
        return facultyRepository.findByDepartment(department);
    }
}
