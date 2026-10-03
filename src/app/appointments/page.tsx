"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Stethoscope,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Shield,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ArrowLeft,
  Search,
  Filter,
  Users,
  Video,
  Building2,
  Syringe,
  Activity,
  HeartPulse,
  Sparkles,
  PhoneCall,
  X,
  Menu,
  Home,
  Info,
  Check,
  Share2,
  Printer
} from "lucide-react";
import { VET_DIRECTORY } from "@/app/api/appointments/route";

interface Appointment {
  id: string;
  token: string;
  vetId: string;
  vetName: string;
  vetPhone: string;
  dispensary: string;
  farmerName: string;
  farmerPhone: string;
  village: string;
  taluka: string;
  animalType: string;
  animalTag: string;
  appointmentType: string;
  appointmentDate: string;
  timeSlot: string;
  symptoms: string[];
  notes?: string;
  status: "CONFIRMED" | "DOCTOR_DISPATCHED" | "COMPLETED" | "CANCELLED";
  createdAt: string;
}

const INITIAL_DEMO_APPOINTMENTS: Appointment[] = [
  {
    id: "apt-demo-1",
    token: "VET-2026-4419",
    vetId: "vet-1",
    vetName: "Dr. Priya Sharma",
    vetPhone: "+91 98231 44521",
    dispensary: "Haveli Taluka Veterinary Dispensary",
    farmerName: "Tukaram Shinde",
    farmerPhone: "+91 98765 43210",
    village: "Wagholi",
    taluka: "Haveli",
    animalType: "Cow (गाय)",
    animalTag: "MH-PUN-8821",
    appointmentType: "CLINIC_VISIT",
    appointmentDate: new Date().toISOString().split("T")[0],
    timeSlot: "Morning (09:00 AM - 11:30 AM)",
    symptoms: ["दूध कम होना (Drop in Milk)", "हल्का बुखार (Mild Fever)"],
    notes: "Sudden drop in morning milk yield, mild udder warmth.",
    status: "CONFIRMED",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "apt-demo-2",
    token: "VET-2026-9021",
    vetId: "vet-5",
    vetName: "1962 Ambulatory Clinic (Unit 4)",
    vetPhone: "1962",
    dispensary: "State Animal Husbandry Emergency Wing",
    farmerName: "Ramesh Patil",
    farmerPhone: "+91 97654 11223",
    village: "Manjari",
    taluka: "Haveli",
    animalType: "Buffalo (भैंस)",
    animalTag: "MH-PUN-1049",
    appointmentType: "EMERGENCY_VISIT",
    appointmentDate: new Date().toISOString().split("T")[0],
    timeSlot: "Immediate Emergency (< 45 mins)",
    symptoms: ["छाले व घाव (Blisters)", "लंगड़ापन (Lameness)"],
    notes: "High fever and inability to stand. Salivation visible.",
    status: "DOCTOR_DISPATCHED",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  }
];

