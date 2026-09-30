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
  Stethoscope,
  Sparkles,
  Phone,
  Clock,
  ChevronRight,
  PlusCircle,
  FileText,
  Users,
  Compass,
  Bell,
  Check
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

  const activeGuide = SYMPTOM_GUIDE_ITEMS[selectedGuideIndex];

  return (
    <div className="min-h-screen bg-[#EEF2EA] text-[#16261B] overflow-x-hidden">
      {/* ── TOP NAV BAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#D5DDD0] shadow-xs px-4 sm:px-8 py-3 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1B4328] via-[#2E7D46] to-[#3B9B58] flex items-center justify-center text-white shadow-md shadow-[#2E7D46]/20 group-hover:scale-105 transition-transform">
            <span className="text-xl">🐄</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-[#16261B]">Pashu Rakshak</span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#DCEFE1] text-[#2E7D46] px-2 py-0.5 rounded-full">
                Surveillance Grid
              </span>
            </div>
            <p className="text-[11px] font-semibold text-[#5B6B5F] -mt-0.5">
              जीव रक्षा • AI Livestock Health & Early Warning
            </p>
          </div>
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-1 bg-[#EEF2EA] p-1 rounded-xl border border-[#D5DDD0]">
          <a
            href="#first-aid"
            className="px-3 py-1.5 text-xs font-bold text-[#5B6B5F] hover:text-[#16261B] hover:bg-white rounded-lg transition"
          >
            प्राथमिक उपचार (First Aid)
          </a>
          <a
            href="#surveillance"
            className="px-3 py-1.5 text-xs font-bold text-[#5B6B5F] hover:text-[#16261B] hover:bg-white rounded-lg transition"
          >
            रोग निगरानी (Surveillance)
          </a>
          <a
            href="#portals"
            className="px-3 py-1.5 text-xs font-bold text-[#5B6B5F] hover:text-[#16261B] hover:bg-white rounded-lg transition"
          >
            पोर्टल (Portals)
          </a>
        </div>

        {/* Auth & Actions */}
        <div className="flex items-center gap-2">
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
              className="inline-flex text-xs font-bold text-[#2E7D46] bg-[#DCEFE1] px-3 py-2 rounded-xl"
            >
              {user.role === "FARMER" ? "🌾 Farmer Portal" : "🩺 Dashboard"}
            </Link>
          )}

          {/* Quick Emergency Report Button */}
          <Link
            href="/farmer/report"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C8372D] hover:bg-[#B32D24] text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-md shadow-[#C8372D]/20 active:scale-95 transition"
          >
            <span>🚨</span>
            <span className="hidden sm:inline">पशु बीमार है (Report)</span>
            <span className="sm:hidden">Report</span>
          </Link>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="pt-24 pb-16 px-4 sm:px-8 relative overflow-hidden bg-gradient-to-b from-[#183921] via-[#215A33] to-[#2E7D46] text-white">
        {/* Subtle background grid */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10 pt-4">
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
                  href="/farmer/chat"
                  className="p-4 rounded-2xl bg-[#E8A317] hover:bg-[#D69312] text-[#16261B] flex items-center justify-center gap-2 font-black text-sm shadow-md active:scale-[0.99] transition shrink-0"
                >
                  <span className="text-2xl">🎤</span>
                  <span>AI आवाज सहायक (Voice Bot)</span>
                </Link>
              </div>

              <div className="flex items-center justify-between text-xs text-white/80 px-1 pt-1 font-medium">
                <span>✓ स्थानीय भाषा में बोलकर बताएं</span>
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
      </section>

      {/* ── LIVE STATS TICKER ── */}
      <section className="bg-white border-b border-[#D5DDD0] py-6 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
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
      <section id="first-aid" className="py-16 px-4 sm:px-8 max-w-6xl mx-auto">
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

      {/* ── PORTALS SHOWCASE ── */}
      <section id="portals" className="py-16 px-4 sm:px-8 bg-white border-t border-[#D5DDD0]">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#2E7D46] bg-[#DCEFE1] px-3 py-1 rounded-full">
              Integrated Access Grid
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#16261B] mt-2">
              सभी हितधारकों के लिए एक मंच
            </h2>
            <p className="text-xs sm:text-sm text-[#5B6B5F] font-semibold mt-1">
              Purpose-built interfaces connecting farmers, field workers, veterinarians, and district administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Farmer Card */}
            <div className="bg-[#EEF2EA] rounded-3xl p-6 border border-[#D5DDD0] flex flex-col justify-between hover:shadow-lg transition">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#DCEFE1] flex items-center justify-center text-2xl">
                  🌾
                </div>
                <h3 className="text-xl font-extrabold text-[#16261B]">किसान पोर्टल (Farmer)</h3>
                <p className="text-xs sm:text-sm text-[#5B6B5F] leading-relaxed">
                  Register cattle, buffalo, goats, and poultry. Report illnesses with Hindi voice or visual symptoms, track vet visits, and receive vaccination reminders.
                </p>
              </div>

              <div className="pt-6 space-y-2">
                <Link
                  href="/farmer/report"
                  className="w-full py-3 bg-[#2E7D46] hover:bg-[#256639] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Report Sickness (रोग दर्ज करें)</span>
                </Link>
                <Link
                  href="/farmer/animals"
                  className="w-full py-2.5 bg-white hover:bg-gray-100 text-[#16261B] border border-[#D5DDD0] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <span>My Livestock (मेरे पशु)</span>
                </Link>
              </div>
            </div>

            {/* Vet Card */}
            <div className="bg-[#EEF2EA] rounded-3xl p-6 border border-[#D5DDD0] flex flex-col justify-between hover:shadow-lg transition">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FBEFCF] flex items-center justify-center text-2xl">
                  🩺
                </div>
                <h3 className="text-xl font-extrabold text-[#16261B]">पशु चिकित्सक (Veterinarian)</h3>
                <p className="text-xs sm:text-sm text-[#5B6B5F] leading-relaxed">
                  Triage assigned village cases, navigate on-site inspections, log clinical findings, prescribe medications, and dispatch biological samples for lab tests.
                </p>
              </div>

              <div className="pt-6 space-y-2">
                <Link
                  href="/dashboard/cases"
                  className="w-full py-3 bg-[#E8A317] hover:bg-[#D69312] text-[#16261B] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>Review Case Queue</span>
                </Link>
                <Link
                  href="/login"
                  className="w-full py-2.5 bg-white hover:bg-gray-100 text-[#16261B] border border-[#D5DDD0] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <span>Doctor Sign In</span>
                </Link>
              </div>
            </div>

            {/* Admin / Authority Card */}
            <div className="bg-[#EEF2EA] rounded-3xl p-6 border border-[#D5DDD0] flex flex-col justify-between hover:shadow-lg transition">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#F8DAD6] flex items-center justify-center text-2xl">
                  🛡️
                </div>
                <h3 className="text-xl font-extrabold text-[#16261B]">प्रशासन (Surveillance)</h3>
                <p className="text-xs sm:text-sm text-[#5B6B5F] leading-relaxed">
                  Live GIS outbreak maps, village cluster tracking, mortality velocity scoring, containment alerts, and vaccine coverage heatmaps.
                </p>
              </div>

              <div className="pt-6 space-y-2">
                <Link
                  href="/dashboard"
                  className="w-full py-3 bg-[#16261B] hover:bg-black text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Open Surveillance Dashboard</span>
                </Link>
                <Link
                  href="/dashboard/alerts"
                  className="w-full py-2.5 bg-white hover:bg-gray-100 text-[#16261B] border border-[#D5DDD0] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <span>Outbreak Alerts</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#16261B] text-white py-12 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-2xl">🐄</span>
              <span className="text-xl font-black">Pashu Rakshak (JeevRaksha)</span>
            </div>
            <p className="text-xs text-white/60">
              AI-Powered Real-Time Livestock Disease Early Warning & Surveillance Grid
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-white/80">
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

        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-white/10 text-center text-[11px] text-white/40">
          © {new Date().getFullYear()} Pashu Rakshak / JeevRaksha. Built for India's rural animal husbandry ecosystem.
        </div>
      </footer>
    </div>
  );
}
