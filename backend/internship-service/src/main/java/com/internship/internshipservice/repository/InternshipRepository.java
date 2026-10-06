package com.internship.internshipservice.repository;

import com.internship.internshipservice.entity.Internship;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InternshipRepository extends JpaRepository<Internship, Long> {
    List<Internship> findByFacultyId(String facultyId);
    List<Internship> findByFacultyIdIgnoreCase(String facultyId);
    List<Internship> findByStatus(String status);
    List<Internship> findByFacultyIdIn(List<String> facultyEmails);
}
