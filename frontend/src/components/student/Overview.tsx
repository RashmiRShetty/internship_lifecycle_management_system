import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  Send,
  Target,
  Search,
  User,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Award,
  Cpu,
  Zap,
  BookOpen,
  GraduationCap,
  Building,
  Users,
  MessageSquare,
  HelpCircle,
  Mail,
  MapPin,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { PrimaryButton, SecondaryButton } from './ui';

interface OverviewProps {
  internships?: any[];
  applications?: any[];
  profileData?: any;
  recommendations?: any[];
}

const OverviewStatCard = ({ icon: Icon, label, value, sub, cta, onClick }: any) => (
  <div className="relative rounded-[2.1rem] bg-gradient-to-br from-[#0b142c]/90 via-[#0a1126]/85 to-[#080e20]/90 border border-slate-700/60 p-6 sm:p-6.5 shadow-xl hover:border-slate-500 hover:shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between min-h-[152px] group overflow-hidden">
    <div className="absolute inset-0 rounded-[2.1rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] pointer-events-none" />
    <div className="relative flex items-center justify-between gap-2">
      <div className="w-12 h-12 rounded-[1.25rem] flex items-center justify-center shrink-0 bg-slate-800/80 text-sky-400 border border-slate-700 shadow-md">
        <Icon className="w-6 h-6" strokeWidth={2} />
      </div>
      <span className="mono-label-small text-slate-300 text-right truncate tracking-wider">{label}</span>
    </div>
    <div className="relative mt-4">
      <div className="text-3xl sm:text-[2.2rem] font-black tracking-tight text-white">{value}</div>
      <div className="mono-section-text text-[0.78rem] text-slate-300 mt-3 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
        <span className="truncate">{sub}</span>
        {cta && (
          <button onClick={onClick} className="text-sky-400 hover:text-sky-300 font-bold flex items-center hover:underline shrink-0 mono-label-small tracking-wider cursor-pointer transition-colors duration-200">
            {cta} <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        )}
      </div>
    </div>
  </div>
);

