package com.internship.userservice.dto;

import java.time.LocalDateTime;

public class SkillDto {
    private Long id;
    private String skillName;
    private String category;
    private Boolean isCustom;
    private LocalDateTime createdAt;

    public SkillDto() {}

    public SkillDto(Long id, String skillName, String category, Boolean isCustom) {
        this.id = id;
        this.skillName = skillName;
        this.category = category;
        this.isCustom = isCustom;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Boolean getIsCustom() { return isCustom; }
    public void setIsCustom(Boolean isCustom) { this.isCustom = isCustom; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
