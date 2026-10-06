import api from './api';
import { calculateRealMatchDetails } from '../utils/matchCalculator';

const CACHE = new Map<string, any>();
const IN_FLIGHT = new Map<string, Promise<any>>();

export const normalizeMatchKey = (studentEmail?: string, internshipId?: number | string) => {
  const safeEmail = String(studentEmail || '').trim().toLowerCase();
  const safeId = String(internshipId ?? '').trim();
  return `${safeEmail}::${safeId}`;
};

const hasMeaningfulSkillInput = (value: any): boolean => {
  if (!value) return false;
  if (Array.isArray(value)) return value.some((entry) => hasMeaningfulSkillInput(entry));
  if (typeof value === 'object') return Object.values(value).some((entry) => hasMeaningfulSkillInput(entry));
  const text = String(value).trim();
  return text.length > 2 && !/^\d+$/.test(text);
};

const buildHeuristicFallback = (
  studentEmail?: string,
  internshipId?: number | string,
  internship?: any,
  studentProfile?: any,
  existingMatch?: any
) => {
  const hasSkillData = hasMeaningfulSkillInput(internship) || hasMeaningfulSkillInput(studentProfile) || hasMeaningfulSkillInput(existingMatch);

  if (existingMatch && typeof existingMatch.matchPercentage === 'number' && !(existingMatch.matchPercentage === 0 && hasSkillData)) {
    return { ...existingMatch, studentEmail, internshipId };
  }

  const fallbackInternship = internship || {};
  const fallbackProfile = studentProfile || {};
  const result = calculateRealMatchDetails(fallbackInternship, fallbackProfile, existingMatch || {});

  return {
    ...result,
    matchPercentage: typeof result.matchPercentage === 'number' ? result.matchPercentage : 0,
    recommendationReason: result.reason,
    reason: result.reason,
    studentEmail,
    internshipId,
    student: studentEmail ? { email: studentEmail } : undefined,
    internship: internshipId != null ? { id: internshipId, title: fallbackInternship.title || fallbackInternship.internshipTitle || '' } : undefined,
    matchedSkills: result.matchedTechnicalRequirements || result.matchedRequirements || [],
    matchedTechnicalRequirements: result.matchedTechnicalRequirements || result.matchedRequirements || [],
    missingTechnicalRequirements: result.missingTechnicalRequirements || result.missingRequirements || [],
  };
};

export const getAiMatchForPair = async ({
  studentEmail,
  internshipId,
  internship,
  studentProfile,
  existingMatch,
}: {
  studentEmail?: string;
  internshipId?: number | string;
  internship?: any;
  studentProfile?: any;
  existingMatch?: any;
}) => {
  const safeEmail = String(studentEmail || '').trim();
  const safeId = internshipId == null ? '' : String(internshipId).trim();

  if (!safeEmail || !safeId) {
    return buildHeuristicFallback(safeEmail, safeId, internship, studentProfile, existingMatch);
  }

  const normalizedKey = normalizeMatchKey(safeEmail, safeId);

  if (CACHE.has(normalizedKey)) {
    return CACHE.get(normalizedKey);
  }

  if (IN_FLIGHT.has(normalizedKey)) {
    return IN_FLIGHT.get(normalizedKey);
  }

  const request = (async () => {
    try {
      const response = await api.get('/recommendations/match-pair', {
        params: {
          studentEmail: safeEmail,
          internshipId: safeId,
        },
      });

      const payload = response?.data || null;
      const hasSkillData = hasMeaningfulSkillInput(internship) || hasMeaningfulSkillInput(studentProfile) || hasMeaningfulSkillInput(payload);
      if (payload && typeof payload.matchPercentage === 'number' && !(payload.matchPercentage === 0 && hasSkillData)) {
        const normalized = {
          ...payload,
          studentEmail: safeEmail,
          internshipId: safeId,
          student: payload.student || { email: safeEmail },
          internship: payload.internship || { id: safeId },
        };
        CACHE.set(normalizedKey, normalized);
        return normalized;
      }

      const fallbackPayload = buildHeuristicFallback(safeEmail, safeId, internship, studentProfile, existingMatch);
      CACHE.set(normalizedKey, fallbackPayload);
      return fallbackPayload;
    } catch (error) {
      const fallbackPayload = buildHeuristicFallback(safeEmail, safeId, internship, studentProfile, existingMatch);
      CACHE.set(normalizedKey, fallbackPayload);
      return fallbackPayload;
    } finally {
      IN_FLIGHT.delete(normalizedKey);
    }
  })();

  IN_FLIGHT.set(normalizedKey, request);
  return request;
};

