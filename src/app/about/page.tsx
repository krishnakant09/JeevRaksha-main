"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Users,
  Award,
  Sparkles,
  ArrowLeft,
  Shield,
  HeartPulse,
  Brain,
  Code2,
  Cpu,
  Layers,
  PhoneCall,
  Phone,
  CheckCircle2,
  Stethoscope,
  MapPin,
  ChevronRight,
  Crown,
  Github,
  Linkedin,
  Mail,
  Star,
  Quote,
  Menu,
  X,
  Home,
  Info,
  Radio,
  Activity,
  Zap,
  Flame,
  Globe,
  Camera,
  Check
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  category: "ai" | "telecom" | "ux" | "domain" | "cloud";
  categoryLabel: string;
  lead?: boolean;
  tagline: string;
  avatarEmoji: string;
  initials: string;
  photoUrl: string;
  secondaryPhotoUrl?: string;
  secondaryPhotoCaption?: string;
  focus: string;
  description: string;
  skills: string[];
  contributions?: string[];
  socials?: {
    github?: string;
    linkedin?: string;
    email?: string;
  };
}

const FOUNDER_LEADER: TeamMember = {
  id: "krishnakant",
  name: "Krishnakant Sharma",
  role: "Founder & Lead Full Stack Architect",
  category: "ai",
  categoryLabel: "Full-Stack Architecture",
  lead: true,
  tagline: "System Architecture, Real-Time Syndromic Surveillance & Strategic Vision",
  avatarEmoji: "👨‍💻",
  initials: "KS",
  photoUrl: "/team/krishnakant.jpg",
  secondaryPhotoUrl: "/team/krishnakant-work.jpg",
  secondaryPhotoCaption:
    "Krishnakant presenting Jeev Rakshak live disease surveillance GIS telemetry & syndromic triage pipeline on the Grand Finale stage at Smart India Hackathon.",
  focus: "End-to-End System Design, Backend Schemas & SIH Strategy",
  description:
    "Spearheaded overall platform architecture, Next.js 16 full-stack structure, Prisma database models, multi-tier jurisdiction filtering, and seamless orchestration of AI, telephony, and surveillance feeds.",
  contributions: [
    "Zero-lag syndromic triage pipeline for 535M+ Indian livestock context",
    "Taluka, District, & State role-based administrative isolation & GIS engine",
    "Offline speech recognition, IVR telephonic bridge, & automated dispatch",
    "Solution alignment for SIH26128 with Govt. of Maharashtra guidelines",
  ],
  skills: [
    "Next.js 16",
    "TypeScript",
    "Prisma ORM",
    "System Architecture",
    "PostgreSQL",
    "Node.js",
    "API Security",
    "Docker",
  ],
  socials: {
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    email: "mailto:contact@jeevrakshak.in",
  },
};

