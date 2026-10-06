package com.internship.recommendationservice.dto;

import java.util.List;

public class InternshipDto {
    private Long id;
    private String title;
    private String description;
    private String skillsRequired;
    private List<String> skillsPreferred;
    private String mode;
    private String internshipType;
    private String duration;
    private String stipend;
    private String location;
    private String eligibilityCriteria;
    private String status;

    public InternshipDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSkillsRequired() { return skillsRequired; }
    public void setSkillsRequired(String skillsRequired) { this.skillsRequired = skillsRequired; }

    public List<String> getSkillsPreferred() { return skillsPreferred; }
    public void setSkillsPreferred(List<String> skillsPreferred) { this.skillsPreferred = skillsPreferred; }

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }

    public String getInternshipType() { return internshipType; }
    public void setInternshipType(String internshipType) { this.internshipType = internshipType; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public String getStipend() { return stipend; }
    public void setStipend(String stipend) { this.stipend = stipend; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getEligibilityCriteria() { return eligibilityCriteria; }
    public void setEligibilityCriteria(String eligibilityCriteria) { this.eligibilityCriteria = eligibilityCriteria; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
