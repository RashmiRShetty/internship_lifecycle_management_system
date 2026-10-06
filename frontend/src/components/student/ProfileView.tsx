import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Upload, Lock, ShieldCheck, Mail, CheckCircle2, FileText } from 'lucide-react';
import api from '../../services/api';
import { SectionHead, PrimaryButton, SecondaryButton, Pill } from './ui';
import ProfileOverviewTabs from './profile/ProfileOverviewTabs';
import ProfileEditForm from './profile/ProfileEditForm';
import type { Certificate, ProjectItem } from './profile/profileFieldOptions';

export const ProfileView = ({ studentEmail, profileData, setProfileData }: any) => {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'certificates' | 'projects' | 'security'>('overview');

  // Password & OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpNewPassword, setOtpNewPassword] = useState('');
  const [otpConfirmPassword, setOtpConfirmPassword] = useState('');
  const [resettingWithOtp, setResettingWithOtp] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    department: '',
    semester: '',
    gender: '',
    dob: '',
    skills: [] as string[],
    interests: [] as string[],
    linkedin: '',
    github: '',
    certificates: [] as Certificate[],
    projects: [] as ProjectItem[],
    collegeName: '',
    registrationNumber: '',
    bio: '',
    cgpa: '',
    experience: '',
    resumeUrl: '',
    completedCourseworks: '',
    profilePhoto: '',
  });

  const parsedCertificates: Certificate[] = (() => {
    let certs: Certificate[] = [];
    try {
      if (profileData?.certificates) {
        certs = typeof profileData.certificates === 'string' ? JSON.parse(profileData.certificates) : profileData.certificates;
      }
    } catch {}
    return certs;
  })();

  const parsedProjects: ProjectItem[] = (() => {
    let projects: ProjectItem[] = [];
    try {
      if (profileData?.projects) {
        projects = typeof profileData.projects === 'string' ? JSON.parse(profileData.projects) : profileData.projects;
      }
    } catch {}
    return projects;
  })();

  useEffect(() => {
    if (profileData) {
      setForm({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        phone: profileData.phone || '',
        department: profileData.department || '',
        semester: profileData.semester || '',
        gender: profileData.gender || '',
        dob: profileData.dob ? new Date(profileData.dob).toISOString().split('T')[0] : '',
        skills: profileData.skills ? profileData.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        interests: profileData.interestedDomain ? profileData.interestedDomain.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        linkedin: profileData.linkedin || '',
        github: profileData.github || '',
        certificates: parsedCertificates,
        projects: parsedProjects,
        collegeName: profileData.collegeName || '',
        registrationNumber: profileData.registrationNumber || '',
        bio: profileData.bio || '',
        cgpa: profileData.cgpa || '',
        experience: profileData.experience || '',
        resumeUrl: profileData.resumeUrl || '',
        completedCourseworks: profileData.completedCourseworks || '',
        profilePhoto: profileData.profilePhoto || '',
      });
    }
  }, [profileData]);

  const calcCompletion = () => {
    const fields = [
      form.firstName,
      form.lastName,
      form.phone,
      form.department,
      form.semester,
      form.skills.length > 0,
      form.interests.length > 0,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  };
  const completionPct = calcCompletion();

  const handleSave = async () => {
    setLoading(true);
    try {
      const processedCertificates = form.certificates.map(({ ...rest }: any) => rest);
      const r = await api.put('/users/profile/student', {
        ...form,
        email: studentEmail,
        skills: form.skills.join(', '),
        interestedDomain: form.interests.join(', '),
        certificates: JSON.stringify(processedCertificates),
        projects: typeof form.projects === 'string' ? form.projects : JSON.stringify(form.projects),
      });
      setProfileData(r.data);
      setEditing(false);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      alert(`Failed to update profile: ${err.response?.data?.message || err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const addCertificate = () => {
    const newCert: Certificate = { id: Date.now().toString(), name: '', issuer: '', issueDate: '' };
    setForm((prev) => ({ ...prev, certificates: [...prev.certificates, newCert] }));
  };

  const updateCertificate = (id: string, field: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      certificates: prev.certificates.map((cert) => (cert.id === id ? { ...cert, [field]: value } : cert)),
    }));
  };

  const handleCertificateFileChange = async (id: string, file: File | null) => {
    if (!file) {
      updateCertificate(id, 'fileUrl', undefined);
      return;
    }
    try {
      const formDataFile = new FormData();
      formDataFile.append('file', file);
      const uploadResponse = await api.post('/chats/files/upload', formDataFile, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateCertificate(id, 'fileUrl', uploadResponse.data.fileUrl);
    } catch {
      alert('Failed to upload certificate file');
    }
  };

  const removeCertificate = (id: string) =>
    setForm((prev) => ({ ...prev, certificates: prev.certificates.filter((cert) => cert.id !== id) }));

  const addProject = () => {
    const newProject: ProjectItem = { id: Date.now().toString(), title: '', description: '', technologies: [], link: '' };
    setForm((prev) => ({ ...prev, projects: [...prev.projects, newProject] }));
  };

  const updateProject = (id: string, field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      projects: prev.projects.map((proj) => (proj.id === id ? { ...proj, [field]: value } : proj)),
    }));
  };

  const removeProject = (id: string) =>
    setForm((prev) => ({ ...prev, projects: prev.projects.filter((proj) => proj.id !== id) }));

  const handleSendOtpInProfile = async () => {
    if (!studentEmail) return alert('Student email not found.');
    if (!otpNewPassword || !otpConfirmPassword) {
      return alert('Please enter both New Password and Confirm New Password first.');
    }
    if (otpNewPassword.length < 6) {
      return alert('Password must be at least 6 characters.');
    }
    if (otpNewPassword !== otpConfirmPassword) {
      return alert('Passwords do not match.');
    }

    setSendingOtp(true);
    try {
      await api.post('/auth/send-otp', { email: studentEmail, purpose: 'forgot-password' });
      setOtpSent(true);
      alert(`OTP sent successfully to ${studentEmail}! Please check your email inbox.`);
    } catch (err: any) {
      console.error('Failed to send OTP:', err);
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to send OTP to email.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtpAndResetPassword = async () => {
    if (!studentEmail || !otpCode) {
      return alert('Please enter the 6-digit OTP code received in your email.');
    }
    if (otpCode.trim().length < 4) {
      return alert('Please enter a valid OTP code.');
    }
    if (otpNewPassword !== otpConfirmPassword) {
      return alert('Passwords do not match.');
    }

    setResettingWithOtp(true);
    try {
      await api.post('/auth/reset-password', {
        email: studentEmail,
        otp: otpCode.trim(),
        newPassword: otpNewPassword,
      });
      alert('🎉 Password updated successfully via OTP verification!');
      setOtpSent(false);
      setOtpCode('');
      setOtpNewPassword('');
      setOtpConfirmPassword('');
    } catch (err: any) {
      console.error('OTP reset failed:', err);
      alert(err.response?.data?.error || err.response?.data?.message || err.response?.data || 'Invalid or expired OTP');
    } finally {
      setResettingWithOtp(false);
    }
  };

  const fullName = [profileData?.firstName, profileData?.lastName].filter(Boolean).join(' ') || 'Student Profile';

  return (
    <div className="w-full space-y-6 text-slate-100 font-sans">
      <SectionHead
        title="My profile"
        sub="Manage your personal information, skills, projects, and credentials."
        action={
          <div className="flex items-center gap-2">
            <Link to="/student/cv-builder">
              <SecondaryButton>
                <FileText size={14} className="text-sky-400" /> Build CV with Templates
              </SecondaryButton>
            </Link>
            {!editing ? (
              <SecondaryButton onClick={() => setEditing(true)}>
                <User size={14} /> Edit profile
              </SecondaryButton>
            ) : (
              <div className="flex gap-2">
                <SecondaryButton onClick={() => setEditing(false)}>Cancel</SecondaryButton>
                <PrimaryButton onClick={handleSave} disabled={loading}>
                  {loading ? 'Saving…' : 'Save changes'}
                </PrimaryButton>
              </div>
            )}
          </div>
        }
      />

      {/* Profile Header Banner */}
      <div className="bg-[#0a1e4e]/85 rounded-3xl border border-sky-500/30 shadow-xl overflow-hidden backdrop-blur-md">
        <div className="h-32 bg-gradient-to-r from-blue-950 via-[#0c2356] to-cyan-950 relative overflow-hidden border-b border-cyan-500/20" />

        <div className="px-6 sm:px-8 pb-6 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-5 -mt-12">
          <div className="flex items-end gap-5">
            <div className="relative group w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 text-white flex items-center justify-center font-extrabold text-3xl shadow-lg ring-4 ring-cyan-400 ring-offset-4 ring-offset-[#061233] border-4 border-[#0a1e4e] flex-shrink-0 overflow-hidden">
              {form.profilePhoto ? (
                <img
                  src={
                    form.profilePhoto.startsWith('http') || form.profilePhoto.startsWith('data:')
                      ? form.profilePhoto
                      : `${api.defaults.baseURL}${form.profilePhoto}`
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                studentEmail?.[0]?.toUpperCase() ?? 'R'
              )}

              <label className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer text-white text-[11px] font-bold gap-1">
                <Upload size={14} /> Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const formDataFile = new FormData();
                      formDataFile.append('file', file);
                      const res = await api.post('/chats/files/upload', formDataFile, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                      });
                      const photoUrl = res.data.fileUrl;
                      setForm((prev) => ({ ...prev, profilePhoto: photoUrl }));
                    } catch {
                      alert('Failed to upload profile photo');
                    }
                  }}
                />
              </label>
            </div>
            <div className="mb-1 space-y-0.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{fullName}</h2>
              <div className="text-xs text-slate-300 font-semibold flex items-center gap-2">
                <span>{form.department ? `${form.department} Student` : 'Manipal Student'}</span>
                <span>•</span>
                <span>{studentEmail}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="flex flex-col items-end">
              <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Completion</div>
              <div className="text-sm font-extrabold text-cyan-400">{completionPct}%</div>
            </div>
            <div className="w-28 h-2.5 bg-[#06163d] border border-sky-500/30 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-500" style={{ width: `${completionPct}%` }} />
            </div>
            {completionPct === 100 ? <Pill color="blue">Complete</Pill> : <Pill color="amber">Incomplete</Pill>}
          </div>
        </div>

        {!editing && (
          <div className="flex items-center gap-2 px-6 sm:px-8 py-3.5 border-t border-sky-500/30 bg-[#06163d]/90 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'overview' ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'skills' ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              Skills &amp; Interests ({form.skills.length + form.interests.length})
            </button>
            <button
              onClick={() => setActiveTab('certificates')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'certificates' ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              Certificates ({parsedCertificates.length})
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'projects' ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              Projects ({parsedProjects.length})
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'security'
                  ? 'bg-amber-500 text-white shadow-xs font-black'
                  : 'text-amber-400 hover:bg-amber-500/10 border border-amber-500/30 bg-amber-500/10'
              }`}
            >
              <Lock size={13} /> Security &amp; Password
            </button>
          </div>
        )}
      </div>

      {/* Main Body Card */}
      <div className="bg-[#0a1e4e]/85 rounded-3xl border border-sky-500/30 shadow-xl p-6 sm:p-8 backdrop-blur-md">
        {!editing ? (
          activeTab === 'security' ? (
            /* Security & Password Card (View Tab Mode - OTP ONLY) */
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4 flex-wrap pb-4 border-b border-sky-500/30">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-amber-400" /> Change Account Password (Email OTP Required)
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 font-medium leading-relaxed">
                    For security, password updates require Email OTP verification sent to <span className="font-bold text-amber-400">{studentEmail}</span>.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-bold text-amber-400">
                  <ShieldCheck className="w-4 h-4 text-amber-400" /> Security Enforced
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-[#06163d]/90 border border-sky-500/30 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">New Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-700/80 bg-slate-900 text-xs text-white font-semibold focus:border-cyan-400 outline-none transition placeholder-slate-500"
                      value={otpNewPassword}
                      onChange={(e) => setOtpNewPassword(e.target.value)}
                      placeholder="New password (min 6 chars)"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Confirm New Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-700/80 bg-slate-900 text-xs text-white font-semibold focus:border-cyan-400 outline-none transition placeholder-slate-500"
                      value={otpConfirmPassword}
                      onChange={(e) => setOtpConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                {!otpSent ? (
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={sendingOtp}
                      onClick={handleSendOtpInProfile}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-extrabold text-xs bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 hover:brightness-110 text-white transition shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
                    >
                      <Mail className="w-4 h-4 text-white" />
                      {sendingOtp ? 'Sending OTP…' : 'Send OTP to my Email'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 pt-2 border-t border-slate-700">
                    <div className="p-3 rounded-xl bg-cyan-500/15 text-cyan-300 text-xs font-bold flex items-center gap-2 border border-cyan-500/30">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>OTP code sent to {studentEmail}. Check your inbox and enter the 6-digit code below.</span>
                    </div>

                    <div className="space-y-1.5 max-w-xs">
                      <label className="text-xs font-bold text-slate-300">Enter OTP Code</label>
                      <input
                        type="text"
                        maxLength={6}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 tracking-widest font-black text-center text-lg text-white uppercase outline-none focus:ring-2 focus:ring-cyan-400"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="123456"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2 flex-wrap">
                      <button
                        type="button"
                        disabled={resettingWithOtp}
                        onClick={handleVerifyOtpAndResetPassword}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 hover:brightness-110 text-white transition shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        {resettingWithOtp ? 'Verifying OTP…' : 'Verify OTP & Update Password'}
                      </button>
                      <button
                        type="button"
                        disabled={sendingOtp}
                        onClick={handleSendOtpInProfile}
                        className="text-xs text-cyan-400 hover:underline font-bold cursor-pointer"
                      >
                        Resend OTP Code
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <ProfileOverviewTabs
              activeTab={activeTab}
              profileData={profileData}
              parsedCertificates={parsedCertificates}
              parsedProjects={parsedProjects}
            />
          )
        ) : (
          <div className="space-y-8">
            <ProfileEditForm
              form={form}
              setForm={setForm}
              addCertificate={addCertificate}
              updateCertificate={updateCertificate}
              handleCertificateFileChange={handleCertificateFileChange}
              removeCertificate={removeCertificate}
              addProject={addProject}
              updateProject={updateProject}
              removeProject={removeProject}
            />

            {/* Embedded in Edit Form (OTP ONLY) */}
            <div className="pt-6 border-t border-slate-700 space-y-6">
              <div className="flex items-start justify-between gap-4 flex-wrap pb-3 border-b border-slate-700">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-cyan-400" /> Change Account Password (Email OTP Required)
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 font-medium leading-relaxed">
                    Password updates require Email OTP verification sent to <span className="font-bold text-cyan-400">{studentEmail}</span>.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/15 border border-cyan-500/30 rounded-xl text-[11px] font-black text-cyan-300">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" /> Security Enforced
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-700 space-y-5 shadow-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">New Password</label>
                    <input
                      type="password"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white font-medium focus:ring-2 focus:ring-cyan-400 outline-none placeholder-slate-500"
                      value={otpNewPassword}
                      onChange={(e) => setOtpNewPassword(e.target.value)}
                      placeholder="New password (min 6 chars)"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Confirm New Password</label>
                    <input
                      type="password"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white font-medium focus:ring-2 focus:ring-cyan-400 outline-none placeholder-slate-500"
                      value={otpConfirmPassword}
                      onChange={(e) => setOtpConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                {!otpSent ? (
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={sendingOtp}
                      onClick={handleSendOtpInProfile}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 hover:brightness-110 text-white transition shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
                    >
                      <Mail className="w-4 h-4" />
                      {sendingOtp ? 'Sending OTP…' : 'Send OTP to my Email'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 pt-2 border-t border-slate-700">
                    <div className="p-3 rounded-xl bg-cyan-500/15 text-cyan-300 text-xs font-bold flex items-center gap-2 border border-cyan-500/30">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>OTP code sent to {studentEmail}. Check your inbox and enter the 6-digit code below.</span>
                    </div>

                    <div className="space-y-1.5 max-w-xs">
                      <label className="text-xs font-bold text-slate-300">Enter OTP Code</label>
                      <input
                        type="text"
                        maxLength={6}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 tracking-widest font-black text-center text-lg text-white uppercase outline-none focus:ring-2 focus:ring-cyan-400"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="123456"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2 flex-wrap">
                      <button
                        type="button"
                        disabled={resettingWithOtp}
                        onClick={handleVerifyOtpAndResetPassword}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 hover:brightness-110 text-white transition shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        {resettingWithOtp ? 'Verifying OTP…' : 'Verify OTP & Update Password'}
                      </button>
                      <button
                        type="button"
                        disabled={sendingOtp}
                        onClick={handleSendOtpInProfile}
                        className="text-xs text-cyan-400 hover:underline font-bold cursor-pointer"
                      >
                        Resend OTP Code
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileView;
