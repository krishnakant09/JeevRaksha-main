"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Mic,
  MicOff,
  MapPin,
  Check,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  HeartPulse,
  Sparkles,
  Plus,
  Minus,
  Info,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Stethoscope,
  Activity,
  FileCheck,
  Volume2,
  X,
  Radio,
  Wand2
} from "lucide-react";
import FarmerNav from "@/components/farmer/FarmerNav";

const LocationPickerMap = dynamic(
  () => import("../../../components/maps/LocationPickerMap"),
  { ssr: false }
);

interface SymptomDef {
  id: string;
  name: string;
  hindi: string;
  emoji: string;
  desc: string;
}

const SYMPTOM_DEFINITIONS: SymptomDef[] = [
  { id: "Fever", name: "Fever", hindi: "तेज़ बुखार", emoji: "🌡️", desc: "Body temp above 102°F, ears hot" },
  { id: "Blistering", name: "Blistering & Lesions", hindi: "छाले व घाव", emoji: "🩹", desc: "Sores on mouth, tongue, skin or hooves" },
  { id: "Excessive salivation", name: "Excessive Salivation", hindi: "मुँह से लार गिरना", emoji: "💧", desc: "Continuous drooling or frothing" },
  { id: "Lameness", name: "Lameness / Limping", hindi: "लंगड़ाना", emoji: "🐾", desc: "Inability or reluctance to walk" },
  { id: "Loss of appetite", name: "Loss of Appetite", hindi: "चारा न खाना", emoji: "🌾", desc: "Refusing fodder, off feed" },
  { id: "Weakness", name: "Weakness & Lethargy", hindi: "कमजोरी व सुस्ती", emoji: "🛋️", desc: "Lying down, unable to rise" },
  { id: "Cough", name: "Cough & Breathing Issue", hindi: "खांसी / सांस फूलना", emoji: "🫁", desc: "Labored respiration, wheezing" },
  { id: "Diarrhea", name: "Diarrhea", hindi: "दस्त / पेचिश", emoji: "⚠️", desc: "Watery, bloody or foul stools" },
  { id: "Nasal discharge", name: "Nasal Discharge", hindi: "नाक से स्राव", emoji: "👃", desc: "Mucus or thick fluid from nose" },
  { id: "Sudden death", name: "Sudden Death", hindi: "अचानक मृत्यु", emoji: "☠️", desc: "Rapid fatality without warning" },
];

interface DiseasePreset {
  name: string;
  hindi: string;
  code: string;
  species: string[]; // ['cow', 'buffalo', 'goat', 'sheep', 'poultry', 'pig', 'horse', 'camel']
  badgeColor: string;
  activeColor: string;
  symptoms: string[];
  description: string;
}

