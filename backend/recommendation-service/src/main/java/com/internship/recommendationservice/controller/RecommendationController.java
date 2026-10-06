package com.internship.recommendationservice.controller;

import com.internship.recommendationservice.dto.InternshipDto;
import com.internship.recommendationservice.dto.RecommendationResultDto;
import com.internship.recommendationservice.dto.StudentDto;
import com.internship.recommendationservice.service.SemanticMatcherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/recommendations")
public class RecommendationController {

    @Autowired
    private SemanticMatcherService matcherService;

    @Autowired
    private RestTemplate restTemplate;

    // Service URLs (can use Gateway or Direct microservice ports with fallback)
    private static final String USER_SERVICE_URL = "http://localhost:8082/users/profile/student?email=";
    private static final String INTERNSHIP_SERVICE_URL = "http://localhost:8083/internships/open";

    @GetMapping("/student")
    public ResponseEntity<List<RecommendationResultDto>> getRecommendationsForStudent(
            @RequestParam String email,
            @RequestParam(required = false, defaultValue = "false") boolean min60Only) {
        try {
            // 1. Fetch Student Profile
            StudentDto student = restTemplate.getForObject(USER_SERVICE_URL + email, StudentDto.class);
            if (student == null) {
                return ResponseEntity.badRequest().build();
            }

            // 2. Fetch Open Internships
            InternshipDto[] internshipsArray = restTemplate.getForObject(INTERNSHIP_SERVICE_URL, InternshipDto[].class);
            List<InternshipDto> internships = internshipsArray != null ? Arrays.asList(internshipsArray) : Collections.emptyList();

            // 3. Evaluate Match for each Internship
            List<RecommendationResultDto> results = internships.stream()
                    .map(internship -> matcherService.evaluateMatch(student, internship))
                    .sorted((r1, r2) -> Double.compare(r2.getMatchPercentage(), r1.getMatchPercentage()))
                    .collect(Collectors.toList());

            // 4. Filter if 60%+ threshold requested
            if (min60Only) {
                results = results.stream()
                        .filter(RecommendationResultDto::isIsRecommended60Plus)
                        .collect(Collectors.toList());
            }

            return ResponseEntity.ok(results);
        } catch (Exception e) {
            System.err.println("Error calculating recommendations: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    @GetMapping("/match-pair")
    public ResponseEntity<RecommendationResultDto> getMatchPair(
            @RequestParam String studentEmail,
            @RequestParam Long internshipId) {
        try {
            StudentDto student = restTemplate.getForObject("http://localhost:8082/users/profile/student?email=" + studentEmail, StudentDto.class);
            InternshipDto internship = restTemplate.getForObject("http://localhost:8083/internships/" + internshipId, InternshipDto.class);
            if (student == null || internship == null) {
                return ResponseEntity.badRequest().build();
            }
            RecommendationResultDto result = matcherService.evaluateMatch(student, internship);
            result.setStudent(student);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Error evaluating match pair: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/faculty-applicants")
    public ResponseEntity<List<RecommendationResultDto>> getFacultyApplicantMatches(@RequestParam String email) {
        try {
            Map<String, Object>[] appsArray = restTemplate.getForObject("http://localhost:8084/applications/faculty?email=" + email, Map[].class);
            if (appsArray == null || appsArray.length == 0) {
                return ResponseEntity.ok(Collections.emptyList());
            }

            List<RecommendationResultDto> results = Arrays.stream(appsArray)
                    .map(app -> {
                        try {
                            String studentEmail = (String) app.get("studentEmail");
                            Number internshipIdNum = (Number) app.get("internshipId");
                            if (studentEmail == null || internshipIdNum == null) return null;

                            StudentDto student = restTemplate.getForObject("http://localhost:8082/users/profile/student?email=" + studentEmail, StudentDto.class);
                            InternshipDto internship = restTemplate.getForObject("http://localhost:8083/internships/" + internshipIdNum.longValue(), InternshipDto.class);
                            if (student == null || internship == null) return null;

                            RecommendationResultDto match = matcherService.evaluateMatch(student, internship);
                            match.setStudent(student);
                            return match;
                        } catch (Exception ex) {
                            return null;
                        }
                    })
                    .filter(res -> res != null)
                    .sorted((r1, r2) -> Double.compare(r2.getMatchPercentage(), r1.getMatchPercentage()))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(results);
        } catch (Exception e) {
            System.err.println("Error fetching faculty applicant matches: " + e.getMessage());
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    @PostMapping("/match")
    public ResponseEntity<RecommendationResultDto> calculateCustomMatch(@RequestBody Map<String, Object> payload) {
        try {
            StudentDto student = new StudentDto();
            InternshipDto internship = new InternshipDto();
            RecommendationResultDto result = matcherService.evaluateMatch(student, internship);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
