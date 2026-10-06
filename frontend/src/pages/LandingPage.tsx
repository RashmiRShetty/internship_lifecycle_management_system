import mitLogo from '../assets/mit_logo.png';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Users, ShieldCheck, ArrowRight, Menu, X, Award, Sparkles, Check, FileCheck, Cpu, Clock, Star, ChevronDown, ChevronUp } from 'lucide-react';
import ParticlesBackground from '../components/student/ParticlesBackground';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const faqs = [
    {
      q: 'How does the AI Role Matching work for MIT students?',
      a: 'Our AI engine analyzes student resume skills, completed courseworks, and academic interests against faculty project requirements to generate an accurate compatibility score (e.g. 98% Match).'
    },
    {
      q: 'How are weekly progress reports submitted and verified?',
      a: 'Students submit weekly report summaries and code/documentation deliverables via their project workspace. Faculty supervisors review and approve tasks week-by-week.'
    },
    {
      q: 'When and how can I download the official MIT Certificate?',
      a: 'Once all required weekly tasks are completed and approved by your faculty supervisor, the certificate is issued automatically. Students can download a high-resolution PDF complete with the official MIT seal and verification code.'
    },
    {
      q: 'Can faculty members post multiple research internship opportunities?',
      a: 'Yes, faculty supervisors can create and manage multiple internship roles, set skill requirements, evaluate applicants, and schedule sync meetings directly through the Faculty Portal.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#06112e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white overflow-x-hidden relative student-dot-canvas">
      <ParticlesBackground />
      
      {/* Background Soft Glow Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[55vw] h-[55vw] bg-blue-600/30 rounded-full blur-[140px]" />
        <div className="absolute top-[30%] right-[-10%] w-[45vw] h-[45vw] bg-cyan-500/25 rounded-full blur-[130px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50vw] h-[50vw] bg-indigo-600/30 rounded-full blur-[150px]" />
      </div>

      {/* Navbar Header */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        scrolled 
          ? 'bg-[#09183e]/95 backdrop-blur-xl border-b border-sky-400/25 py-3 shadow-lg shadow-black/40' 
          : 'bg-[#06112e]/80 backdrop-blur-md py-4 border-b border-sky-400/15'
      }`}>
        <div className="container mx-auto px-6 flex justify-between items-center gap-6">
          {/* Brand Logo & Title */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="p-1.5 bg-white rounded-xl shadow-md border border-white/30 flex items-center shrink-0 group-hover:scale-105 transition-transform"><img src={mitLogo} alt="MIT Logo" className="h-7 md:h-8 object-contain" /></div>
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-black text-white tracking-tight leading-none group-hover:text-cyan-300 transition-colors">
                InternSmart
              </span>
              <span className="text-[10px] font-black text-sky-400 tracking-widest uppercase flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                MIT Academic Portal
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links & Auth Buttons */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-7">
            <nav className="flex items-center gap-3 xl:gap-5">
              {[
                { name: 'About Us', href: '#about-us' },
                { name: 'Features', href: '#features' },
                { name: 'Overview', href: '#overview' },
                { name: 'Testimonials', href: '#testimonials' },
                { name: 'FAQ', href: '#faq' },
                { name: 'Contact', href: '#contact' },
              ].map((item) => (
                <a 
                  key={item.name} 
                  href={item.href} 
                  className="text-xs font-bold text-slate-300 hover:text-cyan-300 transition-colors py-1 px-2 rounded-lg hover:bg-white/10 whitespace-nowrap"
                >
                  {item.name}
                </a>
              ))}
            </nav>
            <div className="h-5 w-px bg-sky-400/20" />
            <div className="flex items-center gap-2.5 shrink-0">
              <Link 
                to="/login" 
                className="text-xs font-extrabold text-slate-200 hover:text-white px-3.5 py-2 rounded-xl border border-sky-400/20 hover:bg-white/10 transition-all whitespace-nowrap"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-white px-4 py-2.5 rounded-xl font-black text-xs hover:brightness-110 transition-all shadow-md shadow-cyan-500/30 active:scale-[0.98] flex items-center gap-1.5 whitespace-nowrap"
              >
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="lg:hidden p-2 text-white bg-blue-950/80 border border-sky-400/30 rounded-xl shadow-xs"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-[#09183e] border-b border-sky-400/30 p-6 flex flex-col gap-5 shadow-xl animate-in fade-in slide-in-from-top-4 text-white">
            <div className="flex flex-col gap-3">
              {[
                { name: 'About Us', href: '#about-us' },
                { name: 'Features', href: '#features' },
                { name: 'Overview', href: '#overview' },
                { name: 'Testimonials', href: '#testimonials' },
                { name: 'FAQ', href: '#faq' },
                { name: 'Contact', href: '#contact' },
              ].map((item) => (
                <a 
                  key={item.name} 
                  href={item.href} 
                  className="text-sm font-bold text-slate-200 py-2 border-b border-sky-400/15"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </div>
            <div className="pt-2 flex flex-col gap-3">
              <Link to="/login" className="w-full text-center py-3 bg-blue-950/80 border border-sky-400/30 rounded-xl font-bold text-xs text-white">Sign In</Link>
              <Link to="/register" className="w-full text-center py-3 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-xl font-bold text-xs text-white">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section with Full Half 50/50 Split Layout */}
      <section className="relative z-10 pt-24 pb-16 md:pt-28 md:pb-24 overflow-hidden">
        
        {/* Full Half 50/50 Split Background & Image Container */}
        <div className="absolute inset-0 pointer-events-none z-0 hidden lg:flex">
          {/* Left Half: Deep Blue Canvas */}
          <div className="w-1/2 bg-[#06112e]" />
          
          {/* Right Half: Full Cover High-Res Tech Workspace Image with Subtle Gradient */}
          <div className="w-1/2 relative overflow-hidden border-l border-sky-400/20 shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop" 
              alt="MIT Technology Research Workspace" 
              className="w-full h-full object-cover scale-105"
            />
            {/* Dark Sleek Gradient Overlay for Crisp Text Contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#06112e] via-[#06112e]/50 to-transparent" />
          </div>
        </div>

        <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12 min-h-[540px]">
          
          {/* Left Half: Content & Hero Copy */}
          <div className="lg:w-6/12 flex flex-col justify-center space-y-7 text-center lg:text-left py-4">
            <div className="inline-flex items-center gap-2.5 bg-sky-500/15 border border-sky-400/30 px-4 py-2 rounded-full shadow-xs self-center lg:self-start">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-[11px] font-black text-sky-200 uppercase tracking-widest">MANIPAL INSTITUTE OF TECHNOLOGY • RESEARCH INTERNSHIPS</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white">
              Empowering <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-teal-300">
                students & faculty.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
              The official academic portal connecting Manipal Institute of Technology (MIT) students with faculty supervisors for research internships, weekly milestone tracking, and verified MIT digital certificates.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-1">
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-white text-base px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 group hover:brightness-110 transition-all shadow-xl shadow-cyan-500/30 active:scale-[0.98]"
              >
                Start Your Journey <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </Link>
              <Link 
                to="/login" 
                className="bg-blue-950/70 text-white border border-sky-400/30 text-base px-8 py-4 rounded-2xl font-black flex items-center justify-center hover:bg-blue-900 transition-all active:scale-[0.98] shadow-xs"
              >
                Explore Platform
              </Link>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2 text-white text-xs font-bold">
              <div className="flex items-center gap-2.5 bg-blue-950/80 border border-sky-400/30 px-4 py-2 rounded-2xl shadow-xs">
                <div className="w-6 h-6 rounded-lg bg-cyan-500 text-white flex items-center justify-center shadow-xs">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-black text-cyan-400 uppercase tracking-wider">AI MATCH ENGINE</span>
                  <span className="text-xs font-black text-white leading-none">99.4% Match Score</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-blue-950/80 border border-sky-400/30 px-4 py-2 rounded-2xl shadow-xs">
                <div className="w-6 h-6 rounded-lg bg-sky-500 text-white flex items-center justify-center shadow-xs">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-black text-sky-400 uppercase tracking-wider">MIT INTERNSHIPS</span>
                  <span className="text-xs font-black text-white leading-none">250+ Active Roles</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Half: Full Fit Visual Showcase Container */}
          <div className="lg:w-6/12 flex flex-col justify-end relative w-full max-w-xl mx-auto py-6">
            <div className="relative">

              {/* Mobile Image (shown on mobile when background 50/50 is hidden) */}
              <div className="lg:hidden rounded-2xl overflow-hidden mb-4 border border-sky-400/30 shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop" 
                  alt="MIT Technology Workspace" 
                  className="w-full h-48 object-cover"
                />
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Key Feature Pillars Section */}
      <section id="features" className="relative z-10 py-12 px-6">
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-10 space-y-2">
            <div className="inline-flex items-center gap-2 bg-sky-500/15 border border-sky-400/30 px-3.5 py-1 rounded-full text-sky-200 text-[11px] font-black uppercase tracking-widest">
              Why MIT InternSmart?
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Designed for academic & research excellence.
            </h2>
            <p className="text-slate-300 text-sm font-medium">
              Everything students and faculty need for seamless internship workflows in one powerful portal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <HighlightCard 
              icon={<Cpu className="w-5 h-5 text-blue-600" />}
              bg="bg-blue-50"
              title="AI Resume Matching"
              description="Semantic AI match scores connect students with relevant faculty research projects based on skills and coursework."
            />
            <HighlightCard 
              icon={<Clock className="w-5 h-5 text-emerald-600" />}
              bg="bg-emerald-50"
              title="Weekly Sync Reports"
              description="Track milestone deliverables week-by-week with transparent faculty review and instant status updates."
            />
            <HighlightCard 
              icon={<Award className="w-5 h-5 text-amber-600" />}
              bg="bg-amber-50"
              title="MIT Digital Certificate"
              description="Earn official high-resolution completion certificates stamped with the Manipal Institute of Technology seal."
            />
            <HighlightCard 
              icon={<FileCheck className="w-5 h-5 text-purple-600" />}
              bg="bg-purple-50"
              title="Faculty Mentorship"
              description="Direct student-mentor chat, schedule 1-on-1 interviews, and receive structured feedback on research tasks."
            />
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about-us" className="relative z-10 py-20 px-6 bg-[#081840]/60 border-y border-sky-400/20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-sky-500/15 border border-sky-400/30 px-3.5 py-1.5 rounded-full text-sky-200 text-xs font-black uppercase tracking-widest">
                About the Institution
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Pioneering innovation at Manipal Institute of Technology.
              </h2>
              <p className="text-slate-300 text-base leading-relaxed font-medium">
                InternSmart is the official internship management portal of Manipal Institute of Technology (MIT), 
                designed to provide students with transparent academic internship access and real-world research exposure.
              </p>
              <p className="text-slate-400 text-sm leading-relaxed">
                From application review and match calculation to weekly progress logs and final certificate issuing, 
                InternSmart streamlines the entire internship lifecycle.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                <StatBox number="10,000+" label="Active Students" color="text-cyan-400" />
                <StatBox number="500+" label="Faculty Mentors" color="text-emerald-400" />
                <StatBox number="250+" label="Active Projects" color="text-purple-400" />
                <StatBox number="100%" label="Verified Certs" color="text-amber-400" />
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-tr from-blue-950 to-indigo-900 rounded-[32px] p-4 border border-sky-400/30 shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop" 
                  alt="MIT Collaboration" 
                  className="rounded-[24px] shadow-md w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section id="overview" className="relative z-10 py-20 px-6">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              One platform, three tailored experiences.
            </h2>
            <p className="text-slate-300 text-base font-medium">
              Purpose-built views for Students, Faculty Mentors, and Academic Administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<GraduationCap className="w-7 h-7 text-cyan-400" />}
              title="Students"
              badge="Student Portal"
              features={['AI Matching & Recommendations', 'Submit Weekly Progress Reports', 'Download MIT PDF Certificates', 'Direct Messaging with Mentors']}
              description="Explore faculty internships tailored to your skillset, track weekly deliverables, and claim official MIT completion certificates."
            />
            <FeatureCard 
              icon={<Users className="w-7 h-7 text-emerald-400" />}
              title="Faculty"
              badge="Faculty Portal"
              features={['Post Research Opportunities', 'AI Candidate Compatibility Scores', 'Schedule Interview Syncs', 'Issue PDF Certificates']}
              description="Manage candidates efficiently, evaluate weekly reports, schedule interviews, and issue verified digital certificates."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-7 h-7 text-purple-400" />}
              title="Administrators"
              badge="Admin Portal"
              features={['Department Analytics & Reports', 'Role & Access Management', 'Academic Compliance Controls', 'Batch Certificate Audits']}
              description="Gain total institute-wide visibility into internship statistics, manage user credentials, and oversee department operations."
            />
          </div>
        </div>
      </section>

      {/* Testimonials / Success Stories Section */}
      <section id="testimonials" className="relative z-10 py-20 px-6 bg-[#081840]/60 border-y border-sky-400/20">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-14 space-y-4">
            <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-400/30 px-3.5 py-1.5 rounded-full text-emerald-300 text-xs font-black uppercase tracking-widest">
              MIT Community Voices
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Trusted by MIT students & faculty.
            </h2>
            <p className="text-slate-300 text-base font-medium">
              See how InternSmart transforms internship experiences at Manipal Institute of Technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="InternSmart matched my Computer Science background with a faculty AI research project. Completing weekly progress logs and downloading my official MIT certificate was completely seamless!"
              name="Rohan N."
              role="B.Tech Computer Science (4th Year)"
              dept="MIT Manipal"
              rating={5}
            />
            <TestimonialCard 
              quote="As a faculty member, evaluating applications and tracking weekly student milestones used to be time-consuming. InternSmart's AI compatibility scores and weekly reporting tools simplified everything."
              name="Dr. Sunita Rao"
              role="Associate Professor"
              dept="Dept of Data Science, MIT"
              rating={5}
            />
            <TestimonialCard 
              quote="The verified digital certificate with the MIT logo was recognized directly during my campus placements. It provided official proof of my academic research work!"
              name="Ananya Hegde"
              role="B.Tech Electronics & Comm."
              dept="MIT Manipal"
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="relative z-10 py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-14 space-y-4">
            <div className="inline-flex items-center gap-2 bg-indigo-500/15 border border-indigo-400/30 px-3.5 py-1.5 rounded-full text-indigo-300 text-xs font-black uppercase tracking-widest">
              Frequently Asked Questions
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Have questions? We've got answers.
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-blue-950/70 border border-sky-400/25 rounded-2xl overflow-hidden transition-all shadow-md text-white"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-white hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    <span className="text-base">{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-cyan-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-slate-300 leading-relaxed font-medium border-t border-sky-400/15 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Combined Side-by-Side Section: Contact Desk & Call to Action (Full Edge-to-Edge Both Sides) */}
      <section id="contact" className="relative z-10 py-12 px-0 w-full">
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch w-full overflow-hidden shadow-2xl border-y border-sky-400/25">
            
            {/* Left Panel: Contact MIT Internship Cell */}
            <div className="bg-[#09183e] p-6 sm:p-8 text-white relative overflow-hidden flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-sky-400/25">
              <div className="absolute top-0 right-0 w-60 h-60 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 bg-sky-500/20 border border-sky-400/30 px-3 py-1 rounded-full text-sky-300 text-[10px] font-black uppercase tracking-widest">
                    Assistance Desk
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">MIT Helpdesk</span>
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Contact MIT Internship Cell</h2>
                  <p className="text-slate-300 text-xs leading-relaxed font-medium mt-1">
                    Have questions regarding internship registration, faculty project postings, or certificate verification?
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                  <div className="bg-blue-950/80 p-3 rounded-xl border border-sky-400/20">
                    <p className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">Email</p>
                    <p className="font-bold text-slate-100 truncate">internships@manipal.edu</p>
                  </div>
                  <div className="bg-blue-950/80 p-3 rounded-xl border border-sky-400/20">
                    <p className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">Phone Desk</p>
                    <p className="font-bold text-slate-100">+91 (0820) 2925000</p>
                  </div>
                  <div className="bg-blue-950/80 p-3 rounded-xl border border-sky-400/20">
                    <p className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">Campus Address</p>
                    <p className="font-bold text-slate-100 truncate">MIT Campus, Manipal, KA 576104</p>
                  </div>
                </div>

                {/* Form Box */}
                <div className="bg-blue-950/80 border border-sky-400/30 rounded-2xl p-5 shadow-xl space-y-3 text-white">
                  <div>
                    <label className="block text-[10px] font-bold text-sky-300 uppercase tracking-wider mb-1">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter your name" 
                      className="w-full bg-blue-900/50 border border-sky-400/25 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-sky-300 uppercase tracking-wider mb-1">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="name@learner.manipal.edu" 
                      className="w-full bg-blue-900/50 border border-sky-400/25 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-sky-300 uppercase tracking-wider mb-1">Message</label>
                    <textarea 
                      rows={2} 
                      placeholder="How can we assist you?" 
                      className="w-full bg-blue-900/50 border border-sky-400/25 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-400 transition-colors resize-none"
                    />
                  </div>
                  <button className="w-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 hover:brightness-110 text-white font-black text-xs py-3 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer">
                    Submit Query
                  </button>
                </div>
              </div>
            </div>

            {/* Right Panel: Call to Action Banner */}
            <div className="bg-gradient-to-br from-blue-950 via-[#0a1e52] to-indigo-950 p-8 sm:p-10 text-white relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <div className="inline-flex items-center gap-2 bg-sky-500/20 border border-sky-400/30 px-3 py-1 rounded-full text-sky-300 text-[10px] font-black uppercase tracking-widest">
                  Get Started Today
                </div>

                <div className="space-y-3">
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-white">
                    Ready to elevate your academic journey?
                  </h2>
                  <p className="text-slate-300 text-sm font-medium leading-relaxed">
                    Join thousands of students and faculty members at Manipal Institute of Technology on InternSmart.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="p-4 bg-blue-900/40 rounded-2xl border border-sky-400/25 space-y-1">
                    <p className="text-xs font-black text-white">For Students</p>
                    <p className="text-[11px] text-slate-300">Apply for faculty research projects, submit weekly logs, and earn verified MIT digital certificates.</p>
                  </div>
                  <div className="p-4 bg-blue-900/40 rounded-2xl border border-sky-400/25 space-y-1">
                    <p className="text-xs font-black text-white">For Faculty Supervisors</p>
                    <p className="text-[11px] text-slate-300">Post research internship positions, review AI-matched candidates, and grade deliverables.</p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row gap-3 pt-6 border-t border-sky-400/20">
                <Link 
                  to="/register" 
                  className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-black text-xs py-3.5 px-5 rounded-xl hover:brightness-110 transition-all shadow-lg active:scale-[0.98] text-center"
                >
                  Register Account
                </Link>
                <Link 
                  to="/login" 
                  className="flex-1 bg-blue-950/80 text-white border border-sky-400/30 font-black text-xs py-3.5 px-5 rounded-xl hover:bg-blue-900 transition-all active:scale-[0.98] text-center"
                >
                  Sign In to Portal
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-sky-400/20 bg-[#040c24] py-12 px-6 text-slate-300">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-10">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <img src={mitLogo} alt="MIT Logo" className="h-10 object-contain bg-white/90 p-1.5 rounded-xl" />
                <div className="flex flex-col">
                  <span className="text-base font-black text-white leading-tight">Manipal Institute of Technology</span>
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">InternSmart Portal</span>
                </div>
              </div>
              <p className="text-slate-300 text-xs font-medium leading-relaxed max-w-sm">
                Empowering technical education, research mentorship, and verified digital credentials for Manipal Institute of Technology.
              </p>
              <p className="text-slate-400 text-[11px] font-medium leading-normal pt-1">
                📍 Manipal Institute of Technology, Udupi District, Manipal, Karnataka 576104, India
              </p>
            </div>

            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Portal Nav</h4>
              <ul className="space-y-2.5 text-xs font-bold text-slate-300">
                <li><Link to="/student" className="hover:text-cyan-400 transition-colors">Student Portal</Link></li>
                <li><Link to="/faculty" className="hover:text-cyan-400 transition-colors">Faculty Portal</Link></li>
                <li><Link to="/admin" className="hover:text-cyan-400 transition-colors">Admin Portal</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Institute</h4>
              <ul className="space-y-2.5 text-xs font-bold text-slate-300">
                <li><a href="https://manipal.edu/mit.html" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">MIT Manipal Official</a></li>
                <li><a href="#about-us" className="hover:text-cyan-400 transition-colors">Research Cell</a></li>
                <li><a href="#contact" className="hover:text-cyan-400 transition-colors">Contact Desk</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Legal</h4>
              <ul className="space-y-2.5 text-xs font-bold text-slate-300">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Certificate Verification</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-sky-400/20 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-400">
            <p>© 2026 Manipal Institute of Technology, Manipal. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link to="/admin" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-cyan-400 transition-colors">
                Internal Admin Access
              </Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

const HighlightCard = ({ icon, bg: _bg, title, description }: { icon: React.ReactNode, bg: string, title: string, description: string }) => (
  <div className="bg-blue-950/70 border border-sky-400/25 p-6 rounded-2xl hover:border-cyan-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-white">
    <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center mb-4 text-cyan-300">
      {icon}
    </div>
    <h3 className="text-lg font-black text-white mb-2">{title}</h3>
    <p className="text-slate-300 text-xs leading-relaxed font-medium">{description}</p>
  </div>
);

const StatBox = ({ number, label, color }: { number: string, label: string, color: string }) => (
  <div className="bg-blue-950/70 border border-sky-400/25 p-4 rounded-xl text-center shadow-md">
    <p className={`text-2xl font-black ${color}`}>{number}</p>
    <p className="text-[10px] font-bold text-sky-300/80 uppercase mt-1">{label}</p>
  </div>
);

const TestimonialCard = ({ quote, name, role, dept, rating }: { quote: string, name: string, role: string, dept: string, rating: number }) => (
  <div className="bg-blue-950/70 border border-sky-400/25 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all flex flex-col justify-between text-white">
    <div>
      <div className="flex items-center gap-1 mb-3 text-amber-400">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-amber-400" />
        ))}
      </div>
      <p className="text-xs text-slate-300 leading-relaxed font-medium italic mb-6">"{quote}"</p>
    </div>
    <div className="pt-3 border-t border-sky-400/20 flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-extrabold flex items-center justify-center text-xs shadow-xs">
        {name[0]}
      </div>
      <div>
        <p className="text-xs font-black text-white leading-tight">{name}</p>
        <p className="text-[10px] font-bold text-slate-400">{role} • {dept}</p>
      </div>
    </div>
  </div>
);

const FeatureCard = ({ icon, title, badge, features, description }: { icon: React.ReactNode, title: string, badge: string, features: string[], description: string }) => (
  <div className="group bg-blue-950/70 border border-sky-400/25 hover:border-cyan-400 p-8 rounded-3xl transition-all duration-300 flex flex-col h-full hover:shadow-xl hover:-translate-y-1.5 text-white">
    <div className="flex items-center justify-between mb-6">
      <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center group-hover:scale-110 transition-transform text-cyan-300">
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-sky-500/20 text-cyan-300 border border-sky-400/30">
        {badge}
      </span>
    </div>

    <h3 className="text-2xl font-black text-white mb-3">{title}</h3>
    <p className="text-slate-300 text-xs leading-relaxed font-medium mb-8">{description}</p>

    <div className="mt-auto space-y-3 pt-4 border-t border-sky-400/20">
      {features.map((f) => (
        <div key={f} className="flex items-center gap-2.5">
          <div className="w-4 h-4 rounded-full bg-sky-500/20 text-cyan-400 flex items-center justify-center shrink-0">
            <Check className="w-2.5 h-2.5" />
          </div>
          <span className="text-xs font-bold text-slate-200">{f}</span>
        </div>
      ))}
    </div>
  </div>
);

export default LandingPage;
