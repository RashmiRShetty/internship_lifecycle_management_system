package com.internship.applicationservice.repository;

import com.internship.applicationservice.entity.ProjectTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectTaskRepository extends JpaRepository<ProjectTask, Long> {
    List<ProjectTask> findByProjectId(Long projectId);
    List<ProjectTask> findByPeriodId(Long periodId);
    List<ProjectTask> findByStudentEmail(String studentEmail);
    List<ProjectTask> findByProjectIdAndStudentEmail(Long projectId, String studentEmail);
    Optional<ProjectTask> findByPeriodIdAndStudentEmail(Long periodId, String studentEmail);
}
