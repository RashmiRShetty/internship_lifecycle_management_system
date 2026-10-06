package com.internship.chatservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String senderEmail;
    private String recipientEmail;
    private String internshipGroupId;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    private LocalDateTime timestamp;
    
    // Status: SENT, DELIVERED, SEEN
    private String status;
    
    // Type: TEXT, IMAGE, VIDEO, AUDIO, DOCUMENT
    private String messageType;
    
    private String fileUrl;
    private String fileName;
    
    // For Tag/Reply functionality
    private Long replyToId;
    
    @Transient
    private ChatMessage repliedToMessage; // For frontend convenience

    public ChatMessage() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSenderEmail() { return senderEmail; }
    public void setSenderEmail(String senderEmail) { this.senderEmail = senderEmail; }

    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }

    public String getInternshipGroupId() { return internshipGroupId; }
    public void setInternshipGroupId(String internshipGroupId) { this.internshipGroupId = internshipGroupId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMessageType() { return messageType; }
    public void setMessageType(String messageType) { this.messageType = messageType; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public Long getReplyToId() { return replyToId; }
    public void setReplyToId(Long replyToId) { this.replyToId = replyToId; }

    public ChatMessage getRepliedToMessage() { return repliedToMessage; }
    public void setRepliedToMessage(ChatMessage repliedToMessage) { this.repliedToMessage = repliedToMessage; }
}
