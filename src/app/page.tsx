"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  HeartPulse,
  AlertTriangle,
  ArrowRight,
  Shield,
  Activity,
  CheckCircle2,
  MapPin,
  Sparkles,
  Phone,
  Clock,
  ChevronRight,
  PlusCircle,
  FileText,
  Users,
  Compass,
  Bell,
  Check,
  Menu,
  X,
  Home,
  Info,
  Stethoscope,
  Calendar
} from "lucide-react";

interface SymptomGuide {
  id: string;
  icon: string;
  nameHi: string;
  nameEn: string;
  urgency: "HIGH" | "MEDIUM" | "LOW";
  firstAidHi: string;
  firstAidEn: string;
  suspected: string;
}

const SYMPTOM_GUIDE_ITEMS: SymptomGuide[] = [
  {
    id: "fever",
    icon: "🌡️",
    nameHi: "तेज़ बुखार",
    nameEn: "High Fever",
    urgency: "HIGH",
    firstAidHi: "पशु को धूप से हटाकर ठंडी छायादार जगह पर रखें। ठंडा पानी पिलाएं और तुरंत पशु चिकित्सक से संपर्क करें।",
    firstAidEn: "Move the animal to a shaded, well-ventilated area. Offer cool water and request immediate veterinary triage.",
    suspected: "FMD / BQ / Tick Fever",
  },
  {
    id: "eating",
    icon: "🍽️",
    nameHi: "चारा न खाना",
    nameEn: "Loss of Appetite",
    urgency: "MEDIUM",
    firstAidHi: "साफ पानी और ताजा हरा चारा थोड़ा-थोड़ा दें। 24 घंटे में सुधार न होने पर जांच कराएं।",
    firstAidEn: "Offer small portions of fresh green fodder and clean water. Monitor digestion closely.",
    suspected: "Indigestion / LSD / Worms",
  },
  {
    id: "limping",
    icon: "🦶",
    nameHi: "लंगड़ाना",
    nameEn: "Limping / Lameness",
    urgency: "MEDIUM",
    firstAidHi: "खुर की सफाई करें, कंकड़-पत्थर निकालें। पशु को नरम मिट्टी या पुआल के बिछावन पर खड़ा करें।",
    firstAidEn: "Clean hooves carefully with mild water. Provide soft bedding and check for lesions.",
    suspected: "FMD / Hoof Rot / BQ",
  },
  {
    id: "diarrhea",
    icon: "💧",
    nameHi: "पतला गोबर",
    nameEn: "Loose Motion / Diarrhea",
    urgency: "HIGH",
    firstAidHi: "शरीर में पानी की कमी रोकने के लिए ओआरएस (ORS) घोल या नमक-चीनी का पानी बार-बार पिलाएं।",
    firstAidEn: "Administer ORS electrolyte solution regularly to prevent severe dehydration and shock.",
    suspected: "Enteritis / PPR / Coccidiosis",
  },
  {
    id: "milk",
    icon: "🥛",
    nameHi: "दूध कम होना",
    nameEn: "Drop in Milk Yield",
    urgency: "LOW",
    firstAidHi: "थन और अयन की जांच करें। कठोरता या सूजन होने पर थन पर ठंडे पानी के छींटे न मारें, डॉक्टर को दिखाएं।",
    firstAidEn: "Inspect udder for swelling or heat. Check feed nutrition and milk consistency.",
    suspected: "Mastitis / Stress / Fever",
  },
  {
    id: "lesions",
    icon: "🩹",
    nameHi: "छाले व त्वचा घाव",
    nameEn: "Blisters & Skin Lesions",
    urgency: "HIGH",
    firstAidHi: "घाव को साफ पोटैशियम परमैंगनेट (लाल दवा) के हल्के घोल से धोएं। संक्रमित पशु को बाकी झुंड से अलग करें।",
    firstAidEn: "Isolate the animal immediately to prevent contagious spread. Clean sores with mild antiseptic wash.",
    suspected: "FMD / Lumpy Skin (LSD)",
  },
];

