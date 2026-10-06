export interface MatchResult {
  matchPercentage: number;
  overallMatchPercentage: number;
  isRecommended60Plus: boolean;
  recommendation: 'Highly Recommended' | 'Recommended' | 'Moderate Match' | 'Low Match';
  requirements: string[];
  matchedTechnicalRequirements: string[];
  missingTechnicalRequirements: string[];
  reason: string;

  matchedRequirements?: string[];
  missingRequirements?: string[];
  matchedItems?: string[];
  missingItems?: string[];
  preferredSkills?: string[];
  matchedPreferredSkills?: string[];
  missingPreferredSkills?: string[];
}

const IGNORED_FILLER_WORDS = new Set([
  'motivated', 'enthusiastic', 'join', 'our', 'team', 'full', 'stack', 'developer', 'intern',
  'internship', 'opportunity', 'looking', 'experience', 'valuable', 'modern', 'real-world',
  'passionate', 'hardworking', 'self-driven', 'dynamic', 'team player', 'good attitude',
  'quick learner', 'excellent communication', 'detail-oriented', 'fast learner', 'energetic',
  'proactive', 'interpersonal', 'interpersonal skills', 'leadership', 'creative', 'responsible',
  'organized', 'flexibility', 'punctual', 'collaborative', 'dedicated', 'self motivated', 'adaptable',
  'work ethic', 'problem solver', 'communication', 'soft skills', 'great', 'best', 'company',
  'position', 'role', 'hiring', 'apply', 'candidate', 'seeking', 'level', 'entry', 'senior'
]);

const ALIAS_MAP: Record<string, string[]> = {
  // --- Computer Science / Software Engineering ---
  'rest api': ['rest', 'api', 'apis', 'endpoint', 'backend api', 'http api', 'web service', 'postman'],
  'frontend development': ['frontend', 'front-end', 'react', 'javascript', 'typescript', 'html', 'css', 'web development', 'ui', 'ux', 'angular', 'vue', 'next.js'],
  'front-end development': ['frontend', 'front-end', 'react', 'javascript', 'typescript', 'html', 'css', 'web development', 'ui', 'ux', 'angular', 'vue'],
  'backend development': ['backend', 'node.js', 'express', 'spring boot', 'java', 'api', 'rest api', 'database', 'server side', 'django'],
  'sql': ['mysql', 'postgresql', 'sqlite', 'oracle', 'dbms', 'database', 'sql server', 'mariadb'],
  'database management': ['dbms', 'sql', 'mysql', 'postgresql', 'database', 'mongodb', 'nosql', 'redis', 'firebase'],
  'object-oriented programming': ['oop', 'object oriented', 'java', 'c++', 'c#', 'classes', 'inheritance', 'polymorphism'],
  'oop': ['object-oriented programming', 'object oriented', 'java', 'c++', 'classes'],
  'version control': ['git', 'github', 'gitlab', 'bitbucket', 'vcs'],
  'cloud deployment': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'cloud', 'devops', 'ec2', 's3', 'ci/cd'],
  'full stack development': ['react', 'node.js', 'full stack', 'web development', 'frontend', 'backend', 'express', 'angular', 'vue'],
  'machine learning': ['ml', 'python', 'scikit-learn', 'tensorflow', 'pytorch', 'deep learning', 'neural networks', 'data science', 'pandas', 'numpy'],
  'cyber security': ['cybersecurity', 'network security', 'ethical hacking', 'cryptography', 'firewall', 'pen testing'],
  'ui/ux design': ['figma', 'adobe xd', 'wireframing', 'prototyping', 'user research', 'ui', 'ux'],

  // --- Civil Engineering ---
  'autocad': ['cad', '2d cad', '3d cad', 'drafting', 'autodesk', 'drawing', 'plan'],
  'staad pro': ['staad', 'staad.pro', 'structural analysis', 'frame analysis', 'bentley'],
  'etabs': ['etabs', 'building design', 'csi', 'structural calculation'],
  'revit': ['revit', 'revit architecture', 'revit structure', 'bim', 'building model'],
  'bim': ['building information modeling', 'revit', 'navisworks', '3d modeling'],
  'reinforced concrete structures': ['rcc', 'concrete', 'rebar', 'beam', 'column', 'slab', 'footing'],
  'land surveying': ['surveying', 'total station', 'theodolite', 'leveling', 'gis', 'gps', 'contouring'],
  'geotechnical engineering': ['soil mechanics', 'foundation', 'bearing capacity', 'geotech', 'soil testing', 'pile foundation'],
  'structural analysis': ['structural design', 'shear force', 'bending moment', 'truss', 'frame', 'stiffness'],
  'quantity surveying & estimation': ['estimation', 'costing', 'boq', 'bill of quantities', 'rate analysis', 'valuation'],
  'highway & transportation engineering': ['pavement design', 'traffic engineering', 'bitumen', 'asphalt', 'highway design'],
  'hydraulics & fluid mechanics': ['fluid flow', 'pipe flow', 'open channel', 'hydrology', 'water resources', 'pump'],

  // --- Mechanical Engineering ---
  'solidworks': ['solid works', '3d cad', 'part modeling', 'assembly', 'drawing', 'dassault'],
  'catia': ['catia v5', 'surface modeling', 'aerospace design', 'dassault'],
  'ptc creo': ['creo', 'pro e', 'pro/engineer', 'parametric modeling'],
  'ansys & fea': ['ansys', 'fea', 'finite element analysis', 'stress analysis', 'structural simulation', 'mesh'],
  'computational fluid dynamics (cfd)': ['cfd', 'fluent', 'openfoam', 'flow simulation', 'aerodynamics'],
  'thermodynamics & heat transfer': ['heat transfer', 'thermal', 'conduction', 'convection', 'radiation', 'enthalpy', 'entropy'],
  'hvac systems': ['hvac', 'refrigeration', 'air conditioning', 'chiller', 'duct design', 'psychrometrics'],
  'cnc & cam programming': ['cnc', 'cam', 'mastercam', 'g-code', 'm-code', 'lathe', 'milling', 'machining'],
  'robotics & mechatronics': ['robotics', 'mechatronics', 'sensors', 'actuators', 'plc', 'arduino', 'automation'],
  'automobile engineering': ['ic engine', 'internal combustion', 'ev', 'electric vehicle', 'transmission', 'chassis', 'automotive'],
  'quality control & lean manufacturing': ['six sigma', 'lean', 'kaizen', '5s', 'spc', 'tqm', 'iso 9001', 'quality assurance'],
  '3d printing & additive manufacturing': ['3d printing', 'additive manufacturing', 'sla', 'fdm', 'rapid prototyping']
};

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were',
  'will', 'with', 'this', 'but', 'they', 'have', 'had', 'what', 'when',
  'where', 'who', 'which', 'why', 'how', 'all', 'any', 'both', 'each', 'few',
  'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
  'same', 'so', 'than', 'too', 'very', 'can', 'just', 'should', 'now', 'or'
]);

