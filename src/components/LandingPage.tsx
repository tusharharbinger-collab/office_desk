import React, { useState } from 'react';

interface LandingPageProps {
  onOpenLogin: () => void;
  onOpenSignUp: () => void;
  onQuickDemoLogin: (role: 'admin' | 'manager' | 'employee') => void;
  onOpenMicrosoftSSO: () => void;
  onExploreArea?: (area: 'area-1' | 'area-2') => void;
  currentUser?: { name: string; role: string } | null;
  onGoToDashboard?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenLogin,
  onOpenSignUp,
  onQuickDemoLogin,
  onOpenMicrosoftSSO,
  onExploreArea,
  currentUser,
  onGoToDashboard
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGetStarted = () => {
    if (onExploreArea) {
      onExploreArea('area-1');
    } else {
      onQuickDemoLogin('employee');
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      q: 'How does desk booking work for employees?',
      a: 'Employees can view an interactive digital floor plan in real time, see which desks and meeting rooms are free, check amenities (such as dual 4K monitors or standing desks), and confirm a reservation in under 10 seconds.'
    },
    {
      q: 'Can I see where my teammates are sitting before commuting?',
      a: 'Yes! The live teammate locator displays who is currently in the office and where they are seated. You can easily pick an adjacent desk to collaborate with your team or choose a quiet zone for focused work.'
    },
    {
      q: 'Does SmartDesk support Microsoft 365 Single Sign-On (SSO)?',
      a: 'Absolutely. Employees can log in instantly with their corporate Microsoft 365 / Entra ID work accounts with one click, eliminating the need to manage separate passwords.'
    },
    {
      q: 'How are unused or "ghost" bookings handled?',
      a: 'SmartDesk features automated check-in confirmations. If a reserved desk remains unoccupied past the grace period, it can be released back into the available pool for other team members to use.'
    },
    {
      q: 'Can managers and administrators allocate desks for team members?',
      a: 'Yes. Team leads and workplace administrators have role-based controls to allocate dedicated seats for visiting staff, review space utilization analytics, and manage office floor layouts.'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#0a0d14] text-[#dfe2ee] overflow-x-hidden selection:bg-primary selection:text-on-primary font-sans">
      {/* Background ambient lighting effects */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-primary/15 via-secondary/5 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-1/3 -left-48 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed top-2/3 -right-48 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* FLOATING MODERN ISLAND NAVIGATION BAR */}
      <header className="fixed top-5 left-0 right-0 z-50 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="w-full bg-[#0d121f]/90 backdrop-blur-2xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.65)] rounded-2xl sm:rounded-full px-5 sm:px-7 py-3 flex items-center justify-between transition-all">
          {/* Brand Logo */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 cursor-pointer group select-none"
            title="SmartDesk - Return to top"
          >
            <div className="h-10 px-2.5 rounded-xl bg-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform flex-shrink-0 border border-white/20">
              <img src="/harbinger-logo.webp" alt="Harbinger Group" className="h-6 w-auto object-contain" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight text-white">SmartDesk</span>
              <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                Workplace
              </span>
            </div>
          </div>

          {/* Centered Glass Pill Nav Links */}
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] rounded-full p-1 text-xs font-medium text-slate-300">
            <button
              onClick={() => scrollToSection('features')}
              className="px-4 py-1.5 rounded-full hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="px-4 py-1.5 rounded-full hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('benefits')}
              className="px-4 py-1.5 rounded-full hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
            >
              Benefits
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="px-4 py-1.5 rounded-full hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
            >
              FAQ
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {currentUser && onGoToDashboard ? (
              <button
                onClick={onGoToDashboard}
                className="px-6 py-2.5 rounded-full text-xs font-bold bg-gradient-to-r from-primary via-sky-400 to-secondary hover:brightness-110 text-slate-950 shadow-[0_0_22px_rgba(14,165,233,0.4)] transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <span>Go to Workspace ({currentUser.name})</span>
                <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
              </button>
            ) : (
              <>
                <button
                  onClick={onOpenLogin}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/[0.08] border border-white/10 transition-all cursor-pointer active:scale-95"
                >
                  Sign In
                </button>

                <button
                  onClick={handleGetStarted}
                  className="px-6 py-2.5 rounded-full text-xs font-bold bg-gradient-to-r from-primary via-sky-400 to-secondary hover:brightness-110 text-slate-950 shadow-[0_0_22px_rgba(14,165,233,0.4)] transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  <span>Book a Desk</span>
                  <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-4 top-22 bg-[#0d121f]/95 backdrop-blur-2xl border border-white/10 rounded-3xl z-40 p-6 flex flex-col gap-4 shadow-2xl animate-in fade-in duration-150 md:hidden">
          <div className="space-y-2">
            <button
              onClick={() => scrollToSection('features')}
              className="w-full text-left py-3 px-4 rounded-2xl hover:bg-white/5 text-sm font-medium flex items-center justify-between"
            >
              <span>Features</span>
              <span className="material-symbols-outlined text-sm text-slate-400">arrow_forward</span>
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="w-full text-left py-3 px-4 rounded-2xl hover:bg-white/5 text-sm font-medium flex items-center justify-between"
            >
              <span>How It Works</span>
              <span className="material-symbols-outlined text-sm text-slate-400">arrow_forward</span>
            </button>
            <button
              onClick={() => scrollToSection('benefits')}
              className="w-full text-left py-3 px-4 rounded-2xl hover:bg-white/5 text-sm font-medium flex items-center justify-between"
            >
              <span>Benefits</span>
              <span className="material-symbols-outlined text-sm text-slate-400">arrow_forward</span>
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="w-full text-left py-3 px-4 rounded-2xl hover:bg-white/5 text-sm font-medium flex items-center justify-between"
            >
              <span>FAQ</span>
              <span className="material-symbols-outlined text-sm text-slate-400">arrow_forward</span>
            </button>
          </div>

          <div className="space-y-2.5 pt-4 border-t border-white/10">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLogin();
              }}
              className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-semibold text-white"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleGetStarted();
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-primary via-sky-400 to-secondary text-slate-950 font-bold text-xs shadow-lg"
            >
              Book a Desk
            </button>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative pt-36 sm:pt-44 pb-20 px-6 sm:px-12 lg:px-16 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-primary font-medium mb-6 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#4edea3] animate-pulse" />
          <span>The Modern Workplace Experience</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.12]">
          The effortless way to coordinate your{' '}
          <span className="bg-gradient-to-r from-primary via-secondary to-primary-container bg-clip-text text-transparent">
            hybrid office.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
          Say goodbye to morning desk scrambles and awkward seating conflicts. See which teammates
          are in today, reserve your favorite desk with dual 4K monitors, and book meeting rooms in seconds.
        </p>

        {/* Hero CTAs */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleGetStarted}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-primary via-sky-400 to-secondary hover:brightness-110 text-slate-950 font-bold text-sm shadow-[0_0_30px_rgba(14,165,233,0.4)] transition-all flex items-center gap-2 cursor-pointer active:scale-95 group"
          >
            <span>Explore Live Desks</span>
            <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </button>

          <button
            onClick={onOpenMicrosoftSSO}
            className="px-7 py-4 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-sm transition-all flex items-center gap-2.5 cursor-pointer active:scale-95 backdrop-blur-md"
          >
            <svg viewBox="0 0 23 23" className="w-4 h-4 flex-shrink-0">
              <rect x="1" y="1" width="10" height="10" fill="#f25022" />
              <rect x="12" y="1" width="10" height="10" fill="#7fba00" />
              <rect x="1" y="12" width="10" height="10" fill="#00a4ef" />
              <rect x="12" y="12" width="10" height="10" fill="#ffb900" />
            </svg>
            <span>Sign In with Microsoft 365</span>
          </button>
        </div>

        {/* Social Proof Stats Bar */}
        <div className="mt-14 pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10 max-w-3xl w-full text-center">
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">&lt; 10s</span>
            <span className="block text-xs text-slate-400 mt-1">Average booking time</span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-secondary tracking-tight">100%</span>
            <span className="block text-xs text-slate-400 mt-1">Zero double bookings</span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">35%</span>
            <span className="block text-xs text-slate-400 mt-1">Higher space utilization</span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-tertiary tracking-tight">4.9/5</span>
            <span className="block text-xs text-slate-400 mt-1">Employee satisfaction</span>
          </div>
        </div>

        {/* PRODUCT DASHBOARD PREVIEW MOCKUP (STATIC NON-CLICKABLE ILLUSTRATION) */}
        <div className="mt-14 w-full max-w-5xl rounded-3xl p-2 sm:p-3 bg-gradient-to-b from-white/10 via-white/5 to-transparent border border-white/10 shadow-2xl backdrop-blur-xl pointer-events-none select-none">
          <div className="rounded-2xl bg-[#0f1420] border border-white/5 overflow-hidden text-left shadow-inner">
            {/* Window Chrome Header */}
            <div className="h-11 px-4 bg-[#141a29] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 text-[11px] font-mono text-slate-400">smartdesk.company.com/workspace</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-secondary/10 text-secondary border border-secondary/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" /> Live Floor Plan
                </span>
              </div>
            </div>

            {/* Dashboard Inner Canvas Mockup */}
            <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Interactive Map Representation */}
              <div className="lg:col-span-2 bg-[#182032]/70 rounded-2xl p-5 border border-white/5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-white">Work Area 1 — Main Floor</h4>
                      <p className="text-xs text-slate-400">130 workstations • 18 available right now</p>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="flex items-center gap-1 text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-secondary" /> Free
                      </span>
                      <span className="flex items-center gap-1 text-slate-300 ml-2">
                        <span className="w-2 h-2 rounded-full bg-primary" /> Reserved
                      </span>
                    </div>
                  </div>

                  {/* Stylized Floor Grid Visual */}
                  <div className="bg-[#0f1420]/80 rounded-xl p-4 border border-white/5 grid grid-cols-6 sm:grid-cols-8 gap-2.5 my-3">
                    {Array.from({ length: 32 }).map((_, i) => {
                      const isFree = i % 3 !== 0;
                      const isSelected = i === 11;
                      return (
                        <div
                          key={i}
                          className={`h-9 rounded-lg border text-[10px] font-mono flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-primary text-on-primary border-primary shadow-[0_0_12px_rgba(14,165,233,0.5)] font-bold scale-105'
                              : isFree
                              ? 'bg-secondary/15 text-secondary border-secondary/30'
                              : 'bg-white/5 text-slate-500 border-white/5'
                          }`}
                        >
                          {isSelected ? '✓' : `D${i + 1}`}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Desk Banner */}
                <div className="mt-4 p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold">
                      D12
                    </div>
                    <div>
                      <span className="font-semibold text-white block">Desk W-12 (Window Sunlight Bank)</span>
                      <span className="text-[11px] text-slate-400">Dual 4K Displays • Ergonomic Seating • Next to Design</span>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-primary/15 border border-primary/30 text-primary font-semibold text-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Selected</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Teammate Activity & Pass */}
              <div className="space-y-4">
                {/* Teammates In Today */}
                <div className="bg-[#182032]/70 rounded-2xl p-5 border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider">Teammates Today</h5>
                    <span className="text-[11px] text-secondary font-medium">8 in office</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold border border-primary/30">
                        FE
                      </div>
                      <div className="text-xs flex-1">
                        <span className="font-semibold text-white block">Frontend Engineering</span>
                        <span className="text-[10px] text-slate-400">Zone B • Pod 2</span>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-secondary" />
                    </div>

                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5">
                      <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center text-xs font-bold border border-secondary/30">
                        PD
                      </div>
                      <div className="text-xs flex-1">
                        <span className="font-semibold text-white block">Product Design Guild</span>
                        <span className="text-[10px] text-slate-400">West Wall • Window Bank</span>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-secondary" />
                    </div>
                  </div>
                </div>

                {/* Instant Check-in Pass Card */}
                <div className="bg-gradient-to-br from-primary/15 via-[#182032]/80 to-secondary/10 rounded-2xl p-5 border border-primary/20">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-semibold block mb-1">
                    Your Active Pass
                  </span>
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-bold text-white">Full Day Pass</h5>
                      <span className="text-xs text-slate-300">09:00 AM – 05:00 PM</span>
                    </div>
                    <span className="px-2 py-1 rounded-md bg-secondary/20 text-secondary text-[10px] font-bold">
                      CONFIRMED
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES (BENEFIT DRIVEN) */}
      <section id="features" className="py-24 px-6 sm:px-12 lg:px-16 border-t border-white/5 bg-[#0e121b]/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-mono text-primary uppercase tracking-widest px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              Purpose-Built for Hybrid Teams
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3">
              Everything your office needs to run smoothly
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mt-2">
              Intuitive tools designed to make coming to the office enjoyable, organized, and collaborative.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="p-7 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-primary/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">map</span>
                </div>
                <h3 className="text-lg font-bold text-white">Interactive Floor Maps</h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed">
                  Navigate real architectural floor plans in high fidelity. Zoom, pan, and filter by
                  specific amenities like standing desks, dual 4K monitors, or quiet focus corners.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 text-xs text-primary font-medium flex items-center gap-1">
                <span>View live floor plan</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-7 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-secondary/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">people</span>
                </div>
                <h3 className="text-lg font-bold text-white">Live Teammate Presence</h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed">
                  Never wonder if your team is in. See live seat badges showing which
                  colleagues are on-site so you can schedule in-person brainstorms effortlessly.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 text-xs text-secondary font-medium flex items-center gap-1">
                <span>Connect with teammates</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-7 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-tertiary/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-tertiary/15 text-tertiary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">meeting_room</span>
                </div>
                <h3 className="text-lg font-bold text-white">Instant Room Booking</h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed">
                  Need a private space for a client pitch or executive review? Reserve soundproof
                  cabins and conference boardrooms with a single tap, free of calendar conflicts.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 text-xs text-tertiary font-medium flex items-center gap-1">
                <span>Explore meeting spaces</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (3 SIMPLE STEPS) */}
      <section id="how-it-works" className="py-24 px-6 sm:px-12 lg:px-16 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-mono text-secondary uppercase tracking-widest px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20">
              Simple 3-Step Routine
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3">
              Booking your day takes 10 seconds
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mt-2">
              From checking teammate schedules to walking in the door.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative p-6 rounded-3xl bg-white/[0.02] border border-white/5">
              <span className="text-3xl font-extrabold text-primary/40 font-mono block mb-3">01</span>
              <h4 className="text-base font-bold text-white">Check who's in</h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Open the app on your phone or laptop before heading out. See which colleagues are working
                on-site and where they're sitting.
              </p>
            </div>

            <div className="relative p-6 rounded-3xl bg-white/[0.02] border border-white/5">
              <span className="text-3xl font-extrabold text-secondary/40 font-mono block mb-3">02</span>
              <h4 className="text-base font-bold text-white">Pick your setup</h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Select your preferred workstation by amenity — dual monitors, standing desk, or natural
                window light — and pick your duration.
              </p>
            </div>

            <div className="relative p-6 rounded-3xl bg-white/[0.02] border border-white/5">
              <span className="text-3xl font-extrabold text-tertiary/40 font-mono block mb-3">03</span>
              <h4 className="text-base font-bold text-white">Sit down & start</h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Arrive at the office with zero stress. Your desk is guaranteed, your name is on the floor plan,
                and your digital pass is verified.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY HYBRID TEAMS LOVE SMARTDESK */}
      <section id="benefits" className="py-24 px-6 sm:px-12 lg:px-16 border-t border-white/5 bg-[#0e121b]/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-mono text-tertiary uppercase tracking-widest px-3 py-1 rounded-full bg-tertiary/10 border border-tertiary/20">
              Measurable Workplace Impact
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3">
              Better days for employees, clear visibility for leaders
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">favorite</span>
                </span>
                <h3 className="text-lg font-bold text-white">For Employees</h3>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="text-secondary font-bold">✓</span>
                  <span>Never commute without knowing your desk is waiting for you</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-secondary font-bold">✓</span>
                  <span>Sit near teammates to brainstorm or grab a quiet pod for deep work</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-secondary font-bold">✓</span>
                  <span>One-click check-in from your laptop with your corporate work account</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-3xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-xl bg-secondary/20 text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">trending_up</span>
                </span>
                <h3 className="text-lg font-bold text-white">For Leaders & Facility Managers</h3>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="text-secondary font-bold">✓</span>
                  <span>Eliminate wasted desk space and optimize real estate operating costs</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-secondary font-bold">✓</span>
                  <span>Real-time occupancy analytics to understand peak office attendance</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-secondary font-bold">✓</span>
                  <span>Easily reserve desks for visiting clients, VIP guests, or team workshops</span>
                </li>
              </ul>
            </div>
          </div>


        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS (ACCORDION) */}
      <section id="faq" className="py-24 px-6 sm:px-12 lg:px-16 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-mono text-primary uppercase tracking-widest px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              Clear Answers
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 text-left text-sm font-semibold text-white flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span
                      className={`material-symbols-outlined text-slate-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-primary' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-3 animate-in fade-in duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-24 px-6 sm:px-12 lg:px-16 border-t border-white/5 bg-gradient-to-b from-[#0a0d14] via-primary/5 to-[#0a0d14]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Ready to experience a modern, stress-free office?
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Explore live desks on the floor plan right now or sign in with your corporate work credentials.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 rounded-2xl bg-primary hover:bg-primary-fixed text-on-primary font-bold text-sm shadow-[0_0_30px_rgba(14,165,233,0.4)] transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Explore Floor Plans</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>

            <button
              onClick={onOpenLogin}
              className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-sm transition-all cursor-pointer"
            >
              Sign In to Your Account
            </button>
          </div>
        </div>
      </section>

      {/* STREAMLINED FOOTER */}
      <footer className="py-12 px-6 sm:px-12 lg:px-16 border-t border-white/5 bg-[#070a0f] text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="h-8 px-2 rounded-lg bg-white flex items-center justify-center shadow-sm border border-white/10">
            <img src="/harbinger-logo.webp" alt="Harbinger Group" className="h-5 w-auto object-contain" />
          </div>
          <div>
            <span className="text-white font-semibold">SmartDesk</span>
            <span className="block text-[11px] text-slate-400">Workplace Desk & Room Booking Platform</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300 font-medium">
          <button onClick={() => scrollToSection('features')} className="hover:text-primary transition-colors cursor-pointer">
            Features
          </button>
          <button onClick={() => scrollToSection('how-it-works')} className="hover:text-primary transition-colors cursor-pointer">
            How It Works
          </button>
          <button onClick={() => scrollToSection('benefits')} className="hover:text-primary transition-colors cursor-pointer">
            Benefits
          </button>
          <button onClick={() => scrollToSection('faq')} className="hover:text-primary transition-colors cursor-pointer">
            FAQ
          </button>
          <button onClick={onOpenLogin} className="hover:text-primary transition-colors cursor-pointer font-bold text-primary">
            Sign In
          </button>
        </div>
      </footer>
    </div>
  );
};
