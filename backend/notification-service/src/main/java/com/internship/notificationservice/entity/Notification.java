package com.internship.notificationservice.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String recipientEmail;
    private String title;
    private String message;
    private String type; // EMAIL, IN_APP, PUSH
    private LocalDateTime timestamp;
    private boolean isRead;

    public Notification() {}

    public Notification(Long id, String recipientEmail, String title, String message, String type, LocalDateTime timestamp, boolean isRead) {
        this.id = id;
        this.recipientEmail = recipientEmail;
        this.title = title;
        this.message = message;
        this.type = type;
        this.timestamp = timestamp;
        this.isRead = isRead;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRecipientEmail() {
        return recipientEmail;
    }

    public void setRecipientEmail(String recipientEmail) {
        this.recipientEmail = recipientEmail;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    @JsonProperty("isRead")
    public boolean isRead() {
        return isRead;
    }

    @JsonProperty("isRead")
    public void setRead(boolean read) {
        isRead = read;
    }
}
