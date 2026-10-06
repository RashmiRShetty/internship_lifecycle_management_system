package com.internship.applicationservice.repository;

import com.internship.applicationservice.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByCreatedBy(String createdBy);
    List<Project> findByAssignedStudentsContaining(String studentEmail);
}

@Repository
interface ProjectPeriodRepositoryInternal extends JpaRepository<ProjectPeriod, Long> {
    List<ProjectPeriod> findByProjectIdOrderByPeriodNumberAsc(Long projectId);
}
