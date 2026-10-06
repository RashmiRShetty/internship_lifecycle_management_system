package com.internship.notificationservice.service;

import com.internship.notificationservice.entity.Notification;
import com.internship.notificationservice.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository repository;

    @Autowired
    private JavaMailSender mailSender;

    @Value("${MAIL_FROM:${spring.mail.username}}")
    private String mailFrom;

    public Notification createNotification(Notification notification) {
        notification.setTimestamp(LocalDateTime.now());
        notification.setRead(false);
        Notification saved = repository.save(notification);

        if ("EMAIL".equalsIgnoreCase(notification.getType()) || "ALL".equalsIgnoreCase(notification.getType())) {
            sendEmail(notification.getRecipientEmail(), notification.getTitle(), notification.getMessage());
        }
        
        // PUSH logic would go here (e.g. Firebase/WebPush)
        // For now we just mark it as saved for the frontend to poll/websocket
        
        return saved;
    }

    public List<Notification> getNotifications(String email) {
        return repository.findByRecipientEmailOrderByTimestampDesc(email);
    }

    public void markAsRead(Long id) {
        repository.findById(id).ifPresent(n -> {
            n.setRead(true);
            repository.save(n);
        });
    }

    public void deleteNotification(Long id) {
        repository.deleteById(id);
    }

    private void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailFrom);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            System.out.println("Email sent successfully to: " + to);
        } catch (Exception e) {
            System.err.println("Error sending email: " + e.getMessage());
        }
    }
}
