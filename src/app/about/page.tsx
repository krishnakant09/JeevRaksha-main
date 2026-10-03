"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Users,
  Award,
  Sparkles,
  ArrowLeft,
  ExternalLink,
  Shield,
  HeartPulse,
  Brain,
  Code2,
  Cpu,
  Layers,
  PhoneCall,
  CheckCircle2,
  Stethoscope,
  MapPin,
  ChevronRight,
  Crown,
  Camera,
  Upload,
  Github,
  Linkedin,
  Mail,
  Star,
  Quote,
  Menu,
  X,
  Home,
  Info
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  lead?: boolean;
  tagline: string;
  avatarEmoji: string;
  initials: string;
  photoUrl: string;
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
  lead: true,
  tagline: "System Architecture, Real-Time Syndromic Surveillance & Strategic Vision",
  avatarEmoji: "👨‍💻",
  initials: "KS",
  photoUrl: "/team/krishnakant.jpg",
  focus: "End-to-End System Design, Backend Schemas & SIH Strategy",
  description:
    "Spearheaded overall platform architecture, Next.js 16 full-stack structure, Prisma database models, multi-tier jurisdiction filtering, and seamless orchestration of AI, telephony, and surveillance feeds.",
  contributions: [
    "Architected zero-lag real-time syndromic triage pipeline for 535M+ Indian livestock context",
    "Engineered Taluka, District, and State role-based administrative isolation and GIS spatial query engine",
    "Orchestrated integration of offline speech recognition, IVR telephonic bridge, and automated dispensary dispatch",
    "Formulated problem-solution alignment for SIH26128 with Govt. of Maharashtra Animal Husbandry Department guidelines",
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

// Interactive Photo Avatar Component with automatic fallback and local upload support
function PhotoAvatar({
  member,
  size = "md",
  className = "",
}: {
  member: TeamMember;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const [imgSrc, setImgSrc] = useState<string>(member.photoUrl);
  const [hasError, setHasError] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if a custom photo was previously uploaded by the user in this browser
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`team_photo_${member.id}`);
      if (stored) {
        setImgSrc(stored);
        setHasError(false);
      }
    } catch {
      // ignore localStorage errors
    }
  }, [member.id]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setImgSrc(result);
          setHasError(false);
          try {
            localStorage.setItem(`team_photo_${member.id}`, result);
          } catch {
            // storage quota exceeded or unavailable
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const sizeClasses = {
    sm: "w-14 h-14 text-lg",
    md: "w-20 h-20 text-2xl",
    lg: "w-28 h-28 text-3xl",
    xl: "w-36 h-36 sm:w-48 sm:h-48 text-4xl",
  }[size];

  return (
    <div className={`relative group shrink-0 ${className}`}>
      <div
        className={`${sizeClasses} rounded-3xl overflow-hidden bg-gradient-to-tr from-[#1B4328] via-[#2E7D46] to-[#4DAA68] border-2 border-white/80 shadow-md flex items-center justify-center relative transition-transform duration-300 group-hover:scale-[1.02]`}
      >
        {!hasError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgSrc}
            alt={member.name}
            onError={() => setHasError(true)}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#183921] via-[#2E7D46] to-[#3B9B58] text-white p-2 select-none">
            <span className="font-black tracking-wider text-xl sm:text-2xl drop-shadow-sm">
              {member.initials}
            </span>
            <span className="text-xs sm:text-sm mt-1">{member.avatarEmoji}</span>
          </div>
        )}

        {/* Hover overlay with photo upload trigger */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title={`Upload photo for ${member.name} (or drop into public/team/${member.id}.jpg)`}
          aria-label={`Upload photo for ${member.name}`}
          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2 text-center backdrop-blur-xs cursor-pointer"
        >
          <Camera className="w-5 h-5 mb-1 text-[#FBEFCF]" />
          <span className="text-[10px] font-bold leading-tight text-[#FBEFCF]">
            Upload Photo
          </span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      {/* Role / Crown Badge */}
      {member.lead ? (
        <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white p-2 rounded-2xl shadow-lg border-2 border-white flex items-center justify-center">
          <Crown className="w-4 h-4 text-white fill-white" />
        </div>
      ) : (
        <div className="absolute -bottom-1 -right-1 bg-white border border-[#D5DDD0] text-xs p-1.5 rounded-xl shadow-xs">
          <span>{member.avatarEmoji}</span>
        </div>
      )}
    </div>
  );
}

