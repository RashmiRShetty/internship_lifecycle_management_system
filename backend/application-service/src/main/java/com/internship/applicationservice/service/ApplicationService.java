package com.internship.applicationservice.service;

import com.internship.applicationservice.entity.Application;
import com.internship.applicationservice.entity.WeeklyReport;
import com.internship.applicationservice.repository.ApplicationRepository;
import com.internship.applicationservice.repository.WeeklyReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository repository;

    @Autowired
    private WeeklyReportRepository weeklyReportRepository;

    @Autowired
    private WebClient.Builder loadBalancedWebClientBuilder;

    public Application applyForInternship(Application application) {
        if (repository.findByStudentEmailAndInternshipId(application.getStudentEmail(), application.getInternshipId()).isPresent()) {
            throw new RuntimeException("You have already applied for this internship");
        }
        application.setStatus("APPLIED");
        application.setAppliedAt(LocalDateTime.now());
        Application saved = repository.save(application);
        
        // Notify Faculty
        notifyUser(application.getFacultyEmail(), "New Application", 
            "Student " + application.getStudentEmail() + " applied for " + application.getInternshipTitle(), "ALL");
            
        return saved;
    }

    public List<Application> getApplicationsByStudent(String email) {
        if (email == null || email.trim().isEmpty()) return java.util.Collections.emptyList();
        return repository.findByStudentEmailIgnoreCase(email.trim());
    }

    public List<Application> getApplicationsByInternship(Long internshipId) {
        return repository.findByInternshipId(internshipId);
    }

    public List<Application> getApplicationsByFaculty(String facultyEmail) {
        try {
            if (facultyEmail == null || facultyEmail.trim().isEmpty()) return java.util.Collections.emptyList();
            return repository.findByFacultyEmailIgnoreCase(facultyEmail.trim());
        } catch (Exception e) {
            System.err.println("Database error in getApplicationsByFaculty: " + e.getMessage());
            return java.util.Collections.emptyList();
        }
    }

    public List<Application> getApplicationsByFacultyEmails(List<String> facultyEmails) {
        return repository.findByFacultyEmailIn(facultyEmails);
    }

    public List<Application> getAllApplications() {
        return repository.findAll();
    }

    public Application updateApplicationStatus(Long id, String status) {
        return updateApplicationStatus(id, status, null);
    }

    public Application updateApplicationStatus(Long id, String status, String rejectionReason) {
        Application application = repository.findById(id).orElseThrow(() -> new RuntimeException("Application not found"));
        application.setStatus(status);
        if (rejectionReason != null && !rejectionReason.trim().isEmpty()) {
            application.setRejectionReason(rejectionReason);
        }
        
        // If SELECTED, get internship data and set start date/submission day
        if ("SELECTED".equals(status)) {
            fetchAndSetInternshipData(application);
        }
        
        Application saved = repository.save(application);
        
        // Build customized, polite status update email message
        String roleTitle = application.getInternshipTitle() != null ? application.getInternshipTitle() : "Internship Position";
        String emailSubject = "Application Status Update: " + roleTitle;
        String emailBody = "";

        if ("SHORTLISTED".equalsIgnoreCase(status)) {
            emailSubject = "🎉 Application Shortlisted: " + roleTitle;
            emailBody = "Dear Candidate,\n\nGreat news! Your application for '" + roleTitle + "' has been SHORTLISTED by the faculty.\n\nPlease log in to your dashboard to review next steps and keep an eye out for interview scheduling notifications.\n\nBest regards,\nInternship Selection Team";
        } else if ("INTERVIEW".equalsIgnoreCase(status)) {
            emailSubject = "📹 Interview Call Scheduled: " + roleTitle;
            emailBody = "Dear Candidate,\n\nYou have been selected for an Interview for '" + roleTitle + "'.\n\nPlease check your student dashboard for interview date, time, and link/venue details.\n\nBest regards,\nInternship Selection Team";
        } else if ("SELECTED".equalsIgnoreCase(status)) {
            emailSubject = "🥳 Congratulations! You are Officially Selected for " + roleTitle;
            emailBody = "Dear Candidate,\n\nWe are delighted to inform you that you have been Officially SELECTED for '" + roleTitle + "'!\n\nPlease log in to your dashboard to access your project details, schedule, and task submission board.\n\nBest regards,\nInternship Selection Team";
        } else if ("REJECTED".equalsIgnoreCase(status)) {
            emailSubject = "Application Status Update: " + roleTitle;
            String reasonText = (application.getRejectionReason() != null && !application.getRejectionReason().trim().isEmpty())
                ? application.getRejectionReason()
                : "Thank you for your application. We have decided to proceed with other candidates whose qualifications are more suitable for this role. We wish you all the best in your search!";
            emailBody = "Dear Candidate,\n\n" + reasonText + "\n\nBest regards,\nInternship Selection Team";
        } else {
            emailBody = "Dear Candidate,\n\nYour application status for '" + roleTitle + "' has been updated to: " + status + ".\n\nBest regards,\nInternship Selection Team";
        }
        
        // Send email & in-app notification to Student
        notifyUser(application.getStudentEmail(), emailSubject, emailBody, "ALL");
            
        return saved;
    }
    
    public Application refreshInternshipData(Long id) {
        Application application = repository.findById(id).orElseThrow(() -> new RuntimeException("Application not found"));
        fetchAndSetInternshipData(application);
        return repository.save(application);
    }
    
    private void fetchAndSetInternshipData(Application application) {
        try {
            Map<String, Object> internship = loadBalancedWebClientBuilder.build()
                    .get()
                    .uri("http://internship-service/internships/" + application.getInternshipId())
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
            
            if (internship != null) {
                if (internship.get("startDate") != null) {
                    application.setInternshipStartDate(LocalDate.parse((String) internship.get("startDate")));
                }
                if (internship.get("endDate") != null) {
                    application.setInternshipEndDate(LocalDate.parse((String) internship.get("endDate")));
                }
                if (internship.get("weeklySubmissionDay") != null) {
                    application.setWeeklySubmissionDay((Integer) internship.get("weeklySubmissionDay"));
                }
            }
        } catch (Exception e) {
            System.err.println("Error fetching internship data: " + e.getMessage());
        }
    }

    public Application assignProjectTitle(Long id, String projectTitle, String projectDescription) {
        Application application = repository.findById(id).orElseThrow(() -> new RuntimeException("Application not found"));
        application.setProjectTitle(projectTitle);
        application.setProjectDescription(projectDescription);
        application.setProjectAccepted(false);
        application.setProjectRejected(false);
        Application saved = repository.save(application);

        notifyUser(application.getStudentEmail(), "Project Title Assigned", 
            "A project title has been assigned for your internship: " + projectTitle, "ALL");

        return saved;
    }

    public Application acceptProjectTitle(Long id) {
        Application application = repository.findById(id).orElseThrow(() -> new RuntimeException("Application not found"));
        application.setProjectAccepted(true);
        application.setProjectRejected(false);
        Application saved = repository.save(application);

        notifyUser(application.getFacultyEmail(), "Project Title Accepted", 
            "Student " + application.getStudentEmail() + " has accepted the project title: " + application.getProjectTitle(), "ALL");

        return saved;
    }

    public Application rejectProjectTitle(Long id) {
        Application application = repository.findById(id).orElseThrow(() -> new RuntimeException("Application not found"));
        application.setProjectAccepted(false);
        application.setProjectRejected(true);
        Application saved = repository.save(application);

        notifyUser(application.getFacultyEmail(), "Project Title Rejected", 
            "Student " + application.getStudentEmail() + " has rejected the project title: " + application.getProjectTitle(), "ALL");

        return saved;
    }

    // Weekly Report Methods
  public WeeklyReport submitWeeklyReport(
      Long applicationId, String studentEmail, String facultyEmail, Integer weekNumber,
      String content, org.springframework.web.multipart.MultipartFile file) {
    
    // Check if there's an existing report for this week that needs revision
    Optional<WeeklyReport> existingReport = weeklyReportRepository
        .findByApplicationIdAndWeekNumber(applicationId, weekNumber);
        
    WeeklyReport report;
    if (existingReport.isPresent() && 
        ("NEEDS_REVISION".equals(existingReport.get().getStatus()) || "PENDING".equals(existingReport.get().getStatus()))) {
      report = existingReport.get();
    } else {
      report = new WeeklyReport();
      report.setApplicationId(applicationId);
      report.setStudentEmail(studentEmail);
      report.setFacultyEmail(facultyEmail);
      report.setWeekNumber(weekNumber);
    }
    
    report.setContent(content);
    
    if (file != null && !file.isEmpty()) {
      // Upload file to chat-service
      try {
        // Use MultipartBodyBuilder properly
        org.springframework.http.client.MultipartBodyBuilder builder = new org.springframework.http.client.MultipartBodyBuilder();
        builder.part("file", file.getResource())
               .filename(file.getOriginalFilename())
               .contentType(org.springframework.http.MediaType.parseMediaType(file.getContentType() != null ? file.getContentType() : "application/octet-stream"));

        Map<String, Object> uploadResponse = loadBalancedWebClientBuilder.build()
                .post()
                .uri("http://chat-service/chats/files/upload")
                .bodyValue(builder.build())
                .retrieve()
                .bodyToMono(Map.class)
                .block();
        
        if (uploadResponse != null) {
          report.setFileUrl((String) uploadResponse.get("fileUrl"));
          report.setFileName((String) uploadResponse.get("fileName"));
          report.setFileType((String) uploadResponse.get("messageType"));
        }
      } catch (Exception e) {
        System.err.println("Failed to upload file: " + e.getMessage());
        e.printStackTrace();
      }
    }
    
    report.setStatus("SUBMITTED");
    report.setSubmittedAt(LocalDateTime.now());
    WeeklyReport saved = weeklyReportRepository.save(report);

    notifyUser(report.getFacultyEmail(), "Weekly Report Submitted", 
        "Student " + report.getStudentEmail() + " submitted report for week " + report.getWeekNumber(), "ALL");

    return saved;
  }
  
  // Keep old method for backward compatibility
  public WeeklyReport submitWeeklyReport(WeeklyReport report) {
    return submitWeeklyReport(
      report.getApplicationId(), report.getStudentEmail(), report.getFacultyEmail(), 
      report.getWeekNumber(), report.getContent(), null);
  }

  public WeeklyReport requestRevision(Long id, String feedback) {
    WeeklyReport report = weeklyReportRepository.findById(id).orElseThrow(() -> new RuntimeException("Report not found"));
    report.setFacultyFeedback(feedback);
    report.setStatus("NEEDS_REVISION");
    report.setReviewedAt(LocalDateTime.now());
    WeeklyReport saved = weeklyReportRepository.save(report);

    notifyUser(report.getStudentEmail(), "Weekly Report Needs Revision", 
        "Faculty has requested changes to your report for week " + report.getWeekNumber(), "ALL");

    return saved;
  }

  public WeeklyReport reviewWeeklyReport(Long id, String feedback) {
    WeeklyReport report = weeklyReportRepository.findById(id).orElseThrow(() -> new RuntimeException("Report not found"));
    report.setFacultyFeedback(feedback);
    report.setStatus("REVIEWED");
    report.setReviewedAt(LocalDateTime.now());
    WeeklyReport saved = weeklyReportRepository.save(report);

    notifyUser(report.getStudentEmail(), "Weekly Report Reviewed", 
        "Faculty has reviewed your report for week " + report.getWeekNumber(), "ALL");

    return saved;
  }

    public List<WeeklyReport> getReportsByApplication(Long applicationId) {
        return weeklyReportRepository.findByApplicationIdOrderByWeekNumberDesc(applicationId);
    }

    public List<WeeklyReport> getReportsByStudent(String email) {
        return weeklyReportRepository.findByStudentEmailOrderBySubmittedAtDesc(email);
    }

    public List<WeeklyReport> getReportsByFaculty(String email) {
        return weeklyReportRepository.findByFacultyEmailOrderBySubmittedAtDesc(email);
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

    // Scheduled task to run every hour
    @Scheduled(fixedRate = 3600000) // every 1 hour in ms
    public void processWeeklyReports() {
        System.out.println("Processing weekly reports...");
        LocalDate today = LocalDate.now();

        // Get all selected applications with start date set
        List<Application> selectedApplications = repository.findByStatus("SELECTED").stream()
                .filter(app -> app.getInternshipStartDate() != null)
                .toList();

        for (Application app : selectedApplications) {
            // Calculate current week number
            int currentWeek = calculateWeekNumber(app.getInternshipStartDate(), today);
            if (currentWeek < 1) continue;

            // Check if report for this week exists
            Optional<WeeklyReport> existingReport = weeklyReportRepository
                    .findByApplicationIdAndWeekNumber(app.getId(), currentWeek);
            
            if (existingReport.isEmpty()) {
                // Generate new weekly report
                LocalDate deadline = calculateDeadlineDate(app.getInternshipStartDate(), currentWeek, app.getWeeklySubmissionDay());
                
                WeeklyReport newReport = new WeeklyReport();
                newReport.setApplicationId(app.getId());
                newReport.setStudentEmail(app.getStudentEmail());
                newReport.setFacultyEmail(app.getFacultyEmail());
                newReport.setWeekNumber(currentWeek);
                newReport.setStatus("PENDING");
                newReport.setDeadlineDate(deadline);
                newReport.setReminderSentOneDayBefore(false);
                newReport.setReminderSentOnDay(false);
                
                weeklyReportRepository.save(newReport);
                
                System.out.println("Created weekly report for week " + currentWeek + " for student: " + app.getStudentEmail());
            } else {
                // Check if we need to send reminders
                WeeklyReport report = existingReport.get();
                if ("PENDING".equals(report.getStatus())) {
                    checkAndSendReminders(report, today);
                }
            }
        }
    }

    private int calculateWeekNumber(LocalDate startDate, LocalDate currentDate) {
        if (currentDate.isBefore(startDate)) {
            return 0;
        }
        
        // Calculate number of weeks between startDate and currentDate
        long daysBetween = currentDate.toEpochDay() - startDate.toEpochDay();
        return (int) (daysBetween / 7) + 1;
    }

    private LocalDate calculateDeadlineDate(LocalDate startDate, int weekNumber, Integer submissionDay) {
        if (submissionDay == null) {
            submissionDay = 5; // Default to Friday if not set
        }
        
        // Start date of the week
        LocalDate weekStart = startDate.plusWeeks(weekNumber - 1);
        
        // Find the next occurrence of the submission day
        DayOfWeek targetDay = DayOfWeek.of(submissionDay);
        return weekStart.with(TemporalAdjusters.nextOrSame(targetDay));
    }

    private void checkAndSendReminders(WeeklyReport report, LocalDate today) {
        LocalDate deadline = report.getDeadlineDate();
        
        // Send reminder one day before
        if (today.equals(deadline.minusDays(1)) && !report.getReminderSentOneDayBefore()) {
            notifyUser(report.getStudentEmail(), 
                    "REMINDER: Weekly Report Due Tomorrow", 
                    "Your weekly report for week " + report.getWeekNumber() + " is due tomorrow! Please submit it on time.",
                    "REMINDER");
            
            report.setReminderSentOneDayBefore(true);
            weeklyReportRepository.save(report);
            System.out.println("Sent 1-day reminder to: " + report.getStudentEmail());
        }
        
        // Send reminder on the day
        if (today.equals(deadline) && !report.getReminderSentOnDay()) {
            notifyUser(report.getStudentEmail(), 
                    "REMINDER: Weekly Report Due Today", 
                    "Your weekly report for week " + report.getWeekNumber() + " is due today! Please submit it soon.",
                    "REMINDER");
            
            report.setReminderSentOnDay(true);
            weeklyReportRepository.save(report);
            System.out.println("Sent day-of reminder to: " + report.getStudentEmail());
        }
    }

    public void clearAll() {
        weeklyReportRepository.deleteAll();
        repository.deleteAll();
    }
}
