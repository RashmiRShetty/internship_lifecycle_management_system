package com.internship.applicationservice.repository;

import com.internship.applicationservice.entity.TaskReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskReviewRepository extends JpaRepository<TaskReview, Long> {
    List<TaskReview> findBySubmissionIdOrderByReviewedAtDesc(Long submissionId);
    Optional<TaskReview> findFirstBySubmissionIdOrderByReviewedAtDesc(Long submissionId);
}
