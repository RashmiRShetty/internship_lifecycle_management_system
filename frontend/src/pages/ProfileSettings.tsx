import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, BookOpen, FileText, Save, LayoutDashboard, Camera, Upload, Trash2, Lock, ShieldCheck, Mail, CheckCircle2 } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';
import { DEPARTMENTS } from '../constants/departmentsAndSkills';
import { SearchableSkillSelect } from '../components/SearchableSkillSelect';
import { ResumeUploader } from '../components/ResumeUploader';

interface CustomJwtPayload {
  sub: string;
  role: string;
}

const getPhotoUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  return `${api.defaults.baseURL}${url}`;
};

const ProfileSettings = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>({
    firstName: '',
    lastName: '',
    department: '',
    bio: '',
    profilePhoto: '',
    skills: [] as string[],
    completedCourseworks: [] as string[],
    projects: '',
    resumeUrl: '',
    designation: '',
    phone: '',
    collegeName: '',
    registrationNumber: '',
    semester: '',
    cgpa: '',
    experience: '',
    interests: [] as string[],
    linkedin: '',
    github: '',
    profileComplete: false
  });

  // OTP Change Password State
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpNewPassword, setOtpNewPassword] = useState('');
  const [otpConfirmPassword, setOtpConfirmPassword] = useState('');
  const [resettingWithOtp, setResettingWithOtp] = useState(false);

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isFaculty, setIsFaculty] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<CustomJwtPayload>(token);
        setUserEmail(decoded.sub);
        setIsFaculty(decoded.role === 'FACULTY' || decoded.role === 'ADMIN' || decoded.role === 'SUPER_ADMIN');
      } catch (e) {
        console.error("Failed to decode token:", e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userEmail) return;
      
      try {
        const endpoint = isFaculty ? `/users/profile/faculty?email=${userEmail}` : `/users/profile/student?email=${userEmail}`;
        const response = await api.get(endpoint);
        const data = response.data || {};
        // Handle skills if it's a string
        if (typeof data.skills === 'string') {
          data.skills = data.skills.split(',').filter((s: string) => s.trim());
        }
        const interests =
          typeof data.interestedDomain === 'string'
            ? data.interestedDomain.split(',').filter((s: string) => s.trim())
            : [];
        const completedCourseworks =
          typeof data.completedCourseworks === 'string'
            ? data.completedCourseworks.split(',').filter((s: string) => s.trim())
            : Array.isArray(data.completedCourseworks) ? data.completedCourseworks : [];
        setProfile({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          department: data.department || '',
          bio: data.bio || '',
          profilePhoto: data.profilePhoto || '',
          skills: data.skills || [],
          completedCourseworks: completedCourseworks,
          projects: data.projects || '',
          resumeUrl: data.resumeUrl || '',
          designation: data.designation || '',
          phone: data.phone || '',
          collegeName: data.collegeName || '',
          registrationNumber: data.registrationNumber || '',
          semester: data.semester || '',
          cgpa: data.cgpa || '',
          experience: data.experience || '',
          interests,
          linkedin: data.linkedin || '',
          github: data.github || '',
          profileComplete: data.profileComplete || false
        });
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        // If profile doesn't exist (404), initialize with empty values
        if (error.response?.status === 404) {
          console.log("Profile not found, initializing empty profile");
          setProfile({
            firstName: '',
            lastName: '',
            department: '',
            bio: '',
            skills: [] as string[],
            resumeUrl: '',
            designation: '',
            phone: '',
            collegeName: '',
            registrationNumber: '',
            semester: '',
            cgpa: '',
            experience: '',
            interests: [] as string[],
            linkedin: '',
            github: '',
            profileComplete: false
          });
        }
      } finally {
        setFetching(false);
      }
    };
    if (userEmail) fetchProfile();
  }, [userEmail, isFaculty]);

  const handlePhotoUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo size must be under 5MB');
      return;
    }
    setUploadingPhoto(true);
    try {
      const formDataFile = new FormData();
      formDataFile.append('file', file);
      const response = await api.post('/chats/files/upload', formDataFile, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const photoUrl = response.data.fileUrl;
      setProfile((prev: any) => ({ ...prev, profilePhoto: photoUrl }));
      alert('Profile photo updated! Click "Save Profile" to save changes.');
    } catch (err: any) {
      console.error('Photo upload error:', err);
      alert('Failed to upload profile photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSendOtpInProfile = async () => {
    if (!userEmail) return alert('User email not found. Please log in again.');
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
      await api.post('/auth/send-otp', { email: userEmail, purpose: 'forgot-password' });
      setOtpSent(true);
      alert(`OTP sent successfully to ${userEmail}! Please check your email inbox.`);
    } catch (err: any) {
      console.error('Failed to send OTP:', err);
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to send OTP to email.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtpAndResetPassword = async () => {
    if (!userEmail || !otpCode) {
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
        email: userEmail,
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSave called');
    if (!userEmail) {
      console.log('No userEmail found');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isFaculty ? '/users/profile/faculty' : '/users/profile/student';
      console.log('Endpoint:', endpoint);
      // Convert skills array to string for backend
      const profileToSave = {
        email: userEmail,
        firstName: profile.firstName || null,
        lastName: profile.lastName || null,
        department: profile.department || null,
        bio: profile.bio || null,
        profilePhoto: profile.profilePhoto || null,
        skills: Array.isArray(profile.skills) ? profile.skills.join(',') : profile.skills,
        completedCourseworks: Array.isArray(profile.completedCourseworks) ? profile.completedCourseworks.join(',') : profile.completedCourseworks,
        projects: profile.projects || null,
        resumeUrl: profile.resumeUrl || null,
        designation: profile.designation || null,
        phone: profile.phone || null,
        collegeName: profile.collegeName || null,
        registrationNumber: profile.registrationNumber || null,
        semester: profile.semester || null,
        cgpa: profile.cgpa || null,
        experience: profile.experience || null,
        interestedDomain: Array.isArray(profile.interests) ? profile.interests.join(',') : profile.interests,
        linkedin: profile.linkedin || null,
        github: profile.github || null
      };
      console.log('Saving profile:', profileToSave);
      console.log('Making PUT request to:', endpoint);
      const response = await api.put(endpoint, profileToSave);
      console.log('Response received:', response);
      const updatedProfile = response.data;
      console.log('Updated profile:', updatedProfile);
      const updatedSkills =
        typeof updatedProfile.skills === 'string'
          ? updatedProfile.skills.split(',').filter((s: string) => s.trim())
          : updatedProfile.skills || [];
      const updatedCourseworks =
        typeof updatedProfile.completedCourseworks === 'string'
          ? updatedProfile.completedCourseworks.split(',').filter((s: string) => s.trim())
          : updatedProfile.completedCourseworks || [];
      const updatedInterests =
        typeof updatedProfile.interestedDomain === 'string'
          ? updatedProfile.interestedDomain.split(',').filter((s: string) => s.trim())
          : [];
      setProfile({
        firstName: updatedProfile.firstName || '',
        lastName: updatedProfile.lastName || '',
        department: updatedProfile.department || '',
        bio: updatedProfile.bio || '',
        profilePhoto: updatedProfile.profilePhoto || profile.profilePhoto || '',
        skills: updatedSkills,
        completedCourseworks: updatedCourseworks,
        projects: updatedProfile.projects || '',
        resumeUrl: updatedProfile.resumeUrl || '',
        designation: updatedProfile.designation || '',
        phone: updatedProfile.phone || '',
        collegeName: updatedProfile.collegeName || '',
        registrationNumber: updatedProfile.registrationNumber || '',
        semester: updatedProfile.semester || '',
        cgpa: updatedProfile.cgpa || '',
        experience: updatedProfile.experience || '',
        interests: updatedInterests,
        linkedin: updatedProfile.linkedin || '',
        github: updatedProfile.github || '',
        profileComplete: updatedProfile.profileComplete || false
      });
      
      if (updatedProfile.profileComplete) {
        alert('Profile updated and marked as complete!');
      } else {
        alert('Profile updated successfully!');
      }
      
      // Redirect to stored URL or dashboard based on role
      const redirectUrl = sessionStorage.getItem('redirectAfterProfile');
      if (redirectUrl) {
        sessionStorage.removeItem('redirectAfterProfile');
        navigate(redirectUrl);
      } else {
        if (isFaculty) {
          navigate('/faculty');
        } else {
          navigate('/student');
        }
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      alert(`Failed to update profile: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-10 text-center">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 animate-in">
      <div className="flex items-center gap-4 mb-10">
        <div className={`w-12 h-12 ${isFaculty ? 'bg-green-600' : 'bg-blue-600'} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
          <User className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Profile Settings</h1>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
              profile.profileComplete ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
            }`}>
              {profile.profileComplete ? '✓ Complete' : '⚠ Incomplete'}
            </span>
          </div>
          <p className="text-gray-500">Manage your personal information and professional details.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Profile Photo Card */}
        <div className="card space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" /> Profile Photo
          </h2>
          
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-28 h-28 rounded-full border-4 border-white/10 shadow-md overflow-hidden bg-slate-900/90 flex items-center justify-center shrink-0">
              {profile.profilePhoto ? (
                <img src={getPhotoUrl(profile.profilePhoto)} alt="Profile Avatar" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
              ) : (
                <User className="w-12 h-12 text-slate-400" />
              )}
              {uploadingPhoto && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold">
                  Uploading…
                </div>
              )}
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <div>
                <h4 className="text-sm font-bold text-gray-900">Avatar Photo</h4>
                <p className="text-xs text-gray-500">Upload or change your profile picture (JPG, PNG or WEBP, max 5MB)</p>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
                <label className="btn btn-primary btn-sm cursor-pointer inline-flex items-center gap-2">
                  <Upload className="w-4 h-4" /> {profile.profilePhoto ? 'Change Photo' : 'Upload Photo'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingPhoto}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoUpload(file);
                    }}
                  />
                </label>

                {profile.profilePhoto && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm text-rose-600 hover:bg-rose-50 inline-flex items-center gap-1.5"
                    onClick={() => setProfile({ ...profile, profilePhoto: '' })}
                  >
                    <Trash2 className="w-4 h-4" /> Remove Photo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Basic Info Card */}
        <div className="card space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-blue-600" /> Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">First Name</label>
              <input 
                type="text" 
                className="input-field" 
                value={profile.firstName}
                onChange={e => setProfile({...profile, firstName: e.target.value})}
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Last Name</label>
              <input 
                type="text" 
                className="input-field" 
                value={profile.lastName}
                onChange={e => setProfile({...profile, lastName: e.target.value})}
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isFaculty ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Designation</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={profile.designation}
                    onChange={e => setProfile({...profile, designation: e.target.value})}
                    placeholder="Assistant Professor"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Phone Number</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={profile.phone}
                    onChange={e => setProfile({...profile, phone: e.target.value})}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Phone Number</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={profile.phone}
                    onChange={e => setProfile({...profile, phone: e.target.value})}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Registration Number</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={profile.registrationNumber}
                    onChange={e => setProfile({...profile, registrationNumber: e.target.value})}
                    placeholder="2021CS101"
                  />
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Department</label>
            <div className="relative group">
              <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-600 transition" />
              <select 
                className="input-field pl-12" 
                value={profile.department}
                onChange={e => setProfile({...profile, department: e.target.value})}
              >
                <option value="">Select Department</option>
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {!isFaculty && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">College Name</label>
              <input 
                type="text" 
                className="input-field" 
                value={profile.collegeName}
                onChange={e => setProfile({...profile, collegeName: e.target.value})}
                placeholder="PIM College of Engineering"
              />
            </div>
          )}

          {!isFaculty && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">CGPA</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={profile.cgpa}
                  onChange={e => setProfile({...profile, cgpa: e.target.value})}
                  placeholder="8.5"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Experience (Years)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={profile.experience}
                  onChange={e => setProfile({...profile, experience: e.target.value})}
                  placeholder="0"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Bio / About You</label>
            <textarea 
              className="input-field min-h-[120px] py-4" 
              value={profile.bio}
              onChange={e => setProfile({...profile, bio: e.target.value})}
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>

        {/* Account Security & Password Card (OTP ONLY) */}
        <div className="card space-y-6 border-2 border-indigo-100 bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/30 p-6 rounded-3xl">
          <div className="flex items-start justify-between gap-4 flex-wrap pb-3 border-b border-indigo-100/60">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-600" /> Change Account Password (Email OTP Required)
              </h2>
              <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">
                Password updates for all roles require Email OTP verification sent to <span className="font-bold text-indigo-700">{userEmail || 'your email'}</span>.
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-xl text-[11px] font-black text-indigo-700">
              <ShieldCheck className="w-4 h-4 text-indigo-600" /> Security Enforced
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">New Password</label>
                <input
                  type="password"
                  className="input-field"
                  value={otpNewPassword}
                  onChange={(e) => setOtpNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 chars)"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Confirm New Password</label>
                <input
                  type="password"
                  className="input-field"
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
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Mail className="w-4 h-4" />
                  {sendingOtp ? 'Sending OTP to Email…' : 'Send OTP to Email'}
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-3 border-t border-white/10">
                <div className="p-3.5 rounded-xl bg-emerald-950/40 text-emerald-800 text-xs font-bold flex items-center gap-2.5 border border-emerald-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>OTP code sent to {userEmail}. Check your inbox and enter the 6-digit verification code below.</span>
                </div>

                <div className="space-y-1.5 max-w-xs">
                  <label className="text-xs font-bold text-gray-700">Enter 6-Digit OTP Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    className="input-field tracking-widest font-black text-center text-lg uppercase"
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
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    {resettingWithOtp ? 'Verifying OTP…' : 'Verify OTP & Change Password'}
                  </button>
                  <button
                    type="button"
                    disabled={sendingOtp}
                    onClick={handleSendOtpInProfile}
                    className="text-xs text-indigo-600 hover:underline font-bold cursor-pointer"
                  >
                    Resend OTP Code
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Fields Card */}
        <div className="card space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" /> Professional Details
          </h2>

          {!isFaculty ? (
            <>
              {/* AI Resume Upload & Auto-Fill Component */}
              <div className="mb-6">
                <ResumeUploader
                  onProfileAutoFill={(parsed) => {
                    const newSkills = parsed.skills ? parsed.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
                    const newCourseworks = parsed.completedCourseworks ? parsed.completedCourseworks.split(',').map(s => s.trim()).filter(Boolean) : [];
                    
                    setProfile((prev: any) => ({
                      ...prev,
                      skills: Array.from(new Set([...(prev.skills || []), ...newSkills])),
                      completedCourseworks: Array.from(new Set([...(prev.completedCourseworks || []), ...newCourseworks])),
                      projects: prev.projects ? `${prev.projects}\n${parsed.projects}` : parsed.projects,
                      bio: prev.bio || parsed.bio
                    }));
                  }}
                />
              </div>

              <div className="space-y-2">
                <SearchableSkillSelect
                  label="Interested Domain"
                  placeholder="Type to search skills or add custom domain..."
                  value={profile.interests}
                  onChange={(newValue) => setProfile({ ...profile, interests: newValue.split(',').map(s => s.trim()).filter(Boolean) })}
                  category="Domain"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">LinkedIn Profile</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={profile.linkedin}
                    onChange={e => setProfile({...profile, linkedin: e.target.value})}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">GitHub Profile</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={profile.github}
                    onChange={e => setProfile({...profile, github: e.target.value})}
                    placeholder="https://github.com/yourprofile"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <SearchableSkillSelect
                  label="Completed Courseworks"
                  placeholder="Type to search skills or add completed coursework..."
                  value={profile.completedCourseworks}
                  onChange={(newValue) => setProfile({ ...profile, completedCourseworks: newValue.split(',').map(s => s.trim()).filter(Boolean) })}
                  category="Coursework"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Completed Projects</label>
                <textarea 
                  className="input-field min-h-[90px] py-3" 
                  value={profile.projects}
                  onChange={e => setProfile({...profile, projects: e.target.value})}
                  placeholder="List your completed projects (e.g. AI Resume Parser in Python, E-commerce App in React)"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Resume Link</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={profile.resumeUrl}
                  onChange={e => setProfile({...profile, resumeUrl: e.target.value})}
                  placeholder="https://link-to-your-resume.pdf"
                />
              </div>
            </>
          ) : null}

          <div className="space-y-4">
            <SearchableSkillSelect
              label="Skills"
              placeholder="Type to search skills or add custom skill..."
              value={profile.skills}
              onChange={(newValue) => setProfile({ ...profile, skills: newValue.split(',').map(s => s.trim()).filter(Boolean) })}
              category="Technical Skills"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary px-12 py-4 text-lg flex items-center gap-2"
          >
            {loading ? 'Saving Changes...' : <><Save className="w-5 h-5" /> Save Profile</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