const ALL_DISEASE_PRESETS: DiseasePreset[] = [
  // ── Cattle (Cow) & Buffalo ──
  {
    name: "FMD (खुरपका-मुँहपका)",
    hindi: "Foot-and-Mouth Disease",
    code: "FMD",
    species: ["cow", "buffalo", "sheep", "goat", "pig"],
    badgeColor: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
    activeColor: "bg-red-600 text-white border-red-600",
    symptoms: ["Fever", "Blistering", "Excessive salivation", "Lameness"],
    description: "Vesicles on hooves/mouth, continuous drooling, high fever",
  },
  {
    name: "LSD (लंपी स्किन)",
    hindi: "Lumpy Skin Disease",
    code: "LSD",
    species: ["cow", "buffalo"],
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
    activeColor: "bg-amber-600 text-white border-amber-600",
    symptoms: ["Fever", "Blistering", "Loss of appetite", "Weakness"],
    description: "Nodular skin eruptions, fever, enlarged lymph nodes",
  },
  {
    name: "BQ (लंगड़ा बुखार)",
    hindi: "Black Quarter",
    code: "BQ",
    species: ["cow", "buffalo", "sheep"],
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
    activeColor: "bg-purple-600 text-white border-purple-600",
    symptoms: ["Fever", "Lameness", "Weakness", "Sudden death"],
    description: "Crepitating painful muscle swelling in thigh/shoulder, acute death",
  },
  {
    name: "HS (गलघोंटू)",
    hindi: "Haemorrhagic Septicaemia",
    code: "HS",
    species: ["cow", "buffalo"],
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
    activeColor: "bg-blue-600 text-white border-blue-600",
    symptoms: ["Fever", "Nasal discharge", "Cough", "Sudden death"],
    description: "Severe neck/throat swelling, stertorous gasping, rapid death",
  },
  {
    name: "Tick Fever (चिचड़ी बुखार)",
    hindi: "Babesiosis / Theileriosis",
    code: "TF",
    species: ["cow", "buffalo"],
    badgeColor: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
    activeColor: "bg-orange-600 text-white border-orange-600",
    symptoms: ["Fever", "Weakness", "Loss of appetite", "Diarrhea"],
    description: "High persistent fever, severe anemia, jaundice from tick vectors",
  },

  // ── Goat & Sheep ──
  {
    name: "PPR (बकरी प्लेग)",
    hindi: "Peste des Petits Ruminants",
    code: "PPR",
    species: ["goat", "sheep"],
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",
    activeColor: "bg-rose-600 text-white border-rose-600",
    symptoms: ["Fever", "Diarrhea", "Nasal discharge", "Loss of appetite"],
    description: "Mouth sores, severe foul diarrhea, eye/nasal mucus discharge",
  },
  {
    name: "Goat/Sheep Pox (चेचक / माता)",
    hindi: "Capripoxvirus",
    code: "POX",
    species: ["goat", "sheep"],
    badgeColor: "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100",
    activeColor: "bg-pink-600 text-white border-pink-600",
    symptoms: ["Fever", "Blistering", "Loss of appetite", "Nasal discharge"],
    description: "Pox lesions and scabs on muzzle, eyelids, ears, and groin",
  },
  {
    name: "ET (फड़किया रोग)",
    hindi: "Enterotoxaemia (Pulpy Kidney)",
    code: "ET",
    species: ["goat", "sheep"],
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100",
    activeColor: "bg-indigo-600 text-white border-indigo-600",
    symptoms: ["Sudden death", "Diarrhea", "Weakness", "Loss of appetite"],
    description: "Convulsions, sudden mortality in well-fed sheep/goats, watery diarrhea",
  },
  {
    name: "CCPP (संक्रामक निमोनिया)",
    hindi: "Contagious Caprine Pleuropneumonia",
    code: "CCPP",
    species: ["goat", "sheep"],
    badgeColor: "bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100",
    activeColor: "bg-cyan-600 text-white border-cyan-600",
    symptoms: ["Fever", "Cough", "Nasal discharge", "Weakness"],
    description: "Continuous coughing, painful breathing, grunting, nasal fluid",
  },

  // ── Poultry (Chicken / Duck) ──
  {
    name: "Ranikhet (रानीखेत रोग)",
    hindi: "Newcastle Disease",
    code: "ND",
    species: ["poultry"],
    badgeColor: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
    activeColor: "bg-red-600 text-white border-red-600",
    symptoms: ["Cough", "Nasal discharge", "Diarrhea", "Weakness", "Sudden death"],
    description: "Twisting neck, greenish watery diarrhea, gasping, heavy mortality",
  },
  {
    name: "Bird Flu (बर्ड फ्लू)",
    hindi: "Avian Influenza",
    code: "AI",
    species: ["poultry"],
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
    activeColor: "bg-amber-600 text-white border-amber-600",
    symptoms: ["Sudden death", "Nasal discharge", "Cough", "Diarrhea"],
    description: "Swelling of comb/wattles, severe lethargy, rapid outbreak mortality",
  },
  {
    name: "Fowl Pox (मुर्गी चेचक)",
    hindi: "Avipoxvirus",
    code: "FP",
    species: ["poultry"],
    badgeColor: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
    activeColor: "bg-yellow-600 text-white border-yellow-600",
    symptoms: ["Blistering", "Loss of appetite", "Weakness"],
    description: "Wart-like nodules on comb, wattles, and eyelids",
  },
  {
    name: "Coccidiosis (खूनी दस्त)",
    hindi: "Coccidial Enteritis",
    code: "COCC",
    species: ["poultry"],
    badgeColor: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
    activeColor: "bg-orange-600 text-white border-orange-600",
    symptoms: ["Diarrhea", "Weakness", "Loss of appetite", "Sudden death"],
    description: "Bloody droppings, ruffled feathers, huddling together, dehydration",
  },

  // ── Pig (Swine) ──
  {
    name: "African Swine Fever (ASF)",
    hindi: "अफ्रीकी स्वाइन फीवर",
    code: "ASF",
    species: ["pig"],
    badgeColor: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
    activeColor: "bg-red-600 text-white border-red-600",
    symptoms: ["Fever", "Weakness", "Diarrhea", "Sudden death"],
    description: "High fever, reddened skin on ears/belly, acute mortality",
  },
  {
    name: "Swine Erysipelas (लाल चर्म रोग)",
    hindi: "Diamond Skin Disease",
    code: "SE",
    species: ["pig"],
    badgeColor: "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100",
    activeColor: "bg-pink-600 text-white border-pink-600",
    symptoms: ["Fever", "Blistering", "Lameness", "Loss of appetite"],
    description: "Diamond-shaped raised red skin patches, stiff walking, high fever",
  },

  // ── Horse (Equine) ──
  {
    name: "Equine Flu (घोड़ों की खांसी)",
    hindi: "Equine Influenza",
    code: "EI",
    species: ["horse"],
    badgeColor: "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100",
    activeColor: "bg-sky-600 text-white border-sky-600",
    symptoms: ["Fever", "Cough", "Nasal discharge", "Weakness"],
    description: "Dry hacking cough, serous nasal discharge, fever, muscle stiffness",
  },
  {
    name: "Strangles (कंठमाला)",
    hindi: "Streptococcus equi",
    code: "STR",
    species: ["horse"],
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
    activeColor: "bg-emerald-600 text-white border-emerald-600",
    symptoms: ["Fever", "Nasal discharge", "Cough", "Loss of appetite"],
    description: "Swollen throat lymph nodes, purulent thick nasal discharge",
  },
  {
    name: "Glanders (ग्लैंडर्स रोग)",
    hindi: "Burkholderia mallei",
    code: "GLD",
    species: ["horse"],
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",
    activeColor: "bg-rose-600 text-white border-rose-600",
    symptoms: ["Fever", "Nasal discharge", "Cough", "Loss of appetite"],
    description: "Nodular ulcers on respiratory mucosa, chronic cough, enlarged vessels",
  },

  // ── Camel ──
  {
    name: "Surra (सर्रा / तीबरसा)",
    hindi: "Trypanosomiasis",
    code: "SUR",
    species: ["camel", "horse", "cow"],
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
    activeColor: "bg-amber-600 text-white border-amber-600",
    symptoms: ["Fever", "Weakness", "Loss of appetite", "Sudden death"],
    description: "Intermittent recurring fever, rapid wasting/anemia, edema of legs",
  },
  {
    name: "Camel Pox (ऊंट चेचक)",
    hindi: "Orthopoxvirus cameli",
    code: "CPX",
    species: ["camel"],
    badgeColor: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
    activeColor: "bg-yellow-600 text-white border-yellow-600",
    symptoms: ["Blistering", "Fever", "Loss of appetite"],
    description: "Pustular skin eruptions around lips, nostrils, and eyelids",
  },
];

function normalizeSpecies(species: string = ""): string {
  const s = species.toLowerCase().trim();
  if (s.includes("cow") || s.includes("गाय") || s.includes("cattle") || s.includes("ox") || s.includes("bull") || s.includes("calf") || s.includes("बछड़ा")) return "cow";
  if (s.includes("buffalo") || s.includes("भैंस") || s.includes("कटड़ा")) return "buffalo";
  if (s.includes("goat") || s.includes("बकरी") || s.includes("बकरा")) return "goat";
  if (s.includes("sheep") || s.includes("भेड़") || s.includes("मेमना")) return "sheep";
  if (s.includes("poultry") || s.includes("chicken") || s.includes("मुर्गी") || s.includes("bird") || s.includes("चूजा")) return "poultry";
  if (s.includes("pig") || s.includes("swine") || s.includes("सूअर")) return "pig";
  if (s.includes("horse") || s.includes("equine") || s.includes("घोड़ा")) return "horse";
  if (s.includes("camel") || s.includes("ऊंट")) return "camel";
  return "other";
}

function getSpeciesEmoji(species: string = ""): string {
  const s = species.toLowerCase();
  if (s.includes("cow") || s.includes("गाय")) return "🐄";
  if (s.includes("buffalo") || s.includes("भैंस")) return "🐃";
  if (s.includes("goat") || s.includes("बकरी")) return "🐐";
  if (s.includes("sheep") || s.includes("भेड़")) return "🐑";
  if (s.includes("poultry") || s.includes("chicken") || s.includes("मुर्गी")) return "🐔";
  if (s.includes("pig") || s.includes("सूअर")) return "🐖";
  if (s.includes("horse") || s.includes("घोड़ा")) return "🐎";
  if (s.includes("camel") || s.includes("ऊंट")) return "🐪";
  return "🐾";
}

