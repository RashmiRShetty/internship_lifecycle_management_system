import os
import re
import json
import io
import threading
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Global Configuration Constants
SIMILARITY_THRESHOLD = 0.75  # Raised from 0.70 to reduce false-positive semantic matches

# Global Model Singletons
sentence_model = None
kw_model = None
nlp_model = None
model_loading = False
model_loaded = False
model_lock = threading.Lock()

def load_model():
    """
    Thread-safe loader for SentenceTransformer, KeyBERT, and spaCy.
    """
    global sentence_model, kw_model, nlp_model, model_loading, model_loaded
    with model_lock:
        if model_loaded or model_loading:
            return
        model_loading = True

    try:
        print("Pre-loading ML Models: SentenceTransformer, KeyBERT, and spaCy...")
        from sentence_transformers import SentenceTransformer
        from keybert import KeyBERT
        import spacy

        sentence_model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
        kw_model = KeyBERT(model=sentence_model)

        try:
            nlp_model = spacy.load('en_core_web_sm')
        except Exception:
            import spacy.cli
            spacy.cli.download('en_core_web_sm')
            nlp_model = spacy.load('en_core_web_sm')

        model_loaded = True
        print("All Universal AI Models (SentenceTransformer + KeyBERT + spaCy) ready!")
    except Exception as e:
        print(f"Failed to load ML models: {e}")
    finally:
        model_loading = False

# Start loading models on startup
threading.Thread(target=load_model, daemon=True).start()

# Soft-skill non-technical buzzwords filter
SOFT_SKILL_BUZZWORDS = {
    "hiring", "opportunity", "join our team", "communication", "leadership",
    "motivated", "enthusiastic", "join", "our", "team", "full", "stack", "developer", "intern",
    "internship", "looking", "experience", "valuable", "modern", "real-world",
    "passionate", "hardworking", "self-driven", "dynamic", "team player", "good attitude",
    "quick learner", "excellent communication", "detail-oriented", "fast learner", "energetic",
    "proactive", "interpersonal", "interpersonal skills", "creative", "responsible",
    "organized", "flexibility", "punctual", "collaborative", "dedicated", "self motivated", "adaptable",
    "work ethic", "problem solver", "soft skills", "great", "best", "company",
    "position", "role", "apply", "candidate", "seeking", "level", "entry", "senior",
    "great opportunity", "looking for", "excellent", "work", "job", "responsibilities"
}

# Skill co-occurrence graph for smart AI skill suggestions
RELATED_SKILL_MAP = {
    "java": ["Spring Boot", "REST API", "Hibernate", "Maven", "MySQL", "Git", "JUnit", "Microservices"],
    "python": ["Django", "Flask", "FastAPI", "Pandas", "NumPy", "Scikit-Learn", "PostgreSQL", "Git"],
    "react": ["Node.js", "TypeScript", "JavaScript", "Redux", "Tailwind CSS", "REST API", "Next.js", "GraphQL"],
    "node.js": ["Express.js", "MongoDB", "React", "TypeScript", "REST API", "Docker", "PostgreSQL"],
    "autocad": ["STAAD Pro", "Revit", "ETABS", "Structural Analysis", "Land Surveying", "BIM"],
    "solidworks": ["ANSYS", "CATIA", "PTC Creo", "Fusion 360", "Finite Element Analysis (FEA)", "CNC Programming"],
    "matlab": ["Simulink", "Embedded Systems", "VLSI Design", "Control Systems", "Arduino", "Python"],
    "financial modeling": ["Valuation", "Corporate Finance", "Advanced Excel", "Financial Statement Analysis", "Accounting", "Power BI"],
    "machine learning": ["Deep Learning", "Python", "TensorFlow", "PyTorch", "Scikit-Learn", "Pandas", "Computer Vision", "NLP"]
}

def clean_token_text(text: str) -> str:
    if not text:
        return ""
    text = text.strip()
    text = re.sub(r'[\t\r\n]+', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'(?<!\b[a-zA-Z0-9])[\.\,]+|[\.\,]+(?!\b[a-zA-Z0-9])', '', text)
    return text.strip()

def parse_tokens(raw) -> list:
    if not raw:
        return []
    if isinstance(raw, list):
        return [str(item).strip() for item in raw if str(item).strip()]
    raw_str = str(raw).strip()
    if raw_str.startswith("[") or raw_str.startswith("{"):
        try:
            parsed = json.loads(raw_str)
            if isinstance(parsed, list):
                result = []
                for item in parsed:
                    if isinstance(item, str):
                        result.append(item.strip())
                    elif isinstance(item, dict):
                        val = item.get("title") or item.get("name") or item.get("skills") or ""
                        if val:
                            result.append(str(val).strip())
                return [r for r in result if r]
        except Exception:
            pass
    tokens = re.split(r'[,;\n/•]+', raw_str)
    return [t.strip() for t in tokens if t.strip()]