export const hydrateAiMatchesForApplications = async (
  applications: any[],
  existingMap: Record<string, any> = {},
  onProgress?: (key: string, loading: boolean) => void,
  forceRefresh = false
) => {
  const nextMap = { ...existingMap };

  await Promise.all(
    applications.map(async (app) => {
      const studentEmail = app?.studentEmail || app?.email || '';
      const internshipId = app?.internshipId ?? app?.internship?.id;
      const key = normalizeMatchKey(studentEmail, internshipId);

      if (!studentEmail || internshipId == null || internshipId === '') {
        return;
      }

      const existingMatch = nextMap[key] || existingMap[key];
      if (existingMatch && typeof existingMatch.matchPercentage === 'number' && existingMatch.matchPercentage > 0 && !forceRefresh) {
        return;
      }

      onProgress?.(key, true);

      try {
        const fullStudentProfile = app?.fullStudentProfile || {};
        const fullInternshipData = app?.postedInternship || {};

        const match = await getAiMatchForPair({
          studentEmail,
          internshipId,
          internship: {
            id: internshipId,
            title: app?.internshipTitle || app?.title || fullInternshipData?.title || '',
            internshipTitle: app?.internshipTitle || app?.title || fullInternshipData?.title || '',
            description: app?.internshipDescription || app?.description || fullInternshipData?.description || '',
            internshipDescription: app?.internshipDescription || app?.description || fullInternshipData?.description || '',
            skillsRequired: app?.internshipSkillsRequired || app?.skillsRequired || app?.requirements || app?.technicalRequirements || fullInternshipData?.skillsRequired || '',
            requirements: app?.requirements || app?.internshipSkillsRequired || app?.skillsRequired || fullInternshipData?.requirements || '',
            technicalRequirements: app?.technicalRequirements || app?.internshipSkillsRequired || app?.skillsRequired || fullInternshipData?.technicalRequirements || '',
            skillsPreferred: app?.internshipSkillsPreferred || app?.skillsPreferred || app?.preferredSkills || fullInternshipData?.skillsPreferred || [],
            preferredSkills: app?.preferredSkills || app?.internshipSkillsPreferred || app?.skillsPreferred || fullInternshipData?.preferredSkills || [],
            eligibilityCriteria: app?.internshipEligibility || app?.eligibilityCriteria || app?.eligibility || app?.requiredQualification || fullInternshipData?.eligibilityCriteria || '',
            eligibility: app?.eligibility || app?.internshipEligibility || app?.eligibilityCriteria || fullInternshipData?.eligibility || '',
            requiredQualification: app?.requiredQualification || app?.internshipEligibility || app?.eligibilityCriteria || fullInternshipData?.requiredQualification || '',
            preferredQualification: app?.preferredQualification || fullInternshipData?.preferredQualification || '',
            responsibilities: app?.responsibilities || app?.jobResponsibilities || app?.duties || app?.keyResponsibilities || fullInternshipData?.responsibilities || '',
            jobResponsibilities: app?.jobResponsibilities || app?.responsibilities || fullInternshipData?.jobResponsibilities || '',
            keyResponsibilities: app?.keyResponsibilities || app?.responsibilities || fullInternshipData?.keyResponsibilities || '',
            duties: app?.duties || app?.responsibilities || fullInternshipData?.duties || '',
            keyProjects: app?.keyProjects || app?.internshipProjects || fullInternshipData?.keyProjects || fullInternshipData?.projects || '',
            projects: fullInternshipData?.projects || app?.keyProjects || '',
            mode: app?.mode || fullInternshipData?.mode || '',
            internshipType: app?.internshipType || fullInternshipData?.internshipType || '',
            duration: app?.duration || fullInternshipData?.duration || '',
            stipend: app?.stipend || fullInternshipData?.stipend || '',
            location: app?.location || fullInternshipData?.location || '',
            status: app?.internshipStatus || fullInternshipData?.status || '',
            department: fullInternshipData?.department || app?.internshipDepartment || '',
            ...fullInternshipData,
          },
          studentProfile: {
            email: studentEmail,
            firstName: app?.firstName || fullStudentProfile?.firstName || '',
            lastName: app?.lastName || fullStudentProfile?.lastName || '',
            department: app?.department || fullStudentProfile?.department || app?.course || app?.studying || '',
            studying: app?.studying || fullStudentProfile?.studying || '',
            course: app?.course || fullStudentProfile?.course || '',
            skills: app?.studentSkills || app?.technicalSkills || fullStudentProfile?.skills || '',
            technicalSkills: app?.technicalSkills || fullStudentProfile?.technicalSkills || '',
            programmingLanguages: app?.programmingLanguages || fullStudentProfile?.programmingLanguages || app?.languages || '',
            languages: app?.languages || fullStudentProfile?.languages || '',
            projects: app?.projects || fullStudentProfile?.projects || '',
            completedCourseworks: app?.completedCourseworks || fullStudentProfile?.completedCourseworks || app?.coursework || '',
            coursework: app?.coursework || fullStudentProfile?.coursework || '',
            certificates: app?.certificates || fullStudentProfile?.certificates || app?.certifications || '',
            certifications: app?.certifications || fullStudentProfile?.certifications || app?.certificates || '',
            bio: app?.bio || app?.coverLetter || fullStudentProfile?.bio || app?.about || '',
            about: app?.about || fullStudentProfile?.about || '',
            interestedDomain: app?.interestedDomain || fullStudentProfile?.interestedDomain || app?.domain || '',
            domain: app?.domain || fullStudentProfile?.domain || '',
            experience: app?.experience || fullStudentProfile?.experience || app?.experienceSummary || '',
            experienceSummary: app?.experienceSummary || fullStudentProfile?.experienceSummary || '',
            experienceYears: app?.experienceYears ?? fullStudentProfile?.experienceYears ?? app?.yearsExperience ?? app?.totalExperience ?? app?.yearsOfExperience ?? null,
            yearsExperience: app?.yearsExperience ?? fullStudentProfile?.yearsExperience ?? null,
            totalExperience: app?.totalExperience ?? fullStudentProfile?.totalExperience ?? null,
            yearsOfExperience: app?.yearsOfExperience ?? fullStudentProfile?.yearsOfExperience ?? null,
            cgpa: app?.cgpa ?? app?.studentCgpa ?? fullStudentProfile?.cgpa ?? null,
            studentCgpa: app?.studentCgpa ?? fullStudentProfile?.studentCgpa ?? app?.cgpa ?? null,
            semester: app?.semester ?? app?.studentSemester ?? fullStudentProfile?.semester ?? null,
            studentSemester: app?.studentSemester ?? fullStudentProfile?.studentSemester ?? app?.semester ?? null,
            internships: app?.internships || fullStudentProfile?.internships || app?.pastInternships || app?.internshipHistory || '',
            pastInternships: app?.pastInternships || fullStudentProfile?.pastInternships || '',
            internshipHistory: app?.internshipHistory || fullStudentProfile?.internshipHistory || '',
            workExperiences: app?.workExperiences || fullStudentProfile?.workExperiences || '',
            interests: app?.interests || fullStudentProfile?.interests || '',
            awards: app?.awards || fullStudentProfile?.awards || '',
            volunteering: app?.volunteering || fullStudentProfile?.volunteering || '',
            customSections: app?.customSections || fullStudentProfile?.customSections || '',
            ...fullStudentProfile,
            ...app,
          },
          existingMatch,
        });

        nextMap[key] = match;
      } finally {
        onProgress?.(key, false);
      }
    })
  );

  return nextMap;
};