export default function ReportPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [animals, setAnimals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<any>(null);
  const [error, setError] = useState("");
  
  // Step state (1: Animal, 2: Symptoms & Severity, 3: Numbers & Location, 4: Review)
  const [step, setStep] = useState<number>(1);

  // Voice & AI states
  const [isListeningSymptoms, setIsListeningSymptoms] = useState(false);
  const [aiSymptomText, setAiSymptomText] = useState("");
  const [analyzingSymptoms, setAnalyzingSymptoms] = useState(false);
  const [isListeningNotes, setIsListeningNotes] = useState(false);

  // Dedicated Voice Form Assistant States
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [voiceLang, setVoiceLang] = useState<"hi" | "mr" | "en">("hi");
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [voiceExtractedData, setVoiceExtractedData] = useState<any>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    animalId: "",
    symptoms: [] as string[],
    severity: "MILD" as "MILD" | "MODERATE" | "SEVERE",
    deaths: 0,
    animalsAffected: 1,
    vaccinatedCount: 0,
    temperature: "102.5",
    duration: "2",
    locationVillage: "",
    locationBlock: "",
    locationDistrict: "",
    latitude: null as number | null,
    longitude: null as number | null,
    additionalNotes: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("jeevraksha_user");
    if (!stored) {
      router.push("/login");
      return;
    }
    const u = JSON.parse(stored);
    setUser(u);

    fetch(`/api/animals?ownerId=${u.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAnimals(data);
          // If animals exist and none selected, auto-select the first
          if (data.length > 0 && !form.animalId) {
            selectAnimal(data[0]);
          }
        }
      })
      .catch((e) => console.error(e));
  }, [router]);

  function selectAnimal(animal: any) {
    setForm((f) => ({
      ...f,
      animalId: animal.id,
      locationVillage: f.locationVillage || animal.village || "",
      locationBlock: f.locationBlock || animal.block || "",
      locationDistrict: f.locationDistrict || animal.district || "",
    }));
  }

  function toggleSymptom(symName: string) {
    setForm((f) => {
      const exists = f.symptoms.includes(symName);
      return {
        ...f,
        symptoms: exists
          ? f.symptoms.filter((s) => s !== symName)
          : [...f.symptoms, symName],
      };
    });
  }

  function applyPresetCluster(symptoms: string[]) {
    setForm((f) => {
      // Toggle: if already all present, remove them; else union
      const hasAll = symptoms.every((s) => f.symptoms.includes(s));
      if (hasAll) {
        return {
          ...f,
          symptoms: f.symptoms.filter((s) => !symptoms.includes(s)),
        };
      }
      return {
        ...f,
        symptoms: Array.from(new Set([...f.symptoms, ...symptoms])),
        severity: f.severity === "MILD" ? "MODERATE" : f.severity,
      };
    });
  }

  // Selected animal data and species-specific disease suggestions
  const selectedAnimalData = useMemo(() => {
    return animals.find((a) => a.id === form.animalId);
  }, [animals, form.animalId]);

  const currentNormalizedSpecies = useMemo(() => {
    return normalizeSpecies(selectedAnimalData?.species || "");
  }, [selectedAnimalData]);

  // Suggest ONLY diseases related to the selected animal species
  const animalSpecificPresets = useMemo(() => {
    if (!currentNormalizedSpecies || currentNormalizedSpecies === "other") {
      // If species is unknown or not selected, provide the most widespread cattle/buffalo diseases
      return ALL_DISEASE_PRESETS.filter((p) => p.species.includes("cow") || p.species.includes("buffalo"));
    }
    return ALL_DISEASE_PRESETS.filter((preset) =>
      preset.species.includes(currentNormalizedSpecies)
    );
  }, [currentNormalizedSpecies]);

  // Dedicated Voice Form Assistant Handlers
  const startVoiceInput = () => {
    setVoiceError(null);
    const SpeechRecognition =
      typeof window !== "undefined"
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;
    if (!SpeechRecognition) {
      setVoiceError("Speech recognition is not supported in this browser. You can click any sample speech below or type directly.");
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = voiceLang === "mr" ? "mr-IN" : voiceLang === "hi" ? "hi-IN" : "en-IN";
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListeningVoice(true);
      };

      recognition.onresult = (e: any) => {
        let currentText = "";
        for (let i = 0; i < e.results.length; i++) {
          currentText += e.results[i][0].transcript;
        }
        setVoiceTranscript(currentText);
      };

      recognition.onerror = (e: any) => {
        console.error("Speech error:", e);
        setIsListeningVoice(false);
        if (e.error === "not-allowed") {
          setVoiceError("Microphone access was denied. Please allow microphone permission or click the quick demo buttons below.");
        }
      };

      recognition.onend = () => {
        setIsListeningVoice(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListeningVoice(false);
    }
  };

  const processVoiceText = async (textToProcess: string) => {
    if (!textToProcess.trim()) return;
    setIsProcessingVoice(true);
    setVoiceError(null);
    try {
      const predefinedSymptoms = SYMPTOM_DEFINITIONS.map((s) => s.id);
      const res = await fetch("/api/draft-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToProcess, predefinedSymptoms }),
      });
      if (!res.ok) throw new Error("Failed to extract data");
      const data = await res.json();
      setVoiceExtractedData(data);
    } catch (err: any) {
      console.error(err);
      setVoiceError("Could not process voice input. Please try again.");
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const applyVoiceDataToForm = () => {
    if (!voiceExtractedData) return;
    
    // 1. Match animal by species if possible
    let targetAnimal = animals.find((a) => 
      a.species.toLowerCase() === (voiceExtractedData.species || "").toLowerCase()
    );
    if (!targetAnimal && animals.length > 0) {
      targetAnimal = animals[0];
    }

    setForm((f) => ({
      ...f,
      animalId: targetAnimal ? targetAnimal.id : f.animalId,
      symptoms: voiceExtractedData.symptoms && voiceExtractedData.symptoms.length > 0 ? voiceExtractedData.symptoms : f.symptoms,
      severity: (voiceExtractedData.severity || f.severity) as "MILD" | "MODERATE" | "SEVERE",
      animalsAffected: voiceExtractedData.animalsAffected || f.animalsAffected,
      deaths: voiceExtractedData.deaths !== undefined ? voiceExtractedData.deaths : f.deaths,
      duration: voiceExtractedData.duration ? String(voiceExtractedData.duration) : f.duration,
      temperature: voiceExtractedData.temperature ? String(voiceExtractedData.temperature) : f.temperature,
      locationVillage: voiceExtractedData.locationVillage || targetAnimal?.village || f.locationVillage,
      locationBlock: targetAnimal?.block || f.locationBlock,
      locationDistrict: targetAnimal?.district || f.locationDistrict,
      additionalNotes: voiceExtractedData.additionalNotes || f.additionalNotes,
    }));

    // Voice confirmation speak back
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(
          voiceLang === "mr" 
            ? "तुमचा फॉर्म भरला आहे. कृपया तपासा आणि पुष्टी करा." 
            : "फॉर्म भर दिया गया है! कृपया जांचें और पुष्टि करें।"
        );
        msg.lang = voiceLang === "mr" ? "mr-IN" : "hi-IN";
        window.speechSynthesis.speak(msg);
      } catch (e) {
        console.error(e);
      }
    }

    setIsVoiceModalOpen(false);
    // Smoothly jump to Step 4 (Review) so farmer can see everything filled
    setStep(4);
  };

  // Voice symptom matcher
  const startListeningSymptoms = () => {
    const SpeechRecognition =
      typeof window !== "undefined"
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN";
    recognition.continuous = false;

    recognition.onstart = () => setIsListeningSymptoms(true);
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setAiSymptomText(transcript);
      triggerSymptomMatch(transcript);
    };
    recognition.onerror = (e: any) => {
      console.error(e);
      setIsListeningSymptoms(false);
    };
    recognition.onend = () => setIsListeningSymptoms(false);
    recognition.start();
  };

  const triggerSymptomMatch = async (textToMatch: string) => {
    if (!textToMatch.trim()) return;
    setAnalyzingSymptoms(true);
    try {
      const predefinedSymptoms = SYMPTOM_DEFINITIONS.map((s) => s.id);
      const res = await fetch("/api/map-symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToMatch, predefinedSymptoms }),
      });
      const data = await res.json();
      if (data.matched && data.matched.length > 0) {
        setForm((f) => {
          const union = new Set([...f.symptoms, ...data.matched]);
          return { ...f, symptoms: Array.from(union) };
        });
        setAiSymptomText("");
      }
    } catch (err) {
      console.error(err);
    }
    setAnalyzingSymptoms(false);
  };

  // Notes Speech-to-Text
  const startListeningNotes = () => {
    const SpeechRecognition =
      typeof window !== "undefined"
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN";
    recognition.continuous = false;

    recognition.onstart = () => setIsListeningNotes(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setForm((f) => ({
        ...f,
        additionalNotes: f.additionalNotes ? f.additionalNotes + " " + transcript : transcript,
      }));
    };
    recognition.onerror = () => setIsListeningNotes(false);
    recognition.onend = () => setIsListeningNotes(false);
    recognition.start();
  };

  // Validation before advancing
  const canAdvance = () => {
    if (step === 1) {
      return !!form.animalId;
    }
    if (step === 2) {
      return form.symptoms.length > 0;
    }
    if (step === 3) {
      return !!form.locationVillage.trim() && form.animalsAffected >= 1;
    }
    return true;
  };

  const nextStep = () => {
    if (!canAdvance()) {
      if (step === 1) setError("Please select or register an animal first.");
      if (step === 2) setError("Please pick at least one visible symptom.");
      if (step === 3) setError("Please provide the village location.");
      return;
    }
    setError("");
    setStep((s) => Math.min(s + 1, 4));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevStep = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Form Submit
  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!form.animalId) {
      setStep(1);
      setError("Please select an animal.");
      return;
    }
    if (form.symptoms.length === 0) {
      setStep(2);
      setError("Please select at least one symptom.");
      return;
    }
    if (!form.locationVillage) {
      setStep(3);
      setError("Please enter the village name.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/health-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, reporterId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Submission failed");
        setLoading(false);
        return;
      }
      setSubmittedReport(data);
      setSubmitted(true);
    } catch {
      setError("Network error. Please check connection and try again.");
    }
    setLoading(false);
  }

  // Estimated Risk Level Preview (Client-side helper)
  const calculateEstimatedRisk = () => {
    if (form.deaths > 0 || form.severity === "SEVERE") {
      return { level: "HIGH", color: "red", score: 85, label: "Immediate Outbreak Alert" };
    }
    if (form.severity === "MODERATE" || form.symptoms.length >= 3) {
      return { level: "MEDIUM", color: "amber", score: 55, label: "Veterinary Attention Required" };
    }
    return { level: "LOW", color: "emerald", score: 25, label: "Symptomatic Monitoring" };
  };

  const estimatedRisk = calculateEstimatedRisk();

  // Success view
  if (submitted && submittedReport) {
    const isHigh = submittedReport.riskLevel === "HIGH";
    const isMed = submittedReport.riskLevel === "MEDIUM";

    return (
      <div className="min-h-screen bg-[#f5f4fb] pb-16">
        <FarmerNav userName={user?.name} />

        <div className="max-w-xl mx-auto p-4 sm:p-6 mt-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 text-center">
            {/* Animated Icon */}
            <div
              className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg ${
                isHigh
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : isMed
                  ? "bg-amber-50 text-amber-600 border border-amber-200"
                  : "bg-emerald-50 text-emerald-600 border border-emerald-200"
              }`}
            >
              {isHigh ? (
                <AlertTriangle className="w-10 h-10 animate-bounce" />
              ) : isMed ? (
                <Activity className="w-10 h-10" />
              ) : (
                <CheckCircle2 className="w-10 h-10" />
              )}
            </div>

            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
                isHigh
                  ? "bg-red-100 text-red-700"
                  : isMed
                  ? "bg-amber-100 text-amber-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              Triage Level: {submittedReport.riskLevel} (Score: {submittedReport.riskScore}/100)
            </span>

            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Report Successfully Logged!
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              रिपोर्ट सफलतापूर्वक दर्ज की गई • केस स्वचालित रूप से बनाया गया
            </p>

            {/* Advice Box */}
            <div
              className={`mt-6 p-4 rounded-2xl text-left border ${
                isHigh
                  ? "bg-red-50/70 border-red-200"
                  : isMed
                  ? "bg-amber-50/70 border-amber-200"
                  : "bg-emerald-50/70 border-emerald-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <Stethoscope
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    isHigh ? "text-red-600" : isMed ? "text-amber-600" : "text-emerald-600"
                  }`}
                />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800">
                    Recommended Immediate Action
                  </h4>
                  <p className="text-sm font-medium text-gray-700 mt-1 leading-relaxed">
                    {submittedReport.recommendedAction || "Monitor the herd and maintain biosecurity."}
                  </p>
                </div>
              </div>
            </div>

            {/* Case Details Badge */}
            <div className="mt-4 py-3 px-4 bg-gray-50 rounded-xl flex items-center justify-between text-xs text-gray-600">
              <span>Report ID: <code className="font-mono font-bold text-violet-700">{submittedReport.id.slice(-8)}</code></span>
              <span>Village: <strong>{submittedReport.locationVillage}</strong></span>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              <Link
                href="/farmer/my-issues"
                className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-sm shadow-md shadow-violet-200 transition text-center flex items-center justify-center gap-1.5"
              >
                <FileCheck className="w-4 h-4" />
                Track My Cases
              </Link>
              <Link
                href="/farmer/chat"
                className="w-full py-3 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 rounded-xl font-bold text-sm transition text-center flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                Ask AI Vet Assistant
              </Link>
            </div>

            <button
              onClick={() => {
                setSubmitted(false);
                setStep(1);
                setForm({
                  animalId: animals[0]?.id || "",
                  symptoms: [],
                  severity: "MILD",
                  deaths: 0,
                  animalsAffected: 1,
                  vaccinatedCount: 0,
                  temperature: "102.5",
                  duration: "2",
                  locationVillage: animals[0]?.village || "",
                  locationBlock: animals[0]?.block || "",
                  locationDistrict: animals[0]?.district || "",
                  latitude: null,
                  longitude: null,
                  additionalNotes: "",
                });
              }}
              className="mt-4 text-xs font-semibold text-gray-400 hover:text-gray-700 inline-flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              File another report
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f4fb] pb-28 md:pb-16">
      {/* Navigation Bar */}
      <FarmerNav userName={user?.name} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
        {/* Page Title & Bilingual Intro */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📋</span>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Livestock Disease Reporting Wizard
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
              पशु रोग रिपोर्टिंग विज़ार्ड • Step-by-Step Rapid Surveillance Form
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/farmer/my-issues"
              className="self-start sm:self-auto text-xs font-bold text-violet-700 hover:text-violet-900 bg-white px-3 py-2 rounded-xl border border-violet-100 shadow-xs flex items-center gap-1"
            >
              <span>Past Reports</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ── STEPPER HEADER ── */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-100 mb-6">
          <div className="flex items-center justify-between relative">
            {[
              { stepNum: 1, title: "Animal", hindi: "पशु", icon: "🐄" },
              { stepNum: 2, title: "Symptoms", hindi: "लक्षण", icon: "🩺" },
              { stepNum: 3, title: "Location", hindi: "स्थान", icon: "📍" },
              { stepNum: 4, title: "Review", hindi: "पुष्टि", icon: "✅" },
            ].map((item) => {
              const isPassed = step > item.stepNum;
              const isCurrent = step === item.stepNum;

              return (
                <div key={item.stepNum} className="flex-1 flex flex-col items-center relative z-10">
                  <button
                    type="button"
                    onClick={() => {
                      if (item.stepNum < step) setStep(item.stepNum);
                    }}
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                      isPassed
                        ? "bg-violet-600 text-white shadow-md shadow-violet-200 cursor-pointer"
                        : isCurrent
                        ? "bg-violet-700 text-white ring-4 ring-violet-100 shadow-md shadow-violet-200 scale-105"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {isPassed ? <Check className="w-5 h-5" /> : <span>{item.icon}</span>}
                  </button>

                  <div className="text-center mt-2">
                    <p
                      className={`text-xs font-bold leading-tight ${
                        isCurrent ? "text-violet-700" : isPassed ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      {item.title}
                    </p>
                    <p className="text-[10px] text-gray-400 hidden sm:block">{item.hindi}</p>
                  </div>
                </div>
              );
            })}

            {/* Stepper Progress Line */}
            <div className="absolute top-5 left-8 right-8 h-1 bg-gray-100 -z-0">
              <div
                className="h-full bg-violet-600 transition-all duration-300"
                style={{
                  width: `${((step - 1) / 3) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* ── STEP 1: SELECT ANIMAL ── */}
        {step === 1 && (
          <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-gray-100 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-violet-600">
                  Step 1 of 4
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">
                  Which animal is affected? (प्रभावित पशु चुनें)
                </h2>
              </div>
              <Link
                href="/farmer/animals/register"
                className="inline-flex items-center gap-1 text-xs font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg border border-violet-100 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ New Animal</span>
              </Link>
            </div>

            {/* Quick Voice Assistant Callout */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
                  <Mic className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-emerald-950 flex items-center gap-1.5">
                    <span>बोलकर 10 सेकंड में पूरा फॉर्म भरें</span>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-200/70 text-emerald-800 px-2 py-0.5 rounded-full">
                      Voice AI
                    </span>
                  </h3>
                  <p className="text-xs text-emerald-700 font-medium mt-0.5">
                    हिंदी, मराठी किंवा English मध्ये सांगा — AI पशु, लक्षणे आणि ठिकाण स्वतः भरेल.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsVoiceModalOpen(true);
                  setVoiceTranscript("");
                  setVoiceExtractedData(null);
                  setVoiceError(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shrink-0 transition active:scale-95 shadow-md shadow-emerald-600/20 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>आवाजाने भरा (Fill with Voice)</span>
              </button>
            </div>

            {animals.length === 0 ? (
              <div className="p-8 bg-violet-50/50 border border-dashed border-violet-200 rounded-2xl text-center">
                <span className="text-4xl">🐮</span>
                <h3 className="font-bold text-gray-900 mt-2">No Animals Registered</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  To report symptoms quickly, first register your livestock. It takes less than 30 seconds!
                </p>
                <Link
                  href="/farmer/animals/register"
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-xs font-bold rounded-xl shadow-md shadow-violet-200 hover:bg-violet-700 transition"
                >
                  <Plus className="w-4 h-4" /> Register Animal Now
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {animals.map((animal) => {
                  const isSelected = form.animalId === animal.id;
                  return (
                    <div
                      key={animal.id}
                      onClick={() => selectAnimal(animal)}
                      className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected
                          ? "border-violet-600 bg-violet-50/40 shadow-sm"
                          : "border-gray-200 hover:border-violet-200 bg-white hover:bg-gray-50/50"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                          isSelected ? "bg-violet-100" : "bg-gray-100"
                        }`}
                      >
                        {getSpeciesEmoji(animal.species)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-extrabold text-sm text-gray-900 truncate">
                            {animal.species}
                          </h4>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs shrink-0">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-500 mt-0.5">
                          {animal.breed ? `Breed: ${animal.breed}` : "Indigenous Breed"}
                        </p>

                        <div className="flex items-center gap-2 mt-2 text-[11px] text-gray-500">
                          <span className="flex items-center gap-0.5 text-gray-700 font-semibold">
                            <MapPin className="w-3 h-3 text-violet-500" />
                            {animal.village}
                          </span>
                          {animal.gender && <span>• {animal.gender}</span>}
                          {animal.age && <span>• {animal.age} yrs</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: SYMPTOMS & ANIMAL-SPECIFIC OUTBREAK PRESETS ── */}
        {step === 2 && (
          <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-gray-100 space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-violet-600">
                  Step 2 of 4
                </span>
                {selectedAnimalData && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-50 border border-violet-200 text-violet-800 text-xs font-extrabold rounded-full">
                    <span>{getSpeciesEmoji(selectedAnimalData.species)}</span>
                    <span>Selected: {selectedAnimalData.species}</span>
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 mt-1">
                What clinical signs do you observe? (लक्षण चुनें)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                The quick presets below are filtered specifically for your selected{" "}
                <strong className="text-gray-800">{selectedAnimalData?.species || "animal"}</strong>.
              </p>
            </div>

            {/* ── ANIMAL-SPECIFIC OUTBREAK PRESETS ── */}
            <div className="bg-gradient-to-br from-violet-50/60 via-purple-50/40 to-indigo-50/60 p-4 rounded-2xl border border-violet-100 shadow-xs">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getSpeciesEmoji(selectedAnimalData?.species)}</span>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-gray-900 flex items-center gap-1.5">
                      <span>Quick Presets for Endemic Outbreaks</span>
                      <span className="text-violet-600 text-[11px] font-bold">
                        ({selectedAnimalData?.species || "Livestock"} विशेष)
                      </span>
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Clicking an outbreak auto-selects its characteristic clinical signs.
                    </p>
                  </div>
                </div>

                {form.symptoms.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, symptoms: [] }))}
                    className="text-[11px] font-bold text-gray-500 hover:text-red-600 transition px-2 py-1 rounded-md hover:bg-red-50 shrink-0"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Grid of Animal-Specific Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
                {animalSpecificPresets.map((preset) => {
                  const isFullyActive = preset.symptoms.every((s) => form.symptoms.includes(s));
                  const partialCount = preset.symptoms.filter((s) => form.symptoms.includes(s)).length;

                  return (
                    <div
                      key={preset.code}
                      onClick={() => applyPresetCluster(preset.symptoms)}
                      className={`p-3 rounded-xl border-2 text-left cursor-pointer transition-all select-none ${
                        isFullyActive
                          ? "border-violet-600 bg-white shadow-sm ring-2 ring-violet-200"
                          : "border-violet-100 hover:border-violet-300 bg-white/90 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <div>
                          <span className="text-xs font-black text-gray-900 block leading-tight">
                            {preset.name}
                          </span>
                          <span className="text-[10px] font-semibold text-violet-700">
                            {preset.hindi}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                            isFullyActive
                              ? "bg-violet-600 text-white"
                              : partialCount > 0
                              ? "bg-amber-100 text-amber-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {isFullyActive
                            ? "Active"
                            : partialCount > 0
                            ? `${partialCount}/${preset.symptoms.length} Selected`
                            : "Preset"}
                        </span>
                      </div>

                      <p className="text-[10px] text-gray-500 leading-snug line-clamp-1 mb-2">
                        {preset.description}
                      </p>

                      {/* Symptoms included */}
                      <div className="flex flex-wrap gap-1">
                        {preset.symptoms.map((symId) => {
                          const isSymActive = form.symptoms.includes(symId);
                          return (
                            <span
                              key={symId}
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                                isSymActive
                                  ? "bg-violet-100 text-violet-800 font-extrabold"
                                  : "bg-gray-50 text-gray-500"
                              }`}
                            >
                              {symId}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Voice Symptom Matcher */}
            <div className="flex items-center gap-2 bg-violet-50/60 p-2.5 rounded-2xl border border-violet-100">
              <button
                type="button"
                onClick={startListeningSymptoms}
                className={`p-2.5 rounded-xl shrink-0 transition-all ${
                  isListeningSymptoms
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-violet-600 text-white hover:bg-violet-700"
                }`}
                title="Speak Symptoms"
              >
                {isListeningSymptoms ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={aiSymptomText}
                onChange={(e) => setAiSymptomText(e.target.value)}
                placeholder="बोलें या लिखें (e.g. मुंह से लार, छाले, लंगड़ाना)..."
                className="flex-1 bg-white px-3 py-2 rounded-xl text-xs sm:text-sm border border-violet-200 outline-none focus:border-violet-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    triggerSymptomMatch(aiSymptomText);
                  }
                }}
              />

              <button
                type="button"
                onClick={() => triggerSymptomMatch(aiSymptomText)}
                disabled={analyzingSymptoms || !aiSymptomText.trim()}
                className="px-3 py-2 bg-violet-700 text-white rounded-xl text-xs font-bold hover:bg-violet-800 disabled:opacity-50 transition"
              >
                {analyzingSymptoms ? "Matching..." : "Match"}
              </button>
            </div>

            {/* Visual Symptoms Grid */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                All Recognizable Symptoms (सभी लक्षण चुनें) *
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SYMPTOM_DEFINITIONS.map((symptom) => {
                  const isChecked = form.symptoms.includes(symptom.id);
                  return (
                    <div
                      key={symptom.id}
                      onClick={() => toggleSymptom(symptom.id)}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 select-none ${
                        isChecked
                          ? "border-violet-600 bg-violet-50/40 shadow-xs scale-101"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="text-2xl pt-0.5">{symptom.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm text-gray-900">
                            {symptom.name}
                          </span>
                          <span
                            className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors ${
                              isChecked
                                ? "bg-violet-600 text-white"
                                : "border border-gray-300 bg-gray-50"
                            }`}
                          >
                            {isChecked && <Check className="w-3.5 h-3.5" />}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-violet-700 mt-0.5">{symptom.hindi}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{symptom.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Severity Cards */}
            <div className="pt-4 border-t border-gray-100">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Symptom Severity (गंभीरता का स्तर) *
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    level: "MILD",
                    title: "Mild (हल्का)",
                    desc: "Walking, eating partially, slight fever",
                    color: "border-emerald-500 bg-emerald-50/40 text-emerald-800",
                    badge: "bg-emerald-100 text-emerald-800",
                    icon: "🟢",
                  },
                  {
                    level: "MODERATE",
                    title: "Moderate (मध्यम)",
                    desc: "Blisters, drooling, isolated from herd",
                    color: "border-amber-500 bg-amber-50/40 text-amber-800",
                    badge: "bg-amber-100 text-amber-800",
                    icon: "🟡",
                  },
                  {
                    level: "SEVERE",
                    title: "Severe (गंभीर)",
                    desc: "Unable to stand, high fever, acute distress",
                    color: "border-red-500 bg-red-50/40 text-red-800",
                    badge: "bg-red-100 text-red-800",
                    icon: "🔴",
                  },
                ].map((item) => {
                  const isSelected = form.severity === item.level;
                  return (
                    <button
                      key={item.level}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, severity: item.level as any }))}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                        isSelected
                          ? `${item.color} shadow-sm`
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                          <span>{item.icon}</span>
                          <span>{item.title}</span>
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-violet-600" />}
                      </div>
                      <p className="text-[11px] text-gray-500 leading-tight">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: IMPACT & LOCATION ── */}
        {step === 3 && (
          <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-gray-100 space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-600">
                Step 3 of 4
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">
                Herd Impact & Geographic Location (संख्या व स्थान)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Helps calculate localized transmission risk across the village cluster.
              </p>
            </div>

            {/* Stepper Counters for Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Animals Affected */}
              <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-200">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Animals Affected (बीमार)
                </label>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, animalsAffected: Math.max(1, f.animalsAffected - 1) }))
                    }
                    className="w-10 h-10 rounded-xl bg-white border border-gray-300 flex items-center justify-center font-bold text-gray-700 hover:bg-violet-50 hover:border-violet-300 active:scale-95 transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <span className="text-2xl font-black text-violet-700 font-mono">
                    {form.animalsAffected}
                  </span>

                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, animalsAffected: f.animalsAffected + 1 }))}
                    className="w-10 h-10 rounded-xl bg-white border border-gray-300 flex items-center justify-center font-bold text-gray-700 hover:bg-violet-50 hover:border-violet-300 active:scale-95 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mortality / Deaths */}
              <div className="bg-red-50/50 p-4 rounded-2xl border border-red-200">
                <label className="block text-xs font-bold text-red-800 uppercase tracking-wider mb-2">
                  Deaths (मृत्यु संख्या)
                </label>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, deaths: Math.max(0, f.deaths - 1) }))}
                    className="w-10 h-10 rounded-xl bg-white border border-red-300 flex items-center justify-center font-bold text-red-700 hover:bg-red-100 active:scale-95 transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <span className="text-2xl font-black text-red-600 font-mono">{form.deaths}</span>

                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, deaths: f.deaths + 1 }))}
                    className="w-10 h-10 rounded-xl bg-white border border-red-300 flex items-center justify-center font-bold text-red-700 hover:bg-red-100 active:scale-95 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Vaccinated Count */}
              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200">
                <label className="block text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                  Vaccinated Animals (टीकाकृत)
                </label>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, vaccinatedCount: Math.max(0, f.vaccinatedCount - 1) }))
                    }
                    className="w-10 h-10 rounded-xl bg-white border border-emerald-300 flex items-center justify-center font-bold text-emerald-700 hover:bg-emerald-100 active:scale-95 transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <span className="text-2xl font-black text-emerald-700 font-mono">
                    {form.vaccinatedCount}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, vaccinatedCount: f.vaccinatedCount + 1 }))
                    }
                    className="w-10 h-10 rounded-xl bg-white border border-emerald-300 flex items-center justify-center font-bold text-emerald-700 hover:bg-emerald-100 active:scale-95 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Temperature & Days */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Body Temperature (°F)
                </label>
                <div className="flex gap-2">
                  {["101.5 (Normal)", "103.0 (Mild)", "105.0+ (High)"].map((preset) => {
                    const tempVal = preset.split(" ")[0];
                    const isSelected = form.temperature === tempVal;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, temperature: tempVal }))}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                          isSelected
                            ? "bg-violet-600 text-white border-violet-600"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {tempVal}°F
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Duration of Symptoms (दिन)
                </label>
                <div className="flex gap-2">
                  {["1 Day (Today)", "2-3 Days", "5+ Days"].map((dur) => {
                    const durVal = dur.startsWith("1") ? "1" : dur.startsWith("2") ? "3" : "5";
                    const isSelected = form.duration === durVal;
                    return (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, duration: durVal }))}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                          isSelected
                            ? "bg-violet-600 text-white border-violet-600"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {dur}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Location Map Picker */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-gray-900">
                  Pinpoint Location on Map (मानचित्र पर स्थान चिन्हित करें) *
                </label>
                {form.latitude && form.longitude && (
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    GPS: {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}
                  </span>
                )}
              </div>

              <div className="rounded-2xl overflow-hidden border border-gray-200">
                <LocationPickerMap
                  onLocationSelect={(lat, lng) =>
                    setForm((f) => ({ ...f, latitude: lat, longitude: lng }))
                  }
                />
              </div>
            </div>

            {/* Village / Block / District Inputs */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Village / Block / District Details *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Village / ग्राम *"
                  value={form.locationVillage}
                  onChange={(e) => setForm((f) => ({ ...f, locationVillage: e.target.value }))}
                  className="w-full px-3.5 py-3 border border-gray-300 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Block / ब्लॉक"
                  value={form.locationBlock}
                  onChange={(e) => setForm((f) => ({ ...f, locationBlock: e.target.value }))}
                  className="w-full px-3.5 py-3 border border-gray-300 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-violet-500"
                />
                <input
                  type="text"
                  placeholder="District / जिला"
                  value={form.locationDistrict}
                  onChange={(e) => setForm((f) => ({ ...f, locationDistrict: e.target.value }))}
                  className="w-full px-3.5 py-3 border border-gray-300 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            {/* Voice Audio Notes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Additional Field Observations (अतिरिक्त विवरण)
                </label>
                <button
                  type="button"
                  onClick={startListeningNotes}
                  className={`text-xs font-bold flex items-center gap-1 px-3 py-1 rounded-lg transition ${
                    isListeningNotes
                      ? "bg-red-100 text-red-600 animate-pulse"
                      : "bg-violet-100 text-violet-700 hover:bg-violet-200"
                  }`}
                >
                  {isListeningNotes ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{isListeningNotes ? "Listening..." : "Speak Notes (बोलें)"}</span>
                </button>
              </div>

              <textarea
                rows={2}
                value={form.additionalNotes}
                onChange={(e) => setForm((f) => ({ ...f, additionalNotes: e.target.value }))}
                placeholder="Mention any medications tried, behavioral changes, or neighbors with sick animals..."
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              />
            </div>
          </div>
        )}

        {/* ── STEP 4: REVIEW & LIVE RISK ESTIMATION ── */}
        {step === 4 && (
          <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-gray-100 space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-600">
                Step 4 of 4
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">
                Review & Confirm Disease Report (समीक्षा एवं पुष्टि)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Check all information before submitting to the surveillance network.
              </p>
            </div>

            {/* Live Triage Risk Indicator Card */}
            <div
              className={`p-4 rounded-2xl border ${
                estimatedRisk.level === "HIGH"
                  ? "bg-red-50/70 border-red-200"
                  : estimatedRisk.level === "MEDIUM"
                  ? "bg-amber-50/70 border-amber-200"
                  : "bg-emerald-50/70 border-emerald-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert
                    className={`w-5 h-5 ${
                      estimatedRisk.level === "HIGH"
                        ? "text-red-600"
                        : estimatedRisk.level === "MEDIUM"
                        ? "text-amber-600"
                        : "text-emerald-600"
                    }`}
                  />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800">
                      Preliminary Risk Triage
                    </h4>
                    <p className="text-sm font-black text-gray-900">
                      Level: {estimatedRisk.level} Risk (~{estimatedRisk.score}/100)
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    estimatedRisk.level === "HIGH"
                      ? "bg-red-100 text-red-800"
                      : estimatedRisk.level === "MEDIUM"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {estimatedRisk.label}
                </span>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Selected Animal Summary */}
              <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Animal Profile
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-violet-700 hover:underline"
                  >
                    Edit
                  </button>
                </div>

                {selectedAnimalData ? (
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getSpeciesEmoji(selectedAnimalData.species)}</span>
                    <div>
                      <p className="font-extrabold text-sm text-gray-900">
                        {selectedAnimalData.species} ({selectedAnimalData.breed || "Indigenous"})
                      </p>
                      <p className="text-xs text-gray-500">
                        Village: {selectedAnimalData.village} • Age: {selectedAnimalData.age || "-"} yrs
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-red-600 font-bold">No animal selected</p>
                )}
              </div>

              {/* Location & Impact */}
              <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Herd Impact & Village
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-xs font-bold text-violet-700 hover:underline"
                  >
                    Edit
                  </button>
                </div>

                <div className="space-y-1 text-xs">
                  <p className="font-bold text-gray-900">
                    📍 {form.locationVillage}, {form.locationBlock || "District"}
                  </p>
                  <p className="text-gray-600">
                    Affected: <strong>{form.animalsAffected}</strong> • Deaths:{" "}
                    <strong className="text-red-600">{form.deaths}</strong> • Vaccinated:{" "}
                    <strong>{form.vaccinatedCount}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Symptoms Tags */}
            <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200/80">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Observed Symptoms ({form.symptoms.length})
                </span>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-bold text-violet-700 hover:underline"
                >
                  Edit
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {form.symptoms.map((s) => {
                  const def = SYMPTOM_DEFINITIONS.find((item) => item.id === s);
                  return (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-100 text-violet-800 text-xs font-bold rounded-xl"
                    >
                      <span>{def?.emoji || "🩺"}</span>
                      <span>{def?.name || s}</span>
                      <span className="text-violet-600 text-[10px]">({def?.hindi})</span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white rounded-2xl font-black text-base sm:text-lg hover:from-violet-700 hover:to-purple-700 shadow-xl shadow-violet-200 hover:shadow-2xl hover:scale-[1.005] active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Submitting to Network...</span>
                ) : (
                  <>
                    <span>Submit Disease Report (रिपोर्ट जमा करें)</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── STICKY BOTTOM WIZARD CONTROLS ── */}
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 p-3 sm:p-4 shadow-lg md:relative md:bg-transparent md:border-none md:p-0 md:mt-6 md:shadow-none">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-5 py-3 rounded-xl border border-gray-300 bg-white font-bold text-xs sm:text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition active:scale-95 shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            <div className="text-xs font-bold text-gray-400">
              Step {step} of 4
            </div>

            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!canAdvance()}
                className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 font-bold text-xs sm:text-sm text-white flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-violet-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        </div>
      </main>

      {/* ── VOICE ASSISTANT MODAL ── */}
      {isVoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative overflow-hidden space-y-5">
            {/* Top Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <Mic className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <h3 className="font-black text-base text-gray-900 leading-tight">
                    Voice Form Assistant (बोलकर फॉर्म भरें)
                  </h3>
                  <p className="text-[11px] text-gray-500 font-semibold">
                    Hands-free multilingual intake • हिन्दी • मराठी • English
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsVoiceModalOpen(false);
                  setIsListeningVoice(false);
                }}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Language Selector */}
            <div className="flex items-center justify-between gap-2 p-1.5 bg-gray-100/80 rounded-2xl">
              {[
                { code: "hi", label: "हिन्दी (Hindi)", flag: "🇮🇳" },
                { code: "mr", label: "मराठी (Marathi)", flag: "🚩" },
                { code: "en", label: "English", flag: "🌐" },
              ].map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setVoiceLang(lang.code as any)}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    voiceLang === lang.code
                      ? "bg-white text-emerald-800 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <span className="mr-1">{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>

            {/* Pulsing Mic Circle */}
            <div className="py-4 text-center space-y-3">
              <div className="relative inline-flex items-center justify-center">
                {isListeningVoice && (
                  <span className="absolute w-28 h-28 rounded-full bg-red-500/20 animate-ping pointer-events-none" />
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (isListeningVoice) {
                      setIsListeningVoice(false);
                    } else {
                      startVoiceInput();
                    }
                  }}
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all active:scale-90 cursor-pointer ${
                    isListeningVoice
                      ? "bg-gradient-to-tr from-red-600 to-rose-500 shadow-red-500/40 ring-4 ring-red-200 animate-pulse"
                      : "bg-gradient-to-tr from-emerald-600 via-teal-600 to-green-600 shadow-emerald-600/30 hover:scale-105"
                  }`}
                >
                  {isListeningVoice ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8 text-amber-200" />}
                </button>
              </div>

              <div>
                <p className="text-sm font-extrabold text-gray-900">
                  {isListeningVoice
                    ? "🔴 सुन रहे हैं... अभी बोलिए (Listening...)"
                    : isProcessingVoice
                    ? "⏳ AI विवरण निकाल रहा है... (Extracting...)"
                    : "माइक बटन दबाएं और पशु की बीमारी बताएं"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  जैसे: "मेरी 2 गायों को 3 दिन से तेज बुखार है, मुंह से लार गिर रही है, गांव वाघोली"
                </p>
              </div>
            </div>

            {/* Error Message if any */}
            {voiceError && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-semibold flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{voiceError}</span>
              </div>
            )}

            {/* Live Transcript / Input Area */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
                <span>बोले गए शब्द (Transcript):</span>
                {voiceTranscript && (
                  <button
                    type="button"
                    onClick={() => {
                      setVoiceTranscript("");
                      setVoiceExtractedData(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 text-[10px] font-bold cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </label>
              <textarea
                rows={3}
                value={voiceTranscript}
                onChange={(e) => setVoiceTranscript(e.target.value)}
                placeholder="यहाँ आपकी आवाज़ के शब्द दिखाई देंगे, या आप सीधे टाइप भी कर सकते हैं..."
                className="w-full p-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs sm:text-sm text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500 font-medium transition resize-none"
              />
            </div>

            {/* Quick 1-Tap Demo Voice Simulation Buttons */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                या तुरंत डेमो परीक्षण के लिए चुनें (Quick Demo Simulation):
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const sample = "मेरी 2 गायों को 3 दिन से तेज बुखार है और मुंह से लार गिर रही है, गांव वाघोली";
                    setVoiceTranscript(sample);
                    processVoiceText(sample);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold transition border border-emerald-200/60 cursor-pointer"
                >
                  🐮 हिन्दी: 2 गाय, तेज बुखार, लार, वाघोली
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const sample = "1 म्हैस आजारी आहे, पायाला जखम आणि चालता येत नाही, गाव उरुळी कांचन";
                    setVoiceTranscript(sample);
                    processVoiceText(sample);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-semibold transition border border-teal-200/60 cursor-pointer"
                >
                  🐃 मराठी: 1 म्हैस, जखम, लंगडत, उरुळी कांचन
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const sample = "Three cows have severe fever and blisters for 2 days in Shirwal";
                    setVoiceTranscript(sample);
                    processVoiceText(sample);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 text-[11px] font-semibold transition border border-purple-200/60 cursor-pointer"
                >
                  🌐 English: 3 cows, fever & blisters, Shirwal
                </button>
              </div>
            </div>

            {/* Extracted Details Preview Card */}
            {voiceExtractedData && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs font-black text-emerald-900">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>AI द्वारा निकाले गए विवरण (Extracted Fields):</span>
                  </span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    Ready to Apply
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-white border border-emerald-100">
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">पशु (Species)</span>
                    <span className="font-extrabold text-gray-800">{voiceExtractedData.species || "Cow"}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-emerald-100">
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">गंभीरता (Severity)</span>
                    <span className={`font-black ${
                      voiceExtractedData.severity === "SEVERE" ? "text-red-600" : "text-amber-600"
                    }`}>
                      {voiceExtractedData.severity}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-emerald-100">
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">संख्या (Affected)</span>
                    <span className="font-extrabold text-gray-800">{voiceExtractedData.animalsAffected || 1} पशु ({voiceExtractedData.duration || 2} दिन)</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-emerald-100">
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">गांव (Village)</span>
                    <span className="font-extrabold text-gray-800">{voiceExtractedData.locationVillage || "Auto Selected"}</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-white border border-emerald-100">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase mb-1">पहचाने गए लक्षण (Symptoms)</span>
                  <div className="flex flex-wrap gap-1">
                    {(voiceExtractedData.symptoms || []).map((s: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-[11px]">
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center gap-2 pt-1">
              {!voiceExtractedData ? (
                <button
                  type="button"
                  onClick={() => processVoiceText(voiceTranscript)}
                  disabled={!voiceTranscript.trim() || isProcessingVoice}
                  className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>{isProcessingVoice ? "AI निकाल रहा है..." : "विवरण निकालें (Extract Details)"}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={applyVoiceDataToForm}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5 text-amber-300" />
                  <span>पूरा फॉर्म भरें और पुष्टि करें (Fill Form & Review) →</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