const CORE_TEAM: TeamMember[] = [
  {
    id: "raj",
    name: "Raj Verma",
    role: "Machine Learning & Vision Lead",
    category: "ai",
    categoryLabel: "AI & Indic NLP",
    tagline: "Indic NLP, Lesion Classification & Risk Heuristics",
    avatarEmoji: "🤖",
    initials: "RV",
    photoUrl: "/team/raj.jpg",
    focus: "Indic NLP, Vision Triage & Risk Modeling",
    description:
      "Trained and fine-tuned multilingual Indic NLP extraction models (Hindi & Marathi), computer vision lesion classification, and plain-language explainable risk scoring.",
    skills: ["Python", "Computer Vision", "Sarvam 105B", "NLP", "PyTorch", "TensorFlow"],
    socials: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      email: "mailto:raj@jeevrakshak.in",
    },
  },
  {
    id: "aman",
    name: "Aman Sharma",
    role: "User Experience & Accessibility Specialist",
    category: "ux",
    categoryLabel: "Design & UX",
    tagline: "Low-Literacy UI, High-Contrast Design & Voice Workflows",
    avatarEmoji: "🎨",
    initials: "AS",
    photoUrl: "/team/aman.jpg",
    focus: "Rural Farmer Usability & Responsive Interfaces",
    description:
      "Crafted low-literacy-first user journeys, high-contrast rustic design tokens, bilingual voice assistant interactions, and GIS surveillance heatmaps.",
    skills: ["Tailwind CSS", "React", "WCAG 2.1", "Figma", "Responsive Web", "UX Research"],
    socials: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      email: "mailto:aman@jeevrakshak.in",
    },
  },
  {
    id: "ojash",
    name: "ojash Dwivedi",
    role: "IVR & Offline Sync Engineer",
    category: "telecom",
    categoryLabel: "Telecom & IVR",
    tagline: "Zero-Internet 2G Telephony & DTMF Voice Gateways",
    avatarEmoji: "📞",
    initials: "OD",
    photoUrl: "/team/ojash.jpg",
    focus: "Telecom Webhooks & 2G Accessibility",
    description:
      "Engineered the 1800 IVR telephony pipeline with DTMF tone routing and TwiML integration to ensure zero-internet accessibility for rural 2G keypad phone users.",
    skills: ["TwiML / Twilio", "DTMF Telephony", "REST APIs", "WebSockets", "Node.js"],
    socials: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      email: "mailto:ojash@jeevrakshak.in",
    },
  },
  {
    id: "ompal",
    name: "Ompal",
    role: "Domain Specialist & Protocol Analyst",
    category: "domain",
    categoryLabel: "Veterinary Protocol",
    tagline: "Epidemiological SOPs, FMD/LSD Guidelines & Maharashtra Demographics",
    avatarEmoji: "🩺",
    initials: "OP",
    photoUrl: "/team/ompal.jpg",
    focus: "Epidemiological SOPs & Maharashtra Context",
    description:
      "Researched endemic livestock diseases (FMD, LSD, HS, PPR), Maharashtra livestock demographics (Pune, Satara, Ahmednagar), and government veterinary response protocols.",
    skills: ["Livestock Healthcare", "Epidemiology", "FMD / LSD SOPs", "Data Analysis", "Field SOPs"],
    socials: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      email: "mailto:ompal@jeevrakshak.in",
    },
  },
  {
    id: "ritika",
    name: "Ritika",
    role: "Security & Cloud Infrastructure Lead",
    category: "cloud",
    categoryLabel: "Cloud & DevSecOps",
    tagline: "Cloud Deployment, RBAC Authentication & Data Integrity",
    avatarEmoji: "☁️",
    initials: "RT",
    photoUrl: "/team/ritika.jpg",
    focus: "Deployment, Auth & Database Scalability",
    description:
      "Configured secure role-based authentication, database migrations, CI/CD pipeline, and audit logging compliance for government data integrity.",
    skills: ["Cloud Deployment", "Docker", "Database Optimization", "Security", "CI/CD"],
    socials: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      email: "mailto:ritika@jeevrakshak.in",
    },
  },
];

// Scroll Reveal Animation Component
function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out transform ${
        isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-[0.98]"
      } ${className}`}
    >
      {children}
    </div>
  );
}

// Clean Photo Avatar Component with automatic initials fallback
function PhotoAvatar({
  member,
  size = "md",
  className = "",
}: {
  member: TeamMember;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const [hasError, setHasError] = useState<boolean>(false);

  const sizeClasses = {
    sm: "w-14 h-14 text-lg",
    md: "w-20 h-20 text-2xl",
    lg: "w-28 h-28 text-3xl",
    xl: "w-44 h-44 sm:w-56 sm:h-56 text-4xl",
  }[size];

  return (
    <div className={`relative group shrink-0 ${className}`}>
      <div
        className={`${sizeClasses} rounded-3xl overflow-hidden bg-gradient-to-tr from-[#1B4328] via-[#2E7D46] to-[#4DAA68] p-1 shadow-lg transition-transform duration-300 group-hover:scale-[1.02]`}
      >
        <div className="w-full h-full rounded-[22px] overflow-hidden bg-[#183921] relative flex items-center justify-center">
          {!hasError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.photoUrl}
              alt={member.name}
              onError={() => setHasError(true)}
              className="w-full h-full object-cover object-top"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#183921] via-[#2E7D46] to-[#3B9B58] text-white p-2 select-none">
              <span className="font-black tracking-wider text-xl sm:text-2xl drop-shadow-sm">
                {member.initials}
              </span>
              <span className="text-xs sm:text-sm mt-1">{member.avatarEmoji}</span>
            </div>
          )}
        </div>
      </div>

      {member.lead && (
        <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white p-2 rounded-2xl shadow-lg border-2 border-white flex items-center justify-center">
          <Crown className="w-4 h-4 text-white fill-white" />
        </div>
      )}
    </div>
  );
}

