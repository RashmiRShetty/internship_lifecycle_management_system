package com.internship.notificationservice.repository;

import com.internship.notificationservice.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientEmailOrderByTimestampDesc(String recipientEmail);
    List<Notification> findByRecipientEmailAndIsReadFalse(String recipientEmail);
}
