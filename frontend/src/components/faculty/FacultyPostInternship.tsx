import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  GraduationCap,
  MapPin,
  Plus,
  Sparkles,
  Globe,
  Building,
  Laptop,
  IndianRupee,
  Gift,
  Check,
  ArrowRight,
  Zap,
  CheckCircle2,
  Users,
  X
} from 'lucide-react';
import api from '../../services/api';
import { AI_MATCHER_BASE_URL } from '../../config/api';
import { SearchableSkillSelect } from '../SearchableSkillSelect';

export const FacultyPostInternship = ({
  isProfileComplete,
  setShowProfileCompleteModal
}: {
  isProfileComplete: () => boolean;
  setShowProfileCompleteModal: (show: boolean) => void;
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skillsRequired: [] as string[],
    skillsPreferred: [] as string[],
    mode: 'Remote',
    internshipType: 'Paid',
    duration: '',
    stipend: '',
    location: '',
    openings: '',
    eligibilityCriteria: '',
    applicationDeadline: '',
    startDate: '',
    endDate: '',
    status: 'OPEN'
  });

  const calculateEndDateFromDuration = (startDateStr: string, durationStr: string): string => {
    if (!startDateStr || !durationStr) return '';
    const date = new Date(startDateStr);
    if (isNaN(date.getTime())) return '';

    const lower = durationStr.toLowerCase().trim();
    const digitMatch = lower.match(/(\d+)/);
    if (!digitMatch) return '';
    const amount = parseInt(digitMatch[1], 10);
    if (amount <= 0) return '';

    if (lower.includes('week') || lower.includes('wk') || lower.endsWith('w')) {
      date.setDate(date.getDate() + amount * 7);
    } else if (lower.includes('day') || lower.endsWith('d')) {
      date.setDate(date.getDate() + amount);
    } else if (lower.includes('year') || lower.includes('yr') || lower.endsWith('y')) {
      date.setFullYear(date.getFullYear() + amount);
    } else {
      date.setMonth(date.getMonth() + amount);
    }

    return date.toISOString().split('T')[0];
  };

  const handleDurationChange = (val: string) => {
    const autoEnd = calculateEndDateFromDuration(formData.startDate, val);
    setFormData((prev) => ({
      ...prev,
      duration: val,
      ...(autoEnd ? { endDate: autoEnd } : {}),
    }));
  };

  const handleStartDateChange = (val: string) => {
    const autoEnd = calculateEndDateFromDuration(val, formData.duration);
    setFormData((prev) => {
      let updatedDeadline = prev.applicationDeadline;
      if (updatedDeadline && val && updatedDeadline > val) {
        updatedDeadline = val;
      }
      return {
        ...prev,
        startDate: val,
        applicationDeadline: updatedDeadline,
        ...(autoEnd ? { endDate: autoEnd } : {}),
      };
    });
  };

  const handleAiExtract = async () => {
    if (!formData.description) {
      alert('Please enter a description first.');
      return;
    }
    setExtracting(true);
    try {
      const res = await fetch(`${AI_MATCHER_BASE_URL}/api/extract-skills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: formData.description })
      });
      const data = await res.json();
      if (data.extractedSkills && data.extractedSkills.length) {
        setFormData((prev: any) => ({
          ...prev,
          skillsRequired: Array.from(new Set([...(prev.skillsRequired || []), ...data.extractedSkills]))
        }));
        alert(`✨ AI extracted ${data.extractedSkills.length} skills!`);
      } else {
        alert('No new skills extracted.');
      }
    } catch (e) {
      alert('Failed to auto-extract skills.');
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isProfileComplete()) {
      sessionStorage.setItem('redirectAfterProfile', window.location.pathname);
      setShowProfileCompleteModal(true);
      return;
    }

    if (!formData.skillsRequired.length) {
      alert('Please add at least one required skill.');
      return;
    }

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(formData.applicationDeadline);
    const startInternDate = new Date(formData.startDate);
    const endInternDate = new Date(formData.endDate);

    if (deadlineDate < today) {
      alert("Application deadline cannot be in the past.");
      return;
    }
    if (deadlineDate > startInternDate) {
      alert('Application deadline cannot exceed the internship start date.');
      return;
    }
    if (endInternDate <= startInternDate) {
      alert('End date must be after the start date.');
      return;
    }

    setLoading(true);
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const decoded: any = token ? jwtDecode(token) : null;
      const facultyId = (decoded?.sub ? String(decoded.sub).trim() : '') || localStorage.getItem('userEmail') || localStorage.getItem('facultyEmail') || '';
      const { skillsRequired, skillsPreferred, ...rest } = formData;
      const payload = {
        ...rest,
        skillsRequired: Array.isArray(skillsRequired) ? skillsRequired.join(', ') : (skillsRequired || ''),
        skillsPreferred: Array.isArray(skillsPreferred)
          ? skillsPreferred
          : typeof skillsPreferred === 'string'
          ? (skillsPreferred as string).split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        facultyId,
        status: 'OPEN',
        postedDate: new Date().toISOString().split('T')[0]
      };
      await api.post('/internships', payload);
      alert('🎉 Internship posted successfully!');
      navigate('/faculty');
    } catch (error: any) {
      console.error('Error posting internship:', error);
      alert('Failed to post internship: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const step1Complete = Boolean(formData.title && formData.description);
  const step2Complete = Boolean(formData.duration && formData.stipend && formData.location && formData.openings);
  const step3Complete = Boolean(formData.skillsRequired.length > 0 && formData.applicationDeadline && formData.startDate && formData.endDate && formData.eligibilityCriteria);

  const completedCount = (step1Complete ? 1 : 0) + (step2Complete ? 1 : 0) + (step3Complete ? 1 : 0);
  const progressPercent = Math.round((completedCount / 3) * 100);

  // High height input styling
  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '52px',
    padding: '0 18px',
    borderRadius: '14px',
    border: '1px solid rgba(56, 189, 248, 0.35)',
    fontSize: '14px',
    fontWeight: 600,
    color: '#ffffff',
    outline: 'none',
    background: 'rgba(6, 22, 61, 0.95)',
    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.4)',
    transition: 'all 0.2s ease',
  };

  // High height textarea styling
  const textareaStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px 18px',
    borderRadius: '14px',
    border: '1px solid rgba(56, 189, 248, 0.35)',
    fontSize: '14px',
    fontWeight: 500,
    color: '#ffffff',
    outline: 'none',
    background: 'rgba(6, 22, 61, 0.95)',
    resize: 'vertical',
    lineHeight: 1.6,
    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.4)',
    transition: 'all 0.2s ease',
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(10, 26, 68, 0.88)',
    border: '1px solid rgba(56, 189, 248, 0.3)',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 12px 30px -8px rgba(6, 18, 51, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  };

  const cardHeaderStyle: React.CSSProperties = {
    padding: '18px 24px',
    borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    background: 'linear-gradient(90deg, rgba(8, 24, 66, 0.75) 0%, rgba(12, 32, 84, 0.45) 100%)',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 800,
    color: '#cbd5e1',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    marginBottom: '8px',
    display: 'block',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 overflow-y-auto">
      <div
        className="relative w-full max-w-[740px] max-h-[92vh] overflow-y-auto bg-[#081330] border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-6 text-white my-auto custom-scrollbar"
        style={{ margin: 'auto' }}
      >
        {/* Background Glow Blobs */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          left: '20%',
          width: '320px',
          height: '320px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.14) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Header Banner with Close X Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '14px',
                background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)',
                flexShrink: 0
              }}>
                <Plus size={22} strokeWidth={3} />
              </div>
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff', margin: 0 }}>Create Internship / Project</h1>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Post a new research project position for students</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              title="Close Form Popup"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Progress Badge */}
          <div style={{
            background: 'rgba(10, 26, 68, 0.9)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '14px',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(2, 10, 36, 0.4)',
          }}>
            <Zap size={15} style={{ color: '#38bdf8' }} />
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#ffffff' }}>{progressPercent}% Completed</div>
              <div style={{ fontSize: '9px', color: '#94a3b8' }}>{completedCount} of 3 Steps filled</div>
            </div>
          </div>
        </div>

        {/* Progress Steps Banner */}
        <div style={{
          background: 'rgba(10, 26, 68, 0.88)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '18px',
          padding: '16px 20px',
          marginBottom: '24px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 10px 25px rgba(2, 10, 36, 0.5)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
            {/* Step 1 Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%',
                background: step1Complete ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
                color: '#fff', fontSize: '12px', fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                boxShadow: step1Complete ? '0 0 10px rgba(16, 185, 129, 0.4)' : '0 0 10px rgba(59, 130, 246, 0.4)'
              }}>
                {step1Complete ? <Check size={15} strokeWidth={3} /> : '1'}
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#ffffff' }}>Basic Info</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>Role & mode</div>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: '20px', borderTop: '2px dashed rgba(56, 189, 248, 0.25)', margin: '0 6px' }} />

            {/* Step 2 Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%',
                background: step2Complete ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(15, 23, 42, 0.7)',
                color: step2Complete ? '#fff' : '#94a3b8',
                border: step2Complete ? 'none' : '1px solid rgba(148, 163, 184, 0.3)',
                fontSize: '12px', fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                boxShadow: step2Complete ? '0 0 10px rgba(16, 185, 129, 0.4)' : 'none'
              }}>
                {step2Complete ? <Check size={15} strokeWidth={3} /> : '2'}
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: step2Complete ? '#ffffff' : '#cbd5e1' }}>Compensation</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>Duration & stipend</div>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: '20px', borderTop: '2px dashed rgba(56, 189, 248, 0.25)', margin: '0 6px' }} />

            {/* Step 3 Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%',
                background: step3Complete ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(15, 23, 42, 0.7)',
                color: step3Complete ? '#fff' : '#94a3b8',
                border: step3Complete ? 'none' : '1px solid rgba(148, 163, 184, 0.3)',
                fontSize: '12px', fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                boxShadow: step3Complete ? '0 0 10px rgba(16, 185, 129, 0.4)' : 'none'
              }}>
                {step3Complete ? <Check size={15} strokeWidth={3} /> : '3'}
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: step3Complete ? '#ffffff' : '#cbd5e1' }}>Requirements</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>Skills & timeline</div>
              </div>
            </div>
          </div>

          {/* Dynamic Progress Bar Track */}
          <div style={{ width: '100%', height: '5px', background: 'rgba(6, 22, 61, 0.8)', borderRadius: '10px', overflow: 'hidden', marginTop: '4px' }}>
            <div style={{
              height: '100%',
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, #3b82f6 0%, #38bdf8 50%, #10b981 100%)',
              borderRadius: '10px',
              transition: 'width 0.4s ease-in-out',
              boxShadow: '0 0 10px rgba(56, 189, 248, 0.6)'
            }} />
          </div>
        </div>

        {/* MAIN FORM */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* STEP 1 CARD */}
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '12px',
                  background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa',
                  border: '1px solid rgba(96, 165, 250, 0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Building2 size={18} />
                </div>
                <div>
                  <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', margin: 0 }}>Basic Information</h2>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0', fontWeight: 500 }}>Provide the primary role title, description, and work arrangements.</p>
                </div>
              </div>
              <span style={{
                background: 'rgba(59, 130, 246, 0.18)', color: '#60a5fa',
                border: '1px solid rgba(96, 165, 250, 0.35)', borderRadius: '18px',
                padding: '4px 12px', fontSize: '9.5px', fontWeight: 900,
                letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0
              }}>
                STEP 1 OF 3
              </span>
            </div>

            <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}>
                  INTERNSHIP TITLE <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Briefcase size={18} style={{ position: 'absolute', left: '16px', color: '#38bdf8', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Full Stack Web Developer Intern"
                    style={{ ...inputStyle, paddingLeft: '48px' }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '10px' }}>
                  <label style={{ ...labelStyle, margin: 0 }}>
                    DESCRIPTION & RESPONSIBILITIES <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <button
                    type="button"
                    disabled={extracting}
                    onClick={handleAiExtract}
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '16px',
                      padding: '6px 16px',
                      fontSize: '11px',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      flexShrink: 0,
                      boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)',
                      opacity: extracting ? 0.7 : 1,
                    }}
                  >
                    <Sparkles size={13} />
                    {extracting ? 'Extracting...' : '✨ AI Extract Skills'}
                  </button>
                </div>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide a detailed overview of internship responsibilities, key projects, technology stack, and learning objectives..."
                  style={{ ...textareaStyle, minHeight: '140px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
                {/* Work Mode Toggle */}
                <div>
                  <label style={labelStyle}>WORK MODE</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {[
                      { name: 'Remote', icon: Globe },
                      { name: 'Hybrid', icon: Building },
                      { name: 'On-site', icon: Laptop },
                    ].map((item) => {
                      const isSelected = formData.mode === item.name;
                      const IconComp = item.icon;
                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => setFormData({ ...formData, mode: item.name })}
                          style={{
                            height: '50px',
                            borderRadius: '14px',
                            fontSize: '12px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            background: isSelected ? 'rgba(59, 130, 246, 0.28)' : 'rgba(6, 22, 61, 0.6)',
                            color: isSelected ? '#38bdf8' : '#94a3b8',
                            border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(56, 189, 248, 0.2)',
                            boxShadow: isSelected ? '0 0 15px rgba(56, 189, 248, 0.35)' : 'none',
                          }}
                        >
                          <IconComp size={15} />
                          {item.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Internship Type Toggle */}
                <div>
                  <label style={labelStyle}>INTERNSHIP TYPE</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    {[
                      { name: 'Paid', icon: IndianRupee, color: '#34d399', bg: 'rgba(16, 185, 129, 0.25)', shadow: 'rgba(52, 211, 153, 0.35)' },
                      { name: 'Unpaid', icon: Gift, color: '#f87171', bg: 'rgba(239, 68, 68, 0.25)', shadow: 'rgba(248, 113, 113, 0.35)' },
                    ].map((item) => {
                      const isSelected = formData.internshipType === item.name;
                      const IconComp = item.icon;

                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => setFormData({ ...formData, internshipType: item.name })}
                          style={{
                            height: '50px',
                            borderRadius: '14px',
                            fontSize: '12px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            background: isSelected ? item.bg : 'rgba(6, 22, 61, 0.6)',
                            color: isSelected ? item.color : '#94a3b8',
                            border: isSelected ? `1px solid ${item.color}` : '1px solid rgba(56, 189, 248, 0.2)',
                            boxShadow: isSelected ? `0 0 15px ${item.shadow}` : 'none',
                          }}
                        >
                          <IconComp size={15} />
                          {item.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2 CARD */}
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '12px',
                  background: 'rgba(14, 165, 233, 0.2)', color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Clock size={18} />
                </div>
                <div>
                  <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', margin: 0 }}>Compensation & Logistics</h2>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0', fontWeight: 500 }}>Specify duration, monthly stipend, location and headcount.</p>
                </div>
              </div>
              <span style={{
                background: 'rgba(14, 165, 233, 0.18)', color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.35)', borderRadius: '18px',
                padding: '4px 12px', fontSize: '9.5px', fontWeight: 900,
                letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0
              }}>
                STEP 2 OF 3
              </span>
            </div>

            <div style={{ padding: '22px 24px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px' }}>
              <div>
                <label style={labelStyle}>
                  DURATION <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Clock size={18} style={{ position: 'absolute', left: '16px', color: '#38bdf8', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    required
                    value={formData.duration}
                    onChange={(e) => handleDurationChange(e.target.value)}
                    placeholder="e.g. 6 months or 8 weeks"
                    style={{ ...inputStyle, paddingLeft: '48px' }}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>
                  STIPEND <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <IndianRupee size={18} style={{ position: 'absolute', left: '16px', color: '#38bdf8', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    required
                    value={formData.stipend}
                    onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                    placeholder="e.g. ₹15,000/month or Unpaid"
                    style={{ ...inputStyle, paddingLeft: '48px' }}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>
                  LOCATION <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <MapPin size={18} style={{ position: 'absolute', left: '16px', color: '#38bdf8', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Bangalore or Remote"
                    style={{ ...inputStyle, paddingLeft: '48px' }}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>
                  NUMBER OF OPENINGS <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Users size={18} style={{ position: 'absolute', left: '16px', color: '#38bdf8', pointerEvents: 'none' }} />
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.openings}
                    onChange={(e) => setFormData({ ...formData, openings: e.target.value })}
                    placeholder="e.g. 5"
                    style={{ ...inputStyle, paddingLeft: '48px' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3 CARD */}
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.2)', color: '#34d399',
                  border: '1px solid rgba(52, 211, 153, 0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <GraduationCap size={18} />
                </div>
                <div>
                  <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', margin: 0 }}>Requirements & Timeline</h2>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0', fontWeight: 500 }}>Set required technical skills, student eligibility criteria and deadlines.</p>
                </div>
              </div>
              <span style={{
                background: 'rgba(16, 185, 129, 0.18)', color: '#34d399',
                border: '1px solid rgba(52, 211, 153, 0.35)', borderRadius: '18px',
                padding: '4px 12px', fontSize: '9.5px', fontWeight: 900,
                letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0
              }}>
                STEP 3 OF 3
              </span>
            </div>

            <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
                <div>
                  <SearchableSkillSelect
                    label="REQUIRED SKILLS *"
                    placeholder="Search required skills..."
                    value={formData.skillsRequired}
                    onChange={(newValue) => setFormData({ ...formData, skillsRequired: newValue.split(',').map(s => s.trim()).filter(Boolean) })}
                    category="Required Skill"
                  />
                </div>
                <div>
                  <SearchableSkillSelect
                    label="PREFERRED SKILLS"
                    placeholder="Search preferred skills..."
                    value={formData.skillsPreferred}
                    onChange={(newValue) => setFormData({ ...formData, skillsPreferred: newValue.split(',').map(s => s.trim()).filter(Boolean) })}
                    category="Preferred Skill"
                  />
                </div>
              </div>

              {/* Timeline Container */}
              <div style={{
                background: 'rgba(6, 22, 61, 0.6)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '16px',
                padding: '16px 20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
                  <Calendar size={16} />
                  <span>INTERNSHIP TIMELINE & DEADLINES</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>
                      APPLICATION DEADLINE <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type="date"
                        required
                        value={formData.applicationDeadline}
                        min={new Date().toISOString().split('T')[0]}
                        max={formData.startDate}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (formData.startDate && val > formData.startDate) {
                            alert("Application deadline cannot exceed the internship start date.");
                            setFormData({ ...formData, applicationDeadline: formData.startDate });
                          } else {
                            setFormData({ ...formData, applicationDeadline: val });
                          }
                        }}
                        style={{ ...inputStyle, paddingRight: '44px', colorScheme: 'dark' }}
                      />
                      <Calendar size={18} style={{ position: 'absolute', right: '16px', color: '#38bdf8', pointerEvents: 'none' }} />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>
                      START DATE <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type="date"
                        required
                        value={formData.startDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => handleStartDateChange(e.target.value)}
                        style={{ ...inputStyle, paddingRight: '44px', colorScheme: 'dark' }}
                      />
                      <Calendar size={18} style={{ position: 'absolute', right: '16px', color: '#38bdf8', pointerEvents: 'none' }} />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>
                      END DATE <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type="date"
                        required
                        value={formData.endDate}
                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        style={{ ...inputStyle, paddingRight: '44px', colorScheme: 'dark' }}
                      />
                      <Calendar size={18} style={{ position: 'absolute', right: '16px', color: '#38bdf8', pointerEvents: 'none' }} />
                    </div>
                    {formData.endDate && (
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#38bdf8', marginTop: '5px', display: 'block' }}>
                        ⚡ Auto-calculated from duration
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label style={labelStyle}>
                  ELIGIBILITY CRITERIA <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  required
                  value={formData.eligibilityCriteria}
                  onChange={(e) => setFormData({ ...formData, eligibilityCriteria: e.target.value })}
                  placeholder="e.g. Open to 3rd & 4th year B.Tech students in CSE/IT with 7.5+ CGPA and no active backlogs..."
                  style={{ ...textareaStyle, minHeight: '110px' }}
                />
              </div>
            </div>
          </div>

          {/* Floating Action Bar */}
          <div style={{
            background: 'rgba(8, 22, 58, 0.95)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            borderRadius: '20px',
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
            boxShadow: '0 10px 30px rgba(2, 10, 36, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(20px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>
              <CheckCircle2 size={16} style={{ color: '#38bdf8' }} />
              <span>All details will be published instantly to student portals.</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={() => navigate('/faculty')}
                style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  color: '#cbd5e1',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '20px',
                  padding: '10px 24px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '10px 28px',
                  fontSize: '13px',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(59, 130, 246, 0.45)',
                  opacity: loading ? 0.6 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Plus size={13} strokeWidth={3} />
                </div>
                {loading ? 'Publishing Opportunity...' : 'Publish Internship Role'}
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FacultyPostInternship;
