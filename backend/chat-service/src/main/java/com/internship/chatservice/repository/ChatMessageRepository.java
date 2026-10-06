package com.internship.chatservice.repository;

import com.internship.chatservice.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findBySenderEmailAndRecipientEmail(String senderEmail, String recipientEmail);
    List<ChatMessage> findByRecipientEmailAndSenderEmail(String recipientEmail, String senderEmail);
    List<ChatMessage> findByInternshipGroupId(String internshipGroupId);
    
    // Find all messages between two users (either way)
    List<ChatMessage> findBySenderEmailAndRecipientEmailOrRecipientEmailAndSenderEmailOrderByTimestampAsc(
            String sender1, String recipient1, String sender2, String recipient2);

    // Find all messages involving a user
    List<ChatMessage> findBySenderEmailOrRecipientEmailOrderByTimestampDesc(String senderEmail, String recipientEmail);

    @Modifying
    @Transactional
    @Query("UPDATE ChatMessage m SET m.status = 'SEEN' WHERE m.recipientEmail = ?1 AND m.senderEmail = ?2 AND m.status <> 'SEEN'")
    void markMessagesAsSeen(String recipientEmail, String senderEmail);

    @Modifying
    @Transactional
    @Query("DELETE FROM ChatMessage m WHERE (m.senderEmail = ?1 AND m.recipientEmail = ?2) OR (m.senderEmail = ?2 AND m.recipientEmail = ?1)")
    void deleteChatHistory(String user1, String user2);
}
