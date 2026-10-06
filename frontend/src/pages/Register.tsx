import mitLogo from '../assets/mit_logo.png';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

import {
  GraduationCap,
  Users,
  Mail,
  Lock,
  CheckCircle2,
  ArrowRight,
  X,
  FileText,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';

import { publicApi } from '../services/api';
import { DEPARTMENTS, DEFAULT_SKILLS, DEFAULT_INTERESTS } from '../constants/departmentsAndSkills';
import SearchableMultiSelect from '../components/SearchableMultiSelect';

const getErrorMessage = (error: any) => {
  if (error?.response?.data) {
    if (typeof error.response.data === 'string') return error.response.data;
    if (error.response.data?.error) return error.response.data.error;
    if (error.response.data?.message) return error.response.data.message;
    return JSON.stringify(error.response.data);
  }

  if (error?.message) return error.message;

  return 'Failed to send OTP';
};

const Register = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [showGoogleRoleModal, setShowGoogleRoleModal] = useState(false);

  const [otpSent, setOtpSent] =
    useState(false);

  const [otpVerified, setOtpVerified] =
    useState(false);

  const [sendingOtp, setSendingOtp] =
    useState(false);

  const [verifyingOtp, setVerifyingOtp] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const handleLoginSuccess = (token: string) => {
    sessionStorage.setItem('token', token);
    const decoded: any = jwtDecode(token);
    const userRole = decoded.role;

    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      navigate('/admin');
    } else if (userRole === 'FACULTY') {
      navigate('/faculty');
    } else {
      navigate('/student');
    }
  };

  const googleLoginFunction = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const response = await publicApi.post('/auth/google-login', {
          token: tokenResponse.access_token,
          role: formData.role
        });
        handleLoginSuccess(response.data);
      } catch (error: any) {
        console.error('Google Login error:', error);
        alert('Google Login failed. Please try again or use standard registration.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      alert('Google Login Failed');
    }
  });

  const loginWithGoogle = () => {
    setShowGoogleRoleModal(true);
  };

  interface Certificate {
    id: string;
    name: string;
    organization: string;
    completionYear: string;
    fileUrl?: string;
    file?: File | null;
  }

  interface Project {
    id: string;
    title: string;
    description: string;
    technologies: string;
    link: string;
  }

  // Using DEPARTMENTS, DEFAULT_SKILLS, and DEFAULT_INTERESTS from departmentsAndSkills

  const [formData, setFormData] =
    useState({
      firstName: '',
      lastName: '',

      email: '',
      phone: '',

      password: '',
      confirmPassword: '',

      otp: '',

      role: 'STUDENT',

      status: '', // For students (Undergraduate, etc.)
      designation: '', // For faculty/admin (Professor, etc.)

      gender: '',

      collegeName: 'MIT',
      registrationNumber: '',
      semester: '',

      department: '',
      studying: '',

      highestGraduation: '',
      workingField: '',
      experience: '',

      skills: [] as string[],
      interests: [] as string[],

      linkedin: '',
      github: '',

      certificates: [] as Certificate[],
      projects: [] as Project[],

      profilePhoto: null as File | null,
      logo: null as File | null,
      resume: null as File | null,
      employeeId: '', // For faculty/admin
      idProof: null as File | null, // Required for faculty/admin
      idProofUrl: '', // Uploaded URL
    });

  const uploadFile = async (file: File, label?: string): Promise<string> => {
    try {
      const formDataFile = new FormData();
      formDataFile.append('file', file);
      const uploadResponse = await publicApi.post('/chats/files/upload', formDataFile, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return uploadResponse.data.fileUrl;
    } catch (err: any) {
      const status = err?.response?.status;
      const statusText = err?.response?.statusText;
      throw new Error(
        `${label || 'File'} upload failed${status ? ` (${status}${statusText ? ` ${statusText}` : ''})` : ''}`
      );
    }
  };

  const sendOtp = async () => {
    if (!formData.email) {
      alert('Please enter email');
      return;
    }

    setSendingOtp(true);

    try {
      await publicApi.post('/auth/send-otp', {
        email: formData.email,
        purpose: 'registration',
      });

      setOtpSent(true);

      alert('OTP Sent Successfully');
    } catch (error: any) {
      alert(getErrorMessage(error));
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    if (!formData.email || !formData.otp) {
      alert('Please enter email and OTP');
      return;
    }

    setVerifyingOtp(true);

    try {
      await publicApi.post('/auth/verify-otp', {
        email: formData.email,
        otp: formData.otp,
      });

      setOtpVerified(true);
      alert('OTP Verified Successfully');
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Failed to verify OTP';
      alert(msg);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const validateStep1 = () => {
    const { firstName, lastName, phone, gender, role, designation, profilePhoto } = formData;
    if (!profilePhoto) { alert('Please upload your Profile Photo'); return false; }
    if (!firstName.trim()) { alert('Please enter First Name'); return false; }
    if (!lastName.trim()) { alert('Please enter Last Name'); return false; }
    if (!phone.trim()) { alert('Please enter Phone Number'); return false; }
    if (phone.replace(/\D/g, '').length !== 10) { alert('Phone Number must be 10 digits'); return false; }
    if (!gender) { alert('Please select Gender'); return false; }

    if ((role === 'FACULTY' || role === 'ADMIN') && !designation.trim()) {
      alert('Please enter Designation');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const { email, otp, password, confirmPassword } = formData;
    if (!email.trim()) { alert('Please enter Email Address'); return false; }
    if (!email.includes('@')) { alert('Please enter a valid Email'); return false; }
    if (!otpSent) { alert('Please send OTP first'); return false; }
    if (!otpVerified) { alert('Please verify OTP first'); return false; }
    if (!otp.trim()) { alert('Please enter OTP'); return false; }
    if (!password) { alert('Please enter Password'); return false; }
    if (password.length < 6) { alert('Password must be at least 6 characters'); return false; }
    if (password !== confirmPassword) { alert('Passwords do not match'); return false; }
    return true;
  };

  // Certificate handlers
  const addCertificate = () => {
    const newCert: Certificate = {
      id: Date.now().toString(),
      name: '',
      organization: '',
      completionYear: '',
    };
    setFormData({ ...formData, certificates: [...formData.certificates, newCert] });
  };

  const updateCertificate = (id: string, field: keyof Certificate, value: any) => {
    setFormData({
      ...formData,
      certificates: formData.certificates.map(cert =>
        cert.id === id ? { ...cert, [field]: value } : cert
      ),
    });
  };

  const handleCertificateFileChange = async (id: string, file: File | null) => {
    if (!file) {
      updateCertificate(id, 'file', null);
      updateCertificate(id, 'fileUrl', undefined);
      return;
    }
    // Upload the file first
    try {
      const fileUrl = await uploadFile(file, 'Certificate');
      updateCertificate(id, 'file', file);
      updateCertificate(id, 'fileUrl', fileUrl);
    } catch (err) {
      console.error('Error uploading certificate file:', err);
      alert('Failed to upload certificate file');
    }
  };

  const removeCertificate = (id: string) => {
    setFormData({
      ...formData,
      certificates: formData.certificates.filter(cert => cert.id !== id),
    });
  };

  // Project handlers
  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: '',
      description: '',
      technologies: '',
      link: '',
    };
    setFormData({ ...formData, projects: [...formData.projects, newProject] });
  };

  const updateProject = (id: string, field: keyof Project, value: string) => {
    setFormData({
      ...formData,
      projects: formData.projects.map(proj =>
        proj.id === id ? { ...proj, [field]: value } : proj
      ),
    });
  };

  const removeProject = (id: string) => {
    setFormData({
      ...formData,
      projects: formData.projects.filter(proj => proj.id !== id),
    });
  };

  const validateStep3 = () => {
    const { role, studying, registrationNumber, semester, department, highestGraduation, workingField, skills, interests, status, idProof, employeeId } = formData;
    if (role === 'STUDENT') {
      if (!status) { alert('Please select your current Status (Undergraduate, etc.)'); return false; }
      if (!studying) { alert('Please select if you are currently studying'); return false; }
      if (studying === 'YES') {
        if (!registrationNumber.trim()) { alert('Please enter Registration Number'); return false; }
        if (!semester) { alert('Please select Semester'); return false; }
        if (!department) { alert('Please select Department'); return false; }
      } else {
        if (!highestGraduation.trim()) { alert('Please enter Highest Degree'); return false; }
        if (!workingField.trim()) { alert('Please enter Work Experience'); return false; }
        if (parseInt(workingField) >= 50) { alert('Experience years must be below 50'); return false; }
      }
      if (skills.length === 0) { alert('Please add at least one Skill'); return false; }
      if (interests.length === 0) { alert('Please add at least one Interest'); return false; }
    } else if (role === 'FACULTY' || role === 'ADMIN') {
      if (!department) { alert('Please select Department'); return false; }
      if (!employeeId.trim()) { alert('Please enter Employee ID'); return false; }
      if (!idProof) { alert('Please upload ID Proof'); return false; }
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(idProof.type)) {
        alert('ID Proof must be a PDF, JPG, JPEG, or PNG file');
        return false;
      }
      // Validate file size (5MB max)
      if (idProof.size > 5 * 1024 * 1024) {
        alert('ID Proof size must be less than 5MB');
        return false;
      }
    }
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setLoading(true);

    try {
      // Destructure formData for requestData
      const {
        firstName, lastName, email, phone, password, role, otp, department,
        studying, status, designation, collegeName, registrationNumber, semester,
        gender, skills, interests, linkedin, github, certificates, projects,
        highestGraduation, workingField, experience, logo, resume, employeeId, idProof, profilePhoto
      } = formData;

      let resumeUrl = '';
      let logoUrl = '';
      let idProofUrl = '';
      let profilePhotoUrl = '';

      if (profilePhoto) {
        profilePhotoUrl = await uploadFile(profilePhoto, 'Profile Photo');
      }

      if (resume) {
        resumeUrl = await uploadFile(resume, 'Resume');
      }

      if (logo) {
        logoUrl = await uploadFile(logo, 'Logo');
      }

      if (idProof) {
        idProofUrl = await uploadFile(idProof, 'ID Proof');
      }

      // Process certificates to remove file field
      const processedCertificates = certificates.map(({ file, ...rest }) => rest);

      const requestData = {
        firstName,
        lastName,
        email,
        phone,
        password,
        role,
        otp,
        department,
        studying,
        status,
        designation,
        collegeName,
        registrationNumber,
        semester,
        gender,
        skills: skills.join(', '),
        interestedDomain: interests.join(', '),
        linkedin,
        github,
        certificates: JSON.stringify(processedCertificates),
        projects: JSON.stringify(projects),
        highestGraduation,
        workingField,
        experience,
        logoUrl,
        resumeUrl,
        employeeId,
        idProofUrl,
        profilePhoto: profilePhotoUrl
      };

      console.log("===== REGISTER REQUEST DATA =====");
      console.log(JSON.stringify(requestData, null, 2));
      console.log("===== END REQUEST DATA =====");

      const response = await publicApi.post('/auth/register', requestData);

      // Show appropriate message based on role
      if (role === 'ADMIN') {
        alert('Registration successful! Your admin account is pending approval from the Super Admin. You will be notified once your account is approved.');
      } else {
        alert(response.data);
      }
      navigate('/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      console.error('Error status:', error?.response?.status);
      console.error('Request:', {
        method: error?.config?.method,
        baseURL: error?.config?.baseURL,
        url: error?.config?.url,
      });
      console.error('Error details:', JSON.stringify(error.response?.data, null, 2));
      console.error('Full response:', error.response);
      const errorData = error?.response?.data;
      const msg = typeof errorData === 'string'
        ? errorData
        : errorData?.error || errorData?.message || JSON.stringify(errorData) || 'Registration failed';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#06112e] text-slate-100 relative student-dot-canvas">
      {/* Google Role Selection Modal */}
      {showGoogleRoleModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#091b48] border border-sky-400/30 rounded-3xl shadow-2xl shadow-cyan-500/20 max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-200 text-white">
            <button
              onClick={() => setShowGoogleRoleModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-sky-500/15 border border-sky-400/30 rounded-3xl flex items-center justify-center mx-auto text-sky-300">
                <Users className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">Choose Your Role</h3>
                <p className="text-slate-300 font-medium">Select how you'll use InternSmart</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, role: 'STUDENT' });
                    setShowGoogleRoleModal(false);
                    googleLoginFunction();
                  }}
                  disabled={loading}
                  className="group p-6 rounded-2xl border-2 border-sky-400/20 hover:border-sky-400 hover:bg-sky-500/15 transition-all flex flex-col items-center gap-2 active:scale-[0.97]"
                >
                  <div className="w-12 h-12 bg-sky-500/20 rounded-xl flex items-center justify-center text-sky-300">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <span className="font-black text-sm text-white">Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    // Default to FACULTY for Faculty/Admin
                    setFormData({ ...formData, role: 'FACULTY' });
                    setShowGoogleRoleModal(false);
                    googleLoginFunction();
                  }}
                  disabled={loading}
                  className="group p-6 rounded-2xl border-2 border-sky-400/20 hover:border-sky-400 hover:bg-sky-500/15 transition-all flex flex-col items-center gap-2 active:scale-[0.97]"
                >
                  <div className="w-12 h-12 bg-sky-500/20 rounded-xl flex items-center justify-center text-sky-300">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="font-black text-sm text-white">Faculty / Admin</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LEFT SIDE - Progress & Info */}
      <div className="hidden lg:flex w-[35%] bg-gradient-to-br from-[#091b48] via-[#071438] to-[#040c24] border-r border-sky-400/20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop"
            alt="Workspace"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/30 to-[#06112e]" />

        <div className="relative z-10 flex flex-col justify-between h-full p-12 text-white">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={mitLogo} alt="MIT Logo" className="h-10 object-contain bg-white p-2.5 rounded-2xl shadow-xl border border-white/30" />
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tight text-white leading-tight">InternSmart</h1>
              <span className="text-[10px] font-extrabold text-sky-300 uppercase tracking-widest">MIT Academic Portal</span>
            </div>
          </Link>

          <div className="space-y-10">
            <div className="space-y-4">
              <h2 className="text-4xl font-black leading-tight tracking-tight">
                Join the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">ecosystem.</span>
              </h2>
              <p className="text-slate-300 font-medium text-base leading-relaxed">
                Start your journey towards professional excellence with our AI-powered internship platform.
              </p>
            </div>

            {/* Visual Step Indicator */}
            <div className="space-y-4">
              {[
                { s: 1, t: 'Personal Information', d: 'Your basic details' },
                { s: 2, t: 'Security & Verification', d: 'Email and password' },
                { s: 3, t: 'Professional Background', d: 'Academic & skills' }
              ].map((item) => (
                <div key={item.s} className={`flex items-start gap-3 transition-all duration-500 ${step >= item.s ? 'opacity-100' : 'opacity-35'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm transition-all ${
                    step === item.s ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/40' :
                    step > item.s ? 'bg-blue-600 text-white' : 'bg-blue-950/80 border border-sky-400/20 text-slate-400'
                  }`}>
                    {step > item.s ? <CheckCircle2 className="w-4 h-4" /> : item.s}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">{item.t}</h4>
                    <p className="text-[10px] text-slate-300 font-medium">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[10px] font-bold text-sky-300/80 uppercase tracking-widest">
            Step {step} of 3 • 100% Secure
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto z-10">
        <div className="w-full max-w-[560px]">
          <div className="rounded-3xl bg-gradient-to-br from-blue-950/80 via-blue-900/65 to-indigo-950/75 border border-sky-400/30 shadow-[0_25px_60px_-15px_rgba(2,10,36,0.85),0_0_40px_-10px_rgba(56,189,248,0.25)] p-6 sm:p-8 relative overflow-hidden backdrop-blur-2xl text-white">
            {/* Mobile Header */}
            <div className="lg:hidden mb-8 text-center space-y-2">
              <h1 className="text-2xl font-black text-white">Create Account</h1>
              <p className="text-slate-300 font-medium text-sm">Step {step} of 3: {step === 1 ? 'Personal Info' : step === 2 ? 'Security' : 'Background'}</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-7">
              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4">
                  <div className="space-y-3 text-center lg:text-left">
                    <h3 className="text-xl font-black text-white">Tell us about yourself</h3>
                    <p className="text-slate-300 font-medium text-sm">Select your role and provide your basic information.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="pt-2 space-y-4">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-sky-400/20"></div>
                        </div>
                        <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.2em]">
                          <span className="bg-[#09183e] px-4 text-sky-300/80 rounded-full border border-sky-400/20">Fast Registration</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => loginWithGoogle()}
                        disabled={loading}
                        className="w-full h-12 bg-blue-950/70 border border-sky-400/30 text-white rounded-xl font-black text-sm hover:bg-blue-900/80 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-70 cursor-pointer"
                      >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                        <span>Sign up with Google</span>
                      </button>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-sky-400/20"></div>
                        </div>
                        <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.2em]">
                          <span className="bg-[#09183e] px-4 text-sky-300/80 rounded-full border border-sky-400/20">Or Register Manually</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-sky-300 uppercase tracking-widest ml-1">I am a...</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, role: 'STUDENT' })}
                          className={`group p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 cursor-pointer ${
                            formData.role === 'STUDENT'
                              ? 'border-cyan-400 bg-sky-500/20 shadow-lg shadow-cyan-500/20'
                              : 'border-sky-400/20 bg-blue-950/50 hover:border-sky-400/40 hover:bg-blue-900/40'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                            formData.role === 'STUDENT' ? 'bg-cyan-400 text-white' : 'bg-blue-950 text-slate-400'
                          }`}>
                            <GraduationCap className="w-5 h-5" />
                          </div>
                          <span className={`font-black text-xs uppercase tracking-tight ${
                            formData.role === 'STUDENT' ? 'text-cyan-300' : 'text-slate-400'
                          }`}>Student</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, role: 'FACULTY' })}
                          className={`group p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 cursor-pointer ${
                            formData.role === 'FACULTY' || formData.role === 'ADMIN'
                              ? 'border-cyan-400 bg-sky-500/20 shadow-lg shadow-cyan-500/20'
                              : 'border-sky-400/20 bg-blue-950/50 hover:border-sky-400/40 hover:bg-blue-900/40'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                            formData.role === 'FACULTY' || formData.role === 'ADMIN' ? 'bg-cyan-400 text-white' : 'bg-blue-950 text-slate-400'
                          }`}>
                            <Users className="w-5 h-5" />
                          </div>
                          <span className={`font-black text-xs uppercase tracking-tight ${
                            formData.role === 'FACULTY' || formData.role === 'ADMIN' ? 'text-cyan-300' : 'text-slate-400'
                          }`}>Faculty / Admin</span>
                        </button>
                      </div>

                      {/* Radio buttons for Faculty/Admin when selected */}
                      {(formData.role === 'FACULTY' || formData.role === 'ADMIN') && (
                        <div className="space-y-2 mt-2">
                          <label className="text-[10px] font-black text-sky-300 uppercase tracking-widest ml-1">Select Role</label>
                          <div className="flex gap-4 p-3 border border-sky-400/30 rounded-xl bg-blue-950/60">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="facultyAdminRole"
                                value="FACULTY"
                                checked={formData.role === 'FACULTY'}
                                onChange={() => setFormData({ ...formData, role: 'FACULTY' })}
                                className="w-4 h-4 text-cyan-400 focus:ring-cyan-400"
                              />
                              <span className="font-bold text-xs text-white">Faculty</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="facultyAdminRole"
                                value="ADMIN"
                                checked={formData.role === 'ADMIN'}
                                onChange={() => setFormData({ ...formData, role: 'ADMIN' })}
                                className="w-4 h-4 text-cyan-400 focus:ring-cyan-400"
                              />
                              <span className="font-bold text-xs text-white">Admin</span>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* PROFILE PHOTO UPLOADER */}
                    <div className="flex flex-col items-center justify-center p-4 bg-blue-950/40 border-2 border-dashed border-sky-400/30 rounded-2xl space-y-2">
                      <label className="text-[10px] font-black text-sky-300 uppercase tracking-widest flex items-center gap-1">
                        Profile Photo <span className="text-rose-400">*</span>
                      </label>
                      
                      <div className="relative group cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          id="profilePhotoUpload"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            if (file) {
                              if (file.size > 5 * 1024 * 1024) return alert('Photo size must be under 5MB');
                              setFormData({ ...formData, profilePhoto: file });
                            }
                          }}
                        />
                        <label
                          htmlFor="profilePhotoUpload"
                          className="w-24 h-24 rounded-full border-4 border-sky-400/30 bg-sky-500/15 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group-hover:border-cyan-400 shadow-lg"
                        >
                          {formData.profilePhoto ? (
                            <img
                              src={URL.createObjectURL(formData.profilePhoto)}
                              alt="Profile Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center text-cyan-300 space-y-1">
                              <Upload className="w-6 h-6" />
                              <span className="text-[9px] font-black uppercase">Upload</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-slate-950/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] font-bold">Change</span>
                          </div>
                        </label>
                      </div>

                      {formData.profilePhoto ? (
                        <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Photo selected ({formData.profilePhoto.name})
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-300 font-medium">Click to upload JPG, PNG or WEBP (Max 5MB)</span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-sky-300 uppercase tracking-widest ml-1">First Name</label>
                        <input
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full h-11 px-4 rounded-xl border border-sky-400/25 bg-blue-950/70 focus:bg-blue-900/80 focus:border-cyan-400 outline-none transition-all text-xs font-bold text-white placeholder:text-slate-400"
                          placeholder="John"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-sky-300 uppercase tracking-widest ml-1">Last Name</label>
                        <input
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full h-11 px-4 rounded-xl border border-sky-400/25 bg-blue-950/70 focus:bg-blue-900/80 focus:border-cyan-400 outline-none transition-all text-xs font-bold text-white placeholder:text-slate-400"
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-sky-300 uppercase tracking-widest ml-1">Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            if (val.length > 10) return;
                            setFormData({ ...formData, phone: val });
                          }}
                          className="w-full h-11 px-4 rounded-xl border border-sky-400/25 bg-blue-950/70 focus:bg-blue-900/80 focus:border-cyan-400 outline-none transition-all text-xs font-bold text-white placeholder:text-slate-400"
                          placeholder="1234567890"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-sky-300 uppercase tracking-widest ml-1">Gender</label>
                        <select
                          required
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          className="w-full h-11 px-4 rounded-xl border border-sky-400/25 bg-[#091b48] focus:border-cyan-400 outline-none transition-all text-xs font-bold text-white appearance-none"
                        >
                          <option value="">Select Gender</option>
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                      {(formData.role === 'FACULTY' || formData.role === 'ADMIN') && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-sky-300 uppercase tracking-widest ml-1">Designation</label>
                          <input
                            type="text"
                            required
                            value={formData.designation}
                            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                            className="w-full h-11 px-4 rounded-xl border border-sky-400/25 bg-blue-950/70 focus:bg-blue-900/80 focus:border-cyan-400 outline-none transition-all text-xs font-bold text-white placeholder:text-slate-400"
                            placeholder="Professor, etc."
                          />
                        </div>
                      )}
                    </div>

                    <div className="pt-2 space-y-4">
                      <button
                        type="button"
                        onClick={() => validateStep1() && setStep(2)}
                        className="w-full h-12 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-white rounded-xl font-black text-sm hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-cyan-500/30 cursor-pointer"
                      >
                        <span>Continue to Security</span>
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4">
                  <div className="space-y-3 text-center lg:text-left">
                    <h3 className="text-xl font-black text-white">Security & Verification</h3>
                    <p className="text-sky-300/80 font-medium text-sm">Verify your email address and set your password.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-sky-300 uppercase tracking-widest ml-1">Email Address</label>
                      <div className="flex gap-3">
                        <div className="relative flex-1 group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-400 group-focus-within:text-cyan-300 w-4 h-4 transition-colors" />
                          <input
                            type="email"
                            required
                            disabled={otpSent}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full h-12 pl-12 pr-4 rounded-xl border border-sky-400/25 bg-blue-950/70 focus:bg-blue-900/80 focus:border-cyan-400 outline-none transition-all text-xs font-bold text-white placeholder:text-slate-400 disabled:opacity-50"
                            placeholder="name@college.edu"
                          />
                        </div>
                        {!otpSent && (
                          <button
                            type="button"
                            onClick={sendOtp}
                            disabled={sendingOtp}
                            className="px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-xs hover:brightness-110 disabled:opacity-50 shadow-md shadow-cyan-500/20 transition-all active:scale-[0.95] cursor-pointer"
                          >
                            {sendingOtp ? '...' : 'Send OTP'}
                          </button>
                        )}
                      </div>
                    </div>

                    {otpSent && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                        <label className="text-[10px] font-black text-sky-300 uppercase tracking-widest ml-1">Verification Code</label>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            required
                            maxLength={6}
                            disabled={otpVerified}
                            value={formData.otp}
                            onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                            className="flex-1 h-12 px-4 rounded-xl border border-sky-400/25 bg-blue-950/70 focus:bg-blue-900/80 focus:border-cyan-400 outline-none transition-all text-lg font-black tracking-[0.4em] text-center text-white placeholder:text-slate-400 disabled:opacity-50"
                            placeholder="000000"
                          />
                          {!otpVerified ? (
                            <button
                              type="button"
                              onClick={verifyOtp}
                              disabled={verifyingOtp}
                              className="px-6 rounded-xl bg-emerald-500 text-white font-black text-xs hover:bg-emerald-600 disabled:opacity-50 shadow-md shadow-emerald-500/20 transition-all active:scale-[0.95] cursor-pointer"
                            >
                              {verifyingOtp ? '...' : 'Verify'}
                            </button>
                          ) : (
                            <div className="px-6 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-black text-xs flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Verified
                            </div>
                          )}
                        </div>
                        {!otpVerified && (
                          <button
                            type="button"
                            onClick={sendOtp}
                            disabled={sendingOtp}
                            className="text-[10px] font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-widest ml-1 cursor-pointer"
                          >
                            Resend Code
                          </button>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-sky-300 uppercase tracking-widest ml-1">Password</label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-400 group-focus-within:text-cyan-300 w-4 h-4 transition-colors" />
                          <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full h-12 pl-12 pr-4 rounded-xl border border-sky-400/25 bg-blue-950/70 focus:bg-blue-900/80 focus:border-cyan-400 outline-none transition-all text-xs font-bold text-white placeholder:text-slate-400"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-sky-300 uppercase tracking-widest ml-1">Confirm</label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-400 group-focus-within:text-cyan-300 w-4 h-4 transition-colors" />
                          <input
                            type="password"
                            required
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="w-full h-12 pl-12 pr-4 rounded-xl border border-sky-400/25 bg-blue-950/70 focus:bg-blue-900/80 focus:border-cyan-400 outline-none transition-all text-xs font-bold text-white placeholder:text-slate-400"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 h-12 bg-sky-950/60 border border-sky-400/30 text-sky-200 rounded-xl font-black text-sm hover:bg-sky-900/50 hover:text-white transition-all active:scale-[0.98] cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => validateStep2() && setStep(3)}
                        className="flex-[2] h-12 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-white rounded-xl font-black text-sm hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-cyan-500/30 cursor-pointer"
                      >
                        <span>Professional Info</span>
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4">
                  <div className="space-y-3 text-center lg:text-left">
                    <h3 className="text-xl font-black text-white">Professional Background</h3>
                    <p className="text-sky-300/80 font-medium text-sm">Complete your profile to get the best matches.</p>
                  </div>

                  <div className="space-y-6">
                    {formData.role === 'STUDENT' && (
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-sky-300 uppercase tracking-widest ml-1">Academic Status</label>
                            <select
                              value={formData.status}
                              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                              className="w-full h-11 px-4 rounded-xl border border-sky-400/25 bg-[#091b48] focus:border-cyan-400 outline-none transition-all text-xs font-bold text-white appearance-none"
                            >
                              <option value="">Select Status</option>
                              <optgroup label="Undergraduate">
                                <option value="BE">BE (Bachelor of Engineering)</option>
                                <option value="BSc">BSc (Bachelor of Science)</option>
                                <option value="BCom">BCom (Bachelor of Commerce)</option>
                                <option value="BBA">BBA (Bachelor of Business Administration)</option>
                                <option value="BCA">BCA (Bachelor of Computer Applications)</option>
                                <option value="BA">BA (Bachelor of Arts)</option>
                                <option value="BArch">BArch (Bachelor of Architecture)</option>
                                <option value="BPharm">BPharm (Bachelor of Pharmacy)</option>
                              </optgroup>
                              <optgroup label="Postgraduate">
                                <option value="MTech">MTech (Master of Technology)</option>
                                <option value="MSc">MSc (Master of Science)</option>
                                <option value="MCom">MCom (Master of Commerce)</option>
                                <option value="MBA">MBA (Master of Business Administration)</option>
                                <option value="MCA">MCA (Master of Computer Applications)</option>
                                <option value="MA">MA (Master of Arts)</option>
                              </optgroup>
                              <optgroup label="Other">
                                <option value="PhD">PhD (Doctor of Philosophy)</option>
                                <option value="Diploma">Diploma</option>
                                <option value="Other">Other</option>
                              </optgroup>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-sky-300 uppercase tracking-widest ml-1">Currently Studying?</label>
                            <select
                              value={formData.studying}
                              onChange={(e) => setFormData({ ...formData, studying: e.target.value })}
                              className="w-full h-11 px-4 rounded-xl border border-sky-400/25 bg-[#091b48] focus:border-cyan-400 outline-none transition-all text-xs font-bold text-white appearance-none"
                            >
                              <option value="">Select Option</option>
                              <option value="YES">Yes</option>
                              <option value="NO">No</option>
                            </select>
                          </div>
                        </div>

                        {formData.studying === 'YES' && (
                          <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-sky-300 uppercase tracking-widest ml-1">Reg Number</label>
                                <input
                                  type="text"
                                  value={formData.registrationNumber}
                                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                                  className="w-full h-11 px-4 rounded-xl border border-sky-400/25 bg-blue-950/70 focus:bg-blue-900/80 focus:border-cyan-400 outline-none transition-all text-xs font-bold text-white placeholder:text-slate-400"
                                  placeholder="ID Number"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-sky-300 uppercase tracking-widest ml-1">Semester</label>
                                <select
                                  value={formData.semester}
                                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                  className="w-full h-11 px-4 rounded-xl border border-sky-400/25 bg-[#091b48] focus:border-cyan-400 outline-none transition-all text-xs font-bold text-white appearance-none"
                                >
                                  <option value="">Select Semester</option>
                                  <option value="1">Semester 1</option>
                                  <option value="2">Semester 2</option>
                                  <option value="3">Semester 3</option>
                                  <option value="4">Semester 4</option>
                                  <option value="5">Semester 5</option>
                                  <option value="6">Semester 6</option>
                                  <option value="7">Semester 7</option>
                                  <option value="8">Semester 8</option>
                                </select>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-sky-300 uppercase tracking-widest ml-1">Department</label>
                              <select
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                className="w-full h-11 px-4 rounded-xl border border-sky-400/25 bg-[#091b48] focus:border-cyan-400 outline-none transition-all text-xs font-bold text-white appearance-none"
                              >
                                <option value="">Select Department</option>
                                {DEPARTMENTS.map(d => (
                                  <option key={d} value={d}>{d}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}

                        {formData.studying === 'NO' && (
                          <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-sky-300 uppercase tracking-widest ml-1">Highest Degree</label>
                                <input
                                  type="text"
                                  value={formData.highestGraduation}
                                  onChange={(e) => setFormData({ ...formData, highestGraduation: e.target.value })}
                                  className="w-full h-11 px-4 rounded-xl border border-sky-400/25 bg-blue-950/70 focus:bg-blue-900/80 focus:border-cyan-400 outline-none transition-all text-xs font-bold text-white placeholder:text-slate-400"
                                  placeholder="B.Tech, etc."
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-sky-300 uppercase tracking-widest ml-1">Exp Years</label>
                                <input
                                  type="number"
                                  value={formData.experience}
                                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                  className="w-full h-11 px-4 rounded-xl border border-sky-400/25 bg-blue-950/70 focus:bg-blue-900/80 focus:border-cyan-400 outline-none transition-all text-xs font-bold text-white placeholder:text-slate-400"
                                  placeholder="0"
                                />
                              </div>
                            </div>
                            <div className="space-y-2 col-span-1 sm:col-span-2">
                              <label className="text-[10px] font-black text-sky-300 uppercase tracking-widest ml-1">Working Field / Expertise</label>
                              <textarea
                                rows={4}
                                value={formData.workingField}
                                onChange={(e) => setFormData({ ...formData, workingField: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-sky-400/25 bg-blue-950/70 focus:bg-blue-900/80 focus:border-cyan-400 outline-none transition-all text-xs font-bold text-white placeholder:text-slate-400 resize-none"
                                placeholder="Describe your area of expertise, domains you've worked in, tools & technologies you're proficient with..."
                              />
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-sky-300 uppercase tracking-widest ml-1">Skills</label>
                            <SearchableMultiSelect
                              options={DEFAULT_SKILLS}
                              selected={formData.skills}
                              onChange={(selected) => setFormData({ ...formData, skills: selected })}
                              placeholder="Search and select skills..."
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-sky-300 uppercase tracking-widest ml-1">Interests</label>
                            <SearchableMultiSelect
                              options={DEFAULT_INTERESTS}
                              selected={formData.interests}
                              onChange={(selected) => setFormData({ ...formData, interests: selected })}
                              placeholder="Search and select interests..."
                            />
                          </div>
                        </div>

                        {/* Certificates Section */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-sky-300 uppercase tracking-widest ml-1">Certificate Courses</label>
                            <button
                              type="button"
                              onClick={addCertificate}
                              className="flex items-center gap-1 px-3 py-1 bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 rounded-lg text-xs font-bold hover:bg-cyan-500/30 transition-all cursor-pointer"
                            >
                              <Plus className="w-3 h-3" /> Add Certificate
                            </button>
                          </div>
                          {formData.certificates.map((cert) => (
                            <div key={cert.id} className="space-y-3 p-4 bg-blue-950/60 rounded-xl border border-sky-400/25">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-sky-200">Certificate</span>
                                <button
                                  type="button"
                                  onClick={() => removeCertificate(cert.id)}
                                  className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-sky-300/80 uppercase">Name</label>
                                  <input
                                    type="text"
                                    value={cert.name}
                                    onChange={(e) => updateCertificate(cert.id, 'name', e.target.value)}
                                    className="w-full h-9 px-3 rounded-lg border border-sky-400/25 bg-blue-900/60 text-xs font-bold text-white outline-none focus:border-cyan-400"
                                    placeholder="Certificate name"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-sky-300/80 uppercase">Organization</label>
                                  <input
                                    type="text"
                                    value={cert.organization}
                                    onChange={(e) => updateCertificate(cert.id, 'organization', e.target.value)}
                                    className="w-full h-9 px-3 rounded-lg border border-sky-400/25 bg-blue-900/60 text-xs font-bold text-white outline-none focus:border-cyan-400"
                                    placeholder="Issuing organization"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-sky-300/80 uppercase">Year</label>
                                  <input
                                    type="text"
                                    value={cert.completionYear}
                                    onChange={(e) => updateCertificate(cert.id, 'completionYear', e.target.value)}
                                    className="w-full h-9 px-3 rounded-lg border border-sky-400/25 bg-blue-900/60 text-xs font-bold text-white outline-none focus:border-cyan-400"
                                    placeholder="2024"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[9px] font-bold text-sky-300/80 uppercase">Certificate File (PDF/Image)</label>
                                <div className="relative">
                                  <input
                                    type="file"
                                    accept="application/pdf,image/*"
                                    onChange={(e) => handleCertificateFileChange(cert.id, e.target.files?.[0] || null)}
                                    className="w-full h-9 px-3 rounded-lg border border-sky-400/25 bg-blue-900/60 text-xs font-bold text-sky-200 outline-none focus:border-cyan-400 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30"
                                  />
                                </div>
                                {cert.file && (
                                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                                    <FileText className="w-4 h-4" />
                                    Selected: {cert.file.name}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Projects Section */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-sky-300 uppercase tracking-widest ml-1">Projects</label>
                            <button
                              type="button"
                              onClick={addProject}
                              className="flex items-center gap-1 px-3 py-1 bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 rounded-lg text-xs font-bold hover:bg-cyan-500/30 transition-all cursor-pointer"
                            >
                              <Plus className="w-3 h-3" /> Add Project
                            </button>
                          </div>
                          {formData.projects.map((proj) => (
                            <div key={proj.id} className="space-y-3 p-4 bg-blue-950/60 rounded-xl border border-sky-400/25">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-sky-200">Project</span>
                                <button
                                  type="button"
                                  onClick={() => removeProject(proj.id)}
                                  className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="space-y-3">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-sky-300/80 uppercase">Title</label>
                                  <input
                                    type="text"
                                    value={proj.title}
                                    onChange={(e) => updateProject(proj.id, 'title', e.target.value)}
                                    className="w-full h-9 px-3 rounded-lg border border-sky-400/25 bg-blue-900/60 text-xs font-bold text-white outline-none focus:border-cyan-400"
                                    placeholder="Project title"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-sky-300/80 uppercase">Description</label>
                                  <textarea
                                    value={proj.description}
                                    onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                                    className="w-full h-20 px-3 py-2 rounded-lg border border-sky-400/25 bg-blue-900/60 text-xs font-bold text-white outline-none focus:border-cyan-400 resize-none"
                                    placeholder="Project description"
                                  />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-sky-300/80 uppercase">Technologies</label>
                                    <input
                                      type="text"
                                      value={proj.technologies}
                                      onChange={(e) => updateProject(proj.id, 'technologies', e.target.value)}
                                      className="w-full h-9 px-3 rounded-lg border border-sky-400/25 bg-blue-900/60 text-xs font-bold text-white outline-none focus:border-cyan-400"
                                      placeholder="React, Node.js, etc."
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-sky-300/80 uppercase">Link</label>
                                    <input
                                      type="url"
                                      value={proj.link}
                                      onChange={(e) => updateProject(proj.id, 'link', e.target.value)}
                                      className="w-full h-9 px-3 rounded-lg border border-sky-400/25 bg-blue-900/60 text-xs font-bold text-white outline-none focus:border-cyan-400"
                                      placeholder="https://..."
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(formData.role === 'FACULTY' || formData.role === 'ADMIN') && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-sky-300 uppercase tracking-widest ml-1">Department</label>
                          <select
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            className="w-full h-11 px-4 rounded-xl border border-sky-400/25 bg-[#091b48] focus:border-cyan-400 outline-none transition-all text-xs font-bold text-white appearance-none"
                          >
                            <option value="">Select Department</option>
                            {DEPARTMENTS.map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-sky-300 uppercase tracking-widest ml-1">Employee ID (Required)</label>
                            <input
                              type="text"
                              value={formData.employeeId}
                              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                              className="w-full h-11 px-4 rounded-xl border border-sky-400/25 bg-blue-950/70 focus:bg-blue-900/80 focus:border-cyan-400 outline-none transition-all text-xs font-bold text-white placeholder:text-slate-400"
                              placeholder="EMP1234"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-sky-300 uppercase tracking-widest ml-1">Working Field / Expertise</label>
                            <textarea
                              rows={4}
                              value={formData.workingField}
                              onChange={(e) => setFormData({ ...formData, workingField: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl border border-sky-400/25 bg-blue-950/70 focus:bg-blue-900/80 focus:border-cyan-400 outline-none transition-all text-xs font-bold text-white placeholder:text-slate-400 resize-none"
                              placeholder="Describe your area of expertise, domains you've worked in, teaching subjects, tools & technologies you're proficient with..."
                            />
                          </div>
                        </div>

                        {/* ID Proof Upload */}
                        <div className="space-y-2 mt-4">
                          <label className="text-[10px] font-black text-sky-300 uppercase tracking-widest ml-1">ID Proof (Required) - PDF, JPG, JPEG, PNG (Max 5MB)</label>
                          <div className="relative">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setFormData({ ...formData, idProof: file });
                              }}
                              className="w-full h-11 px-4 rounded-xl border border-sky-400/25 bg-blue-950/70 focus:border-cyan-400 outline-none transition-all text-xs font-bold text-sky-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30"
                            />
                          </div>
                          {formData.idProof && (
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                              <FileText className="w-4 h-4" />
                              Selected: {formData.idProof.name} ({(formData.idProof.size / 1024 / 1024).toFixed(2)} MB)
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-sky-300 uppercase tracking-widest ml-1">LinkedIn</label>
                        <input
                          type="url"
                          value={formData.linkedin}
                          onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                          className="w-full h-11 px-4 rounded-xl border border-sky-400/25 bg-blue-950/70 focus:bg-blue-900/80 focus:border-cyan-400 outline-none transition-all text-xs font-bold text-white placeholder:text-slate-400"
                          placeholder="linkedin.com/in/..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-sky-300 uppercase tracking-widest ml-1">GitHub</label>
                        <input
                          type="url"
                          value={formData.github}
                          onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                          className="w-full h-11 px-4 rounded-xl border border-sky-400/25 bg-blue-950/70 focus:bg-blue-900/80 focus:border-cyan-400 outline-none transition-all text-xs font-bold text-white placeholder:text-slate-400"
                          placeholder="github.com/..."
                        />
                      </div>
                    </div>

                    {formData.role === 'STUDENT' && (
                      <div className="space-y-2 mt-4">
                        <label className="text-[10px] font-black text-sky-300 uppercase tracking-widest ml-1">Resume (PDF)</label>
                        <div className="relative">
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setFormData({ ...formData, resume: file });
                            }}
                            className="w-full h-11 px-4 rounded-xl border border-sky-400/25 bg-blue-950/70 focus:border-cyan-400 outline-none transition-all text-xs font-bold text-sky-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30"
                          />
                        </div>
                        {formData.resume && (
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                            <FileText className="w-4 h-4" />
                            Selected: {formData.resume.name}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="flex-1 h-12 bg-sky-950/60 border border-sky-400/30 text-sky-200 rounded-xl font-black text-sm hover:bg-sky-900/50 hover:text-white transition-all active:scale-[0.98] cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-[2] h-12 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-white rounded-xl font-black text-sm hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-cyan-500/30 cursor-pointer"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Create Account</span>
                            <CheckCircle2 className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          <p className="text-center text-slate-400 font-bold mt-10">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
