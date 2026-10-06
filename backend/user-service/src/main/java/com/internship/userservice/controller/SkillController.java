package com.internship.userservice.controller;

import com.internship.userservice.dto.SkillDto;
import com.internship.userservice.entity.SkillMaster;
import com.internship.userservice.service.SkillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/users/skills", "/skills"})
@CrossOrigin(origins = "*")
public class SkillController {

    @Autowired
    private SkillService skillService;

    @GetMapping
    public ResponseEntity<List<SkillDto>> getAllSkills(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "100") int limit) {
        List<SkillMaster> skills = skillService.searchSkills(keyword, limit);
        List<SkillDto> dtos = skills.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/search")
    public ResponseEntity<List<SkillDto>> searchSkills(
            @RequestParam String keyword,
            @RequestParam(required = false, defaultValue = "50") int limit) {
        List<SkillMaster> skills = skillService.searchSkills(keyword, limit);
        List<SkillDto> dtos = skills.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/paged")
    public ResponseEntity<Page<SkillDto>> searchSkillsPaged(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Page<SkillMaster> skills = skillService.searchSkillsPaged(keyword, page, size);
        Page<SkillDto> dtos = skills.map(this::convertToDto);
        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    public ResponseEntity<?> addCustomSkill(@RequestBody Map<String, String> body) {
        String skillName = body.get("skillName");
        String category = body.getOrDefault("category", "Custom");

        if (skillName == null || skillName.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "skillName is required."));
        }

        try {
            SkillMaster saved = skillService.addCustomSkill(skillName, category);
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDto(saved));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    private SkillDto convertToDto(SkillMaster entity) {
        SkillDto dto = new SkillDto();
        dto.setId(entity.getId());
        dto.setSkillName(entity.getSkillName());
        dto.setCategory(entity.getCategory());
        dto.setIsCustom(entity.getIsCustom());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
