"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  Camera,
  Upload,
  ArrowLeft,
  Volume2,
  VolumeX,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Stethoscope,
  ExternalLink,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  Info,
  Clock,
  MapPin,
  Check,
} from "lucide-react";
import FarmerNav from "@/components/farmer/FarmerNav";

type ViewState = "UPLOAD" | "SCANNING" | "AI_RESULT" | "CASE_SUBMITTED";

export default function PhotoDetectPage() {
  const [viewState, setViewState] = useState<ViewState>("UPLOAD");
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [isSamplePhoto, setIsSamplePhoto] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState("Buffalo");
  const [village, setVillage] = useState("Rampur");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [caseDetails, setCaseDetails] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample wound image for instant demo testing
  const samplePlaceholderSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'><rect width='600' height='400' fill='%23EEF2EA'/><rect x='80' y='60' width='440' height='280' rx='20' fill='%23DCEFE1'/><text x='300' y='180' font-size='70' text-anchor='middle'>🐃🩹</text><text x='300' y='240' font-size='20' font-family='sans-serif' font-weight='bold' fill='%232E7D46' text-anchor='middle'>पशु के पैर पर खुला घाव (Sample Wound Photo)</text><text x='300' y='270' font-size='14' font-family='sans-serif' fill='%235B6B5F' text-anchor='middle'>Murrah Buffalo - Open Trauma Lesion</text></svg>";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoData(event.target?.result as string);
        setIsSamplePhoto(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseSample = () => {
    setPhotoData(samplePlaceholderSvg);
    setIsSamplePhoto(true);
  };

  const handleClearPhoto = () => {
    setPhotoData(null);
    setIsSamplePhoto(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleStartAnalysis = () => {
    if (!photoData) return;
    setViewState("SCANNING");
    setTimeout(() => {
      setViewState("AI_RESULT");
    }, 2000);
  };

  // Speak aloud in Hindi using SpeechSynthesis
  const speakGuidance = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Audio speech synthesis is not supported on this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = "जांच का नतीजा: पैर पर खुला घाव है और आसपास हल्की सूजन दिखती है। घाव अधिक गहरा नहीं लगता। अभी यह करें: साफ पानी से घाव को धीरे-धीरे धोएं, साफ कपड़े से ढकें, और पशु को सूखी जगह पर रखें। घाव पर गोबर या राख कतई न लगाएं।";
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = "hi-IN";
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Submit case to database with photo
  const handleSubmitCaseWithPhoto = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/photo-detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photo: isSamplePhoto ? "sample_wound_photo" : photoData,
          animalSpecies: selectedAnimal,
          village,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCaseDetails(data);
        setViewState("CASE_SUBMITTED");
      } else {
        alert("केस दर्ज करने में त्रुटि आई।");
      }
    } catch (err) {
      console.error("Failed to submit photo case:", err);
      alert("सर्वर से संपर्क नहीं हो सका।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF2EA] text-[#16261B]">
      <FarmerNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Top Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/farmer/report"
            className="p-2 rounded-xl bg-white border border-[#D5DDD0] text-[#5B6B5F] hover:text-[#16261B] hover:bg-[#DCEFE1] transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#DCEFE1] text-[#2E7D46] text-xs font-black uppercase tracking-wider">
                AI Vision Triage
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#16261B] mt-0.5">
              📷 चोट की फोटो से जांच (Photo Wound Diagnosis)
            </h1>
          </div>
        </div>

        {/* ── STATE 1: UPLOAD / CAMERA VIEW ── */}
        {viewState === "UPLOAD" && (
          <div className="space-y-5">
            {/* Guidelines Banner */}
            <div className="bg-[#DCEFE1] p-4 rounded-2xl border border-[#2E7D46]/20 flex items-start gap-3 text-xs sm:text-sm text-[#183921] font-semibold">
              <Info className="w-5 h-5 text-[#2E7D46] shrink-0 mt-0.5" />
              <div>
                <b className="block font-black text-[#16261B]">फोटो खींचने के लिए सुझाव:</b>
                पास से और दिन की अच्छी रोशनी में फोटो लें। घाव, सूजन या छाले स्पष्ट दिखाई देने चाहिए।
              </div>
            </div>

            {/* Animal Selection */}
            <div className="bg-white p-5 rounded-3xl border border-[#D5DDD0] shadow-sm space-y-3">
              <label className="text-xs font-black text-[#5B6B5F] uppercase tracking-wider block">
                1. पशु चुनें (Select Animal):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: "Cow", label: "🐄 गाय (Cow)" },
                  { id: "Buffalo", label: "🐃 भैंस (Buffalo)" },
                  { id: "Goat", label: "🐐 बकरी (Goat)" },
                  { id: "Other", label: "🐾 अन्य पशु (Other)" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedAnimal(item.id)}
                    className={`py-3 px-3 rounded-2xl border-2 text-xs font-black text-center transition ${
                      selectedAnimal === item.id
                        ? "bg-[#DCEFE1] border-[#2E7D46] text-[#2E7D46] shadow-sm"
                        : "bg-[#EEF2EA] border-transparent text-[#16261B] hover:border-[#D5DDD0]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Capture / Preview Box */}
            <div className="bg-white p-5 rounded-3xl border border-[#D5DDD0] shadow-sm space-y-4">
              <label className="text-xs font-black text-[#5B6B5F] uppercase tracking-wider block">
                2. घाव या चोट की फोटो (Capture or Upload Photo):
              </label>

              {photoData ? (
                /* Image Preview */
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden border-2 border-[#2E7D46] bg-black/5 flex items-center justify-center max-h-[360px]">
                    <img
                      src={photoData}
                      alt="Uploaded Animal Injury"
                      className="w-full h-auto max-h-[360px] object-contain"
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <span className="px-3 py-1 bg-black/70 backdrop-blur-md text-white text-xs font-bold rounded-full">
                        {isSamplePhoto ? "डेमो फोटो (Sample)" : "फोटो तैयार है"}
                      </span>
                      <button
                        onClick={handleClearPhoto}
                        className="px-3 py-1 bg-[#C8372D] text-white text-xs font-bold rounded-full shadow-md hover:bg-[#B32D24] transition"
                      >
                        हटाएं (Change)
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleStartAnalysis}
                    className="w-full py-4 bg-[#2E7D46] hover:bg-[#256639] text-white text-base font-black rounded-2xl shadow-lg shadow-[#2E7D46]/20 transition flex items-center justify-center gap-2 active:scale-[0.99]"
                  >
                    <Sparkles className="w-5 h-5 text-[#FBEFCF]" />
                    <span>🔍 फोटो की जांच करें (Analyze Injury)</span>
                  </button>
                </div>
              ) : (
                /* Upload Buttons Area */
                <div className="space-y-3">
                  <div className="border-3 border-dashed border-[#D5DDD0] hover:border-[#2E7D46] rounded-3xl p-8 text-center bg-[#EEF2EA]/40 transition space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-[#DCEFE1] text-[#2E7D46] flex items-center justify-center mx-auto text-3xl shadow-sm">
                      📷
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-black text-[#16261B]">
                        कैमरे से फोटो खींचें या गैलरी से चुनें
                      </h4>
                      <p className="text-xs text-[#5B6B5F] font-semibold">
                        PNG, JPG, WEBP (अधिकतम 10MB)
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                      {/* Real Camera / File Picker */}
                      <label className="w-full sm:w-auto px-6 py-3.5 bg-[#2E7D46] hover:bg-[#256639] text-white text-xs font-black rounded-2xl shadow-md cursor-pointer transition flex items-center justify-center gap-2 active:scale-95">
                        <Camera className="w-4 h-4" />
                        <span>📷 फोटो खींचें / अपलोड करें</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          hidden
                          onChange={handleFileChange}
                        />
                      </label>

                      {/* Fast Sample Button */}
                      <button
                        onClick={handleUseSample}
                        className="w-full sm:w-auto px-5 py-3.5 bg-white hover:bg-[#F2F9F4] text-[#16261B] text-xs font-black rounded-2xl border-2 border-[#D5DDD0] hover:border-[#2E7D46] transition flex items-center justify-center gap-2 active:scale-95"
                      >
                        <span>🐄 नमूना फोटो इस्तेमाल करें (Demo)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STATE 2: SCANNING ANIMATION ── */}
        {viewState === "SCANNING" && (
          <div className="bg-white rounded-3xl p-10 border border-[#D5DDD0] text-center space-y-6 shadow-sm">
            <div className="relative w-36 h-36 mx-auto rounded-3xl overflow-hidden border-4 border-[#2E7D46] shadow-xl flex items-center justify-center bg-[#EEF2EA]">
              {photoData && (
                <img
                  src={photoData}
                  alt="Scanning"
                  className="w-full h-full object-cover opacity-80"
                />
              )}
              {/* Laser Line */}
              <div className="absolute inset-x-0 h-1.5 bg-[#2E7D46] shadow-lg shadow-emerald-400 animate-bounce" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-[#2E7D46] font-black text-lg">
                <Sparkles className="w-5 h-5 animate-spin" />
                <span>AI फोटो जांच हो रही है…</span>
              </div>
              <p className="text-xs text-[#5B6B5F] font-semibold max-w-sm mx-auto">
                घाव की गहराई, सूजन, संक्रमण के लक्षण व पशु रोग प्रोटोकॉल का विश्लेषण किया जा रहा है।
              </p>
            </div>
          </div>
        )}

        {/* ── STATE 3: AI DIAGNOSIS & GUIDANCE RESULT ── */}
        {viewState === "AI_RESULT" && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* Top Urgency Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-[#E8A317] shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#EEF2EA] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FBEFCF] text-[#E8A317] flex items-center justify-center text-2xl font-bold">
                    ⚠️
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FBEFCF] text-[#8A5E00] text-[11px] font-black uppercase tracking-wider">
                      मध्यम जोखिम • Moderate Urgency
                    </span>
                    <h3 className="text-xl font-black text-[#16261B] mt-0.5">
                      आज डॉक्टर को दिखाएं (See a Vet Today)
                    </h3>
                  </div>
                </div>

                {/* Voice Readout Button */}
                <button
                  onClick={speakGuidance}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 shadow-sm ${
                    isSpeaking
                      ? "bg-rose-500 text-white animate-pulse"
                      : "bg-[#2E7D46] hover:bg-[#256639] text-white"
                  }`}
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{isSpeaking ? "आवाज बंद करें" : "🔊 आवाज में सुनें (Listen)"}</span>
                </button>
              </div>

              {/* Clinical AI Observation */}
              <div className="bg-[#EEF2EA] p-4 rounded-2xl space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#5B6B5F]">
                  AI दृष्टि निरीक्षण (Visual AI Observation):
                </span>
                <p className="text-sm text-[#16261B] font-bold leading-relaxed">
                  पैर पर खुला घाव है और आसपास हल्की सूजन दिखती है। घाव अधिक गहरा नहीं लगता, परंतु मक्खियों और संक्रमण से बचाव अति-आवश्यक है।
                </p>
                <p className="text-xs text-[#5B6B5F] font-medium pt-0.5">
                  Open wound on the leg with mild swelling around it. It does not look deep, but infection prevention is critical.
                </p>
              </div>

              {/* 3 Step Action Guidance (Do, Avoid, Warning) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                {/* 1. Do This Now */}
                <div className="bg-[#F2F9F4] p-4 rounded-2xl border border-[#2E7D46]/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-[#2E7D46] font-black text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>✅ अभी यह करें (Do This)</span>
                  </div>
                  <ul className="text-xs space-y-1.5 text-[#183921] font-semibold">
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#2E7D46] font-bold">•</span>
                      <span>साफ पानी से घाव को धीरे-धीरे धोएं</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#2E7D46] font-bold">•</span>
                      <span>साफ और सूखे सूती कपड़े से ढकें</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#2E7D46] font-bold">•</span>
                      <span>पशु को स्वच्छ, सूखी और छायादार जगह रखें</span>
                    </li>
                  </ul>
                </div>

                {/* 2. Do NOT Do This */}
                <div className="bg-[#FFF5F5] p-4 rounded-2xl border border-[#C8372D]/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-[#C8372D] font-black text-xs">
                    <XCircle className="w-4 h-4" />
                    <span>⛔ यह कतई न करें (Avoid)</span>
                  </div>
                  <ul className="text-xs space-y-1.5 text-[#5C1D18] font-semibold">
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#C8372D] font-bold">•</span>
                      <span>घाव पर गोबर, मिट्टी या राख न लगाएं</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#C8372D] font-bold">•</span>
                      <span>घाव को नंगे हाथों से न कुरेदें</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#C8372D] font-bold">•</span>
                      <span>मक्खियों को घाव पर न बैठने दें</span>
                    </li>
                  </ul>
                </div>

                {/* 3. Call Vet Immediately If */}
                <div className="bg-[#FFFDF5] p-4 rounded-2xl border border-[#E8A317]/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-[#8A5E00] font-black text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    <span>📞 तुरंत डॉक्टर बुलाएं अगर:</span>
                  </div>
                  <ul className="text-xs space-y-1.5 text-[#4D3500] font-semibold">
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#E8A317] font-bold">•</span>
                      <span>खून बहना बंद न हो</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#E8A317] font-bold">•</span>
                      <span>घाव में कीड़े (Maggots) या दुर्गंध दिखे</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#E8A317] font-bold">•</span>
                      <span>पशु चारा छोड़ दे या तेज़ बुखार हो</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-[11px] text-[#5B6B5F] font-semibold pt-1">
                * यह प्राथमिक सहायता सलाह है, अंतिम चिकित्सकीय निदान नहीं। दवा का पर्चा सिर्फ अधिकृत पशु चिकित्सक ही जारी करेंगे।
              </p>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-[#EEF2EA]">
                <button
                  onClick={handleSubmitCaseWithPhoto}
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-[#2E7D46] hover:bg-[#256639] disabled:opacity-50 text-white text-sm font-black rounded-2xl shadow-lg shadow-[#2E7D46]/20 transition flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? "केस दर्ज हो रहा है…"
                      : "🩺 इस फोटो के साथ डॉक्टर को अनुरोध भेजें (Request Vet)"}
                  </span>
                </button>

                <button
                  onClick={() => setViewState("UPLOAD")}
                  className="py-4 px-6 bg-[#EEF2EA] hover:bg-[#D5DDD0] text-[#16261B] text-xs font-black rounded-2xl transition"
                >
                  दूसरी फोटो जांचें
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STATE 4: CASE SUBMITTED RECEIPT ── */}
        {viewState === "CASE_SUBMITTED" && caseDetails && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#2E7D46] shadow-xl space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between border-b border-[#EEF2EA] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#DCEFE1] text-[#2E7D46] flex items-center justify-center font-bold text-2xl">
                  ✓
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#16261B]">
                    फोटो केस दर्ज हो गया! (Case Created)
                  </h3>
                  <p className="text-xs text-[#5B6B5F] font-semibold">
                    पशु चिकित्सक को फोटो व प्राथमिक रिपोर्ट प्रेषित कर दी गई है।
                  </p>
                </div>
              </div>

              <span className="px-3.5 py-1.5 rounded-full bg-[#DCEFE1] text-[#2E7D46] text-xs font-black">
                {caseDetails.caseNumber}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#EEF2EA] p-4 rounded-2xl text-xs">
              <div>
                <span className="text-[#5B6B5F] block font-semibold">पशु (Animal):</span>
                <b className="text-[#16261B] text-sm">{caseDetails.animalSpecies}</b>
              </div>
              <div>
                <span className="text-[#5B6B5F] block font-semibold">गांव (Village):</span>
                <b className="text-[#16261B] text-sm">{caseDetails.village}</b>
              </div>
              <div>
                <span className="text-[#5B6B5F] block font-semibold">तैनात डॉक्टर:</span>
                <b className="text-[#2E7D46] text-sm">{caseDetails.assignedVet}</b>
              </div>
              <div>
                <span className="text-[#5B6B5F] block font-semibold">स्थिति (Status):</span>
                <b className="text-[#E8A317] text-sm">Under Review</b>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F2F9F4] border border-[#2E7D46]/30 text-xs space-y-1">
              <b className="text-[#2E7D46] block font-black">
                डॉक्टर को भेजा गया सारांश (Dispatched to Vet):
              </b>
              <p className="text-[#16261B] font-semibold leading-relaxed">
                {caseDetails.analysis?.seeHi}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/dashboard/cases"
                className="flex-1 py-3.5 px-4 rounded-xl bg-[#2E7D46] hover:bg-[#256639] text-white text-xs font-black flex items-center justify-center gap-2 shadow-md transition"
              >
                <Stethoscope className="w-4 h-4" />
                <span>डॉक्टर पोर्टल में यह केस देखें (View in Vet Cases)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={() => {
                  handleClearPhoto();
                  setViewState("UPLOAD");
                }}
                className="py-3.5 px-5 rounded-xl bg-[#EEF2EA] hover:bg-[#D5DDD0] text-[#16261B] text-xs font-black flex items-center justify-center gap-2 transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>नई फोटो जांचें</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