def extract_skills_from_text(text: str) -> list:
    """
    Extracts technical skills using KeyBERT + spaCy NLP.
    """
    if not text or not text.strip():
        return []

    extracted_set = set()

    # Parse explicit comma/bullet tokens
    for token in parse_tokens(text):
        cleaned = clean_token_text(token)
        if cleaned and cleaned.lower() not in SOFT_SKILL_BUZZWORDS and len(cleaned) > 1:
            extracted_set.add(cleaned)

    # KeyBERT extraction
    if model_loaded and kw_model is not None and len(text) > 10:
        try:
            keywords = kw_model.extract_keywords(
                text,
                keyphrase_ngram_range=(1, 3),
                stop_words='english',
                use_mmr=True,
                diversity=0.4,
                top_n=10
            )
            for kw, score in keywords:
                cleaned = clean_token_text(kw)
                words = [w for w in cleaned.split() if w.lower() not in SOFT_SKILL_BUZZWORDS]
                if words:
                    recombined = " ".join(words)
                    if len(recombined) > 2 and recombined.lower() not in SOFT_SKILL_BUZZWORDS:
                        extracted_set.add(recombined.title() if recombined.islower() else recombined)
        except Exception as e:
            print(f"KeyBERT error: {e}")

    # spaCy extraction
    if model_loaded and nlp_model is not None and len(text) > 10:
        try:
            doc = nlp_model(text)
            for chunk in doc.noun_chunks:
                chunk_text = clean_token_text(chunk.text)
                words = [w for w in chunk_text.split() if w.lower() not in SOFT_SKILL_BUZZWORDS]
                if words and 1 <= len(words) <= 3:
                    recombined = " ".join(words)
                    if len(recombined) > 2 and recombined.lower() not in SOFT_SKILL_BUZZWORDS:
                        extracted_set.add(recombined.title() if recombined.islower() else recombined)
        except Exception as e:
            print(f"spaCy error: {e}")

    return [s for s in sorted(extracted_set) if s and s.strip() and s.lower() not in SOFT_SKILL_BUZZWORDS]

def _dedupe_lower(arr: list) -> list:
    seen = set()
    result = []
    for item in arr:
        if not item:
            continue
        key = str(item).strip().lower()
        if key and key not in seen:
            seen.add(key)
            result.append(str(item).strip())
    return result


def extract_requirements(internship: dict) -> list:
    req_raw = internship.get("skillsRequired") or internship.get("requirements") or internship.get("technicalRequirements") or internship.get("internshipSkillsRequired") or ""
    pref_raw = internship.get("skillsPreferred") or internship.get("preferredSkills") or internship.get("internshipSkillsPreferred") or []
    req_tokens = parse_tokens(req_raw)
    pref_tokens = parse_tokens(pref_raw)
    all_reqs = req_tokens + pref_tokens
    return _dedupe_lower(all_reqs)


def extract_student_sections(student: dict) -> dict:
    skills_raw = student.get("skills") or student.get("technicalSkills") or student.get("studentSkills") or ""
    prog_raw = student.get("programmingLanguages") or ""
    skills_tokens = parse_tokens(skills_raw)
    prog_tokens = parse_tokens(prog_raw)
    combined = skills_tokens + prog_tokens
    combined_text = ", ".join(_dedupe_lower(combined))
    if not combined_text.strip():
        return {}
    return {"Skills & Programming Languages": combined_text}

def compute_embeddings(texts: list):
    if not model_loaded or sentence_model is None or not texts:
        return None
    return sentence_model.encode(texts, convert_to_tensor=True)

def check_false_positive_guards(req_name: str, section_text: str, sim_score: float) -> bool:
    r_lower = req_name.lower().strip()
    s_lower = section_text.lower().strip()

    if r_lower == "java" and "javascript" in s_lower and "java" not in s_lower.replace("javascript", ""):
        return False
    if r_lower == "c" and "c++" in s_lower and "c" not in s_lower.replace("c++", ""):
        return False
    if r_lower == "sql" and "nosql" in s_lower and "sql" not in s_lower.replace("nosql", ""):
        return False
    if r_lower == "react" and "react native" in s_lower and "react" not in s_lower.replace("react native", ""):
        return False
    if r_lower == "spring" and "spring boot" in s_lower and "spring" not in s_lower.replace("spring boot", ""):
        return False
    if r_lower == "ai" and "automation" in s_lower and sim_score < 0.85:
        return False

    return True

