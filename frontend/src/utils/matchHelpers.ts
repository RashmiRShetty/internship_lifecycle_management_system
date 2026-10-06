import { calculateRealMatchDetails } from './matchCalculator';

export const findMatchInList = (list: any, internshipId: any, internshipTitle?: string) => {
  if (!list) return undefined;
  if (!Array.isArray(list)) {
    if (typeof list === 'object' && ('matchPercentage' in list || 'matchedTechnicalRequirements' in list)) {
      return list;
    }
    return undefined;
  }
  const idStr = String(internshipId || '');
  const titleLower = (internshipTitle || '').trim().toLowerCase();

  return list.find((m: any) => {
    const itemIntId = String(m.internship?.id || m.internshipId || m.id || '');
    if (idStr && itemIntId && itemIntId === idStr) return true;

    const itemTitle = (m.internship?.title || m.internshipTitle || m.title || '').trim().toLowerCase();
    if (titleLower && itemTitle && titleLower === itemTitle) return true;

    return false;
  });
};

export const getMatchDetails = (internship: any, studentProfile: any, backendMatchDataOrList?: any) => {
  const backendMatch = findMatchInList(backendMatchDataOrList, internship?.id, internship?.title);
  return calculateRealMatchDetails(internship, studentProfile, backendMatch);
};

export const toTitleCase = (str: string) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ''))
    .join(' ');
};

export const getMatchPercentage = (internship: any, studentProfile: any, backendMatchDataOrList?: any) => {
  const backendMatch = findMatchInList(backendMatchDataOrList, internship?.id, internship?.title);
  const details = calculateRealMatchDetails(internship, studentProfile, backendMatch);
  return details.matchPercentage;
};
