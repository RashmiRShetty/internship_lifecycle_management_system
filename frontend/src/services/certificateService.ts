import jsPDF from 'jspdf';
import { MIT_LOGO_BASE64 } from '../assets/mit_logo_base64';

export interface InternshipCertificate {
  id: string;
  applicationId: number | string;
  studentEmail: string;
  studentName: string;
  facultyEmail: string;
  facultyName: string;
  internshipTitle: string;
  organizationName?: string;
  issueDate: string;
  performanceGrade: string;
  certificateNumber: string;
}

const STORAGE_KEY = 'internship_certificates_v1';

export const getStoredCertificates = (): InternshipCertificate[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const issueCertificate = (certData: Omit<InternshipCertificate, 'id' | 'certificateNumber'>): InternshipCertificate => {
  const existing = getStoredCertificates();
  
  // Check if certificate already issued for this student & application
  const existingCert = existing.find(
    (c) => c.studentEmail.toLowerCase() === certData.studentEmail.toLowerCase() && String(c.applicationId) === String(certData.applicationId)
  );

  if (existingCert) {
    return existingCert;
  }

  const randId = Math.floor(100000 + Math.random() * 900000);
  const newCert: InternshipCertificate = {
    ...certData,
    id: `CERT-${new Date().getFullYear()}-${randId}`,
    certificateNumber: `MIT-CERT-${new Date().getFullYear()}-${randId}`,
  };

  const updated = [...existing, newCert];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newCert;
};

export const getCertificateForStudent = (studentEmail: string, applicationId: number | string): InternshipCertificate | undefined => {
  const certs = getStoredCertificates();
  return certs.find(
    (c) => c.studentEmail.toLowerCase() === studentEmail.toLowerCase() && String(c.applicationId) === String(applicationId)
  );
};

export const getCertificatesByFaculty = (facultyEmail: string): InternshipCertificate[] => {
  const certs = getStoredCertificates();
  return certs.filter((c) => c.facultyEmail.toLowerCase() === facultyEmail.toLowerCase());
};

export const getCertificatesByStudent = (studentEmail: string): InternshipCertificate[] => {
  const certs = getStoredCertificates();
  return certs.filter((c) => c.studentEmail.toLowerCase() === studentEmail.toLowerCase());
};

/**
 * Helper to check if a student application has completed all weekly project tasks
 */
export const checkAreAllTasksCompleted = (app: any): boolean => {
  if (!app) return false;

  // Explicitly marked as completed or status COMPLETED
  if (app.isCompleted === true || app.projectStatus === 'COMPLETED' || app.status === 'COMPLETED') {
    return true;
  }

  // If completedWeeks >= totalWeeks (e.g. 4/4 weeks completed)
  if (app.completedWeeks && app.totalWeeks && app.completedWeeks >= app.totalWeeks) {
    return true;
  }

  // Check if weekly reports exist for all required weeks in localStorage
  if (app.id || app.studentEmail) {
    const sEmail = (app.studentEmail || app.email || '').toLowerCase();
    const appId = String(app.id);
    const key = `student_reports_${sEmail}_${appId}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const reports = JSON.parse(raw);
        if (Array.isArray(reports) && reports.length >= 4) {
          return true;
        }
      }
    } catch (e) {}
  }

  return app.allTasksCompleted === true || app.progress === 100;
};

/**
 * Check if student is allowed to download certificate PDF
 */
export const canStudentDownloadCertificate = (
  studentEmail: string,
  applicationId: number | string,
  appObj?: any
): { canDownload: boolean; cert?: InternshipCertificate; reason?: string } => {
  const cert = getCertificateForStudent(studentEmail, applicationId);

  const isSelected = appObj
    ? appObj.status === 'SELECTED' || appObj.status === 'HIRED' || appObj.status === 'ACCEPTED' || appObj.status === 'COMPLETED'
    : true;
  if (!isSelected) {
    return {
      canDownload: false,
      cert,
      reason: 'Candidate must be accepted for internship to generate certificate.',
    };
  }

  // 1. Check if internship is completed
  const tasksCompleted = appObj ? checkAreAllTasksCompleted(appObj) : true;
  const isInternshipEnded = appObj
    ? appObj.isCompleted === true || appObj.status === 'COMPLETED' || tasksCompleted
    : true;

  if (!isInternshipEnded) {
    return {
      canDownload: false,
      cert,
      reason: 'Internship must be completed before certificate can be generated.',
    };
  }

  // 2. Check if faculty accepted & allowed/issued certificate
  if (!cert && !appObj?.certificateAllowed && !appObj?.certificateIssued) {
    return {
      canDownload: false,
      reason: 'Faculty supervisor must accept & authorize certificate after internship completion.',
    };
  }

  return {
    canDownload: true,
    cert: cert || {
      id: `cert_${applicationId}`,
      applicationId: Number(applicationId),
      studentEmail,
      studentName: appObj?.studentName || studentEmail.split('@')[0],
      facultyEmail: appObj?.facultyEmail || 'faculty@manipal.edu',
      facultyName: appObj?.facultyName || 'Faculty Supervisor',
      internshipTitle: appObj?.internshipTitle || 'Internship Program',
      issueDate: new Date().toISOString().split('T')[0],
      certificateNumber: `MIT-CERT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      performanceGrade: 'Grade A+ (Outstanding)',
    },
  };
};