def calculate_similarity(requirements_list: list, active_sections: dict):
    # --- DEDUPE REQUIREMENTS FIRST (safety net: no more 4x "Frontend Development" duplicates)
    _seen = set()
    _deduped_reqs = []
    for r in requirements_list:
        if not r: continue
        _k = str(r).strip().lower()
        if _k and _k not in _seen:
            _seen.add(_k)
            _deduped_reqs.append(str(r).strip())
    requirements_list = _deduped_reqs

    best_matching_sections = {}
    similarity_scores = {}
    matched_reqs = []
    missing_reqs = []
    matched_count = 0.0

    section_names = list(active_sections.keys())
    section_texts = list(active_sections.values())

    if model_loaded and sentence_model is not None:
        try:
            from sentence_transformers import util

            req_embs = compute_embeddings(requirements_list)
            sec_embs = compute_embeddings(section_texts)

            sim_matrix = util.cos_sim(req_embs, sec_embs).cpu().numpy()

            for idx, req_name in enumerate(requirements_list):
                row_sims = sim_matrix[idx]
                max_sec_idx = int(np.argmax(row_sims))
                max_sim = float(row_sims[max_sec_idx])
                best_sec_name = section_names[max_sec_idx]
                best_sec_text = section_texts[max_sec_idx]

                similarity_scores[req_name] = round(max_sim, 4)
                best_matching_sections[req_name] = best_sec_name

                req_lower = req_name.lower().strip()
                is_exact_in_text = any(re.search(r'\b' + re.escape(req_lower) + r'\b', txt.lower()) for txt in section_texts)
                passes_guard = check_false_positive_guards(req_name, best_sec_text, max_sim)

                if (max_sim >= SIMILARITY_THRESHOLD or is_exact_in_text) and passes_guard:
                    matched_count += 1.0
                    matched_reqs.append(req_name)
                else:
                    missing_reqs.append(req_name)
        except Exception as e:
            print(f"Embedding matrix error: {e}")
            for req_name in requirements_list:
                missing_reqs.append(req_name)
                similarity_scores[req_name] = 0.0
                best_matching_sections[req_name] = "None"
    else:
        combined_text = " ".join(section_texts).lower()
        for req_name in requirements_list:
            req_lower = req_name.lower().strip()
            # Use word-boundary regex instead of raw substring to prevent false positives
            # e.g. "java" should NOT match inside "javascript"
            is_match = bool(re.search(r'(?<![a-z0-9])' + re.escape(req_lower) + r'(?![a-z0-9])', combined_text))
            if is_match:
                matched_count += 1.0
                matched_reqs.append(req_name)
                similarity_scores[req_name] = 1.0
                best_matching_sections[req_name] = "Keyword Fallback"
            else:
                missing_reqs.append(req_name)
                similarity_scores[req_name] = 0.0
                best_matching_sections[req_name] = "None"

    total_reqs = max(1, len(requirements_list))
    match_pct = int(round((matched_count / total_reqs) * 100.0))
    match_pct = min(100, max(0, match_pct))

    return match_pct, matched_reqs, missing_reqs, best_matching_sections, similarity_scores

def generate_recommendation(match_percentage: int) -> str:
    if match_percentage >= 80:
        return "Highly Recommended"
    elif match_percentage >= 65:
        return "Recommended"
    elif match_percentage >= 50:
        return "Moderate Match"
    else:
        return "Low Match"

def build_response(match_pct: int, reqs: list, matched: list, missing: list, recommendation: str, reason: str, best_sections: dict, sim_scores: dict) -> dict:
    return {
        "matchPercentage": match_pct,
        "requirements": reqs,
        "matchedTechnicalRequirements": matched,
        "missingTechnicalRequirements": missing,
        "recommendation": recommendation,
        "reason": reason,
        "bestMatchingSections": best_sections,
        "similarityScores": sim_scores,
        "aiEngine": "SentenceTransformer + spaCy + KeyBERT",
        "matchedRequirements": matched,
        "missingRequirements": missing,
        "isRecommended60Plus": match_pct >= 60
    }

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "UP",
        "service": "Universal Production AI Semantic Matching Engine",
        "modelLoaded": model_loaded,
        "aiEngine": "SentenceTransformer + spaCy + KeyBERT"
    })

@app.route('/api/extract-skills', methods=['POST'])
def extract_skills_endpoint():
    """
    Feature #2: AI Skill Extraction from Internship Description.
    Extracts skills automatically from job description text.
    """
    data = request.get_json() or {}
    text = data.get("text") or data.get("description") or ""
    skills = extract_skills_from_text(text)
    return jsonify({
        "extractedSkills": skills,
        "count": len(skills),
        "aiEngine": "KeyBERT + spaCy"
    })