export const Overview: React.FC<OverviewProps> = ({
  internships = [],
  applications = [],
  profileData: _profileData,
  recommendations = [],
}) => {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeSlide, setActiveSlide] = useState(0);

  const departmentSlides = [
    {
      id: 1,
      name: 'Computer Science & AI Lab',
      tag: '● CS & AI Research Facility',
      image: '/dept_cs_ai.jpg',
      badgeColor: 'bg-cyan-400',
    },
    {
      id: 2,
      name: 'Electronics & Robotics Lab',
      tag: '● ECE & Hardware Lab',
      image: '/dept_ece_robotics.jpg',
      badgeColor: 'bg-blue-400',
    },
    {
      id: 3,
      name: 'Data Science & Biotech Lab',
      tag: '● Data Science & Biotech Lab',
      image: '/dept_data_biotech.jpg',
      badgeColor: 'bg-purple-400',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % departmentSlides.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [departmentSlides.length]);

  const openRolesCount = internships.length || 4;
  const appliedCount = applications.length || 2;
  const underReviewCount = applications.filter((a: any) => a.status === 'APPLIED' || a.status === 'UNDER_REVIEW').length || 1;
  const shortlistedCount = applications.filter((a: any) => a.status === 'SHORTLISTED').length;
  const interviewsCount = applications.filter((a: any) => a.status === 'INTERVIEW').length;
  const offersCount = applications.filter((a: any) => a.status === 'SELECTED').length;

  const matchScores = recommendations.map((r: any) => r.matchPercentage || 0);
  const avgMatchPercentage =
    matchScores.length > 0
      ? Math.round(matchScores.reduce((sum: number, val: number) => sum + val, 0) / matchScores.length)
      : 78;

  const faqs = [
    {
      q: 'How does the ML Semantic Matching Engine calculate my internship fit percentage?',
      a: 'The engine analyzes your profile skills, completed coursework, project repository links, and academic domain preferences against internship requirements. It runs TF-IDF semantic vector similarity to rank roles with high precision.',
    },
    {
      q: 'When and how can I download my official MIT digital certificate?',
      a: 'Once your faculty supervisor marks your internship as COMPLETED and authorizes certificate generation, an official PDF certificate with verified QR code credential and MIT digital seal becomes available in your Projects tab.',
    },
    {
      q: 'How are weekly milestone project deliverables graded and reviewed?',
      a: 'Each week, students upload progress summaries and code/document deliverables in the Task Grid. Faculty supervisors receive instant notifications to review work, provide text feedback, or approve milestones.',
    },
    {
      q: 'Can I apply for multiple faculty research projects simultaneously?',
      a: 'Yes! Students can apply for multiple open positions. You can track real-time evaluation stages (Under Review, Shortlisted, Interview, Selected) directly on your Applications Dashboard.',
    },
    {
      q: 'How do I schedule technical interviews or project sync meetings with faculty?',
      a: 'You can request 1-on-1 virtual or in-person meetings through the Meetings tab. Supervisors accept requests and link Google Meet or office location details automatically.',
    },
  ];

  const capabilities = [
    {
      icon: Cpu,
      title: 'ML Matching Engine',
      desc: 'Smart 60%+ rank algorithm matching candidate skills and coursework with open faculty projects.',
    },
    {
      icon: Target,
      title: 'Weekly Task Grid',
      desc: 'Structured milestone tracking, report submissions, file attachments, and versioned submission logs.',
    },
    {
      icon: Award,
      title: 'MIT Verified PDF Certificates',
      desc: 'Authentic digital certificate generation with official letterhead, seal, and faculty signatures.',
    },
    {
      icon: Calendar,
      title: 'Integrated Meeting Scheduler',
      desc: 'Seamless calendar scheduling for technical interviews and project reviews with Google Meet links.',
    },
    {
      icon: ShieldCheck,
      title: 'Security & OTP Verification',
      desc: 'Email OTP-authenticated password updates and encrypted candidate credentials protection.',
    },
    {
      icon: Zap,
      title: 'Real-time Applications Tracking',
      desc: 'Live candidate evaluation pipeline from application submission to offer letter issuance.',
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'Complete Candidate Profile',
      desc: 'Add your skills, interests, past projects, certificates, and completed academic courseworks.',
    },
    {
      num: '02',
      title: 'Explore ML Recommendations',
      desc: 'Browse tailored internship postings ranked by our semantic matching engine.',
    },
    {
      num: '03',
      title: 'Faculty Interview & Selection',
      desc: 'Engage in 1-on-1 scheduled syncs and receive official internship offer letters.',
    },
    {
      num: '04',
      title: 'Execute Tasks & Get Certified',
      desc: 'Submit weekly milestone reports and claim your verified MIT digital certificate PDF.',
    },
  ];

  return (
    <div className="space-y-14 pb-14 w-full font-sans text-slate-100 relative dashboard-panel">

      {/* 1. Futuristic Hero Section matching exact reference design (media_1789317779686.png) - Borderless edge-to-edge layout */}
      <section className="relative overflow-hidden py-6 sm:py-8 lg:py-10 px-2 sm:px-4">
        {/* Ambient background glow blurs */}
        <div
          className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(34, 211, 238, 0.22) 0%, rgba(37, 99, 235, 0.12) 50%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute -bottom-20 -right-20 w-[550px] h-[550px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.3) 0%, rgba(29, 78, 216, 0.2) 50%, transparent 70%)',
            filter: 'blur(75px)',
          }}
        />
        {/* Bottom right electric cyan flourish curve */}
        <div
          className="absolute -bottom-16 -right-16 w-[420px] h-[420px] rounded-full opacity-90 pointer-events-none z-10"
          style={{
            background: 'radial-gradient(circle at 100% 100%, rgba(34, 211, 238, 0.6) 0%, rgba(37, 99, 235, 0.3) 45%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[480px]">
          {/* Left Column: Headline, subtext, CTA buttons, dot matrix - 50% Width */}
          <div className="w-full space-y-6 relative z-20 my-auto flex flex-col justify-center items-start pl-2 sm:pl-4">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/25 text-cyan-300 backdrop-blur-md">
              <span className="text-cyan-400 text-xs">✦</span>
              <span className="font-mono text-xs text-sky-200 tracking-[0.2em] uppercase font-bold">CREATIVE STUDIO • LAB</span>
            </div>

            {/* Giant Headline */}
            <div className="space-y-4 max-w-xl">
              <h1 className="text-4xl sm:text-5xl lg:text-[4.4rem] font-black tracking-tight leading-[0.98] text-white">
                <span className="block">Let&apos;s get</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 drop-shadow-[0_0_35px_rgba(34,211,238,0.5)]">
                  digital
                </span>
              </h1>
              <p className="text-cyan-400 font-mono text-xs sm:text-sm tracking-[0.25em] uppercase font-extrabold pt-1">
                OUR NEW DIGITAL MARKETING PACKAGES ARE HERE
              </p>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl font-medium pt-0.5">
                Explore faculty research projects, submit weekly milestone deliverables, track your AI skill compatibility, and claim verified MIT digital certificates.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-2 flex-wrap">
              <button
                className="inline-flex items-center gap-2 py-3.5 px-8 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-600 hover:brightness-110 text-white font-extrabold text-xs sm:text-sm shadow-[0_12px_35px_-8px_rgba(34,211,238,0.55)] transition duration-300 cursor-pointer"
                onClick={() => navigate('/student/internships')}
              >
                <Search className="w-4.5 h-4.5" />
                <span>Learn More</span>
              </button>
              <button
                className="inline-flex items-center gap-2 py-3.5 px-8 rounded-full bg-white/5 border border-white/15 hover:bg-white/12 text-white font-bold text-xs sm:text-sm backdrop-blur-md transition duration-300 cursor-pointer shadow-lg"
                onClick={() => navigate('/student/profile')}
              >
                <User className="w-4.5 h-4.5 text-cyan-300" />
                <span>Profile Settings</span>
              </button>
            </div>

            {/* Bottom-left Dot Matrix Pattern */}
            <div className="grid grid-cols-8 gap-2.5 w-36 opacity-30 pt-4">
              {Array.from({ length: 32 }).map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              ))}
            </div>
          </div>

          {/* Right Column: Sliding image - Exact Half Page (50% Width) & Completely Borderless */}
          <div className="w-full relative h-[450px] sm:h-[500px] lg:h-[540px] flex items-center justify-center z-20 my-auto">
            <div className="relative z-10 w-full h-full rounded-[2.5rem] overflow-hidden bg-transparent border-0 outline-none group">
              {departmentSlides.map((slide, idx) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    idx === activeSlide ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={slide.name}
                    className="w-full h-full object-cover object-center rounded-[2.5rem] border-0 outline-none shadow-2xl"
                  />
                  {/* Seamless left-to-right, top-to-bottom and bottom-to-top gradient blend masks */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#06112e] via-[#06112e]/30 to-transparent rounded-[2.5rem]" />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#06112e]/35 via-transparent to-transparent rounded-[2.5rem]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#06112e] via-[#06112e]/25 to-transparent rounded-[2.5rem]" />

                  {/* Top Badge Pill - Borderless */}
                  <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-xl px-4.5 py-2 rounded-full text-white shadow-xl flex items-center gap-2.5 z-20 border-0">
                    <span className="text-cyan-400 text-sm">🧪</span>
                    <span className="font-mono text-xs sm:text-sm text-sky-200 tracking-wider font-bold">{slide.tag.replace('● ', '')}</span>
                  </div>

                  {/* Bottom Text Overlay & Carousel Dots - Borderless */}
                  <div className="absolute bottom-6 inset-x-6 flex items-end justify-between gap-3 text-white z-20">
                    <div>
                      <p className="font-mono text-xs text-cyan-400 tracking-widest uppercase font-extrabold">DEPARTMENT LAB</p>
                      <h4 className="text-xl sm:text-2xl font-black text-white mt-0.5 tracking-tight drop-shadow-md">{slide.name}</h4>
                    </div>

                    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xl px-3.5 py-2 rounded-full shrink-0 border-0">
                      {departmentSlides.map((_, dotIdx) => (
                        <button
                          key={dotIdx}
                          onClick={() => setActiveSlide(dotIdx)}
                          className={`transition-all duration-300 rounded-full cursor-pointer ${
                            dotIdx === activeSlide
                              ? 'w-6 h-2.5 bg-gradient-to-r from-cyan-300 to-blue-500 shadow-[0_0_12px_rgba(34,211,238,0.8)]'
                              : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/80'
                          }`}
                          title={`Go to slide ${dotIdx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => setActiveSlide((prev) => (prev === 0 ? departmentSlides.length - 1 : prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-xl transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-xl hover:scale-105 border-0"
                title="Previous Department"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={() => setActiveSlide((prev) => (prev + 1) % departmentSlides.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-xl transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-xl hover:scale-105 border-0"
                title="Next Department"
              >
                <ChevronRight size={22} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Grow Your Presence style section with staggered notched images + mono text */}
      <section className="relative py-12 -mx-4 sm:-mx-8 px-4 sm:px-8 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(14, 165, 233, 0.1) 0%, transparent 70%), radial-gradient(ellipse 60% 45% at 0% 100%, rgba(29,78,216,0.12) 0%, transparent 70%), radial-gradient(ellipse 55% 40% at 100% 0%, rgba(94,234,212,0.1) 0%, transparent 70%), linear-gradient(180deg, rgba(3,5,12,0) 0%, rgba(5,12,38,0.5) 50%, rgba(3,5,12,0) 100%)',
          }}
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left image - notched top-left/bottom-left */}
          <div className="lg:col-span-4 relative flex justify-center lg:justify-start">
            <div className="relative notched-img w-full max-w-[290px] sm:max-w-[330px]">
              <div className="overflow-hidden rounded-[2.15rem] shadow-[0_35px_80px_-20px_rgba(0,0,0,0.9),0_0_60px_-15px_rgba(56,189,248,0.22)]">
                <img
                  src="/mit_lab_student.jpg"
                  alt="Student working in lab"
                  className="w-full h-[290px] sm:h-[330px] object-cover"
                />
              </div>
              <div className="absolute inset-0 rounded-[2.15rem] shadow-[inset_0_1.5px_0_rgba(255,255,255,0.09)] pointer-events-none" />
            </div>
          </div>

          {/* Middle content - large heading + mono body */}
          <div className="lg:col-span-4 text-center lg:text-left space-y-5.5">
            <h2 className="text-4xl sm:text-5xl lg:text-[3.6rem] font-black text-white tracking-tight leading-[1.05] drop-shadow-[0_0_25px_rgba(56,189,248,0.18)]">
              Grow your
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-cyan-300 to-teal-300 drop-shadow-[0_0_30px_rgba(56,189,248,0.4)]">presence.</span>
            </h2>
            <p className="mono-section-text text-slate-200/90 leading-[1.95] max-w-md mx-auto lg:mx-0">
              We&apos;ll help put your company on the digital map,
              through websites and social platforms.
            </p>
            <p className="mono-section-text text-slate-300/85 leading-[1.95] max-w-md mx-auto lg:mx-0 text-[0.82rem]">
              Build your academic portfolio, connect with research faculty,
              and showcase your credentials through verified MIT digital certificates.
            </p>
          </div>

          {/* Right image - notched top-right */}
          <div className="lg:col-span-4 relative flex justify-center lg:justify-end">
            <div className="relative notched-img notched-img-top-right w-full max-w-[270px] sm:max-w-[310px] mt-10 sm:mt-20">
              <div className="overflow-hidden rounded-[2.15rem] shadow-[0_35px_80px_-20px_rgba(0,0,0,0.9),0_0_60px_-15px_rgba(56,189,248,0.22)]">
                <img
                  src="/dashboard_hero.jpg"
                  alt="Faculty mentorship"
                  className="w-full h-[270px] sm:h-[310px] object-cover"
                />
              </div>
              <div className="absolute inset-0 rounded-[2.15rem] shadow-[inset_0_1.5px_0_rgba(255,255,255,0.09)] pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Stat Cards */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <OverviewStatCard
            icon={Briefcase}
            label="Available roles"
            value={openRolesCount}
            sub="Active listings"
            cta="View all"
            onClick={() => navigate('/student/internships')}
          />
          <OverviewStatCard
            icon={FileText}
            label="Applications"
            value={appliedCount}
            sub={`${underReviewCount} under evaluation`}
            cta="View all"
            onClick={() => navigate('/student/applications')}
          />
          <OverviewStatCard
            icon={Send}
            label="Selection track"
            value={shortlistedCount + interviewsCount + offersCount || 1}
            sub={`${interviewsCount} Interviews · ${offersCount} Offers`}
            cta="Track"
            onClick={() => navigate('/student/applications')}
          />
          <OverviewStatCard
            icon={Target}
            label="Profile readiness"
            value={avgMatchPercentage > 0 ? 'Ready' : 'Review'}
            sub="Average profile fit"
            cta="Improve"
            onClick={() => navigate('/student/profile')}
          />
        </div>
      </section>

      {/* 4. What Customers Say — testimonials section with full blue gradient */}
      <section className="relative -mx-4 sm:-mx-8 px-4 sm:px-8 py-16 overflow-hidden rounded-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 0% 40%, rgba(29, 78, 216, 0.65) 0%, transparent 65%), radial-gradient(ellipse 70% 50% at 100% 60%, rgba(56, 189, 248, 0.5) 0%, transparent 60%), linear-gradient(180deg, #06112e 0%, #0b245e 20%, #103282 50%, #0b245e 80%, #06112e 100%)',
          }}
        />
        <div
          className="blob-decoration"
          style={{
            top: '10%',
            left: '5%',
            width: '320px',
            height: '320px',
            background:
              'linear-gradient(135deg, rgba(56, 189, 248, 0.35), rgba(37, 99, 235, 0.22))',
            filter: 'blur(55px)',
            opacity: 0.7,
          }}
        />
        <div
          className="blob-decoration"
          style={{
            bottom: '5%',
            right: '8%',
            width: '360px',
            height: '360px',
            background:
              'linear-gradient(135deg, rgba(94, 234, 212, 0.22), rgba(56, 189, 248, 0.3))',
            filter: 'blur(55px)',
            opacity: 0.65,
            animationDelay: '-12s',
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-[0_0_30px_rgba(56,189,248,0.25)]">
              What Customers Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
            {[
              {
                quote: 'Their creativity, attention to detail, and ability to bring our vision to life made us feel like we finally had a partner who got it.',
                author: 'Ananya Patel',
                role: 'B.Tech Computer Science (7th Sem)',
                initials: 'AP',
              },
              {
                quote: 'The team at Creative Studio + Lab took our scattered ideas and turned them into a polished, cohesive brand identity.',
                author: 'Dr. Rajesh Kumar',
                role: 'Professor & Research Supervisor, MIT',
                initials: 'RK',
              },
              {
                quote: 'I\'ve worked with other agencies before, but Creative Studio + Lab delivered fresh, creative concepts that blew us away.',
                author: 'Karthik Sharma',
                role: 'ECE Robotics Research Intern',
                initials: 'KS',
              },
            ].map((t, idx) => (
              <div
                key={idx}
                className="relative rounded-[2.1rem] p-6 sm:p-8 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-blue-950/30 border border-white/14 backdrop-blur-[32px] saturate-[200%] shadow-[0_35px_80px_-20px_rgba(0,0,0,0.9),0_0_60px_-20px_rgba(56,189,248,0.22)] hover:shadow-sky-900/40 hover:border-sky-400/35 transition-all duration-350 hover:-translate-y-1.5 overflow-hidden group"
              >
                <div className="absolute inset-0 rounded-[2.1rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.11),inset_0_0_0_1px_rgba(255,255,255,0.035)] pointer-events-none" />
                <div className="absolute -top-14 -left-12 w-44 h-44 rounded-full bg-gradient-to-br from-sky-500/22 via-cyan-400/12 to-transparent blur-3xl group-hover:from-sky-500/34 transition-all duration-500 pointer-events-none" />
                <div className="absolute -bottom-16 -right-12 w-52 h-52 rounded-full bg-gradient-to-br from-violet-500/12 via-blue-500/8 to-transparent blur-3xl group-hover:from-violet-500/20 transition-all duration-500 pointer-events-none" />
                <div className="absolute top-5 right-6 text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-sky-400/30 via-cyan-400/20 to-blue-500/10 leading-none select-none pointer-events-none">
                  &ldquo;
                </div>
                <p className="relative mono-section-text text-slate-100/92 leading-[2.0] text-[0.86rem] pr-2">
                  {t.quote}
                </p>
                <div className="relative mt-7 pt-6 border-t border-white/12 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 via-sky-500 to-cyan-400 text-white font-black text-[0.9rem] flex items-center justify-center shadow-[0_12px_30px_-6px_rgba(56,189,248,0.55)] ring-2 ring-sky-400/35 ring-offset-2 ring-offset-transparent shrink-0">
                    {t.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="section-label-mono text-white tracking-normal text-[0.78rem] uppercase font-black truncate">
                      {t.author}
                    </div>
                    <div className="mono-section-text text-[0.74rem] text-sky-200/85 mt-0.5 leading-snug">
                      {t.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Core Platform Capabilities */}
      <section className="space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="section-label-mono text-sky-300/80 mb-2 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-sky-400" /> Platform Highlights
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
              Portal Capabilities &amp; Features
            </h2>
          </div>
          <SecondaryButton onClick={() => navigate('/student/internships')}>
            Explore Opportunities <ChevronRight className="w-4 h-4" />
          </SecondaryButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap, idx) => {
            const IconComponent = cap.icon;
            return (
              <div
                key={idx}
                className="relative rounded-[2.1rem] p-6 sm:p-7 bg-gradient-to-br from-slate-900/65 via-slate-900/55 to-blue-950/30 border border-sky-400/15 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.85),0_0_50px_-15px_rgba(56,189,248,0.18)] hover:shadow-sky-900/40 hover:border-sky-400/38 backdrop-blur-2xl saturate-[190%] transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between gap-6 group overflow-hidden"
              >
                <div className="absolute inset-0 rounded-[2.1rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.085),inset_0_0_0_1px_rgba(255,255,255,0.028)] pointer-events-none" />
                <div className="absolute -top-14 -right-14 w-48 h-48 rounded-full bg-gradient-to-br from-sky-500/18 via-cyan-400/12 to-blue-600/8 blur-3xl group-hover:from-sky-500/28 group-hover:via-cyan-400/18 group-hover:to-blue-600/14 transition-all duration-500 pointer-events-none" />
                <div className="absolute -bottom-16 -left-14 w-52 h-52 rounded-full bg-gradient-to-br from-teal-500/12 via-emerald-500/8 to-transparent blur-3xl group-hover:from-teal-500/20 transition-all duration-500 pointer-events-none" />
                <div className="relative w-14 h-14 rounded-[1.45rem] flex items-center justify-center shrink-0 bg-gradient-to-br from-sky-500/22 via-cyan-400/16 to-blue-600/18 text-sky-300 border border-sky-400/32 shadow-[inset_0_1.5px_0_rgba(255,255,255,0.2),0_14px_30px_-8px_rgba(56,189,248,0.4)]">
                  <IconComponent className="w-7 h-7" strokeWidth={2.1} />
                </div>
                <div className="relative space-y-2.5">
                  <h3 className="text-base sm:text-[1.05rem] font-black text-white tracking-tight">{cap.title}</h3>
                  <p className="mono-section-text text-[0.8rem] text-slate-300/85 leading-[1.95]">{cap.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. How It Works (4-Step Flow) — NO OUTER FRAME */}
      <section className="relative py-8 -mx-4 sm:-mx-8 px-4 sm:px-8 overflow-hidden rounded-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 75% 55% at 50% 0%, rgba(14, 165, 233, 0.13) 0%, transparent 65%), radial-gradient(ellipse 60% 45% at 100% 100%, rgba(56,189,248,0.1) 0%, transparent 60%), linear-gradient(180deg, rgba(3,5,12,0) 0%, rgba(8,16,48,0.55) 50%, rgba(3,5,12,0) 100%)',
          }}
        />
        <div
          className="blob-decoration"
          style={{
            top: '-10%',
            left: '20%',
            width: '320px',
            height: '320px',
            background:
              'linear-gradient(135deg, rgba(56,189,248,0.28), rgba(37,99,235,0.18))',
            filter: 'blur(55px)',
            opacity: 0.75,
            animationDelay: '-3s',
          }}
        />
        <div className="relative z-10 space-y-8">
          <div>
            <div className="section-label-mono text-sky-300/80 mb-2 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-sky-400" /> Internship Workflow
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
              How InternSmart Works
            </h2>
            <p className="mono-section-text text-[0.82rem] text-slate-300 mt-2 leading-[1.85] max-w-2xl">
              Follow four simple steps from candidate profile setup to verified MIT certificate issuance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s, idx) => (
              <div
                key={idx}
                className="relative rounded-[1.85rem] p-5 sm:p-6 bg-gradient-to-br from-slate-900/65 via-slate-900/55 to-blue-950/30 border border-sky-400/15 backdrop-blur-2xl shadow-[0_25px_55px_-20px_rgba(0,0,0,0.75),0_0_40px_-10px_rgba(56,189,248,0.12)] hover:shadow-sky-900/35 hover:border-sky-400/35 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-gradient-to-br from-sky-500/18 to-blue-600/0 blur-2xl pointer-events-none group-hover:from-sky-500/28 transition-all duration-500" />
                <div className="absolute inset-0 rounded-[1.85rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_0_0_1px_rgba(255,255,255,0.025)] pointer-events-none" />
                <span className="relative text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-sky-400/75 via-cyan-400/55 to-blue-500/40 block tracking-tight drop-shadow-[0_0_18px_rgba(56,189,248,0.2)]">
                  {s.num}
                </span>
                <h3 className="relative text-sm sm:text-[1.02rem] font-black text-white mt-2 tracking-tight">{s.title}</h3>
                <p className="relative mono-section-text text-[0.78rem] text-slate-300/85 mt-2 leading-[1.9]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. MIT Internship Ecosystem Impact Stats */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: GraduationCap, value: '98.4%', label: 'Completion Rate', sub: 'Academic project completion', color: 'from-sky-300 to-blue-400' },
            { icon: Building, value: '150+', label: 'Faculty Projects', sub: 'Cutting-edge research labs', color: 'from-cyan-300 to-sky-400' },
            { icon: Award, value: '5,000+', label: 'Verified Certificates', sub: 'Issued to MIT students', color: 'from-emerald-300 to-teal-400' },
            { icon: Users, value: '200+', label: 'Faculty Supervisors', sub: 'Mentoring student candidates', color: 'from-sky-300 to-indigo-400' },
          ].map((s, idx) => (
            <div
              key={idx}
              className="relative rounded-[2.1rem] p-6 sm:px-7.5 sm:py-7 text-center bg-gradient-to-br from-slate-900/65 via-slate-900/55 to-blue-950/32 border border-sky-400/18 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.85),0_0_50px_-15px_rgba(56,189,248,0.18)] hover:shadow-sky-900/40 hover:border-sky-400/40 backdrop-blur-2xl saturate-[190%] transition-all duration-300 hover:-translate-y-1.5 overflow-hidden group"
            >
              <div className="absolute inset-0 rounded-[2.1rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.085),inset_0_0_0_1px_rgba(255,255,255,0.028)] pointer-events-none" />
              <div className="absolute -top-16 -left-16 w-52 h-52 rounded-full bg-gradient-to-br from-sky-500/18 via-cyan-400/10 to-transparent blur-3xl group-hover:from-sky-500/28 transition-all duration-500 pointer-events-none" />
              <div className="absolute -bottom-18 -right-16 w-56 h-56 rounded-full bg-gradient-to-br from-teal-500/14 via-emerald-500/8 to-transparent blur-3xl group-hover:from-teal-500/22 transition-all duration-500 pointer-events-none" />
              <s.icon className={`relative w-9 h-9 sm:w-10 sm:h-10 mx-auto mb-4`} style={{ stroke: 'url(#g1)', strokeWidth: 2.1 }} />
              <svg width="0" height="0">
                <defs>
                  <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#7dd3fc" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="relative text-3xl sm:text-[2.5rem] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-cyan-300 to-teal-300 drop-shadow-[0_0_24px_rgba(56,189,248,0.3)]">
                {s.value}
              </div>
              <div className="relative section-label-mono text-white tracking-normal text-[0.78rem] uppercase font-black mt-2.5">
                {s.label}
              </div>
              <div className="relative mono-section-text text-[0.74rem] text-slate-300/85 mt-1.5 leading-snug">
                {s.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. FAQ Section — NO OUTER FRAME */}
      <section className="relative py-10 -mx-4 sm:-mx-8 px-4 sm:px-8 overflow-hidden rounded-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 100% 100%, rgba(56, 189, 248, 0.12) 0%, transparent 60%), radial-gradient(ellipse 50% 45% at 0% 0%, rgba(29,78,216,0.1) 0%, transparent 60%), linear-gradient(180deg, rgba(3,5,12,0) 0%, rgba(6,14,44,0.55) 50%, rgba(3,5,12,0) 100%)',
          }}
        />
        <div className="relative z-10 space-y-7 max-w-5xl mx-auto">
          <div>
            <div className="section-label-mono text-sky-300/80 mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-sky-400" /> Knowledge Base
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={`relative rounded-[1.7rem] overflow-hidden transition-all duration-400 ${
                    isOpen
                      ? 'bg-gradient-to-br from-slate-900/80 via-slate-900/70 to-blue-950/30 border border-sky-400/32 shadow-[0_25px_55px_-20px_rgba(0,0,0,0.8),0_0_60px_-15px_rgba(56,189,248,0.22)]'
                      : 'bg-gradient-to-br from-slate-900/60 via-slate-900/50 to-slate-950/40 border border-sky-400/12 hover:border-sky-400/24 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.65)] hover:shadow-sky-900/15 hover:-translate-y-0.5'
                  }`}
                >
                  {isOpen && (
                    <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gradient-to-br from-sky-500/18 via-sky-400/10 to-transparent blur-3xl pointer-events-none" />
                  )}
                  <div className="absolute inset-0 rounded-[1.7rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="relative w-full p-4.5 sm:p-5.5 text-left flex items-center justify-between gap-3 font-bold text-[0.82rem] sm:text-sm text-white hover:text-sky-300 transition-all duration-200 cursor-pointer"
                  >
                    <span className="leading-relaxed pr-2">{faq.q}</span>
                    <div className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isOpen
                        ? 'bg-gradient-to-br from-sky-500/25 to-blue-600/18 border border-sky-400/35 text-sky-300 shadow-inner'
                        : 'bg-white/[0.04] border border-white/[0.08] text-slate-300'
                    }`}>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-sky-300' : ''}`} />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="relative px-4.5 sm:px-5.5 pb-5.5">
                      <div className="mono-section-text text-[0.8rem] text-slate-200/90 leading-[1.95] border-t border-sky-400/14 pt-4.5">
                        {faq.a}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. Questions Section — mint/teal gradient icon + contact info (NO OUTER FRAME) */}
      <section className="relative py-14 -mx-4 sm:-mx-8 px-4 sm:px-8 overflow-hidden rounded-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 75% 60% at 0% 50%, rgba(29, 78, 216, 0.55) 0%, transparent 68%), radial-gradient(ellipse 65% 50% at 100% 50%, rgba(56, 189, 248, 0.45) 0%, transparent 62%), radial-gradient(ellipse 50% 45% at 50% 100%, rgba(94,234,212,0.25) 0%, transparent 70%), linear-gradient(180deg, rgba(3,5,12,0) 0%, rgba(8,18,60,0.82) 50%, rgba(3,5,12,0) 100%)',
          }}
        />
        <div
          className="blob-decoration"
          style={{
            top: '-15%',
            left: '10%',
            width: '360px',
            height: '360px',
            background:
              'linear-gradient(135deg, rgba(94, 234, 212, 0.35), rgba(52, 211, 153, 0.25))',
            filter: 'blur(60px)',
            opacity: 0.75,
            animationDelay: '-5s',
          }}
        />
        <div
          className="blob-decoration"
          style={{
            bottom: '-18%',
            right: '12%',
            width: '400px',
            height: '400px',
            background:
              'linear-gradient(135deg, rgba(56, 189, 248, 0.32), rgba(29, 78, 216, 0.22))',
            filter: 'blur(65px)',
            opacity: 0.7,
            animationDelay: '-10s',
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left: Mint/teal pixel-grid icon inside glass card with notched corner */}
          <div className="lg:col-span-5 flex justify-center lg:justify-start relative">
            <div className="hero-glass-card p-8 sm:p-11 max-w-[380px] w-full relative">
              <div className="absolute -top-6 -right-6 w-24 h-24 border-t-[18px] border-r-[18px] border-emerald-200/10 rounded-tr-[2rem] pointer-events-none z-30" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 border-b-[18px] border-l-[18px] border-sky-200/10 rounded-bl-[2rem] pointer-events-none z-30" />
              <div className="grid grid-cols-4 grid-rows-4 gap-2.5 sm:gap-3 aspect-square max-w-[280px] mx-auto relative z-10">
                {[
                  1, 1, 0, 0,
                  1, 0, 1, 0,
                  0, 1, 0, 1,
                  0, 0, 1, 1,
                ].map((fill, i) => (
                  <div
                    key={i}
                    className={`rounded-[0.95rem] transition-all duration-500 ${
                      fill
                        ? 'bg-gradient-to-br from-emerald-300 via-teal-300 to-sky-400 shadow-[0_0_22px_rgba(52,211,153,0.45),inset_0_1.5px_0_rgba(255,255,255,0.3)]'
                        : 'bg-white/[0.04] border border-white/[0.09] rounded-[0.95rem]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Questions heading + mono contact details */}
          <div className="lg:col-span-7 space-y-7 lg:space-y-8">
            <h2 className="text-4xl sm:text-5xl lg:text-[3.9rem] font-black tracking-tight text-white leading-[1.02] drop-shadow-[0_0_28px_rgba(56,189,248,0.18)]">
              Questions?
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5 mono-section-text text-sky-100/90 leading-relaxed">
                <div className="w-8 h-8 shrink-0 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-600/14 border border-sky-400/25 flex items-center justify-center mt-0.5 shadow-inner">
                  <MapPin className="w-4 h-4 text-sky-300" />
                </div>
                <span className="pt-1">MIT Campus, Manipal, KA 576104</span>
              </div>
              <div className="flex items-start gap-3.5 mono-section-text text-sky-100/90 leading-relaxed">
                <div className="w-8 h-8 shrink-0 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-600/14 border border-sky-400/25 flex items-center justify-center mt-0.5 shadow-inner">
                  <PhoneIcon />
                </div>
                <span className="pt-1">+91 820 2571060</span>
              </div>
              <div className="flex items-start gap-3.5 mono-section-text text-sky-100/90 leading-relaxed">
                <div className="w-8 h-8 shrink-0 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-600/14 border border-sky-400/25 flex items-center justify-center mt-0.5 shadow-inner">
                  <Mail className="w-4 h-4 text-sky-300" />
                </div>
                <a href="mailto:internships@manipal.edu" className="pt-1 hover:text-cyan-300 transition-colors duration-200 cursor-pointer underline decoration-sky-400/45 underline-offset-4">
                  internships@manipal.edu
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2 flex-wrap">
              <PrimaryButton onClick={() => navigate('/student/meetings')}>
                <Calendar className="w-4 h-4 text-white" /> Schedule Helpdesk Sync
              </PrimaryButton>
              <button
                onClick={() => navigate('/student/messages')}
                className="py-3.5 px-7 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white font-bold text-xs sm:text-sm border border-white/[0.12] hover:border-sky-400/45 transition-all duration-300 cursor-pointer flex items-center gap-2 backdrop-blur-2xl shadow-[0_12px_35px_-12px_rgba(0,0,0,0.65)] hover:-translate-y-0.5"
              >
                <MessageSquare className="w-4 h-4 text-sky-300" /> Send a Message
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Clean Footer */}
      <footer className="pt-8 border-t border-sky-400/12 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 font-medium gap-4 mt-4">
        <div className="mono-section-text text-[0.75rem] tracking-wide">
          © 2026 Manipal Institute of Technology (MAHE), Manipal. All rights reserved.
        </div>
        <div className="flex items-center gap-5">
          <a href="#" className="mono-label-small tracking-widest hover:text-sky-300 transition-colors duration-200 cursor-pointer">
            Privacy Policy
          </a>
          <a href="#" className="mono-label-small tracking-widest hover:text-sky-300 transition-colors duration-200 cursor-pointer">
            Terms of Service
          </a>
          <a href="#" className="mono-label-small tracking-widest hover:text-sky-300 transition-colors duration-200 cursor-pointer">
            Helpdesk
          </a>
        </div>
      </footer>
    </div>
  );
};

const PhoneIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-[18px] h-[18px] text-sky-300 shrink-0"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export default Overview;
