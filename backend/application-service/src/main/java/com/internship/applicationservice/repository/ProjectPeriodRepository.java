package com.internship.applicationservice.repository;

import com.internship.applicationservice.entity.ProjectPeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectPeriodRepository extends JpaRepository<ProjectPeriod, Long> {
    List<ProjectPeriod> findByProjectIdOrderByPeriodNumberAsc(Long projectId);
}
