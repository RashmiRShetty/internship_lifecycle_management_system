package com.internship.notificationservice.controller;

import com.internship.notificationservice.entity.Notification;
import com.internship.notificationservice.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired
    private NotificationService service;

    @PostMapping
    public ResponseEntity<Notification> create(@RequestBody Notification notification) {
        return ResponseEntity.ok(service.createNotification(notification));
    }

    @GetMapping("/user")
    public ResponseEntity<List<Notification>> getByUser(@RequestParam String email) {
        return ResponseEntity.ok(service.getNotifications(email));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        service.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteNotification(id);
        return ResponseEntity.ok().build();
    }
}