function cleanConceptName(str: string): string {
  if (!str) return '';
  const tokenLower = str.toLowerCase().trim();

  // CS
  if (tokenLower === 'fullstack' || tokenLower === 'full stack') return 'Full Stack Development';
  if (tokenLower === 'dbms' || tokenLower === 'database') return 'Database Management';
  if (tokenLower === 'rest' || tokenLower === 'restful api') return 'REST API';
  if (tokenLower === 'cloud' || tokenLower === 'devops') return 'Cloud Deployment';
  if (tokenLower === 'ml' || tokenLower === 'ai') return 'Machine Learning';
  if (tokenLower === 'oop' || tokenLower === 'object oriented') return 'Object-Oriented Programming';
  if (tokenLower === 'cybersecurity' || tokenLower === 'cyber security') return 'Cyber Security';
  if (tokenLower === 'ui ux' || tokenLower === 'ui/ux') return 'UI/UX Design';

  // Civil
  if (tokenLower === 'cad' || tokenLower === 'autocad') return 'AutoCAD';
  if (tokenLower === 'staad' || tokenLower === 'staad.pro') return 'STAAD Pro';
  if (tokenLower === 'revit') return 'Revit';
  if (tokenLower === 'bim' || tokenLower === 'building information modeling') return 'BIM';
  if (tokenLower === 'rcc' || tokenLower === 'reinforced concrete') return 'Reinforced Concrete Structures';
  if (tokenLower === 'surveying' || tokenLower === 'total station') return 'Land Surveying';
  if (tokenLower === 'soil mechanics' || tokenLower === 'geotech') return 'Geotechnical Engineering';
  if (tokenLower === 'estimation' || tokenLower === 'boq' || tokenLower === 'costing') return 'Quantity Surveying & Estimation';

  // Mechanical
  if (tokenLower === 'solidworks' || tokenLower === 'solid works') return 'SolidWorks';
  if (tokenLower === 'creo' || tokenLower === 'pro e') return 'PTC Creo';
  if (tokenLower === 'ansys' || tokenLower === 'fea') return 'ANSYS & FEA';
  if (tokenLower === 'cfd' || tokenLower === 'fluent') return 'Computational Fluid Dynamics (CFD)';
  if (tokenLower === 'hvac') return 'HVAC Systems';
  if (tokenLower === 'cnc' || tokenLower === 'cam' || tokenLower === 'mastercam') return 'CNC & CAM Programming';
  if (tokenLower === 'mechatronics' || tokenLower === 'robotics') return 'Robotics & Mechatronics';
  if (tokenLower === 'ic engine' || tokenLower === 'automobile' || tokenLower === 'automotive') return 'Automobile Engineering';
  if (tokenLower === 'six sigma' || tokenLower === 'lean manufacturing') return 'Quality Control & Lean Manufacturing';
  if (tokenLower === '3d printing' || tokenLower === 'additive manufacturing') return '3D Printing & Additive Manufacturing';

  return str.trim();
}

