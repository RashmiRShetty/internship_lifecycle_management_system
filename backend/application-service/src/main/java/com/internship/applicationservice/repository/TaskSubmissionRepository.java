package com.internship.applicationservice.repository;

import com.internship.applicationservice.entity.TaskSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskSubmissionRepository extends JpaRepository<TaskSubmission, Long> {
    List<TaskSubmission> findByTaskIdOrderByAttemptNumberDesc(Long taskId);
    Optional<TaskSubmission> findFirstByTaskIdOrderByAttemptNumberDesc(Long taskId);
}