/**
 * Generate and download high-resolution Certificate PDF document with MIT Logo
 */
export const downloadCertificatePDF = (cert: InternshipCertificate) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Outer Border & Crimson/Gold Accents
  doc.setDrawColor(184, 42, 38); // MIT Crimson/Red
  doc.setLineWidth(2.5);
  doc.rect(8, 8, width - 16, height - 16);

  doc.setDrawColor(217, 119, 6); // Gold Inner Border
  doc.setLineWidth(0.8);
  doc.rect(11, 11, width - 22, height - 22);

  // Background Header Banner
  doc.setFillColor(254, 242, 242); // Soft Crimson light background
  doc.rect(12, 12, width - 24, 38, 'F');

  // Embed MIT Logo Image
  try {
    if (MIT_LOGO_BASE64) {
      doc.addImage(MIT_LOGO_BASE64, 'PNG', 18, 15, 62, 18);
    }
  } catch (e) {
    console.error('Failed to embed MIT logo in PDF:', e);
  }

  // Header Institution Title
  doc.setTextColor(184, 42, 38);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('MANIPAL INSTITUTE OF TECHNOLOGY', width / 2 + 15, 23, { align: 'center' });

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text('A Constituent Institution of Manipal Academy of Higher Education (MAHE)', width / 2 + 15, 30, { align: 'center' });

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL ACADEMIC INTERNSHIP COMPLETION CERTIFICATE', width / 2 + 15, 36, { align: 'center' });

  // Main Title
  doc.setTextColor(15, 23, 42);
  doc.setFont('times', 'bold');
  doc.setFontSize(26);
  doc.text('CERTIFICATE OF COMPLETION', width / 2, 63, { align: 'center' });

  // Subtitle
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('This is to proudly certify that', width / 2, 74, { align: 'center' });

  // Student Name
  doc.setTextColor(184, 42, 38);
  doc.setFont('times', 'bold');
  doc.setFontSize(24);
  doc.text(cert.studentName.toUpperCase(), width / 2, 88, { align: 'center' });

  // Decorative Underline
  doc.setDrawColor(184, 42, 38);
  doc.setLineWidth(0.6);
  doc.line(width / 2 - 55, 91, width / 2 + 55, 91);

  // Body Text
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11.5);
  const text1 = `has successfully completed the official internship program at Manipal Institute of Technology for`;
  doc.text(text1, width / 2, 102, { align: 'center' });

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(`"${cert.internshipTitle}"`, width / 2, 112, { align: 'center' });

  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const text2 = `under the supervision of ${cert.facultyName}. Demonstrating high technical competence,`;
  const text3 = `academic dedication, and overall performance rated as: ${cert.performanceGrade}.`;
  doc.text(text2, width / 2, 124, { align: 'center' });
  doc.text(text3, width / 2, 131, { align: 'center' });

  // Footer Details: Date, Verification ID, Signatures
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139);
  
  // Date
  doc.setFont('helvetica', 'bold');
  doc.text('Date of Issue:', 32, 160);
  doc.setFont('helvetica', 'normal');
  doc.text(cert.issueDate, 32, 167);

  // Certificate ID
  doc.setFont('helvetica', 'bold');
  doc.text('Verification Code:', width / 2, 160, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(cert.certificateNumber, width / 2, 167, { align: 'center' });

  // Faculty Signature Line
  doc.setFont('helvetica', 'bold');
  doc.text(cert.facultyName, width - 45, 160, { align: 'center' });
  doc.setDrawColor(148, 163, 184);
  doc.line(width - 70, 162, width - 20, 162);
  doc.setFont('helvetica', 'normal');
  doc.text('Faculty Supervisor / Mentor', width - 45, 168, { align: 'center' });
  doc.setFontSize(8);
  doc.text('Manipal Institute of Technology', width - 45, 173, { align: 'center' });

  // MIT Verification Seal
  doc.setDrawColor(184, 42, 38);
  doc.setFillColor(254, 242, 242);
  doc.circle(width / 2, 184, 11, 'FD');
  doc.setTextColor(184, 42, 38);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('MIT MANIPAL', width / 2, 182, { align: 'center' });
  doc.text('VERIFIED', width / 2, 185.5, { align: 'center' });
  doc.text('OFFICIAL', width / 2, 189, { align: 'center' });

  // Save the PDF
  const filename = `MIT_Internship_Certificate_${cert.studentName.replace(/\s+/g, '_')}_${cert.certificateNumber}.pdf`;
  doc.save(filename);
};