// (Legacy functions retained to avoid breaking imports that may use them in other modules.
//  They are not used in the new skills-only calculateRealMatchDetails logic.)
function isFillerOrMarketingWord(text: string): boolean {
  if (!text) return true;
  const lower = text.toLowerCase().trim();
  if (IGNORED_FILLER_WORDS.has(lower)) return true;
  for (const buzz of Array.from(IGNORED_FILLER_WORDS)) {
    if (lower === buzz) return true;
  }
  return false;
}
void isFillerOrMarketingWord;

function computeCosineSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2) return 0;
  const words1 = text1.toLowerCase().split(/[^a-zA-Z0-9+#]+/).filter((w: string) => w.length > 1 && !STOP_WORDS.has(w));
  const words2 = text2.toLowerCase().split(/[^a-zA-Z0-9+#]+/).filter((w: string) => w.length > 1 && !STOP_WORDS.has(w));

  if (words1.length === 0 || words2.length === 0) return 0;

  const freq1: Record<string, number> = {};
  const freq2: Record<string, number> = {};

  words1.forEach((w: string) => freq1[w] = (freq1[w] || 0) + 1);
  words2.forEach((w: string) => freq2[w] = (freq2[w] || 0) + 1);

  const allWords = new Set([...Object.keys(freq1), ...Object.keys(freq2)]);
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  allWords.forEach((w: string) => {
    const f1 = freq1[w] || 0;
    const f2 = freq2[w] || 0;
    dotProduct += f1 * f2;
    norm1 += f1 * f1;
    norm2 += f2 * f2;
  });

  if (norm1 === 0 || norm2 === 0) return 0;
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}
void computeCosineSimilarity;

export function calculateRealMatchDetails(
  internship: any,
  profileData: any,
  backendMatchData?: any
): MatchResult {
  const flattenSkillValues = (value: any): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value.flatMap((entry) => flattenSkillValues(entry));
    if (typeof value === 'object') {
      return Object.values(value).flatMap((entry) => flattenSkillValues(entry));
    }
    return [String(value).trim()].filter(Boolean);
  };

  const hasMeaningfulSkillInput = (candidate: any): boolean => {
    const values = [
      candidate?.skillsRequired,
      candidate?.requirements,
      candidate?.technicalRequirements,
      candidate?.internshipSkillsRequired,
      candidate?.skillsPreferred,
      candidate?.preferredSkills,
      candidate?.internshipSkillsPreferred,
      candidate?.skills,
      candidate?.technicalSkills,
      candidate?.studentSkills,
      candidate?.programmingLanguages,
      candidate?.fullStudentProfile,
      candidate?.postedInternship,
      candidate?.student,
      candidate?.internship,
    ];

    return values.some((value) => {
      if (!value) return false;
      const flattened = flattenSkillValues(value);
      return flattened.some((entry) => entry.length > 2);
    });
  };

  if (
    backendMatchData &&
    typeof backendMatchData.matchPercentage === 'number' &&
    !(backendMatchData.matchPercentage === 0 && (hasMeaningfulSkillInput(internship) || hasMeaningfulSkillInput(profileData) || hasMeaningfulSkillInput(backendMatchData)))
  ) {
    const pct = Math.round(backendMatchData.matchPercentage);
    const dedupeLower = (arr: any[]): string[] => {
      const seen = new Set<string>();
      const out: string[] = [];
      (arr || []).forEach((s: any) => {
        const v = String(s || '').trim();
        const k = v.toLowerCase();
        if (k && !seen.has(k) && k.length >= 2) {
          seen.add(k);
          out.push(v);
        }
      });
      return out;
    };
    const rawReqs = backendMatchData.requirements || [];
    const rawPreferred = backendMatchData.preferredSkills || backendMatchData.skillsPreferred || [];
    const matched = backendMatchData.matchedSkills || backendMatchData.matchedTechnicalRequirements || backendMatchData.matchedRequirements || backendMatchData.matchedItems || [];
    const missing = backendMatchData.missingTechnicalRequirements || backendMatchData.missingRequirements || backendMatchData.missingItems || [];
    const matchedPreferred = backendMatchData.matchedPreferredSkills || [];
    const missingPreferred = backendMatchData.missingPreferredSkills || [];
    const reqsDedup = dedupeLower(rawReqs);
    const preferredDedup = dedupeLower(rawPreferred);
    const matchedDedup = dedupeLower(matched);
    const missingDedup = dedupeLower(missing).filter((m) => !matchedDedup.some((x) => x.toLowerCase() === m.toLowerCase()));
    const finalReqs = reqsDedup.length > 0
      ? reqsDedup
      : Array.from(new Set([...matchedDedup, ...missingDedup]));
    const reasonStr = backendMatchData.reason || backendMatchData.recommendationReason || `${matchedDedup.length} of ${Math.max(finalReqs.length, 1)} required/preferred skills matched.`;
    return {
      matchPercentage: pct,
      overallMatchPercentage: pct,
      isRecommended60Plus: pct >= 60,
      recommendation: backendMatchData.recommendation || (pct >= 80 ? 'Highly Recommended' : pct >= 60 ? 'Recommended' : pct >= 40 ? 'Moderate Match' : 'Low Match'),
      requirements: finalReqs,
      matchedTechnicalRequirements: matchedDedup,
      missingTechnicalRequirements: missingDedup,
      reason: reasonStr,
      matchedRequirements: matchedDedup,
      missingRequirements: missingDedup,
      matchedItems: matchedDedup,
      missingItems: missingDedup,
      preferredSkills: preferredDedup,
      matchedPreferredSkills: dedupeLower(matchedPreferred),
      missingPreferredSkills: dedupeLower(missingPreferred)
    };
  }

  if (!internship) {
    return {
      matchPercentage: 0,
      overallMatchPercentage: 0,
      isRecommended60Plus: false,
      recommendation: 'Low Match',
      requirements: [],
      matchedTechnicalRequirements: [],
      missingTechnicalRequirements: [],
      reason: 'No internship data available.'
    };
  }

  // --- SKILLS-ONLY PARSING (NO DESCRIPTION / ELIGIBILITY / RESPONSIBILITIES TEXT) ---
  const parseTokens = (raw: any): string[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw
        .map((s: any) => String(s).trim())
        .filter(Boolean)
        .flatMap((entry) => parseTokens(entry));
    }
    const str = String(raw);
    if (str.startsWith('[') || str.startsWith('{')) {
      try {
        const parsed = JSON.parse(str);
        if (Array.isArray(parsed)) {
          return parsed
            .flatMap((p: any) => typeof p === 'string' ? [p] : [p.title || p.name || p.skills || ''])
            .filter(Boolean)
            .flatMap((entry) => parseTokens(entry));
        }
      } catch {}
    }

    return str
      .split(/[,;\n/•]+/)
      .map((s: string) => s.trim())
      .map((s: string) => s
        .replace(/^(good|strong|excellent|basic|advanced|working knowledge|experience with|knowledge of|proficiency in|understanding of|familiarity with|ability to|must have|preferred|nice to have)\s+/i, '')
        .replace(/\s+(skills?|experience|knowledge|understanding|proficiency|familiarity|ability)\s*$/i, '')
        .trim())
      .filter(Boolean)
      .filter((s: string) => !/^(experience|knowledge|communication|problem solving|teamwork|leadership|soft skills|work ethic|ability)$/i.test(s))
      .filter((s: string) => s.split(/\s+/).length <= 5);
  };

  const dedupeLower = (arr: string[]): string[] => {
    const seen = new Set<string>();
    const out: string[] = [];
    arr.forEach((s: string) => {
      const v = String(s || '').trim();
      const k = v.toLowerCase();
      if (k && !seen.has(k) && k.length >= 2) {
        seen.add(k);
        out.push(v);
      }
    });
    return out;
  };

  // --- INTERNSHIP: ONLY skillsRequired + skillsPreferred (CSV fields) ---
  const reqSkillsRaw = internship.skillsRequired || internship.requirements || internship.technicalRequirements || internship.internshipSkillsRequired || '';
  const prefSkillsRaw = internship.skillsPreferred || internship.preferredSkills || internship.internshipSkillsPreferred || [];
  const requiredTokens = parseTokens(reqSkillsRaw).map((s) => cleanConceptName(s));
  const preferredTokens = parseTokens(prefSkillsRaw).map((s) => cleanConceptName(s));

  const requirementsList = dedupeLower(requiredTokens);
  const preferredSkillsList = dedupeLower(preferredTokens).filter((p) => !requirementsList.some((r) => r.toLowerCase() === p.toLowerCase()));

  // --- STUDENT: ONLY skills / technicalSkills / programmingLanguages (CSV fields) ---
  const studentSkillsRaw = profileData?.skills || profileData?.technicalSkills || profileData?.studentSkills || '';
  const studentProgrammingRaw = profileData?.programmingLanguages || '';
  const studentAllSkillsTokens = [...parseTokens(studentSkillsRaw), ...parseTokens(studentProgrammingRaw)];
  const studentSkillsNormalized = dedupeLower(studentAllSkillsTokens.map((s) => cleanConceptName(s)));
  // Store as a comma-separated list so word-boundary checks work cleanly between items
  const studentSkillsLowerText = studentSkillsNormalized.join(', ').toLowerCase();

  // --- REQUIREMENTS SET EMPTY? SHOW 0% WITH CLEAR REASON, NO CGPA FLOOR ---
  if (requirementsList.length === 0 && preferredSkillsList.length === 0) {
    return {
      matchPercentage: 0,
      overallMatchPercentage: 0,
      isRecommended60Plus: false,
      recommendation: 'Low Match',
      requirements: [],
      matchedTechnicalRequirements: [],
      missingTechnicalRequirements: [],
      reason: 'Internship has no skillsRequired or skillsPreferred declared. Match cannot be computed.'
    };
  }

  const baseSkillList = requirementsList.length > 0 ? requirementsList : preferredSkillsList;
  const allReqs = dedupeLower(baseSkillList);

  const requiredMatchSet = new Set<string>();
  const preferredMatchSet = new Set<string>();
  const missingRequired: string[] = [];
  const missingPreferred: string[] = [];

  /**
   * Word-boundary check: returns true if `needle` appears as a whole word/phrase
   * inside `haystack`. Prevents "java" matching inside "javascript", etc.
   */
  const hasWordBoundary = (haystack: string, needle: string): boolean => {
    if (!needle || !haystack) return false;
    // Escape regex special chars in needle
    const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Non-alphanumeric boundary on both sides
    const pattern = new RegExp(`(?<![a-z0-9.#+])${escaped}(?![a-z0-9.#+])`, 'i');
    return pattern.test(haystack);
  };

  // --- SIMPLE MATCHING: skill alias lookup ---
  const skillMatches = (reqLower: string): { matched: boolean } => {
    if (!reqLower) return { matched: false };

    const normalizedStudentText = studentSkillsLowerText;

    // Direct exact/phrase checks are always allowed.
    const directVariants = new Set<string>([
      reqLower,
      reqLower.replace(/-/g, ' '),
      reqLower.replace(/\s+/g, '-'),
    ]);

    for (const candidate of directVariants) {
      if (hasWordBoundary(normalizedStudentText, candidate)) return { matched: true };
    }

    // Exact alias mapping only: do not expand a requirement to every sibling alias in the same family.
    // This prevents false positives like React satisfying HTML/CSS or Java satisfying JavaScript.
    const matchingEntry = Object.entries(ALIAS_MAP).find(([canonical, aliases]) => {
      const canonicalLower = canonical.toLowerCase();
      return canonicalLower === reqLower || aliases.some((alias) => alias.toLowerCase() === reqLower);
    });

    if (!matchingEntry) {
      const words = reqLower.split(/[\s\-\.\,\/]+/).filter((w) => w.length >= 3);
      if (words.length > 1) {
        let matchedWords = 0;
        words.forEach((w) => { if (hasWordBoundary(normalizedStudentText, w)) matchedWords++; });
        if (matchedWords >= Math.ceil(words.length * 0.7)) return { matched: true };
      }
      return { matched: false };
    }

    const [canonical, aliases] = matchingEntry;
    const canonicalLower = canonical.toLowerCase();

    // If the requirement is the canonical label, allow its explicit aliases.
    if (canonicalLower === reqLower) {
      for (const candidate of [canonicalLower, ...aliases.map((alias) => alias.toLowerCase())]) {
        if (hasWordBoundary(normalizedStudentText, candidate)) return { matched: true };
      }
      return { matched: false };
    }

    // If the requirement is itself an alias, only allow the exact alias value or the canonical label.
    // Never count siblings from the same family as equivalent to this alias.
    return {
      matched: hasWordBoundary(normalizedStudentText, reqLower) || hasWordBoundary(normalizedStudentText, canonicalLower)
    };
  };

  const matchedLowerSeen = new Set<string>();
  const matchedTechnicalRequirements: string[] = [];
  const missingTechnicalRequirements: string[] = [];
  let matchedCount = 0;

  allReqs.forEach((req) => {
    const reqLc = req.toLowerCase().trim();
    if (!reqLc || reqLc.length < 2) return;

    const familyKeys = new Set<string>([reqLc]);
    const canonicalEntry = Object.entries(ALIAS_MAP).find(([key, aliases]) =>
      key.toLowerCase() === reqLc || aliases.some((alias) => alias.toLowerCase() === reqLc)
    );
    if (canonicalEntry && canonicalEntry[0].toLowerCase() === reqLc) {
      familyKeys.add(canonicalEntry[0].toLowerCase());
    }

    const matchedByFamily = [...familyKeys].some((key) => skillMatches(key).matched);
    if (matchedByFamily) {
      const familyLabel = familyKeys.values().next().value || reqLc;
      if (!matchedLowerSeen.has(familyLabel)) {
        matchedLowerSeen.add(familyLabel);
        matchedTechnicalRequirements.push(req);
        matchedCount++;
        if (requirementsList.some((r) => r.toLowerCase() === reqLc)) requiredMatchSet.add(reqLc);
        else if (preferredSkillsList.some((p) => p.toLowerCase() === reqLc)) preferredMatchSet.add(reqLc);
      }
    } else {
      const familyLabel = familyKeys.values().next().value || reqLc;
      if (!matchedLowerSeen.has(familyLabel)) {
        missingTechnicalRequirements.push(req);
        if (requirementsList.some((r) => r.toLowerCase() === reqLc)) missingRequired.push(req);
        else if (preferredSkillsList.some((p) => p.toLowerCase() === reqLc)) missingPreferred.push(req);
      }
    }
  });

  // --- PERCENTAGE: pure ratio of matched/all skills, NO CGPA FLOOR ---
  const totalReqs = allReqs.length;
  const rawPercentage = totalReqs === 0 ? 0 : (matchedCount / totalReqs) * 100;
  const matchPercentage = Math.max(0, Math.min(100, Math.round(rawPercentage)));

  const isRecommended60Plus = matchPercentage >= 60;
  let recommendation: 'Highly Recommended' | 'Recommended' | 'Moderate Match' | 'Low Match';
  if (matchPercentage >= 80) recommendation = 'Highly Recommended';
  else if (matchPercentage >= 60) recommendation = 'Recommended';
  else if (matchPercentage >= 40) recommendation = 'Moderate Match';
  else recommendation = 'Low Match';

  const reason = `${matchedCount} of ${totalReqs} declared ${requirementsList.length > 0 ? 'required' : 'skill'} skills matched (student skills vs internship skill requirements only). No description/CGPA inflation applied.`;

  return {
    matchPercentage,
    overallMatchPercentage: matchPercentage,
    isRecommended60Plus,
    recommendation,
    requirements: allReqs,
    matchedTechnicalRequirements,
    missingTechnicalRequirements,
    reason,
    matchedRequirements: matchedTechnicalRequirements,
    missingRequirements: missingTechnicalRequirements,
    matchedItems: matchedTechnicalRequirements,
    missingItems: missingTechnicalRequirements,
    preferredSkills: preferredSkillsList,
    matchedPreferredSkills: [...new Set([...preferredSkillsList].filter((skill) => preferredMatchSet.has(skill.toLowerCase())))],
    missingPreferredSkills: [...new Set(missingPreferred)]
  };
}
