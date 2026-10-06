package com.internship.userservice.service;

import com.internship.userservice.entity.SkillMaster;
import com.internship.userservice.repository.SkillMasterRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class SkillService {

    @Autowired
    private SkillMasterRepository skillRepository;

    // High-performance in-memory cache for sub-100ms response times
    private final Map<String, SkillMaster> skillCache = new ConcurrentHashMap<>();

    @PostConstruct
    public void initMasterSkills() {
        System.out.println("=== Initializing SkillMaster Database & In-Memory Cache ===");
        if (skillRepository.count() == 0) {
            seedMasterSkills();
        }
        refreshCache();
        System.out.println("=== SkillMaster initialized with " + skillCache.size() + " skills in cache! ===");
    }

    public synchronized void refreshCache() {
        List<SkillMaster> allSkills = skillRepository.findAll();
        skillCache.clear();
        for (SkillMaster skill : allSkills) {
            if (skill.getSkillName() != null && !skill.getSkillName().isBlank()) {
                skillCache.put(skill.getSkillName().trim().toLowerCase(), skill);
            }
        }
    }

    public List<SkillMaster> getAllSkills() {
        return new ArrayList<>(skillCache.values());
    }

    public List<SkillMaster> searchSkills(String keyword, int limit) {
        if (keyword == null || keyword.isBlank()) {
            return skillCache.values().stream()
                    .limit(limit)
                    .collect(Collectors.toList());
        }
        String cleanKw = keyword.trim().toLowerCase();
        return skillCache.values().stream()
                .filter(s -> s.getSkillName().toLowerCase().contains(cleanKw))
                .sorted(Comparator.comparing(SkillMaster::getSkillName))
                .limit(limit)
                .collect(Collectors.toList());
    }

    public Page<SkillMaster> searchSkillsPaged(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("skillName").ascending());
        if (keyword == null || keyword.isBlank()) {
            return skillRepository.findAll(pageable);
        }
        return skillRepository.findBySkillNameContainingIgnoreCase(keyword.trim(), pageable);
    }

    public SkillMaster addCustomSkill(String rawSkillName, String category) {
        if (rawSkillName == null || rawSkillName.isBlank()) {
            throw new IllegalArgumentException("Skill name cannot be empty.");
        }
        String trimmedName = rawSkillName.trim();
        String lowerKey = trimmedName.toLowerCase();

        // 1. Check in-memory cache
        if (skillCache.containsKey(lowerKey)) {
            return skillCache.get(lowerKey);
        }

        // 2. Check Database case-insensitively
        Optional<SkillMaster> existing = skillRepository.findBySkillNameIgnoreCaseTrimmed(trimmedName);
        if (existing.isPresent()) {
            skillCache.put(lowerKey, existing.get());
            return existing.get();
        }

        // 3. Save new custom skill
        String cat = (category != null && !category.isBlank()) ? category.trim() : "Custom";
        SkillMaster newSkill = new SkillMaster(trimmedName, cat, true);
        SkillMaster saved = skillRepository.save(newSkill);

        // Update in-memory cache immediately
        skillCache.put(lowerKey, saved);
        return saved;
    }

    private void seedMasterSkills() {
        List<SkillMaster> masterList = new ArrayList<>();
        Set<String> addedSkillsLower = new HashSet<>();

        // Ensure any existing skills in DB are also tracked
        for (SkillMaster existing : skillRepository.findAll()) {
            if (existing.getSkillName() != null) {
                addedSkillsLower.add(existing.getSkillName().trim().toLowerCase());
            }
        }

        // --- Computer Science / Software Engineering / AI ---
        String cs = "Computer Science & IT";
        String[] csSkills = {
            "Java", "Python", "C", "C++", "C#", "JavaScript", "TypeScript", "Go", "Rust", "Kotlin", "Swift", "PHP", "Ruby", "SQL", "HTML", "CSS",
            "React", "Angular", "Vue.js", "Node.js", "Express.js", "Spring Boot", "Django", "Flask", "FastAPI", "ASP.NET", "Next.js", "Nuxt.js",
            "MySQL", "PostgreSQL", "MongoDB", "Oracle", "Redis", "Firebase", "Cassandra", "SQLite", "MariaDB", "GraphQL", "REST API",
            "Docker", "Kubernetes", "AWS", "Azure", "Google Cloud Platform (GCP)", "Git", "GitHub", "GitLab", "CI/CD", "Jenkins", "Terraform",
            "Machine Learning", "Deep Learning", "Artificial Intelligence", "Natural Language Processing (NLP)", "Computer Vision", "TensorFlow", "PyTorch", "Scikit-Learn", "Pandas", "NumPy",
            "Data Structures", "Algorithms", "System Design", "Microservices", "Object-Oriented Programming (OOP)", "Cyber Security", "Ethical Hacking", "Cryptography",
            "UI/UX Design", "Figma", "Adobe XD", "Wireframing", "Prototyping", "DevOps", "Linux", "Unix", "Bash Scripting", "Software Testing", "JUnit", "Selenium"
        };
        addSkillsIfAbsent(csSkills, cs, masterList, addedSkillsLower);

        // --- Civil Engineering & Architecture ---
        String civil = "Civil Engineering & Architecture";
        String[] civilSkills = {
            "AutoCAD", "STAAD Pro", "ETABS", "Revit Architecture", "Revit Structure", "BIM (Building Information Modeling)", "Navisworks", "SketchUp", "GIS", "ArcGIS",
            "Reinforced Concrete Structures (RCC)", "Steel Structures", "Structural Analysis", "Land Surveying", "Total Station", "Geotechnical Engineering", "Soil Mechanics",
            "Quantity Surveying", "Cost Estimation", "BOQ (Bill of Quantities)", "Highway Engineering", "Pavement Design", "Transportation Engineering", "Hydraulics", "Fluid Mechanics",
            "Construction Management", "Primavera P6", "MS Project", "Foundation Design", "Town Planning", "Environmental Engineering"
        };
        addSkillsIfAbsent(civilSkills, civil, masterList, addedSkillsLower);

        // --- Mechanical Engineering & Mechatronics ---
        String mech = "Mechanical Engineering";
        String[] mechSkills = {
            "SolidWorks", "CATIA V5", "PTC Creo", "ANSYS", "Finite Element Analysis (FEA)", "Computational Fluid Dynamics (CFD)", "ANSYS Fluent", "Fusion 360", "NX CAD",
            "Thermodynamics", "Heat Transfer", "Fluid Mechanics", "HVAC Systems", "Refrigeration", "Strength of Materials", "Machine Design", "Kinematics",
            "CNC Programming", "CAM", "Mastercam", "Machining", "G-Code", "Robotics", "Mechatronics", "Automobile Engineering", "IC Engines", "Electric Vehicles (EV)",
            "Six Sigma", "Lean Manufacturing", "Kaizen", "5S", "Quality Control", "3D Printing", "Additive Manufacturing", "PLC Programming"
        };
        addSkillsIfAbsent(mechSkills, mech, masterList, addedSkillsLower);

        // --- Electrical & Electronics Engineering (EEE / ECE) ---
        String eee = "Electrical & Electronics";
        String[] eeeSkills = {
            "MATLAB", "Simulink", "VLSI Design", "Verilog", "VHDL", "Cadence Virtuoso", "Embedded Systems", "Microcontrollers", "Arduino", "Raspberry Pi",
            "Circuit Design", "PCB Design", "Proteus", "KiCad", "Digital Signal Processing (DSP)", "Power Systems", "Control Systems", "PLC & SCADA",
            "Internet of Things (IoT)", "Sensors & Actuators", "Robotics", "Power Electronics", "Renewable Energy", "Solar PV Systems"
        };
        addSkillsIfAbsent(eeeSkills, eee, masterList, addedSkillsLower);

        // --- Business Administration, MBA & Finance ---
        String biz = "Business & Finance";
        String[] bizSkills = {
            "Financial Modeling", "Corporate Finance", "Valuation", "Financial Statement Analysis", "Accounting", "Tally Prime", "Advanced Excel", "Excel Macros / VBA",
            "Digital Marketing", "SEO (Search Engine Optimization)", "SEM", "Google Analytics", "Social Media Marketing", "Content Marketing", "Brand Management",
            "Human Resources (HR)", "Recruitment", "Talent Acquisition", "Payroll Management", "Labor Laws", "Performance Management",
            "Supply Chain Management", "Logistics", "Inventory Management", "Operations Management", "Business Analytics", "Power BI", "Tableau", "Market Research", "Product Management"
        };
        addSkillsIfAbsent(bizSkills, biz, masterList, addedSkillsLower);

        // --- Healthcare, Pharmacy & Biotechnology ---
        String health = "Healthcare & Biotechnology";
        String[] healthSkills = {
            "Pharmacology", "Pharmaceutics", "Clinical Research", "Drug Design", "HPLC", "GC-MS", "Biochemistry", "Molecular Biology", "Genetics", "Gene Editing (CRISPR)",
            "Microbiology", "Bioprocess Engineering", "Bioinformatics", "Patient Care", "Nursing Practices", "Clinical Pathology", "Medical Diagnostics", "Hospital Administration"
        };
        addSkillsIfAbsent(healthSkills, health, masterList, addedSkillsLower);

        // --- Design, Law & Humanities ---
        String arts = "Design, Law & Media";
        String[] artSkills = {
            "Graphic Design", "Adobe Photoshop", "Adobe Illustrator", "Adobe InDesign", "Fashion Design", "Pattern Making", "Textile Design", "3D Animation", "Blender", "Maya",
            "Corporate Law", "Intellectual Property Rights (IPR)", "Legal Research", "Drafting & Conveyancing", "Journalism", "Content Writing", "Public Relations (PR)"
        };
        addSkillsIfAbsent(artSkills, arts, masterList, addedSkillsLower);

        if (!masterList.isEmpty()) {
            skillRepository.saveAll(masterList);
            System.out.println("Successfully seeded " + masterList.size() + " master skills into skills_master table!");
        }
    }

    private void addSkillsIfAbsent(String[] skills, String category, List<SkillMaster> masterList, Set<String> addedSkillsLower) {
        for (String s : skills) {
            if (s != null && !s.isBlank()) {
                String trimmed = s.trim();
                String key = trimmed.toLowerCase();
                if (addedSkillsLower.add(key)) {
                    masterList.add(new SkillMaster(trimmed, category, false));
                }
            }
        }
    }
}
