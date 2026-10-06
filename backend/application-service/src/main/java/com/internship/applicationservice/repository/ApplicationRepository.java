package com.internship.applicationservice.repository;

import com.internship.applicationservice.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByStudentEmail(String studentEmail);
    List<Application> findByStudentEmailIgnoreCase(String studentEmail);
    List<Application> findByInternshipId(Long internshipId);
    List<Application> findByFacultyEmail(String facultyEmail);
    List<Application> findByFacultyEmailIgnoreCase(String facultyEmail);
    List<Application> findByFacultyEmailIn(List<String> facultyEmails);
    Optional<Application> findByStudentEmailAndInternshipId(String studentEmail, Long internshipId);
    List<Application> findByStatus(String status);
}