export default function HomeLandingPage() {
  const [user, setUser] = useState<any>(null);
  const [selectedGuideIndex, setSelectedGuideIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("jeevraksha_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

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

  const handleAnchorClick = (id: string) => {
    setIsMobileMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 200);
  };

  const isDoctor = user?.role === "VETERINARIAN";
  const isAdmin =
    user &&
    (user.role === "ADMIN" ||
      user.role === "STATE_OFFICER" ||
      user.role === "DISTRICT_OFFICER" ||
      user.role === "TALUKA_OFFICER");
  const isFarmer = user?.role === "FARMER";

  const farmerPortalHref = isFarmer ? "/farmer/report" : "/login?role=farmer&redirect=/farmer/report";
  const doctorPortalHref = isDoctor ? "/dashboard/cases" : "/login?role=vet&redirect=/dashboard/cases";
  const adminPortalHref = isAdmin ? "/dashboard" : "/login?role=admin&redirect=/dashboard";
  const ivrHref = isFarmer ? "/farmer/ivr" : "/login?role=farmer&redirect=/farmer/ivr";
  const photoDetectHref = isFarmer ? "/farmer/photo-detect" : "/login?role=farmer&redirect=/farmer/photo-detect";

  const activeGuide = SYMPTOM_GUIDE_ITEMS[selectedGuideIndex];

  return (
    <div className="min-h-screen bg-[#EEF2EA] text-[#16261B] overflow-x-hidden">
      {/* ── MOBILE DRAWER BACKDROP ── */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* ── MOBILE SLIDE-OVER DRAWER ── */}
      <aside
        id="mobile-navigation-drawer"
        aria-label="Mobile Navigation"
        className={`lg:hidden fixed top-0 right-0 bottom-0 w-[86vw] max-w-sm bg-white z-50 shadow-2xl flex flex-col border-l border-[#D5DDD0] transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#D5DDD0] bg-[#F7F9F5] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#1B4328] via-[#2E7D46] to-[#3B9B58] flex items-center justify-center text-white shadow-md shadow-[#2E7D46]/20">
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
                AI Livestock Surveillance Grid
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
              <span>Home (होम)</span>
            </Link>

            <Link
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-[#EEF2EA] text-[#16261B] font-bold text-xs border border-[#D5DDD0] transition"
            >
              <Info className="w-4 h-4 text-amber-600" />
              <span>About Us (टीम परिचय)</span>
            </Link>

            <button
              type="button"
              onClick={() => handleAnchorClick("first-aid")}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white hover:bg-[#EEF2EA] text-[#16261B] font-bold text-xs border border-[#D5DDD0] transition text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🩺</span>
                <span>प्राथमिक उपचार (First Aid Guide)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            <button
              type="button"
              onClick={() => handleAnchorClick("portals")}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white hover:bg-[#EEF2EA] text-[#16261B] font-bold text-xs border border-[#D5DDD0] transition text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🏛️</span>
                <span>पोर्टल चयन (All Portals)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Rapid Tools Section */}
          <div className="space-y-1.5 pt-2">
            <p className="text-[10px] font-black uppercase tracking-wider text-[#5B6B5F] px-1">Rapid Tools (त्वरित साधन)</p>

            <Link
              href={ivrHref}
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
              href={photoDetectHref}
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

        {/* Drawer Footer / Auth */}
        <div className="p-4 border-t border-[#D5DDD0] bg-[#F7F9F5] shrink-0">
          {!user ? (
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 text-center text-xs font-bold text-[#16261B] bg-white rounded-xl border border-[#D5DDD0] hover:bg-gray-50 transition"
              >
                Sign In (लॉग इन)
              </Link>
              <Link
                href="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 text-center text-xs font-bold text-[#2E7D46] bg-[#DCEFE1] hover:bg-[#DCEFE1]/80 rounded-xl border border-[#2E7D46]/20 transition"
              >
                Create Account
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">Signed in as:</span>
                <span className="font-bold text-[#16261B] truncate max-w-[150px]">{user.name || user.email}</span>
              </div>
              <Link
                href={user.role === "FARMER" ? "/farmer/report" : "/dashboard"}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full py-2.5 text-center text-xs font-bold text-white bg-[#2E7D46] hover:bg-[#256638] rounded-xl shadow-xs transition"
              >
                {user.role === "FARMER" ? "🌾 Open Farmer Portal" : "🩺 Open Authority Dashboard"}
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* ── TOP NAV BAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#D5DDD0] shadow-xs">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group min-w-0 shrink">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-[#1B4328] via-[#2E7D46] to-[#3B9B58] flex items-center justify-center text-white shadow-md shadow-[#2E7D46]/20 group-hover:scale-105 transition-transform shrink-0">
              <span className="text-lg sm:text-xl">🐄</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-base sm:text-lg font-black tracking-tight text-[#16261B] whitespace-nowrap">Jeev Rakshak</span>
                <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase tracking-wider bg-[#DCEFE1] text-[#2E7D46] px-2 py-0.5 rounded-full">
                  Surveillance Grid
                </span>
              </div>
              <p className="hidden sm:block text-[11px] font-semibold text-[#5B6B5F] -mt-0.5 truncate">
                जीव रक्षा • AI Livestock Health & Early Warning
              </p>
            </div>
          </Link>

          {/* Desktop Center Links */}
          <div className="hidden lg:flex items-center gap-1 bg-[#EEF2EA] p-1 rounded-xl border border-[#D5DDD0]">
            <Link
              href="/"
              className="px-3 py-1.5 text-xs font-bold text-[#16261B] hover:bg-white rounded-lg transition"
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
              className="px-3 py-1.5 text-xs font-bold text-[#5B6B5F] hover:text-[#16261B] hover:bg-white rounded-lg transition"
            >
              About Us (टीम परिचय)
            </Link>
            <a
              href="#first-aid"
              className="px-3 py-1.5 text-xs font-bold text-[#5B6B5F] hover:text-[#16261B] hover:bg-white rounded-lg transition"
            >
              प्राथमिक उपचार (First Aid)
            </a>
          </div>

          {/* Auth & Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {!user ? (
              <>
                <Link
                  href="/login"
                  className="hidden sm:inline-flex text-xs font-bold text-[#16261B] hover:text-[#2E7D46] px-3 py-2 rounded-xl transition"
                >
                  Sign In (लॉग इन)
                </Link>
                <Link
                  href="/register"
                  className="hidden md:inline-flex items-center text-xs font-bold text-[#2E7D46] bg-[#DCEFE1] hover:bg-[#DCEFE1]/80 px-3.5 py-2 rounded-xl transition"
                >
                  Create Account
                </Link>
              </>
            ) : (
              <Link
                href={user.role === "FARMER" ? "/farmer/report" : "/dashboard"}
                className="hidden sm:inline-flex text-xs font-bold text-[#2E7D46] bg-[#DCEFE1] px-3 py-2 rounded-xl"
              >
                {user.role === "FARMER" ? "🌾 Farmer Portal" : "🩺 Dashboard"}
              </Link>
            )}

            {/* Quick Emergency Report Button */}
            <Link
              href="/farmer/report"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#C8372D] hover:bg-[#B32D24] text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-md shadow-[#C8372D]/20 active:scale-95 transition shrink-0"
            >
              <span>🚨</span>
              <span className="hidden sm:inline">पशु बीमार है (Report)</span>
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

      {/* ── HERO SECTION ── */}
      <section className="pt-24 pb-16 relative overflow-hidden bg-gradient-to-b from-[#183921] via-[#215A33] to-[#2E7D46] text-white">
        {/* Subtle background grid */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-2">
          {/* ── 3 PRIMARY ENTRY BUTTONS (LESS-EDUCATED ACCESSIBILITY & RAPID ACCESS) ── */}
          <div id="portals" className="mb-10 bg-black/20 backdrop-blur-md p-4 sm:p-6 rounded-3xl border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-[#E8A317] animate-pulse" />
                <h2 className="text-base sm:text-lg font-black text-[#FBEFCF] tracking-wide uppercase">
                  ⚡ अपना पोर्टल चुनें • Select Your Portal
                </h2>
              </div>
              <span className="text-xs text-white/90 font-bold bg-white/10 px-3 py-1 rounded-full border border-white/15">
                सीधे काम के लिए नीचे 1, 2 या 3 नंबर पर टच करें
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. FARMER PORTAL */}
              <Link
                href={farmerPortalHref}
                className="group relative bg-[#F2F9F4] hover:bg-white text-[#16261B] rounded-2xl p-5 border-4 border-[#2E7D46] shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1 flex flex-col justify-between active:scale-[0.98]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-4xl p-2.5 rounded-2xl bg-[#DCEFE1] inline-block shadow-sm group-hover:scale-110 transition-transform">
                      🌾🐄
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#2E7D46] text-white text-xs font-black tracking-wider uppercase shadow-sm">
                      विकल्प 1 • FARMER
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#16261B] group-hover:text-[#2E7D46] transition-colors">
                    किसान पोर्टल
                  </h3>
                  <p className="text-sm font-bold text-[#2E7D46] mt-0.5">
                    Farmer Portal
                  </p>
                  <p className="text-xs text-[#354839] font-semibold mt-2 leading-relaxed">
                    पशु बीमार है? डॉक्टर बुलाएं, लक्षण दर्ज करें या AI सहायता से तुरंत सलाह लें।
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#D5DDD0] flex items-center justify-between text-xs font-black text-[#2E7D46]">
                  <span className="bg-[#DCEFE1] px-2.5 py-1 rounded-lg">प्रवेश करें (Report)</span>
                  <span className="w-8 h-8 rounded-xl bg-[#2E7D46] text-white flex items-center justify-center font-black group-hover:translate-x-1 transition-transform">
                    ➔
                  </span>
                </div>
              </Link>

              {/* 2. VET PORTAL */}
              <Link
                href={doctorPortalHref}
                className="group relative bg-[#FFFDF5] hover:bg-white text-[#16261B] rounded-2xl p-5 border-4 border-[#E8A317] shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1 flex flex-col justify-between active:scale-[0.98]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-4xl p-2.5 rounded-2xl bg-[#FBEFCF] inline-block shadow-sm group-hover:scale-110 transition-transform">
                      🩺👨‍⚕️
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#E8A317] text-[#16261B] text-xs font-black tracking-wider uppercase shadow-sm">
                      विकल्प 2 • VET
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#16261B] group-hover:text-[#B87E0E] transition-colors">
                    डॉक्टर पोर्टल
                  </h3>
                  <p className="text-sm font-bold text-[#B87E0E] mt-0.5">
                    Veterinary Doctor
                  </p>
                  <p className="text-xs text-[#354839] font-semibold mt-2 leading-relaxed">
                    मरीज़ केस देखें, इमरजेंसी स्वीकार करें, दवा व इलाज का पर्चा (Rx) बनाएं।
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#D5DDD0] flex items-center justify-between text-xs font-black text-[#B87E0E]">
                  <span className="bg-[#FBEFCF] px-2.5 py-1 rounded-lg">
                    {isDoctor ? "केस देखें (Cases)" : "लॉग इन करें (Sign In)"}
                  </span>
                  <span className="w-8 h-8 rounded-xl bg-[#E8A317] text-[#16261B] flex items-center justify-center font-black group-hover:translate-x-1 transition-transform">
                    ➔
                  </span>
                </div>
              </Link>

              {/* 3. ADMIN PORTAL */}
              <Link
                href={adminPortalHref}
                className="group relative bg-[#F7F9FB] hover:bg-white text-[#16261B] rounded-2xl p-5 border-4 border-[#16261B] shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1 flex flex-col justify-between active:scale-[0.98]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-4xl p-2.5 rounded-2xl bg-[#EEF2EA] inline-block shadow-sm group-hover:scale-110 transition-transform">
                      🛡️📊
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#16261B] text-white text-xs font-black tracking-wider uppercase shadow-sm">
                      विकल्प 3 • ADMIN
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#16261B] group-hover:text-black transition-colors">
                    एडमिन पोर्टल
                  </h3>
                  <p className="text-sm font-bold text-[#16261B] mt-0.5">
                    Admin / Officer
                  </p>
                  <p className="text-xs text-[#354839] font-semibold mt-2 leading-relaxed">
                    रोग निगरानी नक्शा, जिले के आंकड़े, आउटब्रेक चेतावनी व समग्र नियंत्रण ग्रिड।
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#D5DDD0] flex items-center justify-between text-xs font-black text-[#16261B]">
                  <span className="bg-[#EEF2EA] px-2.5 py-1 rounded-lg">डैशबोर्ड खोलें (Grid)</span>
                  <span className="w-8 h-8 rounded-xl bg-[#16261B] text-white flex items-center justify-center font-black group-hover:translate-x-1 transition-transform">
                    ➔
                  </span>
                </div>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
            {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-5">
            {/* Live Indicator Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-black/25 backdrop-blur-md rounded-full border border-white/20 text-xs font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>National Animal Disease Surveillance Grid • Active</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              पशु स्वास्थ्य सुरक्षा एवं <br />
              <span className="text-[#FBEFCF]">त्वरित रोग पूर्व-चेतावनी प्रणाली</span>
            </h1>

            <p className="text-white/90 text-sm sm:text-base max-w-xl font-medium leading-relaxed">
              India's real-time rural livestock health surveillance platform. Connecting farmers,
              veterinarians, and disease control authorities for instant triage, contagious outbreak
              isolation, and field veterinary assistance.
            </p>

            {/* Big Emergency SOS CTA Box (Inspired directly by Pashu Rakshak prototype!) */}
            <div className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/20 space-y-3 shadow-xl">
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/farmer/report"
                  className="flex-1 p-4 rounded-2xl bg-[#C8372D] hover:bg-[#B32D24] text-white flex items-center gap-3 shadow-lg active:scale-[0.99] transition group"
                >
                  <span className="text-4xl group-hover:scale-110 transition-transform">🚨</span>
                  <div className="text-left">
                    <span className="text-lg sm:text-xl font-black block leading-tight">
                      पशु बीमार है? तुरंत रिपोर्ट करें
                    </span>
                    <span className="text-xs text-white/90 font-medium block mt-0.5">
                      My animal is sick • Tap for rapid triage & doctor dispatch
                    </span>
                  </div>
                </Link>

                <Link
                  href={ivrHref}
                  className="p-4 rounded-2xl bg-[#DCEFE1] hover:bg-emerald-100 text-[#16261B] flex items-center justify-center gap-2 font-black text-sm shadow-md active:scale-[0.99] transition shrink-0 border-2 border-[#2E7D46]"
                >
                  <span className="text-2xl">📞</span>
                  <div className="text-left">
                    <span className="block leading-tight font-black">1800 IVR हेल्पलाइन</span>
                    <span className="text-[10px] text-[#2E7D46] block font-bold">बिना इंटरनेट फोन कॉल</span>
                  </div>
                </Link>

                <Link
                  href={photoDetectHref}
                  className="p-4 rounded-2xl bg-[#E8A317] hover:bg-[#D69312] text-[#16261B] flex items-center justify-center gap-2.5 font-black text-sm shadow-md active:scale-[0.99] transition shrink-0 border-2 border-[#B87E0E]"
                >
                  <span className="text-2xl">📷</span>
                  <div className="text-left">
                    <span className="block leading-tight font-black">चोट की फोटो से जांच</span>
                    <span className="text-[10px] text-[#16261B]/80 block font-bold">AI घाव व रोग विश्लेषण</span>
                  </div>
                </Link>
              </div>

              <div className="flex items-center justify-between text-xs text-white/80 px-1 pt-1 font-medium">
                <span>✓ कैमरे से फोटो द्वारा त्वरित जांच</span>
                <span>✓ 24x7 पशु चिकित्सा सलाह</span>
                <span>✓ निःशुल्क पंजीकरण</span>
              </div>
            </div>
          </div>

          {/* Hero Right: Live Triage Card Showcase */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-5 sm:p-6 text-[#16261B] shadow-2xl border border-white/20 space-y-4 relative">
              <div className="flex items-center justify-between border-b border-[#D5DDD0] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#DCEFE1] text-[#2E7D46] flex items-center justify-center font-bold">
                    🩺
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#16261B]">Live Field Case #841</h3>
                    <p className="text-[11px] text-[#5B6B5F]">Rampur Cluster • 2 mins ago</p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-[#F8DAD6] text-[#C8372D] text-xs font-black uppercase">
                  🚨 High Outbreak Risk
                </span>
              </div>

              {/* Animal & Symptoms */}
              <div className="bg-[#EEF2EA] rounded-2xl p-3.5 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-sm text-[#16261B]">🐃 Gauri (Murrah Buffalo)</span>
                  <span className="text-[#5B6B5F] font-bold">Age: 4 yrs</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 bg-white text-[#C8372D] text-[11px] font-bold rounded-md border border-[#D5DDD0]">
                    🌡️ तेज़ बुखार (104.5°F)
                  </span>
                  <span className="px-2 py-0.5 bg-white text-[#C8372D] text-[11px] font-bold rounded-md border border-[#D5DDD0]">
                    🩹 खुर में छाले (Lesions)
                  </span>
                  <span className="px-2 py-0.5 bg-white text-[#8A5E00] text-[11px] font-bold rounded-md border border-[#D5DDD0]">
                    💧 लार गिरना (Salivation)
                  </span>
                </div>
              </div>

              {/* First Aid Guidance */}
              <div className="bg-[#FBEFCF] p-3 rounded-xl border border-[#E8A317]/30 text-xs text-[#8A5E00]">
                <b>Immediate Bio-Security Action:</b> Isolate affected animal from herd. Wash hooves with mild saline.
              </div>

              {/* Lifecycle Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#5B6B5F]">
                  Veterinary Response Status
                </p>
                <div className="flex items-center justify-between text-xs font-bold text-[#16261B]">
                  <span className="text-[#2E7D46] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D46]" /> Vet Dispatched
                  </span>
                  <span className="text-xs text-[#5B6B5F]">Dr. Anil Verma (UP-VC-20418)</span>
                </div>
                <div className="w-full h-2 bg-[#EEF2EA] rounded-full overflow-hidden">
                  <div className="h-full bg-[#2E7D46] w-3/4 rounded-full" />
                </div>
              </div>

              <Link
                href="/dashboard"
                className="w-full py-2.5 bg-[#EEF2EA] hover:bg-[#D5DDD0] text-[#16261B] text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <span>View Public Surveillance Map</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>

      {/* ── LIVE STATS TICKER ── */}
      <section className="bg-white border-b border-[#D5DDD0] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3">
            <b className="text-3xl sm:text-4xl font-black text-[#2E7D46] block">1,248+</b>
            <span className="text-xs sm:text-sm font-bold text-[#5B6B5F]">Active Farmers Registered</span>
          </div>
          <div className="p-3 border-l border-[#D5DDD0]">
            <b className="text-3xl sm:text-4xl font-black text-[#E8A317] block">37+</b>
            <span className="text-xs sm:text-sm font-bold text-[#5B6B5F]">Vets on Live Duty</span>
          </div>
          <div className="p-3 border-l border-[#D5DDD0]">
            <b className="text-3xl sm:text-4xl font-black text-[#16261B] block">98.4%</b>
            <span className="text-xs sm:text-sm font-bold text-[#5B6B5F]">Early Outbreak Detection</span>
          </div>
          <div className="p-3 border-l border-[#D5DDD0]">
            <b className="text-3xl sm:text-4xl font-black text-[#C8372D] block">&lt; 15 min</b>
            <span className="text-xs sm:text-sm font-bold text-[#5B6B5F]">Average Triage Response</span>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE SYMPTOM & FIRST AID EXPLORER (PASHU RAKSHAK REFERENCE) ── */}
      <section id="first-aid" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#2E7D46] bg-[#DCEFE1] px-3 py-1 rounded-full">
            Immediate Clinical Guide
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#16261B] mt-2">
            आम पशु लक्षण एवं प्राथमिक उपचार
          </h2>
          <p className="text-xs sm:text-sm text-[#5B6B5F] font-semibold mt-1">
            Tap a symptom to see what first-aid care to take immediately before the veterinary doctor arrives.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Symptom Selection Tiles */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SYMPTOM_GUIDE_ITEMS.map((item, idx) => {
              const isSelected = selectedGuideIndex === idx;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedGuideIndex(idx)}
                  className={`p-4 rounded-2xl text-center transition-all border-2 flex flex-col items-center justify-center gap-1 select-none ${
                    isSelected
                      ? "border-[#2E7D46] bg-[#DCEFE1] shadow-md scale-102"
                      : "border-[#D5DDD0] bg-white hover:border-[#2E7D46]/40 hover:bg-[#EEF2EA]/50"
                  }`}
                >
                  <span className="text-3xl sm:text-4xl">{item.icon}</span>
                  <span className="font-extrabold text-sm text-[#16261B] mt-1">{item.nameHi}</span>
                  <span className="text-[11px] font-semibold text-[#5B6B5F]">{item.nameEn}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic First-Aid Advisory Card */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-md border border-[#D5DDD0] space-y-4">
            <div className="flex items-center justify-between border-b border-[#D5DDD0] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{activeGuide.icon}</span>
                <div>
                  <h3 className="font-black text-lg text-[#16261B]">{activeGuide.nameHi}</h3>
                  <p className="text-xs text-[#5B6B5F] font-bold">{activeGuide.nameEn}</p>
                </div>
              </div>

              <span
                className={`text-xs font-black px-2.5 py-1 rounded-full uppercase ${
                  activeGuide.urgency === "HIGH"
                    ? "bg-[#F8DAD6] text-[#C8372D]"
                    : activeGuide.urgency === "MEDIUM"
                    ? "bg-[#FBEFCF] text-[#8A5E00]"
                    : "bg-[#DCEFE1] text-[#2E7D46]"
                }`}
              >
                {activeGuide.urgency === "HIGH"
                  ? "🚨 Emergency"
                  : activeGuide.urgency === "MEDIUM"
                  ? "⚠️ Today"
                  : "✅ Home Care"}
              </span>
            </div>

            {/* Advice Text */}
            <div className="bg-[#EEF2EA] rounded-2xl p-4 space-y-2">
              <b className="text-xs uppercase tracking-wider text-[#2E7D46] block font-extrabold">
                पहले क्या करें (Immediate First Aid):
              </b>
              <p className="text-sm font-bold text-[#16261B] leading-relaxed">
                {activeGuide.firstAidHi}
              </p>
              <p className="text-xs text-[#5B6B5F] font-medium leading-normal">
                {activeGuide.firstAidEn}
              </p>
            </div>

            <div className="text-xs text-[#5B6B5F]">
              Suspected Pathogen/Disease:{" "}
              <strong className="text-[#16261B]">{activeGuide.suspected}</strong>
            </div>

            {/* Action */}
            <Link
              href="/farmer/report"
              className="w-full py-3.5 bg-[#2E7D46] hover:bg-[#256639] text-white font-extrabold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <span>🩺 File Disease Report for this Symptom</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── ABOUT US SECTION ── */}
      <section id="about" className="py-16 bg-white border-t border-[#D5DDD0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#2E7D46] bg-[#DCEFE1] px-3 py-1 rounded-full">
              About The Initiative • हमारे बारे में
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#16261B] tracking-tight">
              Pashu Rakshak (Jeev Rakshak)
            </h2>
            <p className="text-sm sm:text-base text-[#5B6B5F] font-semibold leading-relaxed">
              Real-time syndromic disease early warning and veterinary emergency response ecosystem.
              Built for <strong>Smart India Hackathon Problem Statement SIH26128</strong> in collaboration
              with the <strong>Government of Maharashtra Animal Husbandry Department</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-[#EEF2EA] border border-[#D5DDD0] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#2E7D46] text-white flex items-center justify-center text-2xl shadow-md shadow-[#2E7D46]/20">
                🌾
              </div>
              <h3 className="text-lg font-black text-[#16261B]">किसानों के लिए (For Livestock Keepers)</h3>
              <p className="text-xs sm:text-sm text-[#5B6B5F] font-medium leading-relaxed">
                Report cattle illness via 24x7 web portal, multilingual voice assistants (Marathi/Hindi),
                camera wound triage, or free 1800 IVR phone calls without needing internet.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#EEF2EA] border border-[#D5DDD0] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#C8372D] text-white flex items-center justify-center text-2xl shadow-md shadow-[#C8372D]/20">
                🩺
              </div>
              <h3 className="text-lg font-black text-[#16261B]">पशु चिकित्सकों के लिए (For Veterinarians)</h3>
              <p className="text-xs sm:text-sm text-[#5B6B5F] font-medium leading-relaxed">
                Prioritized triage queues with explainable AI syndromic analysis, photo pathology notes,
                rapid field visit dispatches, treatment prescription tracking, and lab sample referrals.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#EEF2EA] border border-[#D5DDD0] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1B4328] text-white flex items-center justify-center text-2xl shadow-md shadow-[#1B4328]/20">
                🏛️
              </div>
              <h3 className="text-lg font-black text-[#16261B]">प्रशासन के लिए (For State Authorities)</h3>
              <p className="text-xs sm:text-sm text-[#5B6B5F] font-medium leading-relaxed">
                Server-enforced jurisdiction filtering across State, District, and Taluka levels.
                Outbreak containment ring vaccination planning, multi-channel broadcast alerts, and bulletin generation.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#183921] to-[#2E7D46] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] uppercase font-black tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                SIH Problem Statement SIH26128
              </span>
              <h4 className="text-lg font-black">Ready to report a case or inspect surveillance telemetry?</h4>
              <p className="text-xs text-white/80">Choose your role or test any of our automated tools now.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/farmer/report"
                className="px-4 py-2.5 rounded-xl bg-white text-[#183921] font-black text-xs hover:bg-emerald-50 transition shadow-sm"
              >
                Farmer Portal →
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-black text-xs transition border border-white/20"
              >
                Admin Command Center →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#16261B] text-white py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-2xl">🐄</span>
                <span className="text-xl font-black">Pashu Rakshak (JeevRaksha)</span>
              </div>
              <p className="text-xs text-white/60">
                AI-Powered Real-Time Livestock Disease Early Warning & Surveillance Grid
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-semibold text-white/80">
              <Link href="/about" className="hover:text-white transition text-[#FBEFCF]">
                About Us (टीम परिचय)
              </Link>
              <Link href="/appointments" className="hover:text-white transition">
                Connect with Vet (डॉक्टर)
              </Link>
              <Link href="/farmer/report" className="hover:text-white transition">
                Report Illness (रोग रिपोर्ट)
              </Link>
              <Link href="/dashboard" className="hover:text-white transition">
                Authority Dashboard
              </Link>
              <Link href="/login" className="hover:text-white transition">
                Sign In
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[11px] text-white/40">
            <div>
              Built with ❤️ for Indian Farmers & Veterinary Officers
            </div>
            <div>
              © {new Date().getFullYear()} Pashu Rakshak / JeevRaksha. Built for India&apos;s rural animal husbandry ecosystem.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
