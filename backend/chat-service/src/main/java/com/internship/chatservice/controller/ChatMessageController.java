package com.internship.chatservice.controller;

import com.internship.chatservice.entity.ChatMessage;
import com.internship.chatservice.service.ChatMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chats")
public class ChatMessageController {

    @Autowired
    private ChatMessageService chatMessageService;

    @PostMapping("/send")
    public ResponseEntity<ChatMessage> sendMessage(@RequestBody ChatMessage message) {
        return ResponseEntity.ok(chatMessageService.sendMessage(message));
    }

    @GetMapping("/history")
    public ResponseEntity<List<ChatMessage>> getHistory(
            @RequestParam String user1, 
            @RequestParam String user2) {
        return ResponseEntity.ok(chatMessageService.getChatHistory(user1, user2));
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ChatMessage>> getConversations(@RequestParam String email) {
        return ResponseEntity.ok(chatMessageService.getConversations(email));
    }

    @PutMapping("/seen")
    public ResponseEntity<Void> markAsSeen(@RequestParam String recipient, @RequestParam String sender) {
        chatMessageService.markAsSeen(recipient, sender);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<ChatMessage>> getGroupHistory(@PathVariable String groupId) {
        return ResponseEntity.ok(chatMessageService.getGroupMessages(groupId));
    }

    @DeleteMapping("/history")
    public ResponseEntity<Void> deleteHistory(@RequestParam String user1, @RequestParam String user2) {
        chatMessageService.deleteChatHistory(user1, user2);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Chat service is reachable!");
    }
}
