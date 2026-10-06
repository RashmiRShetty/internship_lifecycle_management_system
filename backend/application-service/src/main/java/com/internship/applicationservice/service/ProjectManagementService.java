package com.internship.applicationservice.service;

import com.internship.applicationservice.entity.*;
import com.internship.applicationservice.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class ProjectManagementService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectPeriodRepository periodRepository;

    @Autowired
    private ProjectTaskRepository taskRepository;

    @Autowired
    private TaskSubmissionRepository submissionRepository;

    @Autowired
    private TaskAttachmentRepository attachmentRepository;

    @Autowired
    private TaskReviewRepository reviewRepository;

    private static final String UPLOAD_DIR = "uploads/task_submissions/";

    // 1. Create Project & Auto Calculate Periods
    public Project createProject(Project project) {
        Project savedProject = projectRepository.save(project);
        calculateAndGeneratePeriods(savedProject);
        return savedProject;
    }

    private void calculateAndGeneratePeriods(Project project) {
        LocalDate startDate = project.getStartDate();
        LocalDate endDate = project.getEndDate();
        String freqType = project.getFrequencyType() != null ? project.getFrequencyType().toUpperCase() : "WEEKLY";
        Integer customDays = project.getFrequencyDays();

        int stepDays = 7; // Default weekly
        if ("DAILY".equals(freqType)) {
            stepDays = 1;
        } else if ("WEEKLY".equals(freqType)) {
            stepDays = 7;
        } else if ("FIFTEEN_DAYS".equals(freqType)) {
            stepDays = 15;
        } else if ("MONTHLY".equals(freqType)) {
            stepDays = 30;
        } else if ("CUSTOM".equals(freqType) && customDays != null && customDays > 0) {
            stepDays = customDays;
        }

        LocalDate currStart = startDate;
        int periodNum = 1;
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM");

        while (!currStart.isAfter(endDate)) {
            LocalDate currEnd = currStart.plusDays(stepDays - 1);
            if (currEnd.isAfter(endDate)) {
                currEnd = endDate;
            }

            String periodName;
            if ("WEEKLY".equals(freqType)) {
                periodName = "Week " + periodNum + " (" + currStart.format(fmt) + " – " + currEnd.format(fmt) + ")";
            } else if ("DAILY".equals(freqType)) {
                periodName = "Day " + periodNum + " (" + currStart.format(fmt) + ")";
            } else {
                periodName = "Period " + periodNum + " (" + currStart.format(fmt) + " – " + currEnd.format(fmt) + ")";
            }

            ProjectPeriod period = new ProjectPeriod();
            period.setProjectId(project.getId());
            period.setPeriodNumber(periodNum);
            period.setPeriodName(periodName);
            period.setStartDate(currStart);
            period.setEndDate(currEnd);
            period.setStatus(periodNum == 1 ? "AVAILABLE" : "LOCKED");

            periodRepository.save(period);

            currStart = currEnd.plusDays(1);
            periodNum++;
        }
    }

    public List<Project> getProjectsByFaculty(String facultyEmail) {
        return projectRepository.findByCreatedBy(facultyEmail);
    }

    public List<Project> getProjectsByStudent(String studentEmail) {
        return projectRepository.findByAssignedStudentsContaining(studentEmail);
    }

    public Optional<Project> getProjectById(Long projectId) {
        return projectRepository.findById(projectId);
    }

    public void deleteProject(Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            return;
        }

        projectRepository.deleteById(projectId);
    }

    public List<ProjectPeriod> getPeriodsByProject(Long projectId) {
        return periodRepository.findByProjectIdOrderByPeriodNumberAsc(projectId);
    }

    // 2. Assign Task by Faculty
    public ProjectTask assignTask(Long periodId, Long projectId, String studentEmail, String facultyEmail,
            String title, String description, String instructions, LocalDate dueDate, String priority) {
        // Find existing or create new
        Optional<ProjectTask> existing = taskRepository.findByPeriodIdAndStudentEmail(periodId, studentEmail);
        ProjectTask task = existing.orElse(new ProjectTask());

        task.setPeriodId(periodId);
        task.setProjectId(projectId);
        task.setStudentEmail(studentEmail);
        task.setAssignedBy(facultyEmail);
        task.setTitle(title);
        task.setDescription(description);
        task.setInstructions(instructions);
        task.setDueDate(dueDate != null ? dueDate : LocalDate.now().plusDays(7));
        task.setPriority(priority != null ? priority : "MEDIUM");
        task.setStatus("ASSIGNED");

        ProjectTask savedTask = taskRepository.save(task);

        // Update period status to AVAILABLE if it was LOCKED
        Optional<ProjectPeriod> periodOpt = periodRepository.findById(periodId);
        if (periodOpt.isPresent()) {
            ProjectPeriod period = periodOpt.get();
            if ("LOCKED".equals(period.getStatus())) {
                period.setStatus("AVAILABLE");
                periodRepository.save(period);
            }
        }

        return savedTask;
    }

    public List<ProjectTask> getTasksByProjectAndStudent(Long projectId, String studentEmail) {
        return taskRepository.findByProjectIdAndStudentEmail(projectId, studentEmail);
    }

    public List<ProjectTask> getTasksByStudent(String studentEmail) {
        return taskRepository.findByStudentEmail(studentEmail);
    }

    public List<ProjectTask> getTasksByProject(Long projectId) {
        return taskRepository.findByProjectId(projectId);
    }

    public List<ProjectTask> getTasksByPeriod(Long periodId) {
        return taskRepository.findByPeriodId(periodId);
    }

    // 3. Student Submit Task Response + Multiple Files
    public TaskSubmission submitTask(Long taskId, String studentEmail, String responseText, List<MultipartFile> files)
            throws IOException {
        Optional<ProjectTask> taskOpt = taskRepository.findById(taskId);
        if (taskOpt.isEmpty()) {
            throw new IllegalArgumentException("Task not found with ID: " + taskId);
        }
        ProjectTask task = taskOpt.get();

        // Calculate attempt number
        Optional<TaskSubmission> lastSub = submissionRepository.findFirstByTaskIdOrderByAttemptNumberDesc(taskId);
        int nextAttempt = lastSub.map(s -> s.getAttemptNumber() + 1).orElse(1);

        TaskSubmission submission = new TaskSubmission();
        submission.setTaskId(taskId);
        submission.setStudentEmail(studentEmail);
        submission.setResponseText(responseText);
        submission.setAttemptNumber(nextAttempt);
        submission.setStatus(nextAttempt > 1 ? "RESUBMITTED" : "SUBMITTED");

        TaskSubmission savedSub = submissionRepository.save(submission);

        // Save multiple file attachments
        if (files != null && !files.isEmpty()) {
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            for (MultipartFile file : files) {
                if (file.isEmpty())
                    continue;

                String originalName = file.getOriginalFilename();
                String storedName = UUID.randomUUID().toString() + "_" + originalName;
                Path path = Paths.get(UPLOAD_DIR + storedName);
                Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

                TaskAttachment attachment = new TaskAttachment();
                attachment.setSubmissionId(savedSub.getId());
                attachment.setFileName(originalName);
                attachment.setFilePath(path.toString());
                attachment.setFileType(
                        file.getContentType() != null ? file.getContentType() : "APPLICATION/OCTET-STREAM");
                attachment.setFileSize(file.getSize());

                attachmentRepository.save(attachment);
            }
        }

        // Update task status
        task.setStatus(nextAttempt > 1 ? "RESUBMITTED" : "SUBMITTED");
        taskRepository.save(task);

        return savedSub;
    }

    // 4. Faculty Review Submission (ACCEPT or CORRECTION_REQUIRED)
    public TaskReview reviewTask(Long submissionId, String facultyEmail, String status, String score, String comments,
            LocalDate correctionDueDate) {
        Optional<TaskSubmission> subOpt = submissionRepository.findById(submissionId);
        if (subOpt.isEmpty()) {
            throw new IllegalArgumentException("Submission not found with ID: " + submissionId);
        }
        TaskSubmission submission = subOpt.get();

        Optional<ProjectTask> taskOpt = taskRepository.findById(submission.getTaskId());
        if (taskOpt.isEmpty()) {
            throw new IllegalArgumentException("Task not found");
        }
        ProjectTask task = taskOpt.get();

        TaskReview review = new TaskReview();
        review.setSubmissionId(submissionId);
        review.setFacultyEmail(facultyEmail);
        review.setStatus(status); // ACCEPT or CORRECTION_REQUIRED
        review.setScore(score);
        review.setComments(comments);

        TaskReview savedReview = reviewRepository.save(review);

        if ("ACCEPT".equalsIgnoreCase(status) || "ACCEPTED".equalsIgnoreCase(status)) {
            submission.setStatus("ACCEPTED");
            task.setStatus("ACCEPTED");

            // Unlock next period for this project if available
            unlockNextPeriod(task.getProjectId(), task.getPeriodId());
        } else {
            submission.setStatus("CORRECTION_REQUIRED");
            task.setStatus("CORRECTION_REQUIRED");
            if (correctionDueDate != null) {
                task.setDueDate(correctionDueDate);
            }
        }

        submissionRepository.save(submission);
        taskRepository.save(task);

        return savedReview;
    }

    private void unlockNextPeriod(Long projectId, Long currentPeriodId) {
        List<ProjectPeriod> periods = periodRepository.findByProjectIdOrderByPeriodNumberAsc(projectId);
        for (int i = 0; i < periods.size(); i++) {
            if (periods.get(i).getId().equals(currentPeriodId)) {
                if (i + 1 < periods.size()) {
                    ProjectPeriod nextPeriod = periods.get(i + 1);
                    if ("LOCKED".equals(nextPeriod.getStatus())) {
                        nextPeriod.setStatus("AVAILABLE");
                        periodRepository.save(nextPeriod);
                    }
                }
                break;
            }
        }
    }

    // Get Full Submission History with attachments and reviews for a task
    public Map<String, Object> getTaskDetails(Long taskId) {
        Map<String, Object> result = new HashMap<>();
        Optional<ProjectTask> taskOpt = taskRepository.findById(taskId);
        if (taskOpt.isEmpty())
            return result;

        ProjectTask task = taskOpt.get();
        result.put("task", task);

        Optional<ProjectPeriod> periodOpt = periodRepository.findById(task.getPeriodId());
        periodOpt.ifPresent(p -> result.put("period", p));

        Optional<Project> projOpt = projectRepository.findById(task.getProjectId());
        projOpt.ifPresent(p -> result.put("project", p));

        List<TaskSubmission> submissions = submissionRepository.findByTaskIdOrderByAttemptNumberDesc(taskId);
        List<Map<String, Object>> subDetails = new ArrayList<>();

        for (TaskSubmission sub : submissions) {
            Map<String, Object> subMap = new HashMap<>();
            subMap.put("submission", sub);

            List<TaskAttachment> attachments = attachmentRepository.findBySubmissionId(sub.getId());
            subMap.put("attachments", attachments);

            Optional<TaskReview> review = reviewRepository.findFirstBySubmissionIdOrderByReviewedAtDesc(sub.getId());
            review.ifPresent(r -> subMap.put("review", r));

            subDetails.add(subMap);
        }

        result.put("submissions", subDetails);
        return result;
    }

    public TaskAttachment getAttachmentById(Long attachmentId) {
        return attachmentRepository.findById(attachmentId).orElse(null);
    }
}
