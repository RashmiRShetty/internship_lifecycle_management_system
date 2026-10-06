package com.internship.meetingservice.controller;

import com.internship.meetingservice.entity.Meeting;
import com.internship.meetingservice.service.MeetingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/meetings")
public class MeetingController {

    @Autowired
    private MeetingService service;

    @PostMapping("/request")
    public ResponseEntity<Meeting> requestMeeting(@RequestBody Meeting meeting) {
        return ResponseEntity.ok(service.requestMeeting(meeting));
    }

    @PostMapping("/schedule")
    public ResponseEntity<Meeting> scheduleMeeting(@RequestBody Meeting meeting) {
        return ResponseEntity.ok(service.scheduleMeeting(meeting));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Meeting> updateStatus(
            @PathVariable Long id, 
            @RequestParam String status,
            @RequestParam(required = false) String meetingLink) {
        return ResponseEntity.ok(service.updateMeetingStatus(id, status, meetingLink));
    }

    @PutMapping("/reschedule")
    public ResponseEntity<Meeting> reschedule(
            @RequestParam Long id, 
            @RequestParam String newStartTime) {
        try {
            java.time.LocalDateTime startTime = java.time.LocalDateTime.parse(newStartTime);
            return ResponseEntity.ok(service.rescheduleMeeting(id, startTime));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/host")
    public ResponseEntity<List<Meeting>> getByHost(@RequestParam String email) {
        try {
            return ResponseEntity.ok(service.getMeetingsByHost(email));
        } catch (Exception e) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
    }

    @GetMapping("/participant")
    public ResponseEntity<List<Meeting>> getByParticipant(@RequestParam String email) {
        try {
            return ResponseEntity.ok(service.getMeetingsByParticipant(email));
        } catch (Exception e) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
    }

    @PostMapping("/{id}/send-reminder")
    public ResponseEntity<Meeting> sendReminder(@PathVariable Long id) {
        return ResponseEntity.ok(service.sendReminderForMeeting(id));
    }
}
