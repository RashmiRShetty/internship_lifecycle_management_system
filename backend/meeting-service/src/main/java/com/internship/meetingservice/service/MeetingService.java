package com.internship.meetingservice.service;

import com.internship.meetingservice.entity.Meeting;
import com.internship.meetingservice.repository.MeetingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.scheduling.annotation.Scheduled;

@Service
public class MeetingService {

    @Autowired
    private MeetingRepository repository;

    @Autowired
    private WebClient.Builder loadBalancedWebClientBuilder;

    public Meeting requestMeeting(Meeting meeting) {
        meeting.setStatus("REQUESTED");
        meeting.setType("REQUESTED");
        Meeting saved = repository.save(meeting);

        String msg = "Meeting Request: '" + meeting.getTitle() + "' proposed for " + meeting.getStartTime() +
            (meeting.getMeetingLink() == null || meeting.getMeetingLink().isBlank()
                ? "."
                : ". Google Meet Link: " + meeting.getMeetingLink());
        
        // Notify both Host & Participant via Email & Website notification
        notifyUser(meeting.getHostEmail(), "📩 Meeting Request Received", msg, "ALL");
        notifyUser(meeting.getParticipantEmail(), "📩 Meeting Request Sent", msg, "ALL");
            
        return saved;
    }

    public Meeting scheduleMeeting(Meeting meeting) {
        meeting.setStatus("SCHEDULED");
        boolean isInPerson = "IN_PERSON".equalsIgnoreCase(meeting.getType());
        if (!isInPerson && (meeting.getMeetingLink() == null || meeting.getMeetingLink().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A real Google Meet link is required to schedule an online meeting.");
        }
        Meeting saved = repository.save(meeting);

        String detail = isInPerson 
            ? "Location: " + (meeting.getMeetingLink() != null ? meeting.getMeetingLink() : "In-Person Office/Campus") 
            : "Join Google Meet Link: " + meeting.getMeetingLink();

        String msg = "Meeting Confirmed: '" + meeting.getTitle() + "' at " + meeting.getStartTime() + 
            ". " + detail;
        
        // Notify both Host & Participant via Email & Website notification
        notifyUser(meeting.getParticipantEmail(), "📅 Meeting Scheduled", msg, "ALL");
        notifyUser(meeting.getHostEmail(), "📅 Meeting Scheduled", msg, "ALL");
            
        return saved;
    }

    public Meeting updateMeetingStatus(Long id, String status, String meetingLink) {
        Meeting meeting = repository.findById(id).orElseThrow(() -> new RuntimeException("Meeting not found"));
        meeting.setStatus(status);
        if (meetingLink != null && !meetingLink.isEmpty()) {
            meeting.setMeetingLink(meetingLink);
        }
        if ("SCHEDULED".equalsIgnoreCase(status)
                && !"IN_PERSON".equalsIgnoreCase(meeting.getType())
                && (meeting.getMeetingLink() == null || meeting.getMeetingLink().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A real Google Meet link is required to schedule an online meeting.");
        }
        Meeting saved = repository.save(meeting);
        
        if ("SCHEDULED".equals(status)) {
            String msg = "Your meeting '" + meeting.getTitle() + "' is confirmed for " + meeting.getStartTime() + 
                ". Join Google Meet Link: " + meeting.getMeetingLink();
            notifyUser(meeting.getParticipantEmail(), "📅 Meeting Confirmed", msg, "ALL");
            notifyUser(meeting.getHostEmail(), "📅 Meeting Confirmed", msg, "ALL");
        }
        
        return saved;
    }

    public Meeting rescheduleMeeting(Long id, LocalDateTime newStartTime) {
        Meeting meeting = repository.findById(id).orElseThrow(() -> new RuntimeException("Meeting not found"));
        meeting.setStartTime(newStartTime);
        meeting.setStatus("SCHEDULED");
        if (!"IN_PERSON".equalsIgnoreCase(meeting.getType())
                && (meeting.getMeetingLink() == null || meeting.getMeetingLink().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A real Google Meet link is required to reschedule an online meeting.");
        }
        Meeting saved = repository.save(meeting);

        String msg = "Your meeting '" + meeting.getTitle() + "' has been rescheduled to " + newStartTime + 
            ". Join Google Meet Link: " + meeting.getMeetingLink();

        notifyUser(meeting.getParticipantEmail(), "⏳ Meeting Rescheduled", msg, "ALL");
        notifyUser(meeting.getHostEmail(), "⏳ Meeting Rescheduled", msg, "ALL");

        return saved;
    }

    // AUTOMATED 1-DAY PRIOR MEETING REMINDER SCHEDULER (Runs every hour)
    @Scheduled(fixedRate = 3600000)
    public void sendOneDayPriorReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime tomorrowStart = now.plusHours(23);
        LocalDateTime tomorrowEnd = now.plusHours(25);

        List<Meeting> upcomingMeetings = repository.findByStatusAndStartTimeBetween("SCHEDULED", tomorrowStart, tomorrowEnd);
        for (Meeting m : upcomingMeetings) {
            if (!m.isReminderSent()) {
                sendReminderForMeeting(m.getId());
            }
        }
    }

    public Meeting sendReminderForMeeting(Long id) {
        Meeting m = repository.findById(id).orElseThrow(() -> new RuntimeException("Meeting not found"));
        String reminderMsg = "⏰ 1-DAY PRIOR REMINDER: Your meeting '" + m.getTitle() + "' is scheduled for tomorrow at " +
            m.getStartTime() + (m.getMeetingLink() == null || m.getMeetingLink().isBlank()
                ? "."
                : ". Google Meet Link: " + m.getMeetingLink());

        notifyUser(m.getParticipantEmail(), "⏰ 1-Day Prior Reminder: " + m.getTitle(), reminderMsg, "ALL");
        notifyUser(m.getHostEmail(), "⏰ 1-Day Prior Reminder: " + m.getTitle(), reminderMsg, "ALL");

        m.setReminderSent(true);
        return repository.save(m);
    }

    public List<Meeting> getMeetingsByHost(String email) {
        if (email == null || email.trim().isEmpty()) return java.util.Collections.emptyList();
        return repository.findByHostEmailIgnoreCaseOrderByStartTimeDesc(email.trim());
    }

    public List<Meeting> getMeetingsByParticipant(String email) {
        if (email == null || email.trim().isEmpty()) return java.util.Collections.emptyList();
        return repository.findByParticipantEmailIgnoreCaseOrderByStartTimeDesc(email.trim());
    }

    private void notifyUser(String email, String title, String message, String type) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("recipientEmail", email);
            body.put("title", title);
            body.put("message", message);
            body.put("type", type);

            loadBalancedWebClientBuilder.build()
                .post()
                .uri("http://notification-service/notifications")
                .bodyValue(body)
                .retrieve()
                .toBodilessEntity()
                .subscribe();
        } catch (Exception e) {
            System.err.println("Failed to send notification: " + e.getMessage());
        }
    }
}