export default function AboutPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");

  // Lock background scroll on mobile when drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Handle escape key and screen resize
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const filteredMembers =
    activeTab === "all" ? CORE_TEAM : CORE_TEAM.filter((m) => m.category === activeTab);

  return (
    <div className="min-h-screen bg-[#F4F7F2] text-[#16261B] overflow-x-hidden selection:bg-[#2E7D46] selection:text-white">
      {/* ── MOBILE MENU OVERLAY ── */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* ── SLIDE-OVER MOBILE DRAWER ── */}
      <aside
        id="about-mobile-navigation-drawer"
        aria-label="Mobile Navigation"
        className={`lg:hidden fixed top-0 right-0 bottom-0 w-[86vw] max-w-sm bg-white z-50 shadow-2xl flex flex-col border-l border-[#D5DDD0] transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#D5DDD0] bg-[#F7F9F5] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#183921] via-[#2E7D46] to-[#3B9B58] flex items-center justify-center text-white shadow-md shadow-[#2E7D46]/20">
              <span className="text-lg">🐄</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-[#16261B]">Jeev Rakshak</span>
                <span className="text-[9px] font-black uppercase tracking-wider bg-[#DCEFE1] text-[#2E7D46] px-1.5 py-0.5 rounded">
                  SIH26128
                </span>
              </div>
              <p className="text-[10px] font-semibold text-[#5B6B5F]">
                About Us • Team & Mission
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white hover:bg-gray-100 text-gray-700 hover:text-red-600 transition border border-[#D5DDD0] cursor-pointer active:scale-95 touch-manipulation"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-3">
          {/* Emergency Triage CTA */}
          <Link
            href="/farmer/report"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-[#C8372D] to-[#E04F44] text-white shadow-lg shadow-[#C8372D]/20 active:scale-98 transition group"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-bounce">🚨</span>
              <div>
                <p className="text-[11px] font-black uppercase tracking-wide text-red-100">Emergency Disease Report</p>
                <p className="text-sm font-extrabold">पशु बीमार है (Report Sickness)</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Connect with Vet Feature Card */}
          <Link
            href="/appointments"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-[#DCEFE1] border border-emerald-200 text-[#16261B] shadow-xs active:scale-98 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2E7D46] text-white flex items-center justify-center shadow-xs">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-extrabold text-[#2E7D46]">डॉक्टर अपॉइंटमेंट</p>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-[#2E7D46] text-white rounded-full">
                    NEW
                  </span>
                </div>
                <p className="text-xs font-bold text-[#16261B]">Connect with Vet (1962)</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#2E7D46] group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Main Navigation Links */}
          <div className="space-y-1.5 pt-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-[#5B6B5F] px-1">Navigation (नेविगेशन)</p>

            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-[#EEF2EA] text-[#16261B] font-bold text-xs border border-[#D5DDD0] transition"
            >
              <Home className="w-4 h-4 text-[#2E7D46]" />
              <span>Home (होम पेज)</span>
            </Link>

            <Link
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 text-[#2E7D46] font-bold text-xs border border-emerald-200 transition"
            >
              <Info className="w-4 h-4 text-[#2E7D46]" />
              <span>About Us (टीम परिचय)</span>
            </Link>

            <Link
              href="/#first-aid"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-[#EEF2EA] text-[#16261B] font-bold text-xs border border-[#D5DDD0] transition text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🩺</span>
                <span>प्राथमिक उपचार (First Aid Guide)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>

            <Link
              href="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-[#EEF2EA] text-[#16261B] font-bold text-xs border border-[#D5DDD0] transition text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🏛️</span>
                <span>अधिकारी पोर्टल (Authority Portal)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>

          {/* Rapid Tools Section */}
          <div className="space-y-1.5 pt-2">
            <p className="text-[10px] font-black uppercase tracking-wider text-[#5B6B5F] px-1">Rapid Tools (त्वरित साधन)</p>

            <Link
              href="/farmer/ivr"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 text-emerald-950 font-bold text-xs border border-emerald-200 transition"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="font-extrabold text-xs">1800 IVR Voice Toll-Free</p>
                <p className="text-[10px] text-emerald-700 font-medium">बिना इंटरनेट कीपैड फोन से रिपोर्ट</p>
              </div>
            </Link>

            <Link
              href="/farmer/photo-detect"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 text-amber-950 font-bold text-xs border border-amber-200 transition"
            >
              <span className="text-base">📷</span>
              <div>
                <p className="font-extrabold text-xs">चोट की फोटो से AI जांच</p>
                <p className="text-[10px] text-amber-700 font-medium">Photo Triage & Wound Analysis</p>
              </div>
            </Link>
          </div>
        </div>
      </aside>

      {/* ── TOP NAV BAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#D5DDD0] shadow-xs px-4 sm:px-6 lg:px-8 h-16 flex items-center">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group min-w-0 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-[#183921] via-[#2E7D46] to-[#3B9B58] flex items-center justify-center text-white shadow-md shadow-[#2E7D46]/20 group-hover:scale-105 transition-transform shrink-0">
              <span className="text-lg sm:text-xl">🐄</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-base sm:text-lg font-black tracking-tight text-[#16261B] whitespace-nowrap">
                  Jeev Rakshak
                </span>
                <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase tracking-wider bg-[#DCEFE1] text-[#2E7D46] px-2 py-0.5 rounded-full border border-[#2E7D46]/20">
                  SIH26128
                </span>
              </div>
              <p className="hidden sm:block text-[11px] font-semibold text-[#5B6B5F] -mt-0.5 truncate">
                Pashu Rakshak • Livestock Disease Surveillance Grid
              </p>
            </div>
          </Link>

          {/* Desktop Center Links */}
          <div className="hidden lg:flex items-center gap-1 bg-[#EEF2EA] p-1 rounded-xl border border-[#D5DDD0]">
            <Link
              href="/"
              className="px-3 py-1.5 text-xs font-bold text-[#5B6B5F] hover:text-[#16261B] hover:bg-white rounded-lg transition"
            >
              Home (होम)
            </Link>
            <Link
              href="/appointments"
              className="px-3 py-1.5 text-xs font-bold text-[#2E7D46] hover:bg-white rounded-lg transition flex items-center gap-1.5"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Connect with Vet (डॉक्टर)</span>
            </Link>
            <Link
              href="/about"
              className="px-3 py-1.5 text-xs font-bold text-[#16261B] bg-white rounded-lg transition shadow-2xs"
            >
              About Us (टीम परिचय)
            </Link>
            <Link
              href="/#first-aid"
              className="px-3 py-1.5 text-xs font-bold text-[#5B6B5F] hover:text-[#16261B] hover:bg-white rounded-lg transition"
            >
              प्राथमिक उपचार (First Aid)
            </Link>
          </div>

          {/* Desktop & Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/dashboard"
              className="hidden md:inline-flex text-xs font-bold text-[#5B6B5F] hover:text-[#16261B] bg-[#EEF2EA] hover:bg-white px-3.5 py-2 rounded-xl transition border border-[#D5DDD0]"
            >
              Authority Portal
            </Link>

            <Link
              href="/farmer/report"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#C8372D] hover:bg-[#B32D24] text-white text-xs sm:text-sm font-black rounded-xl shadow-md shadow-[#C8372D]/20 active:scale-95 transition shrink-0"
            >
              <span>🚨</span>
              <span className="hidden sm:inline">Report Illness</span>
              <span className="sm:hidden font-bold">Report</span>
            </Link>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-[#EEF2EA] text-[#16261B] hover:bg-[#DCEFE1] active:scale-95 transition border border-[#D5DDD0] cursor-pointer shrink-0 touch-manipulation select-none"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              <Menu className="w-5 h-5 text-[#16261B]" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO BANNER WITH AMBIENT GRADIENTS & METRICS ── */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-[#0F2617] via-[#163B23] to-[#1E4D2E] text-white relative overflow-hidden">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-[#3B9B58]/20 rounded-full blur-3xl pointer-events-none -translate-x-1/2" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-wider text-[#FBEFCF] shadow-sm">
            <Award className="w-4 h-4 text-amber-300" />
            <span>Smart India Hackathon • Problem Statement SIH26128</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
            The Engineering Minds Behind <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FBEFCF] via-white to-[#DCEFE1]">
              Pashu Rakshak (Jeev Rakshak)
            </span>
          </h1>

          <p className="text-white/85 text-sm sm:text-base md:text-lg max-w-3xl mx-auto font-normal leading-relaxed">
            Building India&apos;s real-time syndromic disease early-warning grid for{" "}
            <strong className="text-white font-bold">535+ million livestock</strong>, engineered in direct alignment
            with the{" "}
            <strong className="text-[#FBEFCF] font-bold">Government of Maharashtra Animal Husbandry Department</strong>.
          </p>

          {/* Key Impact Stats Bar */}
          <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-black text-amber-300">535M+</div>
              <div className="text-xs text-white/80 font-semibold mt-0.5">Livestock Context</div>
              <div className="text-[10px] text-white/60">India National Scale</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-black text-[#DCEFE1]">&lt; 1.2s</div>
              <div className="text-xs text-white/80 font-semibold mt-0.5">Syndromic Triage</div>
              <div className="text-[10px] text-white/60">Zero-Lag Processing</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-black text-[#FBEFCF]">100%</div>
              <div className="text-xs text-white/80 font-semibold mt-0.5">Zero-Internet IVR</div>
              <div className="text-[10px] text-white/60">2G Keypad Accessibility</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-black text-emerald-300">3-Tier</div>
              <div className="text-xs text-white/80 font-semibold mt-0.5">Jurisdiction Grid</div>
              <div className="text-[10px] text-white/60">State • District • Taluka</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        {/* ── FOUNDER & LEAD ARCHITECT SPOTLIGHT ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <div className="flex items-center gap-2.5">
              <Crown className="w-6 h-6 text-amber-500 fill-amber-500" />
              <h2 className="text-2xl sm:text-3xl font-black text-[#16261B] tracking-tight">
                Founder & Lead Architect Spotlight
              </h2>
            </div>
            <span className="text-xs font-bold text-[#2E7D46] bg-[#DCEFE1] px-3 py-1 rounded-full border border-[#2E7D46]/20">
              System Architecture & Strategic Vision
            </span>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#D5DDD0] shadow-xl relative overflow-hidden transition-all hover:shadow-2xl space-y-10">
            {/* Corner Decorative Badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-l from-[#2E7D46] to-[#183921] text-white text-[10px] sm:text-xs font-black uppercase tracking-wider py-1.5 px-6 rounded-bl-2xl shadow-sm flex items-center gap-1.5 z-10">
              <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Project Architect & Team Lead</span>
            </div>

            {/* ── UPPER ROW: INFO ON LEFT, PHOTO ON RIGHT ── */}
            <div className="flex flex-col-reverse lg:flex-row items-center lg:items-start justify-between gap-8 lg:gap-12 pt-2">
              {/* Left Side: Information */}
              <div className="flex-1 space-y-5 text-left w-full">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCEFE1] text-[#2E7D46] text-xs font-black uppercase tracking-wider mb-2.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Founder • Lead Full Stack Architect</span>
                  </div>
                  <h3 className="text-2xl sm:text-4xl font-black text-[#16261B] tracking-tight">
                    {FOUNDER_LEADER.name}
                  </h3>
                  <p className="text-sm sm:text-base font-extrabold text-[#2E7D46] mt-0.5">
                    {FOUNDER_LEADER.role}
                  </p>
                  <p className="text-xs sm:text-sm text-[#5B6B5F] font-medium mt-1 leading-relaxed">
                    {FOUNDER_LEADER.tagline}
                  </p>
                </div>

                {/* Quote block */}
                <div className="bg-[#F4F7F2] rounded-2xl p-4 border border-[#D5DDD0] flex items-start gap-3">
                  <Quote className="w-5 h-5 text-[#2E7D46] shrink-0 mt-0.5 rotate-180 opacity-70" />
                  <p className="text-xs sm:text-sm text-[#16261B] font-semibold italic leading-relaxed">
                    &ldquo;Our vision for Pashu Rakshak is to bridge India&apos;s rural digital divide.
                    Every dairy farmer with even a 2G keypad phone deserves the same early-warning protection
                    against devastating outbreaks like FMD and Lumpy Skin Disease.&rdquo;
                  </p>
                </div>

                {/* Contributions list */}
                <div className="space-y-2 pt-1">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#5B6B5F]">
                    Key Architectural & Hackathon Milestones
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {FOUNDER_LEADER.contributions?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 bg-[#F4F7F2] p-2.5 rounded-xl border border-[#D5DDD0]/80 shadow-2xs"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D46] shrink-0 mt-0.5" />
                        <span className="text-xs text-[#16261B] font-medium leading-snug">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tech & Skills */}
                <div className="pt-2">
                  <span className="text-[10px] uppercase font-black text-[#5B6B5F] tracking-wider block mb-1.5">
                    Core Technical Mastery
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {FOUNDER_LEADER.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2.5 py-1 rounded-xl bg-[#F4F7F2] text-[#16261B] text-xs font-bold border border-[#D5DDD0] shadow-2xs hover:border-[#2E7D46] transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-xs font-bold text-[#5B6B5F] mr-1">Direct Contact:</span>
                  {FOUNDER_LEADER.socials?.github && (
                    <a
                      href={FOUNDER_LEADER.socials.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl bg-[#F4F7F2] hover:bg-[#DCEFE1] text-[#16261B] flex items-center justify-center transition border border-[#D5DDD0] shadow-2xs hover:scale-105"
                      title="GitHub Profile"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {FOUNDER_LEADER.socials?.linkedin && (
                    <a
                      href={FOUNDER_LEADER.socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl bg-[#F4F7F2] hover:bg-[#DCEFE1] text-[#0A66C2] flex items-center justify-center transition border border-[#D5DDD0] shadow-2xs hover:scale-105"
                      title="LinkedIn Profile"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {FOUNDER_LEADER.socials?.email && (
                    <a
                      href={FOUNDER_LEADER.socials.email}
                      className="w-9 h-9 rounded-xl bg-[#F4F7F2] hover:bg-[#DCEFE1] text-[#C8372D] flex items-center justify-center transition border border-[#D5DDD0] shadow-2xs hover:scale-105"
                      title="Email Contact"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Right Side: Portrait Photo */}
              <div className="w-full sm:w-auto flex flex-col items-center shrink-0">
                <div className="relative group">
                  <div className="w-48 h-48 sm:w-60 sm:h-60 lg:w-64 lg:h-64 rounded-3xl overflow-hidden bg-gradient-to-tr from-[#1B4328] via-[#2E7D46] to-[#4DAA68] p-1.5 shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:scale-[1.02]">
                    <div className="w-full h-full rounded-[20px] overflow-hidden bg-[#183921] relative">
                      <img
                        src={FOUNDER_LEADER.photoUrl}
                        alt={FOUNDER_LEADER.name}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Name pill on image */}
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/75 via-black/35 to-transparent pointer-events-none" />
                      <div className="absolute bottom-2.5 inset-x-0 text-center pointer-events-none px-2">
                        <span className="text-[11px] font-black text-white bg-black/40 px-3 py-1 rounded-full backdrop-blur-xs border border-white/20">
                          {FOUNDER_LEADER.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Crown Badge */}
                  <div className="absolute -bottom-2.5 -right-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white p-2.5 rounded-2xl shadow-lg border-2 border-white flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white fill-white" />
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <span className="text-xs font-black text-[#16261B] block">
                    Krishnakant Sharma
                  </span>
                  <span className="text-[11px] font-bold text-[#2E7D46]">
                    Founder & Lead Architect
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CORE TEAM MEMBERS WITH INTERACTIVE FILTER TABS ── */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#D5DDD0] pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCEFE1] text-[#2E7D46] text-xs font-black uppercase tracking-wider mb-2">
                <Users className="w-3.5 h-3.5" />
                <span>Specialized Domain Leads</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#16261B] tracking-tight">
                Core Engineering & Domain Team
              </h2>
              <p className="text-xs sm:text-sm text-[#5B6B5F] font-semibold mt-1">
                Multidisciplinary innovators spanning AI/Vision, Telecom IVR, low-literacy UX, and veterinary epidemiology.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {[
                { id: "all", label: "All Members" },
                { id: "ai", label: "AI & Vision" },
                { id: "ux", label: "UX & Accessibility" },
                { id: "telecom", label: "2G Telecom / IVR" },
                { id: "domain", label: "Veterinary Protocol" },
                { id: "cloud", label: "Cloud & DevSecOps" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-[#2E7D46] text-white shadow-sm"
                      : "bg-white text-[#5B6B5F] hover:bg-[#EEF2EA] hover:text-[#16261B] border border-[#D5DDD0]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-3xl p-6 border border-[#D5DDD0] shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative flex flex-col justify-between group"
              >
                <div>
                  {/* Top Avatar & Role */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <PhotoAvatar member={member} size="md" />

                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 rounded-full bg-[#EEF2EA] text-[#2E7D46] text-[10px] font-extrabold uppercase tracking-wider border border-[#D5DDD0]">
                        {member.categoryLabel}
                      </span>
                      <div className="flex items-center justify-end gap-1.5 mt-2.5">
                        {member.socials?.github && (
                          <a
                            href={member.socials.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-7 h-7 rounded-lg bg-[#EEF2EA] hover:bg-[#DCEFE1] text-[#16261B] flex items-center justify-center transition border border-[#D5DDD0]"
                            title="GitHub"
                          >
                            <Github className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {member.socials?.linkedin && (
                          <a
                            href={member.socials.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-7 h-7 rounded-lg bg-[#EEF2EA] hover:bg-[#DCEFE1] text-[#0A66C2] flex items-center justify-center transition border border-[#D5DDD0]"
                            title="LinkedIn"
                          >
                            <Linkedin className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {member.socials?.email && (
                          <a
                            href={member.socials.email}
                            className="w-7 h-7 rounded-lg bg-[#EEF2EA] hover:bg-[#DCEFE1] text-[#C8372D] flex items-center justify-center transition border border-[#D5DDD0]"
                            title="Email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Name and Role */}
                  <h3 className="text-lg font-black text-[#16261B] leading-tight">
                    {member.name}
                  </h3>
                  <p className="text-xs font-extrabold text-[#2E7D46] mt-0.5">
                    {member.role}
                  </p>
                  <p className="text-[11px] font-semibold text-[#5B6B5F] mt-0.5 mb-3">
                    Focus: {member.focus}
                  </p>

                  {/* Description */}
                  <p className="text-xs text-[#16261B]/80 font-medium leading-relaxed mb-4">
                    {member.description}
                  </p>
                </div>

                {/* Skills Section */}
                <div className="pt-3 border-t border-[#F4F7F2]">
                  <span className="text-[10px] uppercase font-black text-[#5B6B5F] tracking-wider block mb-1.5">
                    Key Tech & Expertise
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {member.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded-lg bg-[#F4F7F2] text-[#16261B] text-[10px] font-bold border border-[#D5DDD0]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── ARCHITECTURAL BREAKTHROUGHS BENTO GRID ── */}
        <section className="space-y-6">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#2E7D46] bg-[#DCEFE1] px-3 py-1 rounded-full border border-[#2E7D46]/20">
              Why Pashu Rakshak Wins
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#16261B] tracking-tight">
              4 Pillar Breakthroughs Solving SIH26128
            </h2>
            <p className="text-xs sm:text-sm text-[#5B6B5F] font-medium leading-relaxed">
              Tailored specifically to tackle real ground constraints in rural Maharashtra: connectivity blackspots,
              low literacy, and urgent need for rapid dispensary alerts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Bento Card 1: 1800 IVR */}
            <div className="bg-gradient-to-br from-[#183921] to-[#215A33] text-white p-7 rounded-3xl shadow-md space-y-4 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl border border-white/20">
                📞
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-[#FBEFCF] bg-white/10 px-2 py-0.5 rounded-md">
                  Zero-Internet Telephony
                </span>
                <h3 className="text-xl font-black text-white">1800 IVR Voice Bridge</h3>
              </div>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">
                Ensures even farmers with ₹1000 2G keypad phones can dial toll-free, hear spoken Hindi voice guidance,
                and press keypad digits (DTMF) to immediately dispatch veterinary aid without any internet connection.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-amber-300">
                <Check className="w-4 h-4" />
                <span>Zero app install needed • DTMF automated triage</span>
              </div>
            </div>

            {/* Bento Card 2: AI Photo Wound */}
            <div className="bg-white p-7 rounded-3xl border border-[#D5DDD0] shadow-sm space-y-4 relative overflow-hidden group hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#DCEFE1] flex items-center justify-center text-2xl border border-[#2E7D46]/20">
                📷
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-[#2E7D46] bg-[#DCEFE1] px-2 py-0.5 rounded-md">
                  Computer Vision Triage
                </span>
                <h3 className="text-xl font-black text-[#16261B]">Photo Wound & Lesion AI</h3>
              </div>
              <p className="text-xs sm:text-sm text-[#5B6B5F] leading-relaxed font-normal">
                Multi-class classification identifying Lumpy Skin nodules, FMD blister lesions, and mastitis inflammation
                with instant plain-language first aid instructions and doctor escalation.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#2E7D46]">
                <Check className="w-4 h-4" />
                <span>Explainable heuristics • Localized Hindi & Marathi aid</span>
              </div>
            </div>

            {/* Bento Card 3: Indic Voice Assistant */}
            <div className="bg-white p-7 rounded-3xl border border-[#D5DDD0] shadow-sm space-y-4 relative overflow-hidden group hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#DCEFE1] flex items-center justify-center text-2xl border border-[#2E7D46]/20">
                🎙️
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-[#2E7D46] bg-[#DCEFE1] px-2 py-0.5 rounded-md">
                  Bilingual Speech AI
                </span>
                <h3 className="text-xl font-black text-[#16261B]">Indic Speech Form Assistant</h3>
              </div>
              <p className="text-xs sm:text-sm text-[#5B6B5F] leading-relaxed font-normal">
                Farmers who cannot read or write comfortably can simply speak their animal&apos;s symptoms into their phone.
                Speech recognition parses symptoms and automatically populates the report.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#2E7D46]">
                <Check className="w-4 h-4" />
                <span>Web Speech API • Audio playback for illiterate users</span>
              </div>
            </div>

            {/* Bento Card 4: Tiered Jurisdictional Grid */}
            <div className="bg-gradient-to-br from-[#16261B] to-[#253D2C] text-white p-7 rounded-3xl shadow-md space-y-4 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl border border-white/20">
                🛡️
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-[#DCEFE1] bg-white/10 px-2 py-0.5 rounded-md">
                  Administrative Governance
                </span>
                <h3 className="text-xl font-black text-white">3-Tier Jurisdiction Security</h3>
              </div>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">
                Strict administrative isolation guarantees a Taluka doctor only manages cases in their block, while
                District Officers and State Directors receive real-time GIS epidemiological cluster heatmaps.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#DCEFE1]">
                <Check className="w-4 h-4" />
                <span>PostGIS coordinates • Quarantine perimeter alerts</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── PRODUCTION TECH STACK MATRIX ── */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-[#16261B] tracking-tight">
              Engineered With Modern Production Technologies
            </h3>
            <p className="text-xs sm:text-sm text-[#5B6B5F] font-semibold">
              Lightweight, offline-capable, and designed for high throughput across Maharashtra.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { title: "Next.js 16", sub: "Turbopack App Router", icon: "▲" },
              { title: "TypeScript", sub: "Type-Safe Backend", icon: "TS" },
              { title: "Prisma ORM", sub: "Spatial DB Schemas", icon: "💎" },
              { title: "Tailwind CSS", sub: "Rustic Contrast UI", icon: "🎨" },
              { title: "Web Speech API", sub: "Voice Recognition", icon: "🎙️" },
              { title: "Twilio TwiML", sub: "Telecom IVR Bridge", icon: "📞" },
            ].map((tech, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-2xl border border-[#D5DDD0] text-center shadow-2xs space-y-1 hover:border-[#2E7D46] hover:shadow-md transition-all"
              >
                <div className="text-xl font-black text-[#2E7D46]">{tech.icon}</div>
                <div className="font-black text-xs text-[#16261B]">{tech.title}</div>
                <div className="text-[10px] text-[#5B6B5F] font-medium">{tech.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── BOTTOM CALL TO ACTION BANNER ── */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#183921] via-[#215A33] to-[#2E7D46] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl text-center md:text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-2 max-w-xl relative z-10">
            <span className="text-[10px] uppercase font-black tracking-wider bg-white/20 px-3 py-1 rounded-full border border-white/20">
              Government of Maharashtra • SIH26128
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Ready to Experience Pashu Rakshak?
            </h3>
            <p className="text-xs sm:text-sm text-white/85 leading-relaxed font-normal">
              Test animal illness reporting, AI photo wound triage, hands-free voice assistant, or the command center
              surveillance dashboard now.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 relative z-10 shrink-0">
            <Link
              href="/"
              className="px-6 py-3.5 rounded-2xl bg-white text-[#183921] font-black text-xs hover:bg-[#F4F7F2] transition shadow-md active:scale-95"
            >
              Explore Home Page
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs transition border border-white/20 active:scale-95"
            >
              Surveillance Grid →
            </Link>
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-[#101F14] text-white py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#183921] via-[#2E7D46] to-[#3B9B58] flex items-center justify-center text-white shadow-md text-xl shrink-0">
                🐄
              </div>
              <div>
                <div className="font-extrabold text-white text-sm">
                  Pashu Rakshak (Jeev Rakshak)
                </div>
                <div className="text-[11px] text-white/50">
                  Problem Statement SIH26128 • Animal Husbandry Department
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-semibold text-white/75">
              <Link href="/" className="hover:text-white transition">
                Home (होम)
              </Link>
              <Link href="/appointments" className="hover:text-white transition text-[#FBEFCF]">
                Connect with Vet (डॉक्टर)
              </Link>
              <Link href="/about" className="hover:text-white transition text-white">
                About Us (टीम परिचय)
              </Link>
              <Link href="/farmer/report" className="hover:text-white transition">
                Report Illness (रोग रिपोर्ट)
              </Link>
              <Link href="/dashboard" className="hover:text-white transition">
                Authority Dashboard
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[11px] text-white/40">
            <div>
              Built with ❤️ for Indian Farmers & Veterinary Officers • SIH26128
            </div>
            <div>
              © {new Date().getFullYear()} Pashu Rakshak / Jeev Rakshak. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
