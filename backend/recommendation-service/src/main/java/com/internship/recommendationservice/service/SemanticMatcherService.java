package com.internship.recommendationservice.service;

import com.internship.recommendationservice.dto.InternshipDto;
import com.internship.recommendationservice.dto.RecommendationResultDto;
import com.internship.recommendationservice.dto.StudentDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SemanticMatcherService {

    @Autowired(required = false)
    private WebClient.Builder webClientBuilder;

    private static final double MIN_MATCH_PERCENT = 15.0;
    private static final double MAX_MATCH_PERCENT = 98.0;

    private static final Map<String, List<String>> ALIAS_MAP = new HashMap<>();

    static {

        // Programming Languages
        ALIAS_MAP.put("java", List.of("jdk", "core java", "java 8", "java 11", "spring", "java se", "j2ee", "javafx"));
        ALIAS_MAP.put("python", List.of("flask", "django", "pandas", "numpy", "python3", "fastapi", "scikit-learn", "jupyter"));
        ALIAS_MAP.put("javascript", List.of("js", "ecmascript", "node.js", "es6", "vanilla js"));
        ALIAS_MAP.put("typescript", List.of("ts", "tsx", "angular 2+", "typed javascript"));
        ALIAS_MAP.put("c++", List.of("cpp", "cplusplus", "stl", "object oriented c++", "qt"));
        ALIAS_MAP.put("c#", List.of("csharp", "dotnet", ".net", "asp.net", "entity framework"));

        // Frontend
        ALIAS_MAP.put("react", List.of("reactjs", "react.js", "jsx", "next.js", "nextjs", "redux", "react hooks"));
        ALIAS_MAP.put("angular", List.of("angularjs", "angular 2", "angular 4", "angular cli", "typescript framework"));
        ALIAS_MAP.put("vue", List.of("vuejs", "vue.js", "vuex", "nuxt", "nuxt.js"));
        ALIAS_MAP.put("ui/ux design", List.of("figma", "adobe xd", "wireframing", "prototyping", "user research", "ui design", "ux design", "ui", "ux"));
        ALIAS_MAP.put("html/css", List.of("html", "css", "scss", "sass", "less", "tailwind", "bootstrap", "responsive design"));

        // Backend
        ALIAS_MAP.put("spring boot", List.of("spring", "spring mvc", "rest api", "spring data jpa", "spring security", "hibernate"));
        ALIAS_MAP.put("node.js", List.of("node", "express", "express.js", "nestjs", "next.js api", "socket.io"));
        ALIAS_MAP.put("rest api", List.of("rest", "api", "apis", "endpoint", "web service", "postman", "swagger", "http api", "soap", "graphql"));
        ALIAS_MAP.put("microservices", List.of("micro service", "service mesh", "api gateway"));

        // Database
        ALIAS_MAP.put("database management", List.of(
                "mysql",
                "postgresql",
                "sql",
                "oracle",
                "mongodb",
                "firebase",
                "sqlite",
                "dbms",
                "rdbms",
                "nosql",
                "redis",
                "cassandra",
                "mariadb",
                "sql server"));
        ALIAS_MAP.put("sql", List.of("mysql", "postgresql", "sqlite", "oracle", "dbms", "database", "sql server", "mariadb", "t-sql", "pl/sql"));
        ALIAS_MAP.put("mongodb", List.of("mongo", "nosql", "document db", "mongoose"));

        // Cloud & DevOps
        ALIAS_MAP.put("cloud deployment", List.of(
                "aws",
                "azure",
                "docker",
                "kubernetes",
                "gcp",
                "vercel",
                "netlify",
                "cloud",
                "devops",
                "ec2",
                "s3",
                "ci/cd",
                "jenkins",
                "terraform",
                "ansible",
                "lambda",
                "serverless"));
        ALIAS_MAP.put("devops", List.of("docker", "kubernetes", "jenkins", "ci/cd", "aws", "terraform", "ansible", "containerization"));
        ALIAS_MAP.put("docker", List.of("container", "kubernetes", "containerization", "docker compose", "dockerfile"));

        // Version Control
        ALIAS_MAP.put("version control", List.of("git", "github", "gitlab", "bitbucket", "vcs", "svn", "mercurial"));

        // AI / ML / Data Science
        ALIAS_MAP.put("machine learning", List.of(
                "ml",
                "tensorflow",
                "pytorch",
                "scikit-learn",
                "deep learning",
                "ai",
                "neural networks",
                "data science",
                "pandas",
                "numpy",
                "nlp",
                "computer vision",
                "classification",
                "regression",
                "clustering"));
        ALIAS_MAP.put("data science", List.of("ml", "data analysis", "statistics", "r", "python", "pandas", "numpy", "visualization", "tableau", "power bi"));
        ALIAS_MAP.put("deep learning", List.of("neural networks", "cnn", "rnn", "lstm", "transformer", "tensorflow", "pytorch", "gan"));

        // Full Stack / Web Dev
        ALIAS_MAP.put("full stack development", List.of(
                "frontend",
                "backend",
                "react",
                "spring boot",
                "node.js",
                "html",
                "css",
                "javascript",
                "mern",
                "mean",
                "web development",
                "web app"));
        ALIAS_MAP.put("data structures & algorithms", List.of("dsa", "data structures", "algorithms", "competitive programming", "complexity analysis", "leetcode"));
        ALIAS_MAP.put("cyber security", List.of("cybersecurity", "network security", "ethical hacking", "cryptography", "pen testing", "infosec", "owasp"));
        ALIAS_MAP.put("object-oriented programming", List.of("oop", "object oriented", "java", "c++", "c#", "classes", "inheritance", "polymorphism", "encapsulation", "abstraction"));

        // --- Civil Engineering ---
        ALIAS_MAP.put("autocad", List.of("cad", "2d cad", "3d cad", "drafting", "autodesk", "drawing", "plan", "2d drafting", "3d modeling cad"));
        ALIAS_MAP.put("staad pro", List.of("staad", "staad.pro", "structural analysis", "frame analysis", "bentley", "staadpro", "rcc design", "steel design"));
        ALIAS_MAP.put("etabs", List.of("etabs", "building design", "csi", "structural calculation", "building analysis", "seismic design"));
        ALIAS_MAP.put("revit", List.of("revit architecture", "revit structure", "bim", "building model", "autodesk revit", "revit mep"));
        ALIAS_MAP.put("bim", List.of("building information modeling", "revit", "navisworks", "3d modeling", "bim coordination", "ifc"));
        ALIAS_MAP.put("reinforced concrete structures", List.of("rcc", "concrete", "rebar", "beam", "column", "slab", "footing", "rcc design", "prestressed concrete", "formwork"));
        ALIAS_MAP.put("land surveying", List.of("surveying", "total station", "theodolite", "leveling", "gis", "gps", "contouring", "chain surveying", "compass surveying", "dgps"));
        ALIAS_MAP.put("geotechnical engineering", List.of("soil mechanics", "foundation", "bearing capacity", "geotech", "soil testing", "pile foundation", "shallow foundation", "deep foundation", "soil stabilization"));
        ALIAS_MAP.put("structural analysis", List.of("structural design", "shear force", "bending moment", "truss", "frame", "stiffness", "matrix method", "finite element", "structural mechanics"));
        ALIAS_MAP.put("quantity surveying & estimation", List.of("estimation", "costing", "boq", "bill of quantities", "rate analysis", "valuation", "tendering", "contract management", "bim quantity takeoff"));
        ALIAS_MAP.put("highway & transportation engineering", List.of("pavement design", "traffic engineering", "bitumen", "asphalt", "highway design", "transportation planning", "traffic signal", "road geometry", "irc codes"));
        ALIAS_MAP.put("hydraulics & fluid mechanics", List.of("fluid flow", "pipe flow", "open channel", "hydrology", "water resources", "pump", "turbine", "hydraulic machinery", "bernoulli", "reynolds"));
        ALIAS_MAP.put("environmental engineering", List.of("water treatment", "wastewater", "solid waste", "air pollution", "environmental impact", "effluent treatment", "sewage", "green building"));
        ALIAS_MAP.put("construction management", List.of("construction planning", "project management", "bar chart", "pert", "cpm", "scheduling", "construction technology", "safety management", "quality control civil"));

        // --- Mechanical Engineering ---
        ALIAS_MAP.put("solidworks", List.of("solid works", "3d cad", "part modeling", "assembly", "drawing", "dassault", "sheet metal solidworks", "surface modeling solidworks"));
        ALIAS_MAP.put("catia", List.of("catia v5", "surface modeling", "aerospace design", "dassault", "catia v6", "3dexperience"));
        ALIAS_MAP.put("ptc creo", List.of("creo", "pro e", "pro/engineer", "parametric modeling", "pro/engineer wildfire", "creo parametric"));
        ALIAS_MAP.put("ansys & fea", List.of("ansys", "fea", "finite element analysis", "stress analysis", "structural simulation", "mesh", "ansys workbench", "fluent", "apdl", "abacus", "nastran"));
        ALIAS_MAP.put("computational fluid dynamics (cfd)", List.of("cfd", "fluent", "openfoam", "flow simulation", "aerodynamics", "ansys cfx", "star ccm+", "heat transfer cfd"));
        ALIAS_MAP.put("thermodynamics & heat transfer", List.of("heat transfer", "thermal", "conduction", "convection", "radiation", "enthalpy", "entropy", "thermodynamics", "refrigeration cycle", "rankine cycle", "carnot"));
        ALIAS_MAP.put("hvac systems", List.of("hvac", "refrigeration", "air conditioning", "chiller", "duct design", "psychrometrics", "ventilation", "heating", "vrf", "ahu", "fcu"));
        ALIAS_MAP.put("cnc & cam programming", List.of("cnc", "cam", "mastercam", "g-code", "m-code", "lathe", "milling", "machining", "cnc machining", "solidcam", "fusion 360 cam", "tap", "die"));
        ALIAS_MAP.put("robotics & mechatronics", List.of("robotics", "mechatronics", "sensors", "actuators", "plc", "arduino", "automation", "microcontroller", "embedded", "ros", "pid controller"));
        ALIAS_MAP.put("automobile engineering", List.of("ic engine", "internal combustion", "ev", "electric vehicle", "transmission", "chassis", "automotive", "vehicle dynamics", "suspension", "braking system", "fuel injection", "hybrid vehicle"));
        ALIAS_MAP.put("quality control & lean manufacturing", List.of("six sigma", "lean", "kaizen", "5s", "spc", "tqm", "iso 9001", "quality assurance", "fmea", "control charts", "poka-yoke", "value stream mapping"));
        ALIAS_MAP.put("3d printing & additive manufacturing", List.of("3d printing", "additive manufacturing", "sla", "fdm", "rapid prototyping", "sls", "dlp", "3d printer", "cad to cam"));
        ALIAS_MAP.put("machine design", List.of("design of machine elements", "dme", "shaft", "bearing", "gear", "spring", "coupling", "brake", "clutch", "fatigue", "som", "strength of materials"));
        ALIAS_MAP.put("strength of materials", List.of("som", "mechanics of materials", "stress", "strain", "bending", "torsion", "buckling", "youngs modulus", "poisson ratio"));
        ALIAS_MAP.put("manufacturing technology", List.of("production", "casting", "forming", "welding", "machining", "milling", "turning", "drilling", "shaping", "grinding", "extrusion", "forging", "sheet metal"));
    }

    public RecommendationResultDto evaluateMatch(StudentDto student,
            InternshipDto internship) {

        if (student == null || internship == null) {
            RecommendationResultDto dto = new RecommendationResultDto();
            dto.setMatchPercentage(0);
            dto.setRecommendation("Low Match");
            dto.setRequirements(Collections.emptyList());
            dto.setMatchedTechnicalRequirements(Collections.emptyList());
            dto.setMissingTechnicalRequirements(Collections.emptyList());
            dto.setReason("Student or Internship is missing.");
            return dto;
        }

        try {

            Map<String, Object> payload = new HashMap<>();
            payload.put("student", student);
            payload.put("internship", internship);

            WebClient client = webClientBuilder != null
                    ? webClientBuilder.build()
                    : WebClient.create();

            System.out.println("=== Calling Python Flask AI Engine (http://localhost:5000/api/match) ===");
            System.out.println("Student Email: " + student.getEmail());
            System.out.println("Student Skills: " + student.getSkills());
            System.out.println("Student ProgLangs: " + student.getProgrammingLanguages());
            System.out.println("Student Projects: " + student.getProjects());
            System.out.println("Student Courseworks: " + student.getCompletedCourseworks());
            System.out.println("Student Certs: " + student.getCertificates());
            System.out.println("Student Domain: " + student.getInterestedDomain());
            System.out.println("Internship Title: " + internship.getTitle());
            System.out.println("Internship SkillsReq: " + internship.getSkillsRequired());

            RecommendationResultDto flaskResult = client.post()
                    .uri("http://localhost:5000/api/match")
                    .bodyValue(payload)
                    .retrieve()
                    .bodyToMono(RecommendationResultDto.class)
                    .timeout(Duration.ofSeconds(8))
                    .block();

            if (flaskResult != null) {
                flaskResult.setStudent(student);
                flaskResult.setInternship(internship);
                flaskResult.setRankScore(flaskResult.getMatchPercentage() / 100.0);
                flaskResult.setIsRecommended60Plus(flaskResult.getMatchPercentage() >= 60);

                System.out.println("=== Python Flask AI Response Received ===");
                System.out.println("Match Percentage: " + flaskResult.getMatchPercentage() + "%");
                System.out.println("Recommendation: " + flaskResult.getRecommendation());
                System.out.println("Reason: " + flaskResult.getReason());
                System.out.println("Matched Reqs: " + flaskResult.getMatchedTechnicalRequirements());
                System.out.println("Missing Reqs: " + flaskResult.getMissingTechnicalRequirements());

                return flaskResult;
            }

        } catch (Exception ex) {
            System.err.println("WARNING: Python Flask AI Matcher call failed/timed out: " + ex.getMessage());
            ex.printStackTrace();
        }

        return evaluateMatchLocally(student, internship);
    }

    public RecommendationResultDto evaluateMatchLocally(StudentDto student,
            InternshipDto internship) {

        String studentSkills = String.join(" ",
                Optional.ofNullable(student.getSkills()).orElse(""),
                Optional.ofNullable(student.getTechnicalSkills()).orElse(""),
                Optional.ofNullable(student.getProgrammingLanguages()).orElse("")).toLowerCase();

        Set<String> requirements = new LinkedHashSet<>();

        for (String tok : parseTokens(internship.getSkillsRequired())) {
            if (tok != null && !tok.isBlank()) requirements.add(cleanConceptName(tok));
        }

        List<String> prefList = internship.getSkillsPreferred();
        if (prefList != null) {
            for (String p : prefList) {
                for (String tok : parseTokens(p)) {
                    if (tok != null && !tok.isBlank()) requirements.add(cleanConceptName(tok));
                }
            }
        }

        requirements.removeIf(s -> s == null || s.isBlank());

        List<String> requirementList = new ArrayList<>(requirements);

        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        double score = 0;

        for (String req : requirementList) {
            String reqLc = req.toLowerCase().trim();
            if (reqLc.length() < 2) {
                continue;
            }
            if (checkSkillsOnlyMatch(reqLc, studentSkills)) {
                matched.add(req);
                score++;
            } else {
                missing.add(req);
            }
        }

        int percentage;
        if (requirementList.isEmpty()) {
            percentage = 0;
        } else {
            percentage = (int) Math.round((score * 100.0) / requirementList.size());
        }
        percentage = Math.max(0, Math.min(100, percentage));

        RecommendationResultDto dto = new RecommendationResultDto();

        dto.setStudent(student);
        dto.setInternship(internship);

        dto.setRequirements(requirementList);

        dto.setMatchedTechnicalRequirements(matched);
        dto.setMissingTechnicalRequirements(missing);

        dto.setMatchedRequirements(matched);
        dto.setMissingRequirements(missing);

        dto.setMatchPercentage(percentage);

        dto.setRankScore(percentage / 100.0);

        dto.setIsRecommended60Plus(percentage >= 60);

        if (percentage >= 80) {
            dto.setRecommendation("Highly Recommended");
        } else if (percentage >= 60) {
            dto.setRecommendation("Recommended");
        } else if (percentage >= 40) {
            dto.setRecommendation("Moderate Match");
        } else {
            dto.setRecommendation("Low Match");
        }

        dto.setReason(matched.size() + " of " + requirementList.size() + " required/preferred skills matched directly from declared skills.");

        return dto;
    }

    private boolean checkSkillsOnlyMatch(String requirement, String studentSkills) {
        requirement = requirement.trim();
        studentSkills = studentSkills.trim();

        if (requirement.isEmpty() || studentSkills.isEmpty()) return false;

        if (studentSkills.contains(requirement)) return true;

        if (ALIAS_MAP.containsKey(requirement)) {
            for (String alias : ALIAS_MAP.get(requirement)) {
                if (studentSkills.contains(alias.toLowerCase())) return true;
            }
        }

        for (Map.Entry<String, List<String>> entry : ALIAS_MAP.entrySet()) {
            String canonical = entry.getKey();
            if (requirement.equals(canonical)) continue;
            if (studentSkills.contains(canonical)) {
                if (requirement.contains(canonical)) return true;
                for (String alias : entry.getValue()) {
                    String aLc = alias.toLowerCase();
                    if (!requirement.equals(aLc) && requirement.contains(aLc)) return true;
                }
            }
        }

        String[] reqWords = requirement.split("[\\s\\-\\.\\,\\/]+");
        int meaningful = 0;
        int matchedWords = 0;
        for (String w : reqWords) {
            if (w.length() < 3) continue;
            meaningful++;
            if (studentSkills.contains(w)) matchedWords++;
        }
        if (meaningful > 0 && matchedWords >= Math.ceil(meaningful * 0.7)) {
            return true;
        }

        return false;
    }

    private String cleanConceptName(String skill) {

        if (skill == null)
            return "";

        skill = skill.trim();

        String lower = skill.toLowerCase();

        switch (lower) {

            case "reactjs":
            case "react.js":
            case "react hooks":
            case "next.js":
            case "nextjs":
                return "React";

            case "node":
            case "nodejs":
            case "express":
            case "express.js":
                return "Node.js";

            case "spring":
            case "spring mvc":
            case "spring data jpa":
            case "hibernate":
                return "Spring Boot";

            case "mysql":
            case "postgres":
            case "postgresql":
            case "mongodb":
            case "firebase":
            case "sqlite":
            case "oracle":
            case "nosql":
            case "redis":
            case "dbms":
            case "rdbms":
                return "Database Management";

            case "rest":
            case "restful":
            case "restful api":
            case "api":
            case "apis":
            case "endpoint":
            case "graphql":
                return "REST API";

            case "aws":
            case "azure":
            case "docker":
            case "kubernetes":
            case "gcp":
            case "devops":
            case "lambda":
            case "serverless":
            case "ci/cd":
            case "jenkins":
                return "Cloud Deployment";

            case "git":
            case "github":
            case "gitlab":
            case "bitbucket":
            case "vcs":
                return "Version Control";

            case "html":
            case "css":
            case "javascript":
            case "scss":
            case "sass":
            case "tailwind":
            case "bootstrap":
                return "Frontend Development";

            case "typescript":
            case "ts":
            case "tsx":
                return "TypeScript";

            case "tensorflow":
            case "pytorch":
            case "scikit-learn":
            case "sklearn":
            case "deep learning":
            case "ml":
            case "ai":
            case "nlp":
            case "computer vision":
            case "neural networks":
                return "Machine Learning";

            case "oop":
            case "object oriented":
            case "inheritance":
            case "polymorphism":
            case "encapsulation":
            case "abstraction":
                return "Object-Oriented Programming";

            case "dsa":
            case "data structures":
            case "algorithms":
                return "Data Structures & Algorithms";

            case "cybersecurity":
            case "network security":
            case "ethical hacking":
            case "cryptography":
            case "pen testing":
            case "infosec":
                return "Cyber Security";

            case "ui":
            case "ux":
            case "figma":
            case "adobe xd":
            case "wireframing":
            case "prototyping":
                return "UI/UX Design";

            // --- Civil Engineering ---
            case "cad":
            case "2d cad":
            case "3d cad":
            case "drafting":
            case "autodesk":
                return "AutoCAD";

            case "staad":
            case "staad.pro":
            case "bentley":
            case "staadpro":
                return "STAAD Pro";

            case "building design":
            case "csi":
            case "seismic design":
                return "ETABS";

            case "revit architecture":
            case "revit structure":
            case "autodesk revit":
            case "revit mep":
                return "Revit";

            case "building information modeling":
            case "building information modelling":
            case "navisworks":
            case "bim coordination":
                return "BIM";

            case "rcc":
            case "concrete":
            case "rebar":
            case "beam":
            case "column":
            case "slab":
            case "footing":
            case "rcc design":
            case "prestressed concrete":
                return "Reinforced Concrete Structures";

            case "surveying":
            case "total station":
            case "theodolite":
            case "leveling":
            case "gis":
            case "gps":
            case "contouring":
            case "dgps":
                return "Land Surveying";

            case "soil mechanics":
            case "foundation":
            case "bearing capacity":
            case "geotech":
            case "soil testing":
            case "pile foundation":
                return "Geotechnical Engineering";

            case "structural design":
            case "shear force":
            case "bending moment":
            case "truss":
            case "frame":
            case "stiffness":
            case "structural mechanics":
                return "Structural Analysis";

            case "estimation":
            case "costing":
            case "boq":
            case "bill of quantities":
            case "rate analysis":
            case "valuation":
            case "tendering":
                return "Quantity Surveying & Estimation";

            case "pavement design":
            case "traffic engineering":
            case "bitumen":
            case "asphalt":
            case "highway design":
            case "transportation planning":
                return "Highway & Transportation Engineering";

            case "fluid flow":
            case "pipe flow":
            case "open channel":
            case "hydrology":
            case "water resources":
            case "pump":
            case "turbine":
            case "hydraulic machinery":
                return "Hydraulics & Fluid Mechanics";

            case "water treatment":
            case "wastewater":
            case "solid waste":
            case "air pollution":
            case "environmental impact":
            case "effluent treatment":
                return "Environmental Engineering";

            case "construction planning":
            case "project management civil":
            case "bar chart":
            case "pert":
            case "cpm":
            case "scheduling":
            case "construction technology":
                return "Construction Management";

            // --- Mechanical Engineering ---
            case "solid works":
            case "part modeling":
            case "assembly modeling":
            case "dassault":
                return "SolidWorks";

            case "catia v5":
            case "catia v6":
            case "3dexperience":
                return "CATIA";

            case "creo":
            case "pro e":
            case "pro/engineer":
            case "pro/engineer wildfire":
            case "creo parametric":
                return "PTC Creo";

            case "ansys":
            case "fea":
            case "finite element analysis":
            case "stress analysis":
            case "structural simulation":
            case "ansys workbench":
            case "apdl":
            case "abacus":
            case "nastran":
                return "ANSYS & FEA";

            case "cfd":
            case "fluent":
            case "openfoam":
            case "flow simulation":
            case "aerodynamics":
            case "ansys cfx":
            case "star ccm+":
                return "Computational Fluid Dynamics (CFD)";

            case "heat transfer":
            case "thermal":
            case "conduction":
            case "convection":
            case "radiation":
            case "thermodynamics":
            case "refrigeration cycle":
            case "rankine cycle":
            case "carnot":
                return "Thermodynamics & Heat Transfer";

            case "hvac":
            case "refrigeration":
            case "air conditioning":
            case "chiller":
            case "duct design":
            case "psychrometrics":
            case "ventilation":
            case "heating":
            case "vrf":
            case "ahu":
            case "fcu":
                return "HVAC Systems";

            case "cnc":
            case "cam":
            case "mastercam":
            case "g-code":
            case "m-code":
            case "lathe":
            case "milling":
            case "machining":
            case "cnc machining":
            case "solidcam":
                return "CNC & CAM Programming";

            case "robotics":
            case "mechatronics":
            case "sensors":
            case "actuators":
            case "plc":
            case "arduino":
            case "automation":
            case "microcontroller":
            case "embedded":
            case "ros":
            case "pid controller":
                return "Robotics & Mechatronics";

            case "ic engine":
            case "internal combustion":
            case "ev":
            case "electric vehicle":
            case "transmission":
            case "chassis":
            case "automotive":
            case "vehicle dynamics":
            case "suspension":
            case "braking system":
            case "hybrid vehicle":
                return "Automobile Engineering";

            case "six sigma":
            case "lean":
            case "kaizen":
            case "5s":
            case "spc":
            case "tqm":
            case "iso 9001":
            case "quality assurance":
            case "fmea":
            case "poka-yoke":
                return "Quality Control & Lean Manufacturing";

            case "3d printing":
            case "additive manufacturing":
            case "sla":
            case "fdm":
            case "rapid prototyping":
            case "sls":
            case "dlp":
                return "3D Printing & Additive Manufacturing";

            case "design of machine elements":
            case "dme":
            case "shaft":
            case "bearing":
            case "gear":
            case "coupling":
            case "brake":
            case "clutch":
                return "Machine Design";

            case "som":
            case "mechanics of materials":
            case "stress":
            case "strain":
            case "bending":
            case "torsion":
            case "buckling":
                return "Strength of Materials";

            case "production":
            case "casting":
            case "forming":
            case "welding":
            case "turning":
            case "drilling":
            case "shaping":
            case "grinding":
            case "extrusion":
            case "forging":
            case "sheet metal":
                return "Manufacturing Technology";

            default:
                return skill;
        }
    }

    private List<String> parseTokens(String text) {

        if (text == null || text.isBlank())
            return Collections.emptyList();

        return Arrays.stream(text.split("[,;/\\n|]+"))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .distinct()
                .collect(Collectors.toList());
    }

    private List<String> extractTechnicalPhrases(String text) {

        List<String> skills = new ArrayList<>();

        if (text == null)
            return skills;

        String lower = text.toLowerCase();

        String[] keywords = {

                // Programming Languages
                "java",
                "python",
                "c",
                "c++",
                "c#",
                "typescript",
                "javascript",
                "kotlin",
                "swift",
                "go",
                "rust",
                "r",
                "scala",
                "php",

                // Frontend
                "react",
                "angular",
                "vue",
                "html",
                "css",
                "scss",
                "sass",
                "tailwind",
                "bootstrap",
                "next.js",
                "nuxt",
                "redux",
                "figma",
                "adobe xd",

                // Backend / Frameworks
                "node",
                "node.js",
                "spring",
                "spring boot",
                "hibernate",
                "rest api",
                "microservices",
                "graphql",
                "soap",
                "flask",
                "django",
                "fastapi",
                "express",
                "nestjs",
                "laravel",
                ".net",
                "asp.net",

                // Databases
                "sql",
                "mysql",
                "postgresql",
                "oracle",
                "mongodb",
                "firebase",
                "sqlite",
                "redis",
                "cassandra",
                "mariadb",
                "nosql",
                "dbms",
                "database",

                // Cloud & DevOps
                "docker",
                "kubernetes",
                "aws",
                "azure",
                "gcp",
                "vercel",
                "netlify",
                "devops",
                "ci/cd",
                "jenkins",
                "terraform",
                "ansible",
                "lambda",
                "serverless",
                "linux",
                "unix",
                "shell",
                "bash",

                // Version Control & Other CS
                "git",
                "github",
                "gitlab",
                "machine learning",
                "deep learning",
                "tensorflow",
                "pytorch",
                "pandas",
                "numpy",
                "scikit-learn",
                "nlp",
                "computer vision",
                "neural networks",
                "data science",
                "data analysis",
                "tableau",
                "power bi",
                "dsa",
                "data structures",
                "algorithms",
                "oop",
                "object oriented",
                "cyber security",
                "cybersecurity",
                "ethical hacking",
                "cryptography",
                "android",
                "flutter",
                "react native",

                // --- Civil Engineering ---
                "autocad",
                "cad",
                "staad pro",
                "staad",
                "etabs",
                "revit",
                "bim",
                "building information modeling",
                "rcc",
                "reinforced concrete",
                "structural analysis",
                "structural design",
                "land surveying",
                "surveying",
                "total station",
                "geotechnical",
                "soil mechanics",
                "foundation",
                "quantity surveying",
                "estimation",
                "boq",
                "bill of quantities",
                "highway",
                "transportation",
                "pavement",
                "hydraulics",
                "fluid mechanics",
                "water resources",
                "hydrology",
                "environmental engineering",
                "construction management",
                "gis",
                "civil engineering",

                // --- Mechanical Engineering ---
                "solidworks",
                "solid works",
                "catia",
                "ptc creo",
                "creo",
                "pro e",
                "pro/engineer",
                "ansys",
                "fea",
                "finite element analysis",
                "cfd",
                "fluent",
                "computational fluid dynamics",
                "openfoam",
                "thermodynamics",
                "heat transfer",
                "hvac",
                "refrigeration",
                "air conditioning",
                "cnc",
                "cam",
                "mastercam",
                "g-code",
                "lathe",
                "milling",
                "machining",
                "robotics",
                "mechatronics",
                "plc",
                "arduino",
                "automation",
                "sensors",
                "actuators",
                "automobile",
                "automotive",
                "ic engine",
                "internal combustion",
                "ev",
                "electric vehicle",
                "vehicle dynamics",
                "transmission",
                "chassis",
                "six sigma",
                "lean manufacturing",
                "kaizen",
                "quality control",
                "tqm",
                "iso 9001",
                "3d printing",
                "additive manufacturing",
                "rapid prototyping",
                "fdm",
                "sla",
                "machine design",
                "design of machine elements",
                "dme",
                "strength of materials",
                "som",
                "manufacturing technology",
                "casting",
                "forming",
                "welding",
                "forging",
                "extrusion",
                "sheet metal",
                "mechanical engineering",
                "stress analysis",
                "aerodynamics"
        };

        for (String keyword : keywords) {

            if (lower.contains(keyword)) {

                skills.add(cleanConceptName(keyword));
            }
        }

        return skills.stream().distinct().collect(Collectors.toList());
    }

    private void filterAndAddTechnicalRequirements(Set<String> destination,
            List<String> skills) {

        if (skills == null)
            return;

        for (String skill : skills) {

            if (skill == null)
                continue;

            skill = cleanConceptName(skill);

            if (!skill.isBlank()) {

                destination.add(skill);
            }
        }
    }

    private double calculateWeightedScore(List<String> matched,
            List<String> requirements,
            String studentProfile) {

        if (requirements.isEmpty())
            return 0;

        double score = 0;

        for (String req : requirements) {

            String skill = req.toLowerCase();

            if (studentProfile.contains(skill)) {
                score += 1.0;
                continue;
            }

            List<String> aliases = ALIAS_MAP.get(skill);

            if (aliases != null) {

                for (String alias : aliases) {

                    if (studentProfile.contains(alias.toLowerCase())) {
                        score += 0.90;
                        break;
                    }
                }
            }
        }

        return (score * 100.0) / requirements.size();
    }

    private int applyBonusScore(int percentage,
            StudentDto student,
            InternshipDto internship) {

        String profile = String.join(" ",
                Optional.ofNullable(student.getSkills()).orElse(""),
                Optional.ofNullable(student.getProgrammingLanguages()).orElse(""),
                Optional.ofNullable(student.getProjects()).orElse(""),
                Optional.ofNullable(student.getCertificates()).orElse(""),
                Optional.ofNullable(student.getCompletedCourseworks()).orElse(""),
                Optional.ofNullable(student.getInterestedDomain()).orElse(""),
                Optional.ofNullable(student.getBio()).orElse("")).toLowerCase();

        int bonus = 0;

        if (profile.contains("react")
                && internship.getDescription().toLowerCase().contains("frontend"))
            bonus += 5;

        if (profile.contains("spring")
                && internship.getDescription().toLowerCase().contains("backend"))
            bonus += 5;

        if (profile.contains("mysql")
                || profile.contains("postgresql")
                || profile.contains("mongodb"))
            bonus += 4;

        if (profile.contains("docker")
                || profile.contains("aws")
                || profile.contains("azure"))
            bonus += 4;

        if (profile.contains("git"))
            bonus += 3;

        if (profile.contains("machine learning")
                || profile.contains("tensorflow")
                || profile.contains("pytorch"))
            bonus += 5;

        percentage += bonus;

        return Math.min(98, percentage);
    }

    private String buildReason(List<String> matched,
            List<String> missing,
            int percentage) {

        StringBuilder reason = new StringBuilder();

        reason.append("Matched ")
                .append(matched.size())
                .append(" technical skills.");

        if (!matched.isEmpty()) {

            reason.append(" Skills: ");

            reason.append(String.join(", ", matched));

            reason.append(".");
        }

        if (!missing.isEmpty()) {

            reason.append(" Missing: ");

            reason.append(String.join(", ", missing));

            reason.append(".");
        }

        reason.append(" Overall semantic match: ")
                .append(percentage)
                .append("%.");

        return reason.toString();
    }
}