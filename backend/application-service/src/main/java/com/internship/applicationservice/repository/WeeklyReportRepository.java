package com.internship.applicationservice.repository;

import com.internship.applicationservice.entity.WeeklyReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WeeklyReportRepository extends JpaRepository<WeeklyReport, Long> {
    List<WeeklyReport> findByApplicationIdOrderByWeekNumberDesc(Long applicationId);
    List<WeeklyReport> findByStudentEmailOrderBySubmittedAtDesc(String studentEmail);
    List<WeeklyReport> findByFacultyEmailOrderBySubmittedAtDesc(String facultyEmail);
    Optional<WeeklyReport> findByApplicationIdAndWeekNumber(Long applicationId, Integer weekNumber);
}
