package com.internship.meetingservice.repository;

import com.internship.meetingservice.entity.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import java.time.LocalDateTime;

public interface MeetingRepository extends JpaRepository<Meeting, Long> {
    List<Meeting> findByHostEmailOrderByStartTimeDesc(String hostEmail);
    List<Meeting> findByHostEmailIgnoreCaseOrderByStartTimeDesc(String hostEmail);
    List<Meeting> findByParticipantEmailOrderByStartTimeDesc(String participantEmail);
    List<Meeting> findByParticipantEmailIgnoreCaseOrderByStartTimeDesc(String participantEmail);
    List<Meeting> findByHostEmailAndStatus(String hostEmail, String status);
    List<Meeting> findByParticipantEmailAndStatus(String participantEmail, String status);
    List<Meeting> findByStatusAndStartTimeBetween(String status, LocalDateTime start, LocalDateTime end);
}
