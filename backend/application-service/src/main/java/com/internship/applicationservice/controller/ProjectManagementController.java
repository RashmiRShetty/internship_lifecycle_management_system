package com.internship.applicationservice.controller;

import com.internship.applicationservice.entity.*;
import com.internship.applicationservice.service.ProjectManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/applications/projects")
public class ProjectManagementController {

    @Autowired
    private ProjectManagementService projectService;

    // 1. Create Project
    @PostMapping
    public ResponseEntity<Project> createProject(@RequestBody Project project) {
        return ResponseEntity.ok(projectService.createProject(project));
    }

    // 2. Delete Project
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok(Map.of("deleted", true, "projectId", id));
    }

    // 3. Get Faculty Projects
    @GetMapping("/faculty")
    public ResponseEntity<List<Project>> getFacultyProjects(@RequestParam String email) {
        return ResponseEntity.ok(projectService.getProjectsByFaculty(email));
    }

    // 4. Get Student Projects
    @GetMapping("/student")
    public ResponseEntity<List<Project>> getStudentProjects(@RequestParam String email) {
        return ResponseEntity.ok(projectService.getProjectsByStudent(email));
    }

    // 4. Get Project Details with Periods
    @GetMapping("/{id}")
    public ResponseEntity<?> getProjectById(@PathVariable Long id) {
        return projectService.getProjectById(id)
                .map(project -> {
                    List<ProjectPeriod> periods = projectService.getPeriodsByProject(id);
                    return ResponseEntity.ok(Map.of("project", project, "periods", periods));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 5. Assign Task by Faculty
    @PostMapping("/tasks/assign")
    public ResponseEntity<ProjectTask> assignTask(
            @RequestParam Long periodId,
            @RequestParam Long projectId,
            @RequestParam String studentEmail,
            @RequestParam String facultyEmail,
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String instructions,
            @RequestParam(required = false) String dueDate,
            @RequestParam(required = false) String priority) {

        LocalDate parsedDueDate = dueDate != null && !dueDate.isBlank() ? LocalDate.parse(dueDate) : null;
        return ResponseEntity.ok(projectService.assignTask(
                periodId, projectId, studentEmail, facultyEmail, title, description, instructions, parsedDueDate,
                priority));
    }

    // 6. Get Tasks for a Project
    @GetMapping("/{projectId}/tasks")
    public ResponseEntity<List<ProjectTask>> getTasksByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(projectService.getTasksByProject(projectId));
    }

    // 7. Get Tasks for a Student
    @GetMapping("/tasks/student")
    public ResponseEntity<List<ProjectTask>> getTasksByStudent(@RequestParam String email) {
        return ResponseEntity.ok(projectService.getTasksByStudent(email));
    }

    // 8. Submit Task by Student (Text Response + Multiple File Uploads)
    @PostMapping("/tasks/{taskId}/submit")
    public ResponseEntity<?> submitTask(
            @PathVariable Long taskId,
            @RequestParam String studentEmail,
            @RequestParam(required = false) String responseText,
            @RequestParam(required = false) List<MultipartFile> files) {
        try {
            TaskSubmission submission = projectService.submitTask(taskId, studentEmail, responseText, files);
            return ResponseEntity.ok(submission);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Submission Error: " + e.getMessage());
        }
    }

    // 9. Review Task Submission by Faculty
    @PostMapping("/submissions/{submissionId}/review")
    public ResponseEntity<?> reviewSubmission(
            @PathVariable Long submissionId,
            @RequestParam String facultyEmail,
            @RequestParam String status, // ACCEPT or CORRECTION_REQUIRED
            @RequestParam(required = false) String score,
            @RequestParam(required = false) String comments,
            @RequestParam(required = false) String correctionDueDate) {
        try {
            LocalDate parsedDate = correctionDueDate != null && !correctionDueDate.isBlank()
                    ? LocalDate.parse(correctionDueDate)
                    : null;
            TaskReview review = projectService.reviewTask(submissionId, facultyEmail, status, score, comments,
                    parsedDate);
            return ResponseEntity.ok(review);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Review Error: " + e.getMessage());
        }
    }

    // 10. Get Full Task Details (Submissions, Attachments, Reviews)
    @GetMapping("/tasks/{taskId}/details")
    public ResponseEntity<Map<String, Object>> getTaskDetails(@PathVariable Long taskId) {
        return ResponseEntity.ok(projectService.getTaskDetails(taskId));
    }

    // 11. Download Task Attachment
    @GetMapping("/attachments/{attachmentId}/download")
    public ResponseEntity<Resource> downloadAttachment(@PathVariable Long attachmentId) {
        TaskAttachment attachment = projectService.getAttachmentById(attachmentId);
        if (attachment == null) {
            return ResponseEntity.notFound().build();
        }

        File file = new File(attachment.getFilePath());
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(file);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getFileName() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
}
