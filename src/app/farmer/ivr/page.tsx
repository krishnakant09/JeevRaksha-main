"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Shield,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Stethoscope,
  Info,
  Radio,
  Clock,
  MapPin,
  ExternalLink,
} from "lucide-react";
import FarmerNav from "@/components/farmer/FarmerNav";

type CallState = "IDLE" | "DIALING" | "CONNECTED" | "COMPLETED";

interface IVRCaseResult {
  caseId: string;
  caseNumber: string;
  animalSpecies: string;
  suspectedDisease: string;
  riskLevel: string;
  riskScore: number;
  symptoms: string[];
  village: string;
  district: string;
  firstAidHindi: string;
  assignedVet: string;
  confirmationVoiceText: string;
}

export default function IVRPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);

  const [callState, setCallState] = useState<CallState>("IDLE");
  const [phoneNumber, setPhoneNumber] = useState("1800-727-466"); // 1800-PASHU-ROK
  const [callDuration, setCallDuration] = useState(0);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(null);
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [loading, setLoading] = useState(false);
  const [caseResult, setCaseResult] = useState<IVRCaseResult | null>(null);
  const [userVillage, setUserVillage] = useState("Rampur");
  const [userPhone, setUserPhone] = useState("9876543210");
  const [activeTab, setActiveTab] = useState<"dialer" | "developer">("dialer");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Authentication check: Login required
  useEffect(() => {
    const stored = localStorage.getItem("jeevraksha_user");
    if (!stored) {
      router.replace("/login?redirect=/farmer/ivr");
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      if (parsed.jurisdictionVillage || parsed.village) {
        setUserVillage(parsed.jurisdictionVillage || parsed.village);
      }
      setAuthChecking(false);
    } catch {
      router.replace("/login?redirect=/farmer/ivr");
    }
  }, [router]);

  // Call timer effect
  useEffect(() => {
    if (callState === "CONNECTED") {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (callState === "IDLE") setCallDuration(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  // Voice synthesis (Text to speech in Hindi)
  const speakPrompt = (text: string) => {
    if (!isAudioEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "hi-IN";
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("SpeechSynthesis error:", e);
    }
  };

  // Start Call Handler
  const handleStartCall = () => {
    setCallState("DIALING");
    setCurrentStep(1);
    setSelectedAnimal(null);
    setSelectedSymptom(null);
    setCaseResult(null);
    setVoiceText("");

    setTimeout(() => {
      setCallState("CONNECTED");
      const greeting = "नमस्ते! पशु रक्षक एवं जीव-रक्षा आपातकालीन हेल्पलाइन में आपका स्वागत है। पशु चुनने के लिए: गाय के लिए 1, भैंस के लिए 2, बकरी के लिए 3 दबाएं।";
      speakPrompt(greeting);
    }, 1800);
  };

  // End Call Handler
  const handleEndCall = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setCallState("IDLE");
    setCurrentStep(1);
    setSelectedAnimal(null);
    setSelectedSymptom(null);
  };

  // Keypad Press Handler
  const handleKeyPress = (digit: string) => {
    // Play subtle audio tone
    playDtmfTone();

    if (callState !== "CONNECTED") return;

    if (currentStep === 1) {
      if (["1", "2", "3", "4"].includes(digit)) {
        setSelectedAnimal(digit);
        setCurrentStep(2);
        const symptomPrompt = "लक्षण बताएं: तेज़ बुखार और खुर या मुंह के छालों के लिए 1 दबाएं। लंपी गांठों के लिए 2 दबाएं। सांस में घरघराहट या गलघोंटू के लिए 3 दबाएं। या बोलकर बताने के लिए 4 दबाएं।";
        speakPrompt(symptomPrompt);
      }
    } else if (currentStep === 2) {
      if (["1", "2", "3", "4"].includes(digit)) {
        setSelectedSymptom(digit);
        if (digit === "4") {
          // Open microphone for voice
          startVoiceRecognition();
        } else {
          submitIvrCase(selectedAnimal || "1", digit, "");
        }
      }
    }
  };

  // Web Speech Recognition for voice symptom option (Option 4)
  const startVoiceRecognition = () => {
    const SpeechRecognition = typeof window !== "undefined" ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : null;
    if (!SpeechRecognition) {
      submitIvrCase(selectedAnimal || "1", "4", "पशु अस्वस्थ है और खाना-पीना छोड़ दिया है।");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      speakPrompt("बीप के बाद अपनी समस्या बोलें...");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setVoiceText(transcript);
      setIsListening(false);
      submitIvrCase(selectedAnimal || "1", "4", transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      submitIvrCase(selectedAnimal || "1", "4", "वॉयस इनपुट के माध्यम से दर्ज लक्षण");
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  // Play realistic DTMF phone beep
  const playDtmfTone = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      // Ignore web audio errors
    }
  };

  // Submit Case to Database
  const submitIvrCase = async (animalChoice: string, symptomChoice: string, voiceNote: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/ivr/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callerPhone: userPhone,
          animalChoice,
          symptomChoice,
          voiceNoteText: voiceNote,
          village: userVillage,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCaseResult(data);
        setCallState("COMPLETED");
        speakPrompt(data.confirmationVoiceText);
      } else {
        alert("IVR केस दर्ज करने में त्रुटि आई। कृपया पुनः प्रयास करें।");
      }
    } catch (err) {
      console.error("IVR intake failed:", err);
      alert("सर्वर से संपर्क नहीं हो सका।");
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#EEF2EA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#2E7D46] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-[#16261B]">पहुंच सत्यापित हो रही है... (Checking Login...)</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF2EA] text-[#16261B]">
      <FarmerNav />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
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
                  24x7 Toll-Free IVR Service
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#16261B] mt-0.5">
                📞 1800-PASHOO-HELP (पशु रक्षक हेल्पलाइन)
              </h1>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-white p-1 rounded-2xl border border-[#D5DDD0] text-xs font-bold shadow-sm">
            <button
              onClick={() => setActiveTab("dialer")}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                activeTab === "dialer"
                  ? "bg-[#2E7D46] text-white shadow-sm"
                  : "text-[#5B6B5F] hover:text-[#16261B]"
              }`}
            >
              📱 लाइव डायलर (Dialer Simulator)
            </button>
            <button
              onClick={() => setActiveTab("developer")}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                activeTab === "developer"
                  ? "bg-[#2E7D46] text-white shadow-sm"
                  : "text-[#5B6B5F] hover:text-[#16261B]"
              }`}
            >
              ⚙️ टेलीकॉम वेबहुक (Twilio/API)
            </button>
          </div>
        </div>

        {activeTab === "dialer" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ── LEFT: PHONE HARDWARE SIMULATOR ── */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-[370px] bg-[#16261B] rounded-[42px] p-4 shadow-2xl border-4 border-[#2E7D46]/40 text-white relative">
                {/* Phone Speaker Notch */}
                <div className="w-32 h-4 bg-black/60 rounded-full mx-auto mb-3 flex items-center justify-center gap-2">
                  <div className="w-10 h-1.5 bg-gray-600 rounded-full" />
                  <div className="w-2 h-2 bg-gray-800 rounded-full" />
                </div>

                {/* Inner Screen */}
                <div className="bg-gradient-to-b from-[#183921] to-[#122416] rounded-[32px] p-4 border border-white/10 min-h-[560px] flex flex-col justify-between shadow-inner">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between text-[11px] text-white/70 font-bold px-1 border-b border-white/10 pb-2">
                    <span>Pashu-Cell 4G</span>
                    <span className="flex items-center gap-1.5">
                      <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                      98% ⚡
                    </span>
                  </div>

                  {/* Call State Display */}
                  <div className="text-center py-4 space-y-2">
                    {callState === "IDLE" && (
                      <div className="space-y-1">
                        <span className="text-xs uppercase font-extrabold tracking-wider text-[#FBEFCF]">
                          Toll-Free Helpline
                        </span>
                        <div className="text-2xl font-black text-white tracking-widest">
                          {phoneNumber}
                        </div>
                        <p className="text-[11px] text-white/70 font-medium">
                          पशु आपातकाल हेतु नीचे हरा बटन दबाएं
                        </p>
                      </div>
                    )}

                    {callState === "DIALING" && (
                      <div className="space-y-2 py-4 animate-pulse">
                        <div className="w-12 h-12 rounded-full bg-[#E8A317]/20 border border-[#E8A317] flex items-center justify-center mx-auto text-[#E8A317]">
                          <PhoneCall className="w-6 h-6 animate-bounce" />
                        </div>
                        <div className="text-lg font-black text-white">कॉल कनेक्ट हो रही है...</div>
                        <p className="text-xs text-white/70">Connecting to IVR Voice Server</p>
                      </div>
                    )}

                    {callState === "CONNECTED" && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                          <span className="text-sm font-black text-emerald-400">
                            कॉल चालू है • {formatTimer(callDuration)}
                          </span>
                        </div>

                        {/* Interactive Voice Waveform */}
                        <div className="flex items-center justify-center gap-1 h-8 px-4">
                          {[40, 80, 55, 95, 60, 85, 45, 90, 70, 50].map((h, i) => (
                            <div
                              key={i}
                              className="w-1 bg-[#FBEFCF] rounded-full animate-pulse"
                              style={{
                                height: `${h}%`,
                                animationDelay: `${i * 80}ms`,
                              }}
                            />
                          ))}
                        </div>

                        {/* Spoken Step Instructions in Screen */}
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 text-left text-xs space-y-1.5 shadow-md">
                          {currentStep === 1 && (
                            <>
                              <b className="text-[#FBEFCF] block">चरण 1: पशु का चयन करें (Dial 1-4)</b>
                              <p className="text-white/90">
                                <b>1</b> = 🐄 गाय (Cow) &nbsp;|&nbsp; <b>2</b> = 🐃 भैंस (Buffalo)<br />
                                <b>3</b> = 🐐 बकरी (Goat) &nbsp;|&nbsp; <b>4</b> = अन्य (Other)
                              </p>
                            </>
                          )}

                          {currentStep === 2 && (
                            <>
                              <b className="text-[#FBEFCF] block">चरण 2: बीमारी का लक्षण चुनें</b>
                              <p className="text-white/90 leading-relaxed">
                                <b>1</b> = 🌡️ बुखार व खुर/मुंह के छाले (FMD)<br />
                                <b>2</b> = 🩹 चमड़ी में गांठें (LSD)<br />
                                <b>3</b> = 🫁 गले में सूजन / सांस में घरघराहट<br />
                                <b>4</b> = 🎤 बोलकर बताएं (Voice Input)
                              </p>
                            </>
                          )}

                          {isListening && (
                            <div className="flex items-center gap-2 text-rose-400 font-bold animate-pulse pt-1">
                              <Mic className="w-4 h-4" />
                              <span>माइक सक्रिय: बोलकर बताएं...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {callState === "COMPLETED" && (
                      <div className="space-y-2 py-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mx-auto text-emerald-400">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h4 className="text-base font-black text-white">केस दर्ज हो गया!</h4>
                        <span className="px-3 py-1 rounded-full bg-white/20 text-[#FBEFCF] text-xs font-black tracking-wider block mx-auto w-fit">
                          {caseResult?.caseNumber}
                        </span>
                        <p className="text-[11px] text-white/80">
                          पशु चिकित्सक को आपातकालीन अलर्ट भेजा गया है।
                        </p>
                      </div>
                    )}
                  </div>

                  {/* ── KEYPAD DIALER ── */}
                  <div className="space-y-2.5 pt-2">
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { num: "1", sub: "गाय (Cow)" },
                        { num: "2", sub: "भैंस (Buffalo)" },
                        { num: "3", sub: "बकरी (Goat)" },
                        { num: "4", sub: "FMD छाले" },
                        { num: "5", sub: "लंपी गांठें" },
                        { num: "6", sub: "गलघोंटू" },
                        { num: "7", sub: "PQRS" },
                        { num: "8", sub: "TUV" },
                        { num: "9", sub: "WXYZ" },
                        { num: "*", sub: "Menu" },
                        { num: "0", sub: "+" },
                        { num: "#", sub: "Send" },
                      ].map((key) => (
                        <button
                          key={key.num}
                          onClick={() => handleKeyPress(key.num)}
                          disabled={callState === "IDLE" || callState === "COMPLETED"}
                          className={`h-12 rounded-2xl flex flex-col items-center justify-center transition active:scale-90 ${
                            callState === "CONNECTED"
                              ? "bg-white/15 hover:bg-white/25 text-white cursor-pointer"
                              : "bg-white/5 text-white/40 cursor-not-allowed"
                          }`}
                        >
                          <span className="text-base font-black leading-none">{key.num}</span>
                          <span className="text-[9px] text-white/60 font-semibold leading-tight">
                            {key.sub}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Bottom Action Bar (Call / End Call / Audio Controls) */}
                    <div className="pt-2 flex items-center justify-around">
                      {/* Audio Prompt Toggle */}
                      <button
                        onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                        className={`p-3 rounded-full transition ${
                          isAudioEnabled
                            ? "bg-white/10 text-emerald-400 hover:bg-white/20"
                            : "bg-white/10 text-gray-400 hover:bg-white/20"
                        }`}
                        title="Toggle IVR Hindi Voice Prompts"
                      >
                        {isAudioEnabled ? (
                          <Volume2 className="w-5 h-5" />
                        ) : (
                          <VolumeX className="w-5 h-5" />
                        )}
                      </button>

                      {/* Main Call / End Button */}
                      {callState === "IDLE" ? (
                        <button
                          onClick={handleStartCall}
                          className="w-16 h-16 rounded-full bg-[#2E7D46] hover:bg-[#256639] text-white flex items-center justify-center shadow-lg shadow-[#2E7D46]/40 transition active:scale-95"
                          title="Dial Toll-Free IVR"
                        >
                          <Phone className="w-7 h-7" />
                        </button>
                      ) : (
                        <button
                          onClick={handleEndCall}
                          className="w-16 h-16 rounded-full bg-[#C8372D] hover:bg-[#B32D24] text-white flex items-center justify-center shadow-lg shadow-[#C8372D]/40 transition active:scale-95"
                          title="End Call"
                        >
                          <PhoneOff className="w-7 h-7" />
                        </button>
                      )}

                      {/* Mic Button for Step 2 (Voice Note) */}
                      <button
                        onClick={startVoiceRecognition}
                        disabled={callState !== "CONNECTED" || isListening}
                        className={`p-3 rounded-full transition ${
                          isListening
                            ? "bg-rose-500 text-white animate-ping"
                            : "bg-white/10 text-white/80 hover:bg-white/20"
                        }`}
                        title="Speak Symptoms via Mic"
                      >
                        <Mic className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT: CALL MONITOR & LIVE CASE GENERATION ── */}
            <div className="lg:col-span-7 space-y-5">
              {/* Feature Introduction Card */}
              <div className="bg-white rounded-3xl p-6 border border-[#D5DDD0] shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#DCEFE1] text-[#2E7D46] flex items-center justify-center font-bold">
                    📞
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#16261B]">
                      IVR फोन हेल्पलाइन कैसे काम करती है?
                    </h3>
                    <p className="text-xs text-[#5B6B5F] font-semibold">
                      ग्रामीण किसानों के लिए बिना इंटरनेट की आपातकालीन वॉइस प्रणाली
                    </p>
                  </div>
                </div>

                {/* Simulation Setup Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-xs font-bold text-[#5B6B5F] block mb-1">
                      कॉलर का फोन नंबर (Simulated Caller Phone):
                    </label>
                    <input
                      type="text"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-[#EEF2EA] rounded-xl border border-[#D5DDD0] text-xs font-bold text-[#16261B]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#5B6B5F] block mb-1">
                      गांव का नाम (Simulated Village):
                    </label>
                    <input
                      type="text"
                      value={userVillage}
                      onChange={(e) => setUserVillage(e.target.value)}
                      className="w-full px-3 py-2 bg-[#EEF2EA] rounded-xl border border-[#D5DDD0] text-xs font-bold text-[#16261B]"
                    />
                  </div>
                </div>

                {/* IVR Workflow Steps */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-[#EEF2EA]">
                  <div
                    className={`p-3 rounded-2xl border transition ${
                      currentStep === 1 && callState === "CONNECTED"
                        ? "bg-[#DCEFE1] border-[#2E7D46] font-bold"
                        : "bg-[#EEF2EA] border-[#D5DDD0]"
                    }`}
                  >
                    <span className="text-[11px] font-black text-[#2E7D46] block">चरण 1 (Step 1)</span>
                    <span className="text-xs font-bold text-[#16261B] block mt-0.5">
                      पशु चुनें (Dial 1-4)
                    </span>
                    <span className="text-[11px] text-[#5B6B5F]">गाय, भैंस, बकरी</span>
                  </div>

                  <div
                    className={`p-3 rounded-2xl border transition ${
                      currentStep === 2 && callState === "CONNECTED"
                        ? "bg-[#FBEFCF] border-[#E8A317] font-bold"
                        : "bg-[#EEF2EA] border-[#D5DDD0]"
                    }`}
                  >
                    <span className="text-[11px] font-black text-[#B87E0E] block">चरण 2 (Step 2)</span>
                    <span className="text-xs font-bold text-[#16261B] block mt-0.5">
                      लक्षण बताएं (Dial 1-4)
                    </span>
                    <span className="text-[11px] text-[#5B6B5F]">FMD, LSD, गलघोंटू</span>
                  </div>

                  <div
                    className={`p-3 rounded-2xl border transition ${
                      callState === "COMPLETED"
                        ? "bg-[#DCEFE1] border-[#2E7D46] font-bold"
                        : "bg-[#EEF2EA] border-[#D5DDD0]"
                    }`}
                  >
                    <span className="text-[11px] font-black text-[#2E7D46] block">चरण 3 (Step 3)</span>
                    <span className="text-xs font-bold text-[#16261B] block mt-0.5">
                      स्वचालित केस दर्ज
                    </span>
                    <span className="text-[11px] text-[#5B6B5F]">डॉक्टर अलर्ट व दवा</span>
                  </div>
                </div>
              </div>

              {/* ── LIVE CASE RECEIPT WHEN COMPLETED ── */}
              {caseResult ? (
                <div className="bg-white rounded-3xl p-6 border-2 border-[#2E7D46] shadow-xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center justify-between border-b border-[#EEF2EA] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-[#DCEFE1] text-[#2E7D46] flex items-center justify-center font-bold">
                        📋
                      </span>
                      <div>
                        <h4 className="font-extrabold text-[#16261B] text-base">
                          आपातकालीन केस रसीद (IVR Emergency Case)
                        </h4>
                        <p className="text-xs text-[#5B6B5F]">
                          कॉल के माध्यम से डेटाबेस में सफलतापूर्वक दर्ज
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-[#DCEFE1] text-[#2E7D46] text-xs font-black">
                      {caseResult.caseNumber}
                    </span>
                  </div>

                  {/* Case Key Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#EEF2EA] p-3.5 rounded-2xl text-xs">
                    <div>
                      <span className="text-[#5B6B5F] block font-semibold">पशु (Species):</span>
                      <b className="text-[#16261B] text-sm">{caseResult.animalSpecies}</b>
                    </div>
                    <div>
                      <span className="text-[#5B6B5F] block font-semibold">स्थान (Village):</span>
                      <b className="text-[#16261B] text-sm">{caseResult.village}</b>
                    </div>
                    <div>
                      <span className="text-[#5B6B5F] block font-semibold">जोखिम (Risk):</span>
                      <b className="text-[#C8372D] text-sm font-black">
                        {caseResult.riskLevel} ({caseResult.riskScore}%)
                      </b>
                    </div>
                    <div>
                      <span className="text-[#5B6B5F] block font-semibold">तैनात डॉक्टर:</span>
                      <b className="text-[#2E7D46] text-sm">{caseResult.assignedVet}</b>
                    </div>
                  </div>

                  {/* Suspected Outbreak */}
                  <div className="bg-[#FFFDF5] p-3.5 rounded-2xl border border-[#E8A317]/30 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-[#B87E0E] font-extrabold">
                      <AlertTriangle className="w-4 h-4" />
                      <span>संभावित प्रकोप (Suspected Outbreak Disease):</span>
                    </div>
                    <p className="font-black text-[#16261B] text-sm">{caseResult.suspectedDisease}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {caseResult.symptoms.map((sym, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-white border border-[#D5DDD0] text-[11px] font-bold text-[#16261B]"
                        >
                          {sym}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* First Aid Guidelines */}
                  <div className="bg-[#F2F9F4] p-3.5 rounded-2xl border border-[#2E7D46]/30 text-xs space-y-1">
                    <span className="font-extrabold text-[#2E7D46] block">
                      🩺 तत्काल प्राथमिक उपचार (Emergency First-Aid Spoken to Farmer):
                    </span>
                    <p className="text-[#16261B] font-semibold leading-relaxed">
                      {caseResult.firstAidHindi}
                    </p>
                  </div>

                  {/* Direct Action Links */}
                  <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                    <Link
                      href="/dashboard/cases"
                      className="flex-1 py-3 px-4 rounded-xl bg-[#2E7D46] hover:bg-[#256639] text-white text-xs font-black flex items-center justify-center gap-2 shadow-md transition"
                    >
                      <Stethoscope className="w-4 h-4" />
                      <span>डॉक्टर पोर्टल में यह केस देखें (View in Vet Cases)</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={handleStartCall}
                      className="py-3 px-4 rounded-xl bg-[#EEF2EA] hover:bg-[#D5DDD0] text-[#16261B] text-xs font-black flex items-center justify-center gap-2 transition"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>नई कॉल करें (Call Again)</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Ready State Call-to-action */
                <div className="bg-white rounded-3xl p-8 border border-[#D5DDD0] text-center space-y-3 shadow-sm">
                  <div className="w-14 h-14 rounded-2xl bg-[#DCEFE1] text-[#2E7D46] flex items-center justify-center mx-auto text-2xl">
                    📞
                  </div>
                  <h4 className="text-lg font-black text-[#16261B]">
                    सिम्युलेटर का परीक्षण करने के लिए तैयार हैं?
                  </h4>
                  <p className="text-xs text-[#5B6B5F] max-w-md mx-auto leading-relaxed">
                    बाएं हाथ पर फोन स्क्रीन में दिए गए <b>हरे कॉल बटन</b> पर क्लिक करें। आपको वास्तविक
                    हिंदी आवाज़ में निर्देश सुनाई देंगे। आप कीपैड पर 1, 2, 3 दबाकर या बोलकर बीमार पशु का केस दर्ज कर सकते हैं।
                  </p>
                  <button
                    onClick={handleStartCall}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#2E7D46] hover:bg-[#256639] text-white text-xs font-black rounded-xl shadow-md transition"
                  >
                    <Phone className="w-4 h-4" />
                    <span>हेल्पलाइन नंबर मिलाएं (Start Call Now)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ── DEVELOPER / TELECOM INTEGRATION TAB ── */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D5DDD0] shadow-sm space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#2E7D46] bg-[#DCEFE1] px-2.5 py-0.5 rounded-full">
                Production Telephony Integration
              </span>
              <h3 className="text-xl font-black text-[#16261B]">
                Twilio / Exotel टेलीकॉम सेटअप निर्देश
              </h3>
              <p className="text-xs text-[#5B6B5F] font-semibold">
                वास्तविक भारतीय सिम कार्ड या 1800 टोल-फ्री नंबर को अपने Next.js बैकएंड से कैसे जोड़ें
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#EEF2EA] border border-[#D5DDD0] space-y-2">
                <b className="text-xs text-[#2E7D46] font-black uppercase">
                  1. एक्टिव वेबहुक एंडपॉइंट्स (Available Endpoints)
                </b>
                <ul className="text-xs space-y-1.5 font-mono text-[#16261B]">
                  <li className="bg-white p-2 rounded-lg border border-[#D5DDD0]">
                    <b>POST / GET:</b> /api/ivr/webhook
                  </li>
                  <li className="bg-white p-2 rounded-lg border border-[#D5DDD0]">
                    <b>POST:</b> /api/ivr/simulate
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-[#EEF2EA] border border-[#D5DDD0] space-y-2">
                <b className="text-xs text-[#E8A317] font-black uppercase">
                  2. Twilio फोन नंबर कॉन्फ़िगरेशन
                </b>
                <p className="text-xs text-[#5B6B5F] font-medium leading-relaxed">
                  Twilio Console में जाकर अपने Phone Number की <b>"A Call Comes In"</b> सेटिंग में <b>Webhook</b> चुनें और URL दर्ज करें:
                </p>
                <div className="bg-white p-2 rounded-lg border border-[#D5DDD0] text-xs font-mono text-[#16261B]">
                  https://your-domain.com/api/ivr/webhook
                </div>
              </div>
            </div>

            {/* Architecture Code Snippet */}
            <div className="space-y-2">
              <b className="text-xs font-black text-[#16261B]">
                TwiML / XML प्रतिक्रिया प्रारूप (Auto-Generated by /api/ivr/webhook):
              </b>
              <pre className="bg-[#16261B] text-emerald-300 p-4 rounded-2xl text-xs font-mono overflow-x-auto">
{`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather numDigits="1" action="/api/ivr/webhook?step=symptoms" method="POST">
    <Say language="hi-IN" voice="Polly.Aditi">
      नमस्ते! पशु रक्षक राष्ट्रीय आपातकालीन हेल्पलाइन में आपका स्वागत है।
      गाय के लिए 1, भैंस के लिए 2, बकरी के लिए 3 दबाएं।
    </Say>
  </Gather>
</Response>`}
              </pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