@app.route('/api/suggest-skills', methods=['POST'])
def suggest_skills_endpoint():
    """
    Features #1 & #3: AI Skill Suggestions for Faculty & Students.
    Recommends related skills based on currently selected skills.
    """
    data = request.get_json() or {}
    selected = data.get("skills") or []
    if isinstance(selected, str):
        selected = [s.strip() for s in selected.split(',') if s.strip()]

    suggested = set()
    for skill in selected:
        s_lower = skill.lower().strip()
        if s_lower in RELATED_SKILL_MAP:
            for rec in RELATED_SKILL_MAP[s_lower]:
                if rec.lower() not in [x.lower() for x in selected]:
                    suggested.add(rec)

    # If vector model loaded, find semantic neighbors
    if model_loaded and sentence_model is not None and len(selected) > 0 and len(suggested) < 5:
        try:
            from sentence_transformers import util
            candidate_pool = [
                "Spring Boot", "REST API", "Hibernate", "Maven", "MySQL", "Git", "Docker", "Kubernetes",
                "React", "TypeScript", "Node.js", "Express.js", "PostgreSQL", "MongoDB", "AWS", "Python",
                "AutoCAD", "STAAD Pro", "Revit", "Structural Analysis", "SolidWorks", "ANSYS", "MATLAB",
                "Financial Modeling", "Valuation", "Power BI", "Tableau", "Machine Learning", "Deep Learning"
            ]
            sel_emb = compute_embeddings(selected)
            cand_emb = compute_embeddings(candidate_pool)
            sims = util.cos_sim(sel_emb, cand_emb).cpu().numpy()
            max_sims = np.max(sims, axis=0)

            for idx, score in enumerate(max_sims):
                cand = candidate_pool[idx]
                if score >= 0.55 and cand.lower() not in [x.lower() for x in selected]:
                    suggested.add(cand)
        except Exception as e:
            print(f"Semantic suggestion error: {e}")

    suggested_list = list(suggested)[:8]
    return jsonify({
        "selectedSkills": selected,
        "suggestedSkills": suggested_list,
        "count": len(suggested_list)
    })

@app.route('/api/parse-resume', methods=['POST'])
def parse_resume_endpoint():
    """
    Feature #5: AI Resume Analyzer.
    Parses PDF or text resumes and auto-fills student profile.
    """
    text = ""
    if 'file' in request.files:
        uploaded_file = request.files['file']
        if uploaded_file.filename.endswith('.pdf'):
            try:
                import pypdf
                reader = pypdf.PdfReader(uploaded_file.stream)
                for page in reader.pages:
                    text += page.extract_text() or ""
            except Exception as e:
                print(f"PDF parsing error: {e}")
        else:
            text = uploaded_file.read().decode('utf-8', errors='ignore')
    else:
        data = request.get_json() or {}
        text = data.get("text") or ""

    extracted_skills = extract_skills_from_text(text)

    # Basic section heuristic parsing
    courseworks = []
    projects = []
    bio = text[:300].strip() if text else ""

    lines = text.split('\n')
    for line in lines:
        line_clean = line.strip()
        if any(kw in line_clean.lower() for kw in ["coursework", "subjects", "courses"]):
            courseworks.append(line_clean)
        elif any(kw in line_clean.lower() for kw in ["project", "developed", "built"]):
            projects.append(line_clean)

    return jsonify({
        "skills": ", ".join(extracted_skills),
        "completedCourseworks": ", ".join(courseworks[:5]),
        "projects": "\n".join(projects[:3]),
        "bio": bio,
        "extractedSkillsList": extracted_skills
    })

@app.route('/api/match', methods=['POST'])
def match_student_with_internship():
    data = request.get_json() or {}
    student = data.get("student") or {}
    internship = data.get("internship") or {}

    requirements_list = extract_requirements(internship)
    active_sections = extract_student_sections(student)

    if not active_sections:
        return jsonify(build_response(
            match_pct=0,
            reqs=requirements_list,
            matched=[],
            missing=requirements_list,
            recommendation="Low Match",
            reason="Student profile contains no technical or domain information.",
            best_sections={},
            sim_scores={}
        ))

    match_pct, matched_reqs, missing_reqs, best_sections, sim_scores = calculate_similarity(requirements_list, active_sections)
    recommendation = generate_recommendation(match_pct)
    reason = f"The student's profile satisfies {match_pct}% of extracted requirements ({len(matched_reqs)} matched of {len(requirements_list)} total requirements)."

    return jsonify(build_response(
        match_pct=match_pct,
        reqs=requirements_list,
        matched=matched_reqs,
        missing=missing_reqs,
        recommendation=recommendation,
        reason=reason,
        best_sections=best_sections,
        sim_scores=sim_scores
    ))

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting Universal AI Service with Resume Analyzer & AI Skill Suggestions on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
