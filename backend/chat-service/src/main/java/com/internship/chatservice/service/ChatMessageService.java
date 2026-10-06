package com.internship.chatservice.service;

import com.internship.chatservice.entity.ChatMessage;
import com.internship.chatservice.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ChatMessageService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    public ChatMessage sendMessage(ChatMessage message) {
        message.setTimestamp(LocalDateTime.now());
        if (message.getStatus() == null) {
            message.setStatus("SENT");
        }
        if (message.getMessageType() == null) {
            message.setMessageType("TEXT");
        }
        return chatMessageRepository.save(message);
    }

    public List<ChatMessage> getChatHistory(String user1, String user2) {
        // Mark received messages as seen when history is fetched
        chatMessageRepository.markMessagesAsSeen(user1, user2);
        
        List<ChatMessage> messages = chatMessageRepository.findBySenderEmailAndRecipientEmailOrRecipientEmailAndSenderEmailOrderByTimestampAsc(
                user1, user2, user1, user2);
        
        // Enrich messages with reply data
        for (ChatMessage msg : messages) {
            if (msg.getReplyToId() != null) {
                Optional<ChatMessage> repliedTo = chatMessageRepository.findById(msg.getReplyToId());
                repliedTo.ifPresent(msg::setRepliedToMessage);
            }
        }
        
        return messages;
    }

    public List<ChatMessage> getConversations(String userEmail) {
        List<ChatMessage> allMessages = chatMessageRepository.findBySenderEmailOrRecipientEmailOrderByTimestampDesc(userEmail, userEmail);
        Map<String, ChatMessage> latestMessages = new HashMap<>();
        
        for (ChatMessage msg : allMessages) {
            String sender = msg.getSenderEmail() != null ? msg.getSenderEmail() : "";
            String recipient = msg.getRecipientEmail() != null ? msg.getRecipientEmail() : "";

            boolean isSender = sender.equalsIgnoreCase(userEmail);
            boolean isRecipient = recipient.equalsIgnoreCase(userEmail);

            if (isSender && isRecipient) {
                continue; // Skip self-messages
            }

            String otherUser = isSender ? recipient : sender;
            if (otherUser != null && !otherUser.isBlank() && !otherUser.equalsIgnoreCase(userEmail)) {
                String key = otherUser.toLowerCase();
                if (!latestMessages.containsKey(key)) {
                    latestMessages.put(key, msg);
                }
            }
        }
        
        return new ArrayList<>(latestMessages.values());
    }

    public List<ChatMessage> getGroupMessages(String groupId) {
        return chatMessageRepository.findByInternshipGroupId(groupId);
    }

    public void markAsSeen(String recipientEmail, String senderEmail) {
        chatMessageRepository.markMessagesAsSeen(recipientEmail, senderEmail);
    }

    public void deleteChatHistory(String user1, String user2) {
        chatMessageRepository.deleteChatHistory(user1, user2);
    }
}
