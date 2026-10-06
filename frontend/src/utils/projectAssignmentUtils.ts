export const isApplicantAssignableToProject = (applicant: any, project: any): boolean => {
  const status = String(applicant?.status || '').trim().toUpperCase();
  if (!['ACCEPTED', 'SELECTED', 'HIRED'].includes(status)) return false;
  if (applicant.projectAccepted !== true && status !== 'ACCEPTED') return false;

  const normalizeRole = (value: unknown) =>
    String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');

  const projectRole = normalizeRole(project?.internshipTitle || project?.name);
  const applicantRole = normalizeRole(applicant?.internshipTitle || applicant?.title || applicant?.role);
  if (!projectRole || projectRole === 'general internship project') return true;
  if (!applicantRole) return false;

  return applicantRole.includes(projectRole) || projectRole.includes(applicantRole);
};