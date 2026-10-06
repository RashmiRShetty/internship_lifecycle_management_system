import React, { useState } from 'react';
import { Award, CheckCircle2, Download, Printer, ShieldCheck, X } from 'lucide-react';
import jsPDF from 'jspdf';
import { MIT_LOGO_BASE64 } from '../../../assets/mit_logo_base64';
import { toTitleCase } from '../../../utils/matchHelpers';

interface OfferLetterModalProps {
  application: any;
  onClose: () => void;
}

export const generateOfferLetterPDF = (app: any) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const width = doc.internal.pageSize.getWidth(); // ~210mm
  const height = doc.internal.pageSize.getHeight(); // ~297mm

  // Outer Border & Decorative Frame
  doc.setLineWidth(0.75);
  doc.setDrawColor(6, 182, 212);
  doc.rect(8, 8, width - 16, height - 16);

  doc.setLineWidth(0.25);
  doc.setDrawColor(56, 189, 248);
  doc.rect(10, 10, width - 20, height - 20);

  // Top MIT Header with Logo
  try {
    if (MIT_LOGO_BASE64) {
      doc.addImage(MIT_LOGO_BASE64, 'PNG', 16, 15, 22, 22);
    }
  } catch (e) {
    console.error('Failed to embed MIT logo:', e);
  }

  // Institution Title
  doc.setTextColor(184, 42, 38);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text('MANIPAL INSTITUTE OF TECHNOLOGY', width / 2 + 10, 21, { align: 'center' });

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('A Constituent Institution of Manipal Academy of Higher Education (MAHE)', width / 2 + 10, 27, { align: 'center' });

  doc.setTextColor(6, 182, 212);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('ACADEMIC INTERNSHIP & CAREER DEVELOPMENT CELL · MANIPAL 576104', width / 2 + 10, 32, { align: 'center' });

  // Divider line below header
  doc.setDrawColor(6, 182, 212);
  doc.setLineWidth(0.5);
  doc.line(16, 40, width - 16, 40);

  // Document Title
  doc.setTextColor(15, 23, 42);
  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.text('OFFICIAL ACADEMIC INTERNSHIP OFFER LETTER', width / 2, 51, { align: 'center' });

  // Metadata: Ref No & Date
  const refNo = `Ref: MIT/INT-OFFER/${new Date().getFullYear()}/${String(app.id || app.internshipId || 101).padStart(4, '0')}`;
  const issueDate = `Date: ${new Date(app.appliedAt || Date.now()).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(refNo, 16, 62);
  doc.text(issueDate, width - 16, 62, { align: 'right' });

  // Candidate Box Header
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(16, 68, width - 32, 44, 3, 3, 'FD');

  const studentName = app.studentEmail ? app.studentEmail.split('@')[0].toUpperCase() : 'STUDENT CANDIDATE';
  const roleTitle = toTitleCase(app.internshipTitle || 'Internship Position');
  const supervisor = app.facultyEmail || 'Faculty Supervisor';

  doc.setTextColor(6, 182, 212);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('CANDIDATE & POSITION DETAILS', 22, 76);

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(9);

  doc.setFont('helvetica', 'bold');
  doc.text('Candidate Email:', 22, 84);
  doc.setFont('helvetica', 'normal');
  doc.text(app.studentEmail || 'N/A', 55, 84);

  doc.setFont('helvetica', 'bold');
  doc.text('Offered Role:', 22, 91);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9);
  doc.text(roleTitle, 55, 91);
  doc.setTextColor(51, 65, 85);

  doc.setFont('helvetica', 'bold');
  doc.text('Faculty Mentor:', 22, 98);
  doc.setFont('helvetica', 'normal');
  doc.text(supervisor, 55, 98);

  doc.setFont('helvetica', 'bold');
  doc.text('Stipend / Support:', 22, 105);
  doc.setFont('helvetica', 'normal');
  doc.text(app.stipend ? (app.stipend.includes('₹') ? app.stipend : `₹${app.stipend} / month`) : '₹10,000 / month (As per MIT Norms)', 55, 105);

  doc.setFont('helvetica', 'bold');
  doc.text('Duration:', 125, 84);
  doc.setFont('helvetica', 'normal');
  doc.text(app.duration || '6 Months', 150, 84);

  doc.setFont('helvetica', 'bold');
  doc.text('Work Mode:', 125, 91);
  doc.setFont('helvetica', 'normal');
  doc.text(app.mode || 'Remote / Hybrid', 150, 91);

  doc.setFont('helvetica', 'bold');
  doc.text('Status:', 125, 98);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 163, 74);
  doc.text('SELECTION CONFIRMED', 150, 98);
  doc.setTextColor(51, 65, 85);

  // Main Letter Body
  doc.setFont('times', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59);

  let y = 122;
  doc.setFont('times', 'bold');
  doc.text(`Dear ${studentName},`, 16, y);
  y += 7;

  doc.setFont('times', 'normal');
  const para1 = `We are pleased to formally offer you the academic internship position for "${roleTitle}" under the academic supervision of ${supervisor} at Manipal Institute of Technology (MAHE).`;
  const split1 = doc.splitTextToSize(para1, width - 32);
  doc.text(split1, 16, y);
  y += split1.length * 5 + 4;

  const para2 = `This selection is made following a rigorous evaluation of your academic standing, technical skill set, and alignment with department research goals. During your internship tenure, you will participate in structured project deliverables, weekly progress assessments, and collaborative module implementations.`;
  const split2 = doc.splitTextToSize(para2, width - 32);
  doc.text(split2, 16, y);
  y += split2.length * 5 + 4;

  const para3 = `You are required to adhere to the academic integrity policies, institutional code of conduct, and schedule regular weekly sync-ups with your assigned faculty mentor via the InternSmart portal.`;
  const split3 = doc.splitTextToSize(para3, width - 32);
  doc.text(split3, 16, y);
  y += split3.length * 5 + 8;

  doc.setFont('times', 'italic');
  doc.text('We wish you outstanding success in your academic and professional development.', 16, y);

  // Signatures Section
  const sigY = 225;

  // Signatory 1: Faculty Supervisor
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.4);
  doc.line(20, sigY, 75, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(supervisor.split('@')[0].toUpperCase(), 47.5, sigY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Faculty Supervisor / Mentor', 47.5, sigY + 9, { align: 'center' });
  doc.text('Dept. of Computer Science & Eng.', 47.5, sigY + 13, { align: 'center' });

  // Official Verified Stamp Badge on Right
  doc.setDrawColor(6, 182, 212);
  doc.setFillColor(236, 253, 245);
  doc.circle(width - 45, sigY + 4, 12, 'FD');
  doc.setTextColor(6, 182, 212);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('MIT MANIPAL', width - 45, sigY + 2, { align: 'center' });
  doc.text('OFFICIAL OFFER', width - 45, sigY + 5, { align: 'center' });
  doc.text('VERIFIED 2026', width - 45, sigY + 8, { align: 'center' });

  // Bottom Footer Notice
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.text('This is an official system-generated Academic Offer Letter issued via InternSmart Portal, MIT Manipal.', width / 2, height - 12, { align: 'center' });

  // Save the PDF
  const filename = `MIT_Offer_Letter_${studentName}_${app.id || '2026'}.pdf`;
  doc.save(filename);
};

export const OfferLetterModal: React.FC<OfferLetterModalProps> = ({ application, onClose }) => {
  const [downloading, setDownloading] = useState(false);

  if (!application) return null;

  const refNo = `MIT/INT-OFFER/${new Date().getFullYear()}/${String(application.id || application.internshipId || 101).padStart(4, '0')}`;
  const issueDate = new Date(application.appliedAt || Date.now()).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  const studentName = application.studentEmail ? application.studentEmail.split('@')[0].toUpperCase() : 'STUDENT CANDIDATE';
  const roleTitle = toTitleCase(application.internshipTitle || 'Internship Position');
  const supervisor = application.facultyEmail || 'Faculty Supervisor';

  const handleDownloadPDF = () => {
    setDownloading(true);
    try {
      generateOfferLetterPDF(application);
    } catch (e) {
      console.error('Error generating offer letter PDF:', e);
      alert('Failed to generate PDF. You can use the Print option.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b1329]/95 text-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-cyan-500/30 flex flex-col max-h-[90vh] backdrop-blur-2xl">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-cyan-950 text-white p-5 px-6 flex items-center justify-between shrink-0 shadow-md border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 backdrop-blur-md border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white leading-tight">Official Academic Internship Offer Letter</h2>
              <p className="text-[11px] text-cyan-300 font-medium mt-0.5">Manipal Institute of Technology — MAHE Manipal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Letter Document Preview */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 font-sans bg-slate-950 flex-1">
          {/* Printable Letterhead Document */}
          <div id="printable-offer-letter" className="bg-slate-900 rounded-2xl border border-cyan-500/30 p-6 sm:p-10 shadow-2xl relative overflow-hidden font-sans space-y-6 text-white">
            {/* Top Decorative Corner Highlight */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-500" />

            {/* Institution Letterhead Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-700 pb-6">
              <div className="flex items-center gap-3">
                <img src="/mit_logo.png" alt="MIT Logo" className="h-14 object-contain shrink-0" />
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-rose-500 tracking-tight leading-tight">MANIPAL INSTITUTE OF TECHNOLOGY</h1>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-300">Constituent Institution of Manipal Academy of Higher Education (MAHE)</p>
                  <p className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider mt-0.5">Academic Internship &amp; Career Development Cell</p>
                </div>
              </div>
              <div className="text-right sm:text-right text-[11px] font-bold text-slate-300 shrink-0 space-y-0.5">
                <div className="text-cyan-400 font-black">{refNo}</div>
                <div>{issueDate}</div>
              </div>
            </div>

            {/* Title Badge */}
            <div className="text-center py-2">
              <span className="inline-block px-5 py-2 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs sm:text-sm font-black uppercase tracking-widest shadow-xs">
                OFFICIAL INTERNSHIP OFFER LETTER
              </span>
            </div>

            {/* Candidate & Offer Grid Box */}
            <div className="bg-slate-950/90 rounded-2xl border border-slate-700 p-5 space-y-3 shadow-xs">
              <div className="text-xs font-black text-white uppercase tracking-wider border-b border-slate-700 pb-2 flex items-center justify-between">
                <span>CANDIDATE &amp; POSITION SUMMARY</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                  <CheckCircle2 size={11} /> SELECTION CONFIRMED
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-300 font-bold block text-[10px] uppercase tracking-wide">Candidate Email</span>
                  <span className="font-extrabold text-white">{application.studentEmail || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-300 font-bold block text-[10px] uppercase tracking-wide">Offered Position</span>
                  <span className="font-black text-amber-400 text-sm">{roleTitle}</span>
                </div>
                <div>
                  <span className="text-slate-300 font-bold block text-[10px] uppercase tracking-wide">Faculty Supervisor</span>
                  <span className="font-bold text-white">{supervisor}</span>
                </div>
                <div>
                  <span className="text-slate-300 font-bold block text-[10px] uppercase tracking-wide">Stipend / Financial Support</span>
                  <span className="font-extrabold text-cyan-400">
                    {application.stipend ? (application.stipend.includes('₹') ? application.stipend : `₹${application.stipend} / month`) : '₹10,000 / month (As per MIT Norms)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-300 font-bold block text-[10px] uppercase tracking-wide">Duration</span>
                  <span className="font-bold text-white">{application.duration || '6 Months'}</span>
                </div>
                <div>
                  <span className="text-slate-300 font-bold block text-[10px] uppercase tracking-wide">Work Mode &amp; Location</span>
                  <span className="font-bold text-white">{application.mode || 'Remote / Hybrid'} ({application.location || 'Manipal Campus'})</span>
                </div>
              </div>
            </div>

            {/* Letter Content Body */}
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-serif pt-2">
              <p className="font-bold font-sans text-sm text-white">Dear {studentName},</p>
              <p>
                We are pleased to formally offer you the academic internship position for <strong className="text-white">{roleTitle}</strong> under the academic supervision of <strong className="text-white">{supervisor}</strong> at Manipal Institute of Technology (MAHE).
              </p>
              <p>
                This selection is made following a thorough evaluation of your academic standing, technical skill set, and project alignment. During your internship tenure, you will participate in structured project deliverables, weekly progress evaluations, and collaborative technical implementations.
              </p>
              <p>
                You are required to maintain high standards of academic integrity, adhere to the institutional code of conduct, and schedule regular weekly progress reviews with your faculty mentor via the InternSmart portal.
              </p>
              <p className="italic font-sans text-slate-300 font-medium">
                We congratulate you on your selection and wish you outstanding success in your academic and professional development.
              </p>
            </div>

            {/* Signatures & Verification Seal */}
            <div className="pt-8 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left space-y-1">
                <div className="w-36 h-0.5 bg-slate-700 mb-2 mx-auto sm:mx-0" />
                <div className="text-xs font-black text-white">{supervisor.split('@')[0].toUpperCase()}</div>
                <div className="text-[11px] text-slate-300 font-medium">Faculty Supervisor / Mentor</div>
                <div className="text-[10px] text-slate-300">Dept. of Computer Science &amp; Eng.</div>
              </div>

              {/* Official Seal Badge */}
              <div className="w-20 h-20 rounded-full border-2 border-cyan-400 bg-cyan-500/10 flex flex-col items-center justify-center text-center text-cyan-300 font-black text-[9px] uppercase tracking-wider shadow-xs shrink-0 my-2 sm:my-0">
                <ShieldCheck size={18} className="text-cyan-400 mb-0.5" />
                <span>MIT MANIPAL</span>
                <span className="text-[7px] text-amber-400 font-bold">VERIFIED 2026</span>
              </div>
            </div>

            {/* Footer Note */}
            <div className="text-center pt-4 border-t border-slate-700 text-[10px] text-slate-300 font-medium">
              This is an official system-generated Academic Offer Letter issued via InternSmart Portal, MIT Manipal.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-slate-700 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
            <ShieldCheck size={16} className="text-cyan-400" />
            <span>Official MIT Academic Offer</span>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-700/80 text-slate-300 hover:bg-white/10 transition cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer size={14} /> Print Letter
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="px-5 py-2 rounded-full text-xs font-extrabold bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 hover:brightness-110 text-white transition shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-70"
            >
              <Download size={14} /> {downloading ? 'Generating PDF…' : 'Download PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferLetterModal;