export default function AboutPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#EEF2EA] text-[#16261B] overflow-x-hidden">
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── TOP NAV BAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#D5DDD0] shadow-xs px-3 sm:px-8 py-2.5 sm:py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group min-w-0 shrink">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-[#1B4328] via-[#2E7D46] to-[#3B9B58] flex items-center justify-center text-white shadow-md shadow-[#2E7D46]/20 group-hover:scale-105 transition-transform shrink-0">
              <span className="text-lg sm:text-xl">🐄</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-base sm:text-lg font-black tracking-tight text-[#16261B] whitespace-nowrap">Jeev Rakshak</span>
                <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase tracking-wider bg-[#DCEFE1] text-[#2E7D46] px-2 py-0.5 rounded-full">
                  SIH26128
                </span>
              </div>
              <p className="hidden sm:block text-[11px] font-semibold text-[#5B6B5F] -mt-0.5 truncate">
                Pashu Rakshak • Livestock Disease Surveillance
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#5B6B5F] hover:text-[#16261B] bg-[#EEF2EA] hover:bg-white px-3.5 py-2 rounded-xl transition border border-[#D5DDD0]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>

            <Link
              href="/dashboard"
              className="hidden sm:inline-flex text-xs font-bold text-[#2E7D46] bg-[#DCEFE1] hover:bg-[#DCEFE1]/80 px-3.5 py-2 rounded-xl transition"
            >
              Authority Portal
            </Link>

            <Link
              href="/farmer/report"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#C8372D] hover:bg-[#B32D24] text-white text-xs sm:text-sm font-black rounded-xl shadow-sm active:scale-95 transition shrink-0"
            >
              <span>🚨</span>
              <span className="hidden sm:inline">Report Illness</span>
              <span className="sm:hidden font-bold">Report</span>
            </Link>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-[#EEF2EA] text-[#16261B] hover:bg-[#DCEFE1] active:scale-95 transition border border-[#D5DDD0] cursor-pointer shrink-0 touch-manipulation select-none"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-red-600" /> : <Menu className="w-5 h-5 text-[#16261B]" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-[#D5DDD0] space-y-2 max-h-[calc(100vh-5rem)] overflow-y-auto pb-4 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="grid grid-cols-2 gap-2 pb-2">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white text-[#16261B] font-bold text-xs border border-[#D5DDD0] hover:bg-[#DCEFE1]"
              >
                <Home className="w-4 h-4 text-[#2E7D46]" />
                <span>Home (होम)</span>
              </Link>
              <Link
                href="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 text-[#2E7D46] font-bold text-xs border border-emerald-200"
              >
                <Info className="w-4 h-4 text-[#2E7D46]" />
                <span>About Us (टीम परिचय)</span>
              </Link>
              <Link
                href="/#first-aid"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white text-[#16261B] font-bold text-xs border border-[#D5DDD0] hover:bg-[#DCEFE1]"
              >
                <span>🩺 First Aid (उपचार)</span>
              </Link>
              <Link
                href="/#surveillance"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white text-[#16261B] font-bold text-xs border border-[#D5DDD0] hover:bg-[#DCEFE1]"
              >
                <span>📡 Surveillance</span>
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white text-[#16261B] font-bold text-xs border border-[#D5DDD0] hover:bg-[#DCEFE1]"
              >
                <span>🏛️ Authority Portal</span>
              </Link>
              <Link
                href="/farmer/ivr"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-900 font-bold text-xs border border-emerald-200"
              >
                <span>📞 1800 IVR Call</span>
              </Link>
              <Link
                href="/farmer/photo-detect"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 text-amber-900 font-bold text-xs border border-amber-200 col-span-2"
              >
                <span>📷 चोट की फोटो से जांच (Photo Wound AI)</span>
              </Link>
            </div>

            {/* Mobile Actions row */}
            <div className="pt-2 border-t border-[#D5DDD0] flex items-center gap-2">
              <Link
                href="/farmer/report"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-xs font-bold text-white bg-[#C8372D] rounded-xl shadow-xs"
              >
                🚨 Report Animal Illness (पशु बीमार है)
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO BANNER ── */}
      <section className="pt-28 pb-16 px-4 sm:px-8 bg-gradient-to-b from-[#183921] via-[#215A33] to-[#2E7D46] text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-wider text-[#FBEFCF]">
            <Award className="w-4 h-4 text-amber-300" />
            <span>Smart India Hackathon • Problem Statement SIH26128</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Meet the Builders Behind <br />
            <span className="text-[#FBEFCF]">Pashu Rakshak (Jeev Rakshak)</span>
          </h1>

          <p className="text-white/90 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed">
            We are a passionate team of engineers and innovators building real-time syndromic disease
            early-warning technology for India&apos;s 535+ million livestock population, developed in alignment
            with the <strong>Government of Maharashtra Animal Husbandry Department</strong>.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <span className="px-3 py-1 rounded-xl bg-white/10 text-xs font-semibold border border-white/20">
              📍 Problem Statement: SIH26128
            </span>
            <span className="px-3 py-1 rounded-xl bg-white/10 text-xs font-semibold border border-white/20">
              🏛️ Ministry / State: Govt. of Maharashtra
            </span>
            <span className="px-3 py-1 rounded-xl bg-white/10 text-xs font-semibold border border-white/20">
              🌱 Theme: Agriculture, FoodTech & Rural Development
            </span>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-14 space-y-16">

        {/* ── PHOTO UPLOAD HINT NOTIFICATION ── */}
        <div className="bg-[#DCEFE1]/80 border border-[#2E7D46]/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#183921]">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">📷</span>
            <div>
              <strong className="font-extrabold text-[#183921]">Team Photos Ready:</strong>{" "}
              <span>
                Hover over any member&apos;s photo card to upload an image from your computer, or place images inside{" "}
                <code className="bg-white/80 px-1.5 py-0.5 rounded font-mono font-bold text-[#2E7D46]">
                  public/team/&lt;name&gt;.jpg
                </code>.
              </span>
            </div>
          </div>
          <span className="text-[11px] font-bold text-[#2E7D46] bg-white px-2.5 py-1 rounded-xl border border-[#D5DDD0] shadow-2xs shrink-0">
            Interactive Uploads Enabled
          </span>
        </div>

        {/* ── FOUNDER & TEAM LEADER SPOTLIGHT ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h2 className="text-xl sm:text-2xl font-black text-[#16261B] tracking-tight">
              Founder & Team Leader Spotlight
            </h2>
          </div>

          <div className="bg-gradient-to-br from-white via-[#FCFDFB] to-[#F4F7F2] rounded-3xl p-6 sm:p-10 border-2 border-[#2E7D46]/40 shadow-xl relative overflow-hidden transition-all hover:shadow-2xl">
            {/* Top decorative badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-l from-[#2E7D46] to-[#183921] text-white text-[10px] sm:text-xs font-black uppercase tracking-wider py-1.5 px-6 rounded-bl-2xl shadow-sm flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Project Architect & Team Lead</span>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mt-2">
              {/* Leader Photo with Avatar Fallback */}
              <div className="flex flex-col items-center gap-3">
                <PhotoAvatar member={FOUNDER_LEADER} size="xl" />
                <span className="text-[11px] text-[#5B6B5F] font-semibold text-center flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-[#2E7D46]" />
                  <span>Click avatar to change photo</span>
                </span>
                
                {/* Social Links */}
                <div className="flex items-center gap-2 pt-1">
                  {FOUNDER_LEADER.socials?.github && (
                    <a
                      href={FOUNDER_LEADER.socials.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-xl bg-[#EEF2EA] hover:bg-[#DCEFE1] text-[#16261B] flex items-center justify-center transition border border-[#D5DDD0]"
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
                      className="w-8 h-8 rounded-xl bg-[#EEF2EA] hover:bg-[#DCEFE1] text-[#16261B] flex items-center justify-center transition border border-[#D5DDD0]"
                      title="LinkedIn Profile"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {FOUNDER_LEADER.socials?.email && (
                    <a
                      href={FOUNDER_LEADER.socials.email}
                      className="w-8 h-8 rounded-xl bg-[#EEF2EA] hover:bg-[#DCEFE1] text-[#16261B] flex items-center justify-center transition border border-[#D5DDD0]"
                      title="Email Contact"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Leader Details */}
              <div className="flex-1 space-y-4 text-center md:text-left">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCEFE1] text-[#2E7D46] text-xs font-black uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Founder • Lead Architect</span>
                  </div>
                  <h3 className="text-2xl sm:text-4xl font-black text-[#16261B] tracking-tight">
                    {FOUNDER_LEADER.name}
                  </h3>
                  <p className="text-sm sm:text-base font-extrabold text-[#2E7D46] mt-0.5">
                    {FOUNDER_LEADER.role}
                  </p>
                  <p className="text-xs sm:text-sm text-[#5B6B5F] font-medium mt-1">
                    {FOUNDER_LEADER.tagline}
                  </p>
                </div>

                {/* Quote block */}
                <div className="bg-[#EEF2EA] rounded-2xl p-4 border border-[#D5DDD0] flex items-start gap-3 text-left">
                  <Quote className="w-5 h-5 text-[#2E7D46] shrink-0 mt-0.5 rotate-180 opacity-70" />
                  <p className="text-xs sm:text-sm text-[#16261B] font-semibold italic leading-relaxed">
                    &ldquo;Our vision for Pashu Rakshak is to bridge India&apos;s rural digital divide.
                    Every dairy farmer with even a 2G keypad phone deserves the same early-warning protection
                    against devastating outbreaks like FMD and Lumpy Skin Disease.&rdquo;
                  </p>
                </div>

                {/* Contributions list */}
                <div className="space-y-2 pt-1 text-left">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#5B6B5F]">
                    Key Architectural & Hackathon Milestones
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {FOUNDER_LEADER.contributions?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-[#D5DDD0]/80 shadow-2xs"
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
                <div className="pt-2 text-left">
                  <span className="text-[10px] uppercase font-black text-[#5B6B5F] tracking-wider block mb-1.5">
                    Core Technical Mastery
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {FOUNDER_LEADER.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2.5 py-1 rounded-xl bg-white text-[#16261B] text-xs font-bold border border-[#D5DDD0] shadow-2xs hover:border-[#2E7D46] transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CORE TEAM MEMBERS ── */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 border-b border-[#D5DDD0] pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCEFE1] text-[#2E7D46] text-xs font-black uppercase tracking-wider mb-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Specialized Domain Leads</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#16261B] tracking-tight">
                Core Engineering & Domain Team
              </h2>
            </div>
            <p className="text-xs text-[#5B6B5F] font-semibold max-w-md">
              Multidisciplinary innovators spanning AI/Vision, Telecom IVR, low-literacy UX, and veterinary epidemiology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CORE_TEAM.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-3xl p-6 border border-[#D5DDD0] shadow-xs transition-all hover:shadow-xl hover:-translate-y-1 relative flex flex-col justify-between group"
              >
                <div>
                  {/* Photo & Role Badge Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <PhotoAvatar member={member} size="md" />

                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 rounded-full bg-[#EEF2EA] text-[#2E7D46] text-[10px] font-extrabold uppercase tracking-wider border border-[#D5DDD0]">
                        {member.avatarEmoji} Lead
                      </span>
                      <div className="flex items-center justify-end gap-1.5 mt-2">
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
                            className="w-7 h-7 rounded-lg bg-[#EEF2EA] hover:bg-[#DCEFE1] text-[#16261B] flex items-center justify-center transition border border-[#D5DDD0]"
                            title="LinkedIn"
                          >
                            <Linkedin className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {member.socials?.email && (
                          <a
                            href={member.socials.email}
                            className="w-7 h-7 rounded-lg bg-[#EEF2EA] hover:bg-[#DCEFE1] text-[#16261B] flex items-center justify-center transition border border-[#D5DDD0]"
                            title="Email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Name and Designation */}
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
                <div className="pt-3 border-t border-[#EEF2EA]">
                  <span className="text-[10px] uppercase font-black text-[#5B6B5F] tracking-wider block mb-1.5">
                    Key Tech & Expertise
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {member.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded-lg bg-[#EEF2EA] text-[#16261B] text-[10px] font-bold border border-[#D5DDD0]"
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

        {/* ── PROJECT INNOVATION PILLARS ── */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-[#D5DDD0] shadow-sm space-y-8">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#2E7D46] bg-[#DCEFE1] px-3 py-1 rounded-full">
              Why Pashu Rakshak Wins
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#16261B]">
              Key Technological Breakthroughs
            </h2>
            <p className="text-xs sm:text-sm text-[#5B6B5F] font-medium leading-relaxed">
              Designed from ground up to satisfy all requirements of Problem Statement SIH26128
              and real ground-level challenges faced by rural farmers in Maharashtra.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#EEF2EA] border border-[#D5DDD0] space-y-2 hover:border-[#2E7D46] transition-colors">
              <div className="text-2xl">📞</div>
              <h4 className="font-black text-sm text-[#16261B]">Zero-Internet 1800 IVR</h4>
              <p className="text-xs text-[#5B6B5F] font-medium leading-relaxed">
                Keypad phone telephony with automated spoken Hindi voice guidance and instant DTMF emergency triage.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#EEF2EA] border border-[#D5DDD0] space-y-2 hover:border-[#2E7D46] transition-colors">
              <div className="text-2xl">📷</div>
              <h4 className="font-black text-sm text-[#16261B]">AI Photo Wound Triage</h4>
              <p className="text-xs text-[#5B6B5F] font-medium leading-relaxed">
                Camera lesion detection with clinical first-aid advisories and photo dispatch to local dispensary vets.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#EEF2EA] border border-[#D5DDD0] space-y-2 hover:border-[#2E7D46] transition-colors">
              <div className="text-2xl">🎙️</div>
              <h4 className="font-black text-sm text-[#16261B]">Indic Voice Assistant</h4>
              <p className="text-xs text-[#5B6B5F] font-medium leading-relaxed">
                Hands-free speech recognition in Marathi, Hindi, and English that automatically extracts symptoms and fills forms.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#EEF2EA] border border-[#D5DDD0] space-y-2 hover:border-[#2E7D46] transition-colors">
              <div className="text-2xl">🛡️</div>
              <h4 className="font-black text-sm text-[#16261B]">Server Jurisdiction Grid</h4>
              <p className="text-xs text-[#5B6B5F] font-medium leading-relaxed">
                State, District, and Taluka boundary isolation enforced strictly on backend APIs with GIS hotspot mapping.
              </p>
            </div>
          </div>
        </section>

        {/* ── TECH STACK MATRIX ── */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-[#16261B]">
              Engineered With Modern Production Technologies
            </h3>
            <p className="text-xs text-[#5B6B5F] font-semibold">
              Built using scalable, lightweight, and offline-aware technology.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { title: "Next.js 16", sub: "Turbopack App Router", icon: "▲" },
              { title: "TypeScript", sub: "End-to-End Type Safety", icon: "TS" },
              { title: "Prisma ORM", sub: "Schema & Spatial Queries", icon: "💎" },
              { title: "Tailwind CSS", sub: "WCAG Accessible UI", icon: "🎨" },
              { title: "Web Speech API", sub: "Speech-to-Text & TTS", icon: "🎙️" },
              { title: "Twilio / TwiML", sub: "Telecom IVR Gateway", icon: "📞" },
            ].map((tech, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-2xl border border-[#D5DDD0] text-center shadow-2xs space-y-1 hover:border-[#2E7D46] transition-colors"
              >
                <div className="text-xl font-black text-[#2E7D46]">{tech.icon}</div>
                <div className="font-black text-xs text-[#16261B]">{tech.title}</div>
                <div className="text-[10px] text-[#5B6B5F] font-medium">{tech.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CALL TO ACTION ── */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#183921] via-[#215A33] to-[#2E7D46] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl text-center md:text-left">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-[10px] uppercase font-black tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
              Government of Maharashtra • SIH26128
            </span>
            <h3 className="text-xl sm:text-2xl font-black">
              Experience Pashu Rakshak in Action
            </h3>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Test real disease reporting, camera wound triage, voice form assistant, or the command center dashboard.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="px-5 py-3 rounded-2xl bg-white text-[#183921] font-black text-xs hover:bg-[#EEF2EA] transition shadow-md"
            >
              Explore Home Page
            </Link>
            <Link
              href="/dashboard"
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs transition border border-white/20"
            >
              Surveillance Grid →
            </Link>
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-[#16261B] text-white py-10 px-4 sm:px-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-white/60">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐄</span>
            <span className="font-bold text-white">Pashu Rakshak (Jeev Rakshak)</span>
            <span>• SIH26128</span>
          </div>
          <div>
            Built with ❤️ for Indian Farmers & Veterinary Officers • © {new Date().getFullYear()}
          </div>
        </div>
      </footer>
    </div>
  );
}
