package com.internship.recommendationservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class RecommendationResultDto {
    private InternshipDto internship;
    private StudentDto student;
    private double rankScore; // e.g. 0.87
    
    @JsonProperty("matchPercentage")
    private int matchPercentage; // e.g. 87
    
    private boolean isRecommended60Plus; // true if matchPercentage >= 60

    @JsonProperty("recommendation")
    private String recommendation; // Highly Recommended | Recommended | Moderate Match | Low Match

    @JsonProperty("requirements")
    private List<String> requirements;

    @JsonProperty("matchedTechnicalRequirements")
    private List<String> matchedTechnicalRequirements;

    @JsonProperty("missingTechnicalRequirements")
    private List<String> missingTechnicalRequirements;

    @JsonProperty("matchedRequirements")
    private List<String> matchedRequirements;

    @JsonProperty("missingRequirements")
    private List<String> missingRequirements;

    @JsonProperty("reason")
    private String reason;

    @JsonProperty("matchedItems")
    private List<String> matchedItems;

    @JsonProperty("missingItems")
    private List<String> missingItems;

    public RecommendationResultDto() {}

    public InternshipDto getInternship() { return internship; }
    public void setInternship(InternshipDto internship) { this.internship = internship; }

    public StudentDto getStudent() { return student; }
    public void setStudent(StudentDto student) { this.student = student; }

    public double getRankScore() { return rankScore; }
    public void setRankScore(double rankScore) { this.rankScore = rankScore; }

    public int getMatchPercentage() { return matchPercentage; }
    public void setMatchPercentage(int matchPercentage) { this.matchPercentage = matchPercentage; }

    public boolean isIsRecommended60Plus() { return isRecommended60Plus; }
    public void setIsRecommended60Plus(boolean recommended60Plus) { isRecommended60Plus = recommended60Plus; }

    public String getRecommendation() { return recommendation; }
    public void setRecommendation(String recommendation) { this.recommendation = recommendation; }

    public List<String> getRequirements() { return requirements; }
    public void setRequirements(List<String> requirements) { this.requirements = requirements; }

    public List<String> getMatchedTechnicalRequirements() { return matchedTechnicalRequirements; }
    public void setMatchedTechnicalRequirements(List<String> matchedTechnicalRequirements) {
        this.matchedTechnicalRequirements = matchedTechnicalRequirements;
        this.matchedRequirements = matchedTechnicalRequirements;
        this.matchedItems = matchedTechnicalRequirements;
    }

    public List<String> getMissingTechnicalRequirements() { return missingTechnicalRequirements; }
    public void setMissingTechnicalRequirements(List<String> missingTechnicalRequirements) {
        this.missingTechnicalRequirements = missingTechnicalRequirements;
        this.missingRequirements = missingTechnicalRequirements;
        this.missingItems = missingTechnicalRequirements;
    }

    public List<String> getMatchedRequirements() { return matchedRequirements; }
    public void setMatchedRequirements(List<String> matchedRequirements) { 
        this.matchedRequirements = matchedRequirements; 
        this.matchedTechnicalRequirements = matchedRequirements;
        this.matchedItems = matchedRequirements;
    }

    public List<String> getMissingRequirements() { return missingRequirements; }
    public void setMissingRequirements(List<String> missingRequirements) { 
        this.missingRequirements = missingRequirements; 
        this.missingTechnicalRequirements = missingRequirements;
        this.missingItems = missingRequirements;
    }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public List<String> getMatchedItems() { return matchedItems; }
    public void setMatchedItems(List<String> matchedItems) { this.matchedItems = matchedItems; }

    public List<String> getMissingItems() { return missingItems; }
    public void setMissingItems(List<String> missingItems) { this.missingItems = missingItems; }

    public List<String> getMatchedSkills() { return matchedRequirements; }
    public List<String> getMissingSkills() { return missingRequirements; }
    public String getRecommendationReason() { return reason; }
}