export default function AppointmentsPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"book" | "my-bookings" | "directory">("book");
  const [selectedVetId, setSelectedVetId] = useState<string>("vet-1");
  const [selectedType, setSelectedType] = useState<string>("CLINIC_VISIT");
  const [selectedAnimal, setSelectedAnimal] = useState<string>("Cow (गाय)");
  const [animalTag, setAnimalTag] = useState<string>("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedSlot, setSelectedSlot] = useState<string>("Morning (09:00 AM - 11:30 AM)");
  const [farmerName, setFarmerName] = useState<string>("");
  const [farmerPhone, setFarmerPhone] = useState<string>("");
  const [village, setVillage] = useState<string>("");
  const [taluka, setTaluka] = useState<string>("Haveli");
  const [notes, setNotes] = useState<string>("");

  const [searchTaluka, setSearchTaluka] = useState<string>("All");
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Appointment | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Load appointments from localStorage or demo
  useEffect(() => {
    try {
      const stored = localStorage.getItem("jeevraksha_appointments");
      if (stored) {
        setAppointments(JSON.parse(stored));
      } else {
        setAppointments(INITIAL_DEMO_APPOINTMENTS);
        localStorage.setItem("jeevraksha_appointments", JSON.stringify(INITIAL_DEMO_APPOINTMENTS));
      }

      // Pre-fill user data if logged in
      const userStr = localStorage.getItem("jeevraksha_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.name) setFarmerName(user.name);
        if (user.email) setFarmerPhone("9876543210");
        if (user.jurisdictionVillage) setVillage(user.jurisdictionVillage);
        if (user.jurisdictionTaluka) setTaluka(user.jurisdictionTaluka);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveAppointments = (newList: Appointment[]) => {
    setAppointments(newList);
    try {
      localStorage.setItem("jeevraksha_appointments", JSON.stringify(newList));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleSymptom = (sym: string) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerName || !farmerPhone) {
      alert("Please provide your name and phone number for booking.");
      return;
    }

    setSubmitting(true);
    const selectedVet = VET_DIRECTORY.find((v) => v.id === selectedVetId) || VET_DIRECTORY[0];
    const token = `VET-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      token,
      vetId: selectedVet.id,
      vetName: selectedVet.name,
      vetPhone: selectedVet.phone,
      dispensary: selectedVet.dispensary,
      farmerName,
      farmerPhone,
      village: village || "Local Village",
      taluka: taluka || selectedVet.taluka,
      animalType: selectedAnimal,
      animalTag: animalTag || "N/A",
      appointmentType: selectedType,
      appointmentDate: selectedDate,
      timeSlot: selectedSlot,
      symptoms: selectedSymptoms,
      notes,
      status: selectedType === "EMERGENCY_VISIT" ? "DOCTOR_DISPATCHED" : "CONFIRMED",
      createdAt: new Date().toISOString(),
    };

    // Save to list
    const updated = [newApt, ...appointments];
    saveAppointments(updated);
    setConfirmedBooking(newApt);
    setSubmitting(false);

    // Call API in background
    fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newApt),
    }).catch(() => {});
  };

  const cancelAppointment = (id: string) => {
    if (confirm("Are you sure you want to cancel this appointment?")) {
      const updated = appointments.map((a) =>
        a.id === id ? { ...a, status: "CANCELLED" as const } : a
      );
      saveAppointments(updated);
    }
  };

  const filteredVets =
    searchTaluka === "All"
      ? VET_DIRECTORY
      : VET_DIRECTORY.filter(
          (v) =>
            v.taluka.toLowerCase().includes(searchTaluka.toLowerCase()) ||
            v.taluka.includes("All Talukas")
        );

  return (
    <div className="min-h-screen bg-[#EEF2EA] text-[#16261B] overflow-x-hidden">
      {/* ── MOBILE MENU OVERLAY ── */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-xs z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── TOP NAV BAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#D5DDD0] shadow-xs px-3 sm:px-8 py-2.5 sm:py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group min-w-0 shrink">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-[#1B4328] via-[#2E7D46] to-[#3B9B58] flex items-center justify-center text-white shadow-md shadow-[#2E7D46]/20 group-hover:scale-105 transition-transform shrink-0">
              <span className="text-lg sm:text-xl">🐄</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-base sm:text-lg font-black tracking-tight text-[#16261B] whitespace-nowrap">
                  Jeev Rakshak
                </span>
                <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase tracking-wider bg-[#DCEFE1] text-[#2E7D46] px-2 py-0.5 rounded-full border border-[#2E7D46]/20">
                  Vet Connect
                </span>
              </div>
              <p className="hidden sm:block text-[11px] font-semibold text-[#5B6B5F] -mt-0.5 truncate">
                पशु चिकित्सक अपॉइंटमेंट • Verified Veterinary Booking
              </p>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden lg:flex items-center gap-1 bg-[#EEF2EA] p-1 rounded-xl border border-[#D5DDD0]">
            <Link
              href="/"
              className="px-3 py-1.5 text-xs font-bold text-[#5B6B5F] hover:text-[#16261B] hover:bg-white rounded-lg transition"
            >
              Home (होम)
            </Link>
            <Link
              href="/appointments"
              className="px-3 py-1.5 text-xs font-bold text-[#2E7D46] bg-white shadow-2xs rounded-lg transition flex items-center gap-1.5"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Connect with Vet (डॉक्टर)</span>
            </Link>
            <Link
              href="/about"
              className="px-3 py-1.5 text-xs font-bold text-[#5B6B5F] hover:text-[#16261B] hover:bg-white rounded-lg transition"
            >
              About Us (टीम)
            </Link>
            <Link
              href="/farmer/report"
              className="px-3 py-1.5 text-xs font-bold text-[#C8372D] hover:bg-red-50 rounded-lg transition"
            >
              Report Illness (बीमारी)
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="tel:1962"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold rounded-xl shadow-xs transition"
            >
              <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
              <span>1962 Emergency Hotline</span>
            </Link>

            <Link
              href="/farmer/report"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#C8372D] hover:bg-[#B32D24] text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-md shadow-[#C8372D]/20 active:scale-95 transition shrink-0"
            >
              <span>🚨</span>
              <span className="hidden sm:inline">Report Case</span>
              <span className="sm:hidden font-bold">Report</span>
            </Link>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-[#EEF2EA] text-[#16261B] hover:bg-[#DCEFE1] active:scale-95 transition border border-[#D5DDD0] cursor-pointer shrink-0"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-red-600" /> : <Menu className="w-5 h-5 text-[#16261B]" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
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
                href="/appointments"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 text-[#2E7D46] font-bold text-xs border border-emerald-200"
              >
                <Stethoscope className="w-4 h-4 text-[#2E7D46]" />
                <span>Connect with Vet</span>
              </Link>
              <Link
                href="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white text-[#16261B] font-bold text-xs border border-[#D5DDD0] hover:bg-[#DCEFE1]"
              >
                <Info className="w-4 h-4 text-amber-600" />
                <span>About Us (टीम)</span>
              </Link>
              <Link
                href="/farmer/ivr"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white text-[#16261B] font-bold text-xs border border-[#D5DDD0] hover:bg-[#DCEFE1]"
              >
                <span>📞 1800 IVR Call</span>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO BANNER ── */}
      <section className="pt-28 pb-14 px-4 sm:px-8 bg-gradient-to-b from-[#183921] via-[#215A33] to-[#2E7D46] text-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-wider text-[#FBEFCF]">
            <Stethoscope className="w-4 h-4 text-amber-300" />
            <span>Govt. of Maharashtra Veterinary Health Services • 100% Subsidized</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Connect with Verified <br />
                <span className="text-[#FBEFCF]">Veterinary Surgeons</span>
              </h1>
              <p className="text-white/90 text-sm sm:text-base font-medium leading-relaxed">
                Book in-person dispensary visits, home emergency dispatches, or tele-consultations with certified
                government veterinary officers across Maharashtra.
              </p>
            </div>

            {/* Quick Emergency Box */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4 shrink-0 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center text-2xl font-black shrink-0">
                🚑
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-amber-200 tracking-wider block">
                  24x7 Ambulance Dispatch
                </span>
                <a
                  href="tel:1962"
                  className="text-lg sm:text-xl font-black text-white hover:text-amber-200 transition flex items-center gap-1"
                >
                  <span>Dial 1962</span>
                  <span className="text-xs bg-red-600 px-2 py-0.5 rounded-md text-white font-extrabold ml-1">
                    TOLL FREE
                  </span>
                </a>
                <span className="text-[11px] text-white/80 block">Mobile Veterinary Clinic</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Pills */}
          <div className="pt-2 flex flex-wrap items-center gap-2.5 text-xs text-white/80 font-medium">
            <span className="px-3 py-1 rounded-xl bg-white/10 border border-white/15">
              ✅ MSVC Certified Doctors
            </span>
            <span className="px-3 py-1 rounded-xl bg-white/10 border border-white/15">
              📍 45+ Dispensaries in Pune Division
            </span>
            <span className="px-3 py-1 rounded-xl bg-white/10 border border-white/15">
              ⚡ &lt; 45 Min Emergency Response
            </span>
            <span className="px-3 py-1 rounded-xl bg-white/10 border border-white/15">
              ₹ 0 Government Treatment Scheme
            </span>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-2 rounded-2xl border border-[#D5DDD0] shadow-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveTab("book")}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "book"
                  ? "bg-[#2E7D46] text-white shadow-sm"
                  : "text-[#5B6B5F] hover:text-[#16261B] hover:bg-[#EEF2EA]"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment (नया अपॉइंटमेंट)</span>
            </button>
            <button
              onClick={() => setActiveTab("my-bookings")}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "my-bookings"
                  ? "bg-[#2E7D46] text-white shadow-sm"
                  : "text-[#5B6B5F] hover:text-[#16261B] hover:bg-[#EEF2EA]"
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>My Bookings ({appointments.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("directory")}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "directory"
                  ? "bg-[#2E7D46] text-white shadow-sm"
                  : "text-[#5B6B5F] hover:text-[#16261B] hover:bg-[#EEF2EA]"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Dispensary Directory (अस्पताल सूची)</span>
            </button>
          </div>
        </div>

        {/* ── TAB 1: BOOKING WIZARD ── */}
        {activeTab === "book" && (
          <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Columns: Booking Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Appointment Type */}
              <div className="bg-white rounded-3xl p-6 border border-[#D5DDD0] shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#DCEFE1] text-[#2E7D46] flex items-center justify-center text-xs font-black">
                    1
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-[#16261B]">
                    Select Appointment Type (सेवा का प्रकार)
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: "CLINIC_VISIT",
                      title: "Dispensary Visit (अस्पताल में जांच)",
                      desc: "Bring livestock to nearest Taluka veterinary dispensary",
                      icon: "🏥",
                      badge: "Standard",
                    },
                    {
                      id: "EMERGENCY_VISIT",
                      title: "Emergency Field Visit (घर पर डॉक्टर)",
                      desc: "Doctor dispatched directly to your shed/farm",
                      icon: "🚨",
                      badge: "Immediate",
                    },
                    {
                      id: "TELE_CONSULTATION",
                      title: "Tele-Consultation (फोन/वीडियो सलाह)",
                      desc: "Direct phone call or WhatsApp video advice from duty vet",
                      icon: "📞",
                      badge: "Instant",
                    },
                    {
                      id: "VACCINATION_DRIVE",
                      title: "Vaccination & Deworming (टीकाकरण)",
                      desc: "FMD / Lumpy Skin / HS vaccine administration",
                      icon: "💉",
                      badge: "Preventive",
                    },
                  ].map((type) => (
                    <div
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 relative ${
                        selectedType === type.id
                          ? "border-[#2E7D46] bg-[#DCEFE1]/30 shadow-xs"
                          : "border-[#D5DDD0] hover:border-[#2E7D46]/50 bg-white"
                      }`}
                    >
                      <span className="text-2xl shrink-0 mt-0.5">{type.icon}</span>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-xs sm:text-sm text-[#16261B] leading-tight">
                            {type.title}
                          </h3>
                        </div>
                        <p className="text-[11px] text-[#5B6B5F] leading-snug">{type.desc}</p>
                      </div>
                      {selectedType === type.id && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#2E7D46] text-white flex items-center justify-center text-xs">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 2: Choose Veterinarian */}
              <div className="bg-white rounded-3xl p-6 border border-[#D5DDD0] shadow-xs space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#DCEFE1] text-[#2E7D46] flex items-center justify-center text-xs font-black">
                      2
                    </span>
                    <h2 className="text-base sm:text-lg font-black text-[#16261B]">
                      Select Duty Veterinarian / Clinic (चिकित्सक चुनें)
                    </h2>
                  </div>

                  {/* Taluka Filter */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-[#5B6B5F] font-semibold">Filter:</span>
                    <select
                      value={searchTaluka}
                      onChange={(e) => setSearchTaluka(e.target.value)}
                      className="px-2.5 py-1 rounded-lg border border-[#D5DDD0] text-xs font-bold bg-[#EEF2EA]"
                    >
                      <option value="All">All Talukas (सभी क्षेत्र)</option>
                      <option value="Haveli">Haveli (हवेली)</option>
                      <option value="Baramati">Baramati (बारामती)</option>
                      <option value="Pune City">Pune City (पुणे)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredVets.map((vet) => (
                    <div
                      key={vet.id}
                      onClick={() => setSelectedVetId(vet.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        selectedVetId === vet.id
                          ? "border-[#2E7D46] bg-[#DCEFE1]/20 shadow-xs"
                          : "border-[#D5DDD0] hover:border-[#2E7D46]/40 bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#183921] to-[#2E7D46] text-white flex items-center justify-center text-2xl shrink-0 shadow-sm">
                          {vet.avatar}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-black text-sm text-[#16261B]">{vet.name}</h3>
                            <span className="text-[10px] font-black text-[#2E7D46] bg-[#DCEFE1] px-2 py-0.5 rounded-full">
                              {vet.registrationNo}
                            </span>
                            {vet.availableToday && (
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Available
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#5B6B5F] font-semibold">{vet.dispensary}</p>
                          <p className="text-[11px] text-[#16261B]/80 font-medium">
                            🎯 {vet.specialization} • ⏳ {vet.experience}
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
                        <span className="text-xs font-black text-[#2E7D46]">
                          {vet.consultationFee}
                        </span>
                        <span className="text-[11px] text-[#5B6B5F] font-medium flex items-center gap-1">
                          ★ {vet.rating} ({vet.reviewsCount} reviews)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 3: Animal & Symptoms */}
              <div className="bg-white rounded-3xl p-6 border border-[#D5DDD0] shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#DCEFE1] text-[#2E7D46] flex items-center justify-center text-xs font-black">
                    3
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-[#16261B]">
                    Animal & Symptom Details (पशु व लक्षण)
                  </h2>
                </div>

                {/* Animal Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#16261B] block">
                    Select Animal Type (पशु का प्रकार) *
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[
                      { label: "Cow (गाय)", icon: "🐄" },
                      { label: "Buffalo (भैंस)", icon: "🐃" },
                      { label: "Goat (बकरी)", icon: "🐐" },
                      { label: "Sheep (भेड़)", icon: "🐑" },
                      { label: "Calf (बछड़ा)", icon: "🐮" },
                      { label: "Other (अन्य)", icon: "🐾" },
                    ].map((animal) => (
                      <button
                        type="button"
                        key={animal.label}
                        onClick={() => setSelectedAnimal(animal.label)}
                        className={`p-2.5 rounded-xl border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          selectedAnimal === animal.label
                            ? "border-[#2E7D46] bg-[#DCEFE1]/40 font-black text-[#2E7D46]"
                            : "border-[#D5DDD0] bg-white text-[#16261B] hover:border-[#2E7D46]/40"
                        }`}
                      >
                        <span className="text-xl">{animal.icon}</span>
                        <span className="text-[11px] font-extrabold truncate w-full">
                          {animal.label.split(" ")[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ear Tag & Symptoms */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-bold text-[#16261B] block mb-1">
                      Ear Tag / INAPH ID (कनौती संख्या - Optional)
                    </label>
                    <input
                      type="text"
                      value={animalTag}
                      onChange={(e) => setAnimalTag(e.target.value)}
                      placeholder="e.g. MH-PUN-9921"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5DDD0] text-xs font-semibold focus:outline-none focus:border-[#2E7D46] bg-[#EEF2EA]/40"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#16261B] block mb-1">
                      Urgency Level (गंभीरता)
                    </label>
                    <select
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5DDD0] text-xs font-semibold focus:outline-none focus:border-[#2E7D46] bg-[#EEF2EA]/40"
                      defaultValue="MODERATE"
                    >
                      <option value="ROUTINE">Routine / Checkup (सामान्य जांच)</option>
                      <option value="MODERATE">Moderate / Mild Illness (मध्यम बीमारी)</option>
                      <option value="HIGH">High / Urgent (गंभीर स्थिति)</option>
                    </select>
                  </div>
                </div>

                {/* Symptom Chips */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-[#16261B] block">
                    Observed Symptoms (देखे गए लक्षण - Click to select)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "🌡️ तेज बुखार (High Fever)",
                      "🩹 छाले व त्वचा घाव (Blisters)",
                      "🥛 दूध कम होना (Drop in Milk)",
                      "🦵 लंगड़ापन (Lameness)",
                      "💨 सांस की तकलीफ (Breathing)",
                      "🤤 मुंह से झाग/लार (Salivation)",
                      "🍂 भूख न लगना (Loss of Appetite)",
                      "💉 नियमित टीका (Vaccination)",
                    ].map((sym) => {
                      const isSelected = selectedSymptoms.includes(sym);
                      return (
                        <button
                          type="button"
                          key={sym}
                          onClick={() => toggleSymptom(sym)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            isSelected
                              ? "bg-[#2E7D46] text-white border-[#2E7D46] shadow-2xs"
                              : "bg-[#EEF2EA] text-[#16261B] border-[#D5DDD0] hover:bg-white"
                          }`}
                        >
                          {sym}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#16261B] block mb-1">
                    Additional Notes for Doctor (अतिरिक्त विवरण)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe duration of illness, feed consumption, or any prior medicines given..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5DDD0] text-xs font-semibold focus:outline-none focus:border-[#2E7D46] bg-[#EEF2EA]/40"
                  />
                </div>
              </div>

              {/* Step 4: Date, Time & Farmer Details */}
              <div className="bg-white rounded-3xl p-6 border border-[#D5DDD0] shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#DCEFE1] text-[#2E7D46] flex items-center justify-center text-xs font-black">
                    4
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-[#16261B]">
                    Date, Time & Farmer Contact (समय व संपर्क)
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#16261B] block mb-1">
                      Appointment Date (तारीख) *
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5DDD0] text-xs font-semibold focus:outline-none focus:border-[#2E7D46] bg-[#EEF2EA]/40"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#16261B] block mb-1">
                      Preferred Time Slot (समय स्लॉट) *
                    </label>
                    <select
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5DDD0] text-xs font-semibold focus:outline-none focus:border-[#2E7D46] bg-[#EEF2EA]/40"
                    >
                      <option value="Morning (09:00 AM - 11:30 AM)">Morning (09:00 AM - 11:30 AM)</option>
                      <option value="Midday (11:30 AM - 02:00 PM)">Midday (11:30 AM - 02:00 PM)</option>
                      <option value="Afternoon (02:30 PM - 05:00 PM)">Afternoon (02:30 PM - 05:00 PM)</option>
                      <option value="Immediate Emergency (< 45 mins)">🚨 Immediate Emergency (&lt; 45 mins)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-bold text-[#16261B] block mb-1">
                      Farmer Full Name (किसान का नाम) *
                    </label>
                    <input
                      type="text"
                      value={farmerName}
                      onChange={(e) => setFarmerName(e.target.value)}
                      placeholder="e.g. Tukaram Shinde"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5DDD0] text-xs font-semibold focus:outline-none focus:border-[#2E7D46] bg-[#EEF2EA]/40"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#16261B] block mb-1">
                      Mobile Number (मोबाइल नंबर - For SMS token) *
                    </label>
                    <input
                      type="tel"
                      value={farmerPhone}
                      onChange={(e) => setFarmerPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5DDD0] text-xs font-semibold focus:outline-none focus:border-[#2E7D46] bg-[#EEF2EA]/40"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-bold text-[#16261B] block mb-1">
                      Village / Farm Location (गांव / पता)
                    </label>
                    <input
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      placeholder="e.g. Wagholi, Haveli"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5DDD0] text-xs font-semibold focus:outline-none focus:border-[#2E7D46] bg-[#EEF2EA]/40"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#16261B] block mb-1">
                      Taluka / District (तालुका / जिला)
                    </label>
                    <input
                      type="text"
                      value={taluka}
                      onChange={(e) => setTaluka(e.target.value)}
                      placeholder="e.g. Haveli, Pune"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5DDD0] text-xs font-semibold focus:outline-none focus:border-[#2E7D46] bg-[#EEF2EA]/40"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Submit Card */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border-2 border-[#2E7D46]/40 shadow-xl space-y-5 sticky top-24">
                <div className="flex items-center justify-between pb-3 border-b border-[#D5DDD0]">
                  <span className="text-xs font-black uppercase tracking-wider text-[#2E7D46] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Appointment Summary
                  </span>
                  <span className="text-[10px] font-extrabold bg-[#DCEFE1] text-[#2E7D46] px-2 py-0.5 rounded-full">
                    FREE GOVT SCHEME
                  </span>
                </div>

                {/* Selected Doctor Preview */}
                {(() => {
                  const vet = VET_DIRECTORY.find((v) => v.id === selectedVetId) || VET_DIRECTORY[0];
                  return (
                    <div className="bg-[#EEF2EA] p-3.5 rounded-2xl border border-[#D5DDD0] space-y-2">
                      <span className="text-[10px] font-black uppercase text-[#5B6B5F]">
                        Assigned Veterinary Surgeon
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{vet.avatar}</span>
                        <div>
                          <h4 className="font-black text-sm text-[#16261B]">{vet.name}</h4>
                          <p className="text-[11px] text-[#5B6B5F] font-semibold">{vet.dispensary}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Booking Key Facts */}
                <div className="space-y-2 text-xs font-semibold">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-[#5B6B5F]">Consultation Type:</span>
                    <span className="font-bold text-[#16261B]">
                      {selectedType.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-[#5B6B5F]">Patient:</span>
                    <span className="font-bold text-[#16261B]">{selectedAnimal}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-[#5B6B5F]">Preferred Date:</span>
                    <span className="font-bold text-[#16261B]">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-[#5B6B5F]">Time Slot:</span>
                    <span className="font-bold text-[#2E7D46]">{selectedSlot.split(" ")[0]}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-[#5B6B5F]">Govt. Consultation Fee:</span>
                    <span className="font-black text-[#2E7D46]">₹ 0 (Free)</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <span className="text-sm">ℹ️</span>
                  <p className="leading-snug">
                    An SMS confirmation with the token and dispensary phone number will be dispatched upon booking.
                  </p>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-4 bg-[#2E7D46] hover:bg-[#256639] active:scale-95 text-white font-black text-sm rounded-2xl shadow-lg shadow-[#2E7D46]/25 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>
                    {submitting ? "Booking Appointment..." : "Confirm Vet Appointment (बुकिंग करें)"}
                  </span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ── TAB 2: MY BOOKINGS ── */}
        {activeTab === "my-bookings" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-[#16261B]">
                Your Scheduled Appointments (आपकी बुकिंग्स)
              </h2>
              <button
                onClick={() => setActiveTab("book")}
                className="px-4 py-2 bg-[#2E7D46] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#256639] transition"
              >
                + Book Another Appointment
              </button>
            </div>

            {appointments.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#D5DDD0] space-y-3">
                <span className="text-4xl">📅</span>
                <h3 className="text-base font-bold text-[#16261B]">No appointments found</h3>
                <p className="text-xs text-[#5B6B5F]">
                  You have not scheduled any veterinary appointments yet.
                </p>
                <button
                  onClick={() => setActiveTab("book")}
                  className="px-5 py-2.5 bg-[#2E7D46] text-white text-xs font-black rounded-xl"
                >
                  Book First Appointment
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="bg-white rounded-3xl p-6 border border-[#D5DDD0] shadow-xs space-y-4 hover:shadow-md transition-all relative"
                  >
                    {/* Status Badge */}
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-gray-100">
                      <span className="font-mono text-xs font-black text-[#2E7D46] bg-[#DCEFE1] px-2.5 py-0.5 rounded-lg">
                        {apt.token}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                          apt.status === "CONFIRMED"
                            ? "bg-emerald-100 text-emerald-800"
                            : apt.status === "DOCTOR_DISPATCHED"
                            ? "bg-amber-100 text-amber-900 animate-pulse"
                            : apt.status === "COMPLETED"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {apt.status === "DOCTOR_DISPATCHED"
                          ? "🚨 Doctor Dispatched"
                          : apt.status}
                      </span>
                    </div>

                    {/* Doctor and Clinic */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#EEF2EA] flex items-center justify-center text-xl shrink-0">
                        🩺
                      </div>
                      <div>
                        <h3 className="font-black text-sm text-[#16261B]">{apt.vetName}</h3>
                        <p className="text-xs text-[#5B6B5F] font-semibold">{apt.dispensary}</p>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-[#EEF2EA]/40 p-3 rounded-2xl">
                      <div>
                        <span className="text-[#5B6B5F] block text-[10px]">Animal / Tag:</span>
                        <span className="font-bold text-[#16261B]">
                          {apt.animalType} ({apt.animalTag})
                        </span>
                      </div>
                      <div>
                        <span className="text-[#5B6B5F] block text-[10px]">Consultation Type:</span>
                        <span className="font-bold text-[#2E7D46]">
                          {apt.appointmentType.replace("_", " ")}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#5B6B5F] block text-[10px]">Date:</span>
                        <span className="font-bold text-[#16261B]">{apt.appointmentDate}</span>
                      </div>
                      <div>
                        <span className="text-[#5B6B5F] block text-[10px]">Time Slot:</span>
                        <span className="font-bold text-[#16261B]">{apt.timeSlot}</span>
                      </div>
                    </div>

                    {/* Symptoms Chips */}
                    {apt.symptoms && apt.symptoms.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-[#5B6B5F]">
                          Reported Issues:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {apt.symptoms.map((s, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-bold bg-[#EEF2EA] text-[#16261B] px-2 py-0.5 rounded-lg border border-[#D5DDD0]"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <a
                        href={`tel:${apt.vetPhone}`}
                        className="flex-1 py-2 rounded-xl bg-[#2E7D46] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#256639] transition"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Doctor</span>
                      </a>
                      {apt.status !== "CANCELLED" && apt.status !== "COMPLETED" && (
                        <button
                          type="button"
                          onClick={() => cancelAppointment(apt.id)}
                          className="py-2 px-3 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 text-xs font-bold transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: DISPENSARY DIRECTORY ── */}
        {activeTab === "directory" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#16261B]">
                  Government Veterinary Dispensaries & Clinics
                </h2>
                <p className="text-xs text-[#5B6B5F] font-semibold">
                  Department of Animal Husbandry, Govt. of Maharashtra (Pune Division)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#5B6B5F]">Taluka:</span>
                <select
                  value={searchTaluka}
                  onChange={(e) => setSearchTaluka(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-[#D5DDD0] text-xs font-bold bg-white"
                >
                  <option value="All">All Talukas (सभी क्षेत्र)</option>
                  <option value="Haveli">Haveli (हवेली)</option>
                  <option value="Baramati">Baramati (बारामती)</option>
                  <option value="Pune City">Pune City (पुणे)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVets.map((vet) => (
                <div
                  key={vet.id}
                  className="bg-white rounded-3xl p-6 border border-[#D5DDD0] shadow-xs space-y-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#DCEFE1] text-[#2E7D46] flex items-center justify-center text-2xl font-black shrink-0">
                        {vet.avatar}
                      </div>
                      <div>
                        <h3 className="font-black text-sm sm:text-base text-[#16261B]">{vet.dispensary}</h3>
                        <p className="text-xs text-[#2E7D46] font-bold">
                          Officer: {vet.name} ({vet.qualification})
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black bg-[#EEF2EA] text-[#5B6B5F] px-2 py-0.5 rounded-md border border-[#D5DDD0]">
                      {vet.taluka}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#5B6B5F]">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#2E7D46] shrink-0 mt-0.5" />
                      <span>{vet.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#2E7D46] shrink-0" />
                      <span className="font-bold text-[#16261B]">{vet.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#2E7D46] shrink-0" />
                      <span>OPD Timings: 08:30 AM - 01:30 PM & 03:00 PM - 05:30 PM</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setSelectedVetId(vet.id);
                        setActiveTab("book");
                      }}
                      className="px-4 py-2 bg-[#2E7D46] hover:bg-[#256639] text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Book With This Dispensary
                    </button>
                    <a
                      href={`tel:${vet.phone}`}
                      className="px-3 py-2 bg-[#EEF2EA] hover:bg-white text-[#16261B] text-xs font-bold rounded-xl border border-[#D5DDD0] transition flex items-center gap-1.5"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Direct Call</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── BOOKING CONFIRMATION MODAL ── */}
      {confirmedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border-2 border-[#2E7D46] shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setConfirmedBooking(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-[#DCEFE1] text-[#2E7D46] mx-auto flex items-center justify-center text-3xl shadow-sm">
                🎉
              </div>
              <span className="text-xs font-black uppercase text-[#2E7D46] bg-[#DCEFE1] px-3 py-1 rounded-full">
                Appointment Confirmed
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#16261B]">
                Vet Booking Successful!
              </h2>
              <p className="text-xs text-[#5B6B5F]">
                Token <strong className="text-[#16261B]">{confirmedBooking.token}</strong> has been
                registered with {confirmedBooking.dispensary}.
              </p>
            </div>

            <div className="bg-[#EEF2EA] p-4 rounded-2xl border border-[#D5DDD0] space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#D5DDD0]/60">
                <span className="text-[#5B6B5F]">Assigned Vet:</span>
                <span className="font-bold text-[#16261B]">{confirmedBooking.vetName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#D5DDD0]/60">
                <span className="text-[#5B6B5F]">Patient:</span>
                <span className="font-bold text-[#16261B]">{confirmedBooking.animalType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#D5DDD0]/60">
                <span className="text-[#5B6B5F]">Date & Time:</span>
                <span className="font-bold text-[#2E7D46]">
                  {confirmedBooking.appointmentDate} • {confirmedBooking.timeSlot.split(" ")[0]}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#D5DDD0]/60">
                <span className="text-[#5B6B5F]">Farmer Contact:</span>
                <span className="font-bold text-[#16261B]">
                  {confirmedBooking.farmerName} ({confirmedBooking.farmerPhone})
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#5B6B5F]">Doctor Phone:</span>
                <span className="font-black text-[#2E7D46]">{confirmedBooking.vetPhone}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <a
                href={`tel:${confirmedBooking.vetPhone}`}
                className="flex-1 py-3 bg-[#2E7D46] hover:bg-[#256639] text-white text-xs font-bold rounded-xl text-center shadow-md transition"
              >
                📞 Call Doctor Now
              </a>
              <button
                type="button"
                onClick={() => {
                  setConfirmedBooking(null);
                  setActiveTab("my-bookings");
                }}
                className="flex-1 py-3 bg-[#EEF2EA] hover:bg-white text-[#16261B] text-xs font-bold rounded-xl border border-[#D5DDD0] text-center transition"
              >
                View in My Bookings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer className="bg-[#101F14] text-white py-10 px-4 sm:px-8 border-t border-white/10 mt-16">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-white/60">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐄</span>
            <span className="font-bold text-white">Jeev Rakshak • Veterinary Services Grid</span>
            <span>• SIH26128</span>
          </div>
          <div>
            1962 Ambulatory Clinic & Veterinary Dispensary Connect • Govt. of Maharashtra
          </div>
        </div>
      </footer>
    </div>
  );
}
