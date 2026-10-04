"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Phone,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  PhoneCall,
  Volume2,
  Mic,
  MicOff,
  Upload,
  FileText,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  Plus,
  Minus,
  Sparkles,
  MapPin,
  Stethoscope,
  Building2,
  User as UserIcon,
  RefreshCw,
  Camera,
  X,
  Award
} from "lucide-react";

// Maharashtra districts & talukas lookup
const MAHA_DISTRICTS: Record<string, string[]> = {
  Pune: ["Haveli", "Baramati", "Khed", "Shirur", "Ambegaon", "Junnar", "Maval", "Mulshi", "Daund", "Indapur", "Bhor", "Velhe", "Purandar"],
  Ahmednagar: ["Nagar", "Rahuri", "Sangamner", "Kopargaon", "Shrirampur", "Newasa", "Shevgaon", "Parner", "Akole", "Karjat", "Jamkhed"],
  Satara: ["Satara", "Karad", "Wai", "Phaltan", "Koregaon", "Patan", "Mahabaleshwar", "Khandala", "Jaoli", "Khatav", "Man"],
  Solapur: ["Solapur North", "Solapur South", "Barshi", "Pandharpur", "Madha", "Karmala", "Mohol", "Malshiras", "Sangola", "Mangalvedha", "Akkalkot"],
  Nashik: ["Nashik", "Sinnar", "Dindori", "Igatpuri", "Niphad", "Yeola", "Malegaon", "Satana", "Kalwan", "Deola", "Trimbakeshwar"],
  Kolhapur: ["Karvir", "Hatkanangle", "Shirol", "Kagal", "Radhanagari", "Panhala", "Bhudargad", "Ajara", "Gadhinglaj", "Chandgad", "Shahuwadi"],
  Aurangabad: ["Aurangabad", "Paithan", "Vaijapur", "Gangapur", "Kannad", "Khuldabad", "Sillod", "Phulambri", "Soygaon"],
  Nagpur: ["Nagpur Urban", "Nagpur Rural", "Kamptee", "Hingna", "Katol", "Narkhed", "Savner", "Kalmeshwar", "Ramtek", "Parseoni", "Mouda", "Umred", "Bhiwapur", "Kuhi"]
};

// UI Translations Dictionary
const TRANSLATIONS = {
  mr: {
    helpline: "मदत हवी आहे? टोल-फ्री कॉल करा",
    languageSelect: "आपली भाषा निवडा",
    languageSub: "सर्व माहिती आपल्या पसंतीच्या भाषेत दिसेल",
    roleSelect: "आपले खाते प्रकार निवडा",
    roleSub: "आपल्या भूमिकेनुसार योग्य पर्याय निवडा",
    roles: {
      farmer: { title: "पशुपालक / शेतकरी", desc: "पशु आजारी असल्यास रिपोर्ट करा, पशुवैद्यकीय सल्ला व सरकारी योजना मिळवा.", badge: "टाइपिंगची गरज नाही" },
      vet: { title: "पशुवैद्यकीय अधिकारी / डॉक्टर", desc: "रुग्ण केस व्यवस्थापन, आपत्कालीन भेटी व डिजिटल उपचार पर्चा.", badge: "MSVC नोंदणी आवश्यक" },
      officer: { title: "शासकीय अधिकारी (प्रशासन)", desc: "तालुका, जिल्हा व राज्य रोग नियंत्रण कक्ष आणि सर्वेक्षण.", badge: "आमंत्रण कोड आवश्यक" },
    },
    officerInviteTitle: "शासकीय आमंत्रण कोड टाका",
    officerInviteSub: "अधिकारी खाती केवळ राज्य प्रशासनाच्या अधिकृत आमंत्रणाने तयार केली जातात.",
    inviteCodePlaceholder: "उदा. MAHA-GOV-2026",
    validateCode: "कोड तपासा",
    phoneTitle: "आपला मोबाईल नंबर टाका",
    phoneSub: "आपल्या मोबाईलवर 6-अंकी OTP पाठवला जाईल",
    phonePlaceholder: "10-अंकी मोबाईल नंबर",
    sendOtp: "OTP पाठवा",
    sendingOtp: "OTP पाठवत आहे...",
    otpTitle: "मोबाईलवर आलेला OTP टाका",
    otpSub: "वर 6-अंकी कोड पाठवला आहे",
    verifyOtp: "सत्यापित करा आणि पुढे जा",
    verifying: "तपासत आहे...",
    resendOtp: "पुन्हा OTP पाठवा",
    cooldownWait: "सेकंद थांबा",
    voiceCallOtp: "फोन कॉलद्वारे OTP मिळवा",
    callingVoice: "कॉल सुरू करत आहे...",
    farmerNameTitle: "आपले पूर्ण नाव काय आहे?",
    farmerNameSub: "पशुवैद्यकीय अधिकारी व अहवालासाठी आपले नाव आवश्यक आहे",
    farmerNamePlaceholder: "उदा. रमेश तुकाराम पाटील",
    locationTitle: "आपले गाव आणि तालुका कुठे आहे?",
    locationSub: "जवळच्या पशुवैद्यकीय अधिकाऱ्यांशी जोडण्यासाठी अचूक ठिकाण निवडा",
    useGps: "माझे सध्याचे ठिकाण वापरा (GPS)",
    district: "जिल्हा निवडा",
    taluka: "तालुका निवडा (आवश्यक)",
    village: "गाव / वस्तीचे नाव (पर्यायी)",
    animalsTitle: "आपल्याकडे कोणती जनावरे आहेत?",
    animalsSub: "जनावरांच्या प्रकारावर टच करून संख्या (+ / -) नोंदवा",
    species: {
      cow: "गाय",
      buffalo: "म्हैस",
      goat: "शेळी",
      sheep: "मेंढी",
      poultry: "कोंबडी",
    },
    consentTitle: "डेटा गोपनीयता व संमती",
    consentSub: "आपल्या जनावरांच्या सुरक्षिततेसाठी कृपया संमती द्या",
    consent1: "माझ्या जनावरांच्या आजाराचे निदान, उपचार आणि पशुवैद्यकीय साहाय्यासाठी हा डेटा वापरण्यास माझी संमती आहे. (आवश्यक)",
    consent2: "तातडीच्या उपचारासाठी जनावरांचे फोटो आणि ठिकाण पशुवैद्यकीय डॉक्टरांसोबत शेअर करण्यास माझी संमती आहे. (पर्यायी)",
    submitCreate: "खाते तयार करा",
    submitting: "खाते तयार होत आहे...",
    vetFormTitle: "पशुवैद्यकीय अधिकारी नोंदणी",
    vetFormSub: "महाराष्ट्र पशुवैद्यकीय परिषद (MSVC) प्रमाणन तपशील प्रविष्ट करा",
    vetName: "डॉक्टरांचे पूर्ण नाव",
    vetTypeLabel: "पदनाम / प्रकार",
    vetTypes: { vet: "पशुवैद्यकीय अधिकारी (B.V.Sc & A.H.)", para: "पशुधन पर्यवेक्षक (Para-Vet)" },
    regNo: "परिषद नोंदणी क्रमांक (MSVC Reg. No.)",
    council: "नोंदणी परिषद",
    uploadCert: "नोंदणी प्रमाणपत्र अपलोड करा (PDF / JPG)",
    uploadSuccess: "प्रमाणपत्र यशस्वीरित्या अपलोड झाले!",
    serviceDist: "कार्यक्षेत्र जिल्हा",
    serviceTal: "कार्यक्षेत्र तालुका",
    languagesSpoken: "बोलल्या जाणाऱ्या भाषा",
    vetUnderReviewTitle: "नोंदणी तपासणी सुरू आहे (Under Review)",
    vetUnderReviewSub: "आपला अर्ज प्रशासनाकडे पडताळणीसाठी सादर केला गेला आहे.",
    vetUnderReviewTime: "आपल्या नोंदणी प्रमाणपत्राची 24 ते 48 तासांत तपासणी केली जाईल. मंजुरी मिळाल्यावर आपल्याला SMS पाठवला जाईल.",
    farmerDoneTitle: "जीव रक्षक मध्ये आपले स्वागत आहे!",
    farmerDoneSub: "आपले शेतकरी खाते यशस्वीरित्या तयार झाले आहे.",
    goToPortal: "शेतकरी पोर्टल उघडा",
    addFirstAnimal: "पहिले जनावर नोंदवा",
    doLater: "हे नंतर करा",
    step: "पाऊल",
    of: "/",
    back: "मागे",
    next: "पुढे जा"
  },
  hi: {
    helpline: "सहायता चाहिए? टोल-फ्री कॉल करें",
    languageSelect: "अपनी भाषा चुनें",
    languageSub: "सभी जानकारी आपकी पसंदीदा भाषा में दिखाई देगी",
    roleSelect: "अपना खाता प्रकार चुनें",
    roleSub: "अपनी भूमिका के अनुसार उपयुक्त विकल्प चुनें",
    roles: {
      farmer: { title: "पशुपालक / किसान", desc: "पशु बीमार होने पर रिपोर्ट करें, पशु चिकित्सा सलाह और सरकारी योजनाएं पाएं।", badge: "टाइपिंग की जरूरत नहीं" },
      vet: { title: "पशु चिकित्सक / डॉक्टर", desc: "मरीज केस प्रबंधन, आपातकालीन फील्ड विजिट और डिजिटल नुस्खा पर्चा।", badge: "MSVC पंजीकरण जरूरी" },
      officer: { title: "शासकीय अधिकारी (प्रशासन)", desc: "तालुका, जिला व राज्य रोग नियंत्रण कक्ष और निगरानी ग्रिड।", badge: "आमंत्रण कोड आवश्यक" },
    },
    officerInviteTitle: "शासकीय आमंत्रण कोड दर्ज करें",
    officerInviteSub: "अधिकारी खाते केवल राज्य प्रशासन के अधिकृत आमंत्रण से बनाए जाते हैं।",
    inviteCodePlaceholder: "उदा. MAHA-GOV-2026",
    validateCode: "कोड सत्यापित करें",
    phoneTitle: "अपना मोबाइल नंबर दर्ज करें",
    phoneSub: "आपके मोबाइल पर 6-अंकीय OTP भेजा जाएगा",
    phonePlaceholder: "10-अंकीय मोबाइल नंबर",
    sendOtp: "OTP भेजें",
    sendingOtp: "OTP भेजा जा रहा है...",
    otpTitle: "मोबाइल पर आया OTP दर्ज करें",
    otpSub: "पर 6-अंकीय कोड भेजा गया है",
    verifyOtp: "सत्यापित करें और आगे बढ़ें",
    verifying: "जांच जारी है...",
    resendOtp: "पुनः OTP भेजें",
    cooldownWait: "सेकंड प्रतीक्षा करें",
    voiceCallOtp: "फोन कॉल द्वारा OTP प्राप्त करें",
    callingVoice: "कॉल शुरू हो रही है...",
    farmerNameTitle: "आपका पूरा नाम क्या है?",
    farmerNameSub: "पशु चिकित्सक और सहायता रिपोर्ट के लिए आपका नाम आवश्यक है",
    farmerNamePlaceholder: "उदा. रमेश तुकाराम पाटिल",
    locationTitle: "आपका गांव और ब्लॉक कहां स्थित है?",
    locationSub: "निकटतम पशु चिकित्सक से जोड़ने के लिए सही स्थान चुनें",
    useGps: "मेरा वर्तमान स्थान उपयोग करें (GPS)",
    district: "जिला चुनें",
    taluka: "तालुका / ब्लॉक चुनें (आवश्यक)",
    village: "गांव का नाम (वैकल्पिक)",
    animalsTitle: "आपके पास कौन-से पशु हैं?",
    animalsSub: "पशु के प्रकार पर स्पर्श करके संख्या (+ / -) दर्ज करें",
    species: {
      cow: "गाय",
      buffalo: "भैंस",
      goat: "बकरी",
      sheep: "भेड़",
      poultry: "मुर्गी",
    },
    consentTitle: "डेटा गोपनीयता और सहमति",
    consentSub: "आपके पशुओं की सुरक्षा और चिकित्सा के लिए कृपया सहमति दें",
    consent1: "मेरे पशुओं के रोग निदान, उपचार और पशु चिकित्सा सहायता के लिए इस डेटा के उपयोग पर मेरी सहमति है। (अनिवार्य)",
    consent2: "त्वरित आपातकालीन सहायता के लिए पशुओं के फोटो और स्थान पशु चिकित्सकों से साझा करने पर मेरी सहमति है। (वैकल्पिक)",
    submitCreate: "खाता बनाएं",
    submitting: "खाता बनाया जा रहा है...",
    vetFormTitle: "पशु चिकित्सक पंजीकरण",
    vetFormSub: "महाराष्ट्र पशु चिकित्सा परिषद (MSVC) प्रमाणन विवरण दर्ज करें",
    vetName: "डॉक्टर का पूरा नाम",
    vetTypeLabel: "पदनाम / प्रकार",
    vetTypes: { vet: "पशु चिकित्सा अधिकारी (B.V.Sc & A.H.)", para: "पशुधन पर्यवेक्षक (Para-Vet)" },
    regNo: "परिषद पंजीकरण संख्या (MSVC Reg. No.)",
    council: "पंजीकरण परिषद",
    uploadCert: "पंजीकरण प्रमाण पत्र अपलोड करें (PDF / JPG)",
    uploadSuccess: "प्रमाण पत्र सफलतापूर्वक अपलोड हुआ!",
    serviceDist: "सेवा कार्यक्षेत्र जिला",
    serviceTal: "सेवा कार्यक्षेत्र तालुका",
    languagesSpoken: "बोली जाने वाली भाषाएं",
    vetUnderReviewTitle: "पंजीकरण जांच जारी है (Under Review)",
    vetUnderReviewSub: "आपका आवेदन सत्यापन के लिए प्रशासन को प्रेषित किया गया है।",
    vetUnderReviewTime: "आपके प्रमाण पत्र की जांच 24 से 48 घंटे में पूरी होगी। अनुमोदन मिलने पर आपको SMS द्वारा सूचित किया जाएगा।",
    farmerDoneTitle: "जीव रक्षक में आपका स्वागत है!",
    farmerDoneSub: "आपका किसान खाता सफलतापूर्वक तैयार हो गया है।",
    goToPortal: "किसान पोर्टल खोलें",
    addFirstAnimal: "पहला पशु पंजीकृत करें",
    doLater: "बाद में करें",
    step: "चरण",
    of: "/",
    back: "पीछे",
    next: "आगे बढ़ें"
  },
  en: {
    helpline: "Need Help? Toll-Free Helpline",
    languageSelect: "Choose Your Language",
    languageSub: "All notifications and screens will appear in your preferred language",
    roleSelect: "Select Account Type",
    roleSub: "Choose the role that matches your activity on Pashu Rakshak",
    roles: {
      farmer: { title: "Livestock Farmer / Owner", desc: "Report animal illnesses, request veterinary visits, and access government support.", badge: "No Typing Needed" },
      vet: { title: "Veterinarian / Para-Vet", desc: "Manage clinical case queues, field emergencies, and generate digital Rx prescriptions.", badge: "MSVC Reg. Required" },
      officer: { title: "Government Officer", desc: "District, Taluka and State disease outbreak surveillance and command grid.", badge: "Invite Code Only" },
    },
    officerInviteTitle: "Enter Government Invite Code",
    officerInviteSub: "Officer accounts are created exclusively via Departmental invitation.",
    inviteCodePlaceholder: "e.g. MAHA-GOV-2026",
    validateCode: "Validate Invite",
    phoneTitle: "Enter Your Mobile Number",
    phoneSub: "A 6-digit verification code will be sent to your phone",
    phonePlaceholder: "10-digit mobile number",
    sendOtp: "Send Verification Code",
    sendingOtp: "Sending code...",
    otpTitle: "Enter 6-Digit OTP",
    otpSub: "We sent a 6-digit verification code to",
    verifyOtp: "Verify & Proceed",
    verifying: "Verifying...",
    resendOtp: "Resend Code",
    cooldownWait: "s wait",
    voiceCallOtp: "Get OTP via Voice Call",
    callingVoice: "Initiating voice call...",
    farmerNameTitle: "What is your full name?",
    farmerNameSub: "Your name will appear on official veterinary reports and case tickets",
    farmerNamePlaceholder: "e.g. Ramesh Tukaram Patil",
    locationTitle: "Where is your farm located?",
    locationSub: "Select your jurisdiction to connect with your local government veterinary dispensary",
    useGps: "Use My Current GPS Location",
    district: "Select District",
    taluka: "Select Taluka / Block (Required)",
    village: "Village / Wadi Name (Optional)",
    animalsTitle: "How many animals do you keep?",
    animalsSub: "Tap an animal card to add counts (+ / -)",
    species: {
      cow: "Cow",
      buffalo: "Buffalo",
      goat: "Goat",
      sheep: "Sheep",
      poultry: "Poultry",
    },
    consentTitle: "Data Privacy & Consent",
    consentSub: "Please review and accept terms to complete your account setup",
    consent1: "I consent to the processing of my livestock and location data for disease early warning, diagnosis, and veterinary treatment. (Required)",
    consent2: "I consent to share injury photos and farm GPS coordinates with dispatching veterinary surgeons during emergencies. (Optional)",
    submitCreate: "Complete Registration",
    submitting: "Creating account...",
    vetFormTitle: "Veterinarian Registration",
    vetFormSub: "Provide MSVC / VCI council verification credentials",
    vetName: "Doctor's Full Name",
    vetTypeLabel: "Designation / Role",
    vetTypes: { vet: "Veterinary Officer (B.V.Sc & A.H.)", para: "Livestock Supervisor (Para-Vet)" },
    regNo: "Veterinary Council Reg. Number",
    council: "Issuing Veterinary Council",
    uploadCert: "Upload Registration Certificate (PDF or JPG)",
    uploadSuccess: "Certificate uploaded successfully!",
    serviceDist: "Jurisdiction District",
    serviceTal: "Jurisdiction Taluka",
    languagesSpoken: "Languages Spoken",
    vetUnderReviewTitle: "Registration Under Verification",
    vetUnderReviewSub: "Your application has been submitted to state administration for credential verification.",
    vetUnderReviewTime: "Your registration documents will be verified within 24 to 48 hours. You will receive an SMS notification once approved.",
    farmerDoneTitle: "Welcome to Pashu Rakshak!",
    farmerDoneSub: "Your farmer profile is active. You can now report illnesses and book veterinary appointments.",
    goToPortal: "Open Farmer Portal",
    addFirstAnimal: "Register First Animal",
    doLater: "Do This Later",
    step: "Step",
    of: "of",
    back: "Back",
    next: "Next"
  }
};

type Language = "mr" | "hi" | "en";
type Role = "FARMER" | "VET" | "OFFICER";

export default function RegisterPage() {
  const router = useRouter();

  // Core wizard state
  const [lang, setLang] = useState<Language>("mr");
  const [step, setStep] = useState<
    | "language"
    | "role"
    | "officer_invite"
    | "phone"
    | "otp"
    | "farmer_name"
    | "farmer_location"
    | "farmer_animals"
    | "vet_form"
    | "consent"
    | "done"
  >("language");

  const [role, setRole] = useState<Role>("FARMER");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [otpChallengeToken, setOtpChallengeToken] = useState<string | null>(null);

  // Timers and loading states
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Officer invite state
  const [inviteCode, setInviteCode] = useState("");
  const [officerDesignation, setOfficerDesignation] = useState("");
  const [inviteValidated, setInviteValidated] = useState(false);

  // Farmer form state
  const [farmerName, setFarmerName] = useState("");
  const [isListeningName, setIsListeningName] = useState(false);
  const [district, setDistrict] = useState("Pune");
  const [taluka, setTaluka] = useState("Haveli");
  const [village, setVillage] = useState("");
  const [animals, setAnimals] = useState<Record<string, number>>({
    cow: 2,
    buffalo: 0,
    goat: 0,
    sheep: 0,
    poultry: 0,
  });

  // Vet form state
  const [vetName, setVetName] = useState("");
  const [vetRole, setVetRole] = useState<"VET" | "PARA_VET">("VET");
  const [regNo, setRegNo] = useState("");
  const [council, setCouncil] = useState("Maharashtra State Veterinary Council (MSVC)");
  const [certificateUrl, setCertificateUrl] = useState("");
  const [certificateFilename, setCertificateFilename] = useState("");
  const [uploadingCert, setUploadingCert] = useState(false);
  const [serviceDistrict, setServiceDistrict] = useState("Pune");
  const [serviceTaluka, setServiceTaluka] = useState("Haveli");
  const [vetLanguages, setVetLanguages] = useState<string[]>(["mr", "hi"]);

  // Consent checkboxes (neither pre-ticked!)
  const [consentDataTreatment, setConsentDataTreatment] = useState(false);
  const [consentMediaLocation, setConsentMediaLocation] = useState(false);

  // Created user result
  const [registeredUser, setRegisteredUser] = useState<any>(null);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.mr;

  // Restore saved state from localStorage if available
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("jeevraksha_signup_lang") as Language;
      if (savedLang && (savedLang === "mr" || savedLang === "hi" || savedLang === "en")) {
        setLang(savedLang);
      }
    } catch {
      // ignore
    }
  }, []);

  // Cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Text-To-Speech reader for accessibility
  const handleReadAloud = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === "mr" ? "mr-IN" : lang === "hi" ? "hi-IN" : "en-IN";
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("TTS error:", e);
    }
  };

  // Speech Recognition for Farmer Name
  const handleListenName = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(lang === "mr" ? "आपल्या ब्राउझरमध्ये व्हॉइस इनपुट समर्थित नाही." : "Voice recognition not supported in this browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === "mr" ? "mr-IN" : lang === "hi" ? "hi-IN" : "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListeningName(true);
        setError("");
      };
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setFarmerName(transcript);
        }
      };
      recognition.onerror = () => setIsListeningName(false);
      recognition.onend = () => setIsListeningName(false);
      recognition.start();
    } catch {
      setIsListeningName(false);
    }
  };

  // Browser GPS Location autofill
  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false);
        // Default to Pune / Haveli if GPS detected inside Maharashtra
        setDistrict("Pune");
        setTaluka("Haveli");
        setVillage("Rampur Wadi");
      },
      (err) => {
        setLoading(false);
        setError("GPS permission denied. Please choose district and taluka from the list.");
      },
      { timeout: 8000 }
    );
  };

  // 1. Language Step -> Role Step
  const handleLanguageSelect = (selected: Language) => {
    setLang(selected);
    try {
      localStorage.setItem("jeevraksha_signup_lang", selected);
    } catch {}
    setError("");
    setStep("role");
  };

  // 2. Role Step -> Next Step
  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    setError("");
    if (selectedRole === "OFFICER") {
      setStep("officer_invite");
    } else {
      setStep("phone");
    }
  };

  // 3. Validate Officer Invite Code
  const handleValidateInvite = async () => {
    if (!inviteCode.trim()) {
      setError("Please enter your departmental invite code.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/invites/accept?code=${encodeURIComponent(inviteCode.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid invite code.");
        setLoading(false);
        return;
      }
      setInviteValidated(true);
      setStep("phone");
    } catch {
      setError("Network error while validating invite code.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Send SMS OTP
  const handleSendOtp = async () => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleaned }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send OTP.");
        if (data.cooldownRemaining) setCooldown(data.cooldownRemaining);
        setLoading(false);
        return;
      }

      setCooldown(data.cooldownSeconds || 30);
      if (data.debugOtp) setDebugOtp(data.debugOtp);
      if (data.otpChallengeToken) setOtpChallengeToken(data.otpChallengeToken);
      setStep("otp");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 5. Trigger Voice Call OTP
  const handleVoiceCallOtp = async () => {
    const cleaned = phone.replace(/\D/g, "");
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/otp/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleaned }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Voice call failed.");
        if (data.cooldownRemaining) setCooldown(data.cooldownRemaining);
      } else {
        setCooldown(30);
        if (data.debugOtp) setDebugOtp(data.debugOtp);
        if (data.otpChallengeToken) setOtpChallengeToken(data.otpChallengeToken);
      }
    } catch {
      setError("Failed to trigger voice call.");
    } finally {
      setLoading(false);
    }
  };

  // 6. Verify OTP
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.replace(/\D/g, ""),
          otp,
          otpChallengeToken,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid OTP.");
        setLoading(false);
        return;
      }

      setAuthToken(data.token);

      // If user is existing, save session and redirect
      if (!data.isNew && data.user) {
        localStorage.setItem("jeevraksha_user", JSON.stringify(data.user));
        localStorage.setItem("jeevraksha_token", data.token);
        if (data.user.role === "FARMER") router.push("/farmer/report");
        else router.push("/dashboard");
        return;
      }

      // If officer role:
      if (role === "OFFICER") {
        await handleCompleteOfficerSignup(data.token);
        return;
      }

      // If farmer: proceed to name
      if (role === "FARMER") {
        setStep("farmer_name");
      } else {
        setStep("vet_form");
      }
    } catch {
      setError("Network error during verification.");
    } finally {
      setLoading(false);
    }
  };

  // 7. Certificate Upload for Vet
  const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("Certificate file exceeds 10MB limit.");
      return;
    }

    setUploadingCert(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/uploads/certificate", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to upload certificate.");
        setUploadingCert(false);
        return;
      }

      setCertificateUrl(data.fileUrl);
      setCertificateFilename(file.name);
    } catch {
      setError("Failed to upload document.");
    } finally {
      setUploadingCert(false);
    }
  };

  // 8. Complete Farmer Registration
  const handleCompleteFarmerSignup = async () => {
    if (!consentDataTreatment) {
      setError(lang === "mr" ? "नोंदणीसाठी कृपया आवश्यक संमती बॉक्स निवडा." : "Please accept mandatory consent.");
      return;
    }

    setLoading(true);
    setError("");

    const animalArray = Object.entries(animals)
      .filter(([_, count]) => count > 0)
      .map(([species, count]) => ({ species, count }));

    try {
      const res = await fetch("/api/signup/farmer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.replace(/\D/g, ""),
          token: authToken,
          name: farmerName,
          district,
          taluka,
          village,
          language: lang,
          animals: animalArray,
          consent: {
            dataTreatment: consentDataTreatment,
            mediaLocationSharing: consentMediaLocation,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to complete registration.");
        setLoading(false);
        return;
      }

      setRegisteredUser(data.user);
      localStorage.setItem("jeevraksha_user", JSON.stringify(data.user));
      if (data.token) localStorage.setItem("jeevraksha_token", data.token);

      setStep("done");
    } catch {
      setError("Network error while creating account.");
    } finally {
      setLoading(false);
    }
  };

  // 9. Complete Vet Registration
  const handleCompleteVetSignup = async () => {
    if (!consentDataTreatment) {
      setError("Please accept the mandatory verification consent.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/signup/vet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.replace(/\D/g, ""),
          token: authToken,
          name: vetName,
          role: vetRole,
          registrationNo: regNo,
          council,
          certificateUrl,
          serviceDistrict,
          serviceTaluka,
          languages: vetLanguages.join(","),
          language: lang,
          consent: {
            dataTreatment: consentDataTreatment,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit vet application.");
        setLoading(false);
        return;
      }

      setRegisteredUser(data.user);
      setStep("done");
    } catch {
      setError("Network error while submitting application.");
    } finally {
      setLoading(false);
    }
  };

  // 10. Complete Officer Registration
  const handleCompleteOfficerSignup = async (token: string) => {
    try {
      const res = await fetch("/api/invites/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: inviteCode,
          phone: phone.replace(/\D/g, ""),
          token,
          name: farmerName || "Veterinary Officer",
          designation: officerDesignation || "Department Official",
        }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        localStorage.setItem("jeevraksha_user", JSON.stringify(data.user));
        router.push("/dashboard");
      } else {
        setError(data.error || "Failed to activate officer account.");
      }
    } catch {
      setError("Failed to register officer.");
    }
  };

  // Step Calculation for Progress Bar
  const getStepProgress = () => {
    if (role === "FARMER") {
      const stepMap: Record<string, number> = {
        language: 1,
        role: 2,
        phone: 3,
        otp: 4,
        farmer_name: 5,
        farmer_location: 6,
        farmer_animals: 7,
        consent: 8,
        done: 8,
      };
      return { current: stepMap[step] || 1, total: 8 };
    }
    if (role === "VET") {
      const stepMap: Record<string, number> = {
        language: 1,
        role: 2,
        phone: 3,
        otp: 4,
        vet_form: 5,
        consent: 6,
        done: 6,
      };
      return { current: stepMap[step] || 1, total: 6 };
    }
    return { current: 1, total: 4 };
  };

  const progress = getStepProgress();

  return (
    <div className="min-h-screen bg-[#F4F7F2] text-[#16261B] flex flex-col justify-between selection:bg-[#2E7D46] selection:text-white">
      {/* ── TOP NAV BAR & HELP CALL STRIP ── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#D5DDD0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#183921] via-[#2E7D46] to-[#3B9B58] flex items-center justify-center text-white shadow-md shadow-[#2E7D46]/20">
              <span className="text-lg">🐄</span>
            </div>
            <div>
              <span className="font-black text-base sm:text-lg tracking-tight text-[#16261B] block">
                Pashu Rakshak
              </span>
              <span className="text-[10px] text-[#5B6B5F] font-bold block -mt-0.5">
                जीव रक्षा • Account Setup
              </span>
            </div>
          </Link>

          {/* Quick Helpline & Language Switcher */}
          <div className="flex items-center gap-2">
            <a
              href="tel:18002330418"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EEF2EA] hover:bg-[#DCEFE1] text-[#2E7D46] rounded-xl text-xs font-black transition border border-[#D5DDD0]"
              title="Government Veterinary Toll-Free Helpline"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#2E7D46]" />
              <span className="hidden sm:inline">1800 233 0418</span>
              <span className="sm:hidden">1800</span>
            </a>

            {/* Language toggle pill */}
            <div className="flex items-center bg-[#EEF2EA] p-1 rounded-xl border border-[#D5DDD0] text-xs font-black">
              {(["mr", "hi", "en"] as Language[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => handleLanguageSelect(l)}
                  className={`px-2 py-1 rounded-lg transition uppercase ${
                    lang === l ? "bg-[#2E7D46] text-white shadow-xs" : "text-[#5B6B5F] hover:text-[#16261B]"
                  }`}
                >
                  {l === "mr" ? "मराठी" : l === "hi" ? "हिंदी" : "EN"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {step !== "done" && (
          <div className="w-full bg-[#E5ECE0] h-1.5">
            <div
              className="bg-gradient-to-r from-[#2E7D46] to-[#3B9B58] h-1.5 transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        )}
      </header>

      {/* ── MAIN CONTENT CONTAINER (360px TO TABLET TO DESKTOP) ── */}
      <main className="flex-1 flex flex-col justify-center max-w-xl w-full mx-auto px-4 py-8 sm:py-12">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D5DDD0] shadow-xl relative overflow-hidden transition-all">
          {/* Subtle Ambient Header Glow */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#183921] via-[#2E7D46] to-[#3B9B58]" />

          {/* ── STEP 1: LANGUAGE SELECTION ── */}
          {step === "language" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#2E7D46] bg-[#DCEFE1] px-3 py-1 rounded-full">
                  Step 1 • भाषा निवडा
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-[#16261B] tracking-tight">
                  Choose Your Language
                </h1>
                <p className="text-xs sm:text-sm text-[#5B6B5F] font-semibold">
                  Select your primary language for voice guides and reporting.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2">
                {[
                  { id: "mr", title: "मराठी", sub: "महाराष्ट्र राज्य मुख्य भाषा", icon: "🚩" },
                  { id: "hi", title: "हिन्दी", sub: "सरल व सुलभ हिंदी भाषा", icon: "🇮🇳" },
                  { id: "en", title: "English", sub: "Standard Indian English", icon: "🌐" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleLanguageSelect(item.id as Language)}
                    className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between text-left transition-all active:scale-[0.99] cursor-pointer min-h-[64px] ${
                      lang === item.id
                        ? "border-[#2E7D46] bg-[#DCEFE1] shadow-md shadow-[#2E7D46]/10"
                        : "border-[#D5DDD0] bg-[#F7F9F5] hover:bg-white hover:border-[#2E7D46]/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <div className="text-lg font-black text-[#16261B]">{item.title}</div>
                        <div className="text-xs text-[#5B6B5F] font-semibold">{item.sub}</div>
                      </div>
                    </div>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                        lang === item.id ? "bg-[#2E7D46] border-[#2E7D46] text-white" : "border-[#D5DDD0]"
                      }`}
                    >
                      {lang === item.id && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setStep("role")}
                className="w-full py-4 bg-[#2E7D46] hover:bg-[#256638] text-white font-black text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2 active:scale-98 cursor-pointer mt-4"
              >
                <span>{t.next}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── STEP 2: ROLE SELECTION ── */}
          {step === "role" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep("language")}
                  className="p-2 -ml-2 rounded-xl text-[#5B6B5F] hover:text-[#16261B] hover:bg-[#EEF2EA] transition"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleReadAloud(t.roleSelect + ". " + t.roleSub)}
                  className="p-2 rounded-xl bg-[#EEF2EA] text-[#2E7D46] hover:bg-[#DCEFE1] transition"
                  title="Read aloud"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-[#2E7D46] bg-[#DCEFE1] px-3 py-1 rounded-full">
                  {t.step} 2 {t.of} {progress.total}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#16261B] tracking-tight">
                  {t.roleSelect}
                </h2>
                <p className="text-xs sm:text-sm text-[#5B6B5F] font-semibold">{t.roleSub}</p>
              </div>

              <div className="space-y-3 pt-2">
                {/* 1. Farmer */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect("FARMER")}
                  className={`w-full p-4 sm:p-5 rounded-2xl border-2 flex items-start justify-between text-left transition-all active:scale-[0.99] cursor-pointer ${
                    role === "FARMER"
                      ? "border-[#2E7D46] bg-[#F2F9F4] shadow-md shadow-[#2E7D46]/10"
                      : "border-[#D5DDD0] bg-[#F7F9F5] hover:bg-white hover:border-[#2E7D46]/50"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <span className="text-3xl sm:text-4xl p-2 rounded-xl bg-[#DCEFE1] shrink-0">🌾🐄</span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base sm:text-lg font-black text-[#16261B]">
                          {t.roles.farmer.title}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-[#2E7D46] text-white px-2 py-0.5 rounded-full">
                          {t.roles.farmer.badge}
                        </span>
                      </div>
                      <p className="text-xs text-[#5B6B5F] font-medium leading-relaxed">
                        {t.roles.farmer.desc}
                      </p>
                    </div>
                  </div>
                </button>

                {/* 2. Vet / Para-vet */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect("VET")}
                  className={`w-full p-4 sm:p-5 rounded-2xl border-2 flex items-start justify-between text-left transition-all active:scale-[0.99] cursor-pointer ${
                    role === "VET"
                      ? "border-[#E8A317] bg-[#FFFDF5] shadow-md shadow-[#E8A317]/10"
                      : "border-[#D5DDD0] bg-[#F7F9F5] hover:bg-white hover:border-[#E8A317]/50"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <span className="text-3xl sm:text-4xl p-2 rounded-xl bg-[#FBEFCF] shrink-0">🩺👨‍⚕️</span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base sm:text-lg font-black text-[#16261B]">
                          {t.roles.vet.title}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-[#E8A317] text-[#16261B] px-2 py-0.5 rounded-full">
                          {t.roles.vet.badge}
                        </span>
                      </div>
                      <p className="text-xs text-[#5B6B5F] font-medium leading-relaxed">
                        {t.roles.vet.desc}
                      </p>
                    </div>
                  </div>
                </button>

                {/* 3. Government Officer (Invite Only) */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect("OFFICER")}
                  className={`w-full p-4 sm:p-5 rounded-2xl border-2 flex items-start justify-between text-left transition-all active:scale-[0.99] cursor-pointer ${
                    role === "OFFICER"
                      ? "border-[#1B4328] bg-[#EEF2EA] shadow-md"
                      : "border-[#D5DDD0] bg-[#F7F9F5] hover:bg-white hover:border-[#1B4328]/50"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <span className="text-3xl sm:text-4xl p-2 rounded-xl bg-[#D5DDD0] shrink-0">🏛️🇮🇳</span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base sm:text-lg font-black text-[#16261B]">
                          {t.roles.officer.title}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-[#1B4328] text-white px-2 py-0.5 rounded-full">
                          {t.roles.officer.badge}
                        </span>
                      </div>
                      <p className="text-xs text-[#5B6B5F] font-medium leading-relaxed">
                        {t.roles.officer.desc}
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2.5: OFFICER INVITE CODE ── */}
          {step === "officer_invite" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep("role")}
                  className="p-2 -ml-2 rounded-xl text-[#5B6B5F] hover:text-[#16261B] hover:bg-[#EEF2EA] transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleReadAloud(t.officerInviteTitle + ". " + t.officerInviteSub)}
                  className="p-2 rounded-xl bg-[#EEF2EA] text-[#2E7D46] hover:bg-[#DCEFE1] transition"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-[#1B4328] bg-[#EEF2EA] px-3 py-1 rounded-full">
                  Government Invite Verification
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#16261B] tracking-tight">
                  {t.officerInviteTitle}
                </h2>
                <p className="text-xs sm:text-sm text-[#5B6B5F] font-semibold">
                  {t.officerInviteSub}
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-[#5B6B5F] mb-1.5 uppercase tracking-wider">
                    Department Authorization Code
                  </label>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder={t.inviteCodePlaceholder}
                    className="w-full p-4 rounded-2xl bg-[#F7F9F5] border-2 border-[#D5DDD0] focus:border-[#1B4328] focus:bg-white text-lg font-black tracking-widest text-[#16261B] outline-hidden transition"
                  />
                  <p className="text-[11px] text-[#5B6B5F] mt-1 font-semibold">
                    💡 Demo Authority Code: <button type="button" onClick={() => setInviteCode("MAHA-GOV-2026")} className="text-[#2E7D46] underline font-bold">MAHA-GOV-2026</button>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5B6B5F] mb-1.5 uppercase tracking-wider">
                    Official Designation (उदा. Taluka Veterinary Officer)
                  </label>
                  <input
                    type="text"
                    value={officerDesignation}
                    onChange={(e) => setOfficerDesignation(e.target.value)}
                    placeholder="e.g. Livestock Development Officer"
                    className="w-full p-3.5 rounded-2xl bg-[#F7F9F5] border border-[#D5DDD0] text-sm font-bold text-[#16261B] outline-hidden transition"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="button"
                  disabled={loading || !inviteCode.trim()}
                  onClick={handleValidateInvite}
                  className="w-full py-4 bg-[#1B4328] hover:bg-[#122E1B] disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  {loading ? t.verifying : t.validateCode}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: PHONE NUMBER INPUT ── */}
          {step === "phone" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(role === "OFFICER" ? "officer_invite" : "role")}
                  className="p-2 -ml-2 rounded-xl text-[#5B6B5F] hover:text-[#16261B] hover:bg-[#EEF2EA] transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleReadAloud(t.phoneTitle + ". " + t.phoneSub)}
                  className="p-2 rounded-xl bg-[#EEF2EA] text-[#2E7D46] hover:bg-[#DCEFE1] transition"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-[#2E7D46] bg-[#DCEFE1] px-3 py-1 rounded-full">
                  {t.step} 3 {t.of} {progress.total}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#16261B] tracking-tight">
                  {t.phoneTitle}
                </h2>
                <p className="text-xs sm:text-sm text-[#5B6B5F] font-semibold">{t.phoneSub}</p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="relative">
                  <div className="flex items-center border-2 border-[#D5DDD0] focus-within:border-[#2E7D46] rounded-2xl overflow-hidden bg-[#F7F9F5] focus-within:bg-white transition-all">
                    <span className="px-4 py-4 text-base sm:text-lg font-black text-[#2E7D46] border-r border-[#D5DDD0] bg-[#EEF2EA] select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      autoFocus
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setPhone(val);
                        setError("");
                      }}
                      placeholder={t.phonePlaceholder}
                      className="w-full px-4 py-4 text-lg sm:text-xl font-black tracking-wider text-[#16261B] outline-hidden bg-transparent"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="button"
                  disabled={loading || phone.replace(/\D/g, "").length !== 10}
                  onClick={handleSendOtp}
                  className="w-full py-4 bg-[#2E7D46] hover:bg-[#256638] disabled:opacity-50 disabled:pointer-events-none text-white font-black text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  {loading ? t.sendingOtp : t.sendOtp}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4: OTP VERIFICATION ── */}
          {step === "otp" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep("phone")}
                  className="p-2 -ml-2 rounded-xl text-[#5B6B5F] hover:text-[#16261B] hover:bg-[#EEF2EA] transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleReadAloud(t.otpTitle + ". " + t.otpSub + " +91 " + phone)}
                  className="p-2 rounded-xl bg-[#EEF2EA] text-[#2E7D46] hover:bg-[#DCEFE1] transition"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-[#2E7D46] bg-[#DCEFE1] px-3 py-1 rounded-full">
                  {t.step} 4 {t.of} {progress.total}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#16261B] tracking-tight">
                  {t.otpTitle}
                </h2>
                <p className="text-xs sm:text-sm text-[#5B6B5F] font-semibold">
                  {t.otpSub} <strong className="text-[#16261B]">+91 {phone}</strong>
                </p>
              </div>

              {/* Dev mode helper */}
              {debugOtp && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-950 font-bold">
                  <span>🔑 Mock OTP received: <span className="font-mono text-sm tracking-widest font-black text-[#2E7D46]">{debugOtp}</span></span>
                  <button
                    type="button"
                    onClick={() => setOtp(debugOtp)}
                    className="px-2.5 py-1 bg-[#2E7D46] text-white rounded-lg text-[10px] font-black hover:bg-[#256638]"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              <div className="space-y-4 pt-1">
                <div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    autoFocus
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setOtp(val);
                      setError("");
                    }}
                    placeholder="• • • • • •"
                    className="w-full text-center py-4 rounded-2xl border-2 border-[#D5DDD0] focus:border-[#2E7D46] bg-[#F7F9F5] focus:bg-white text-3xl font-black tracking-[0.3em] text-[#16261B] outline-hidden transition"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="button"
                  disabled={loading || otp.length !== 6}
                  onClick={handleVerifyOtp}
                  className="w-full py-4 bg-[#2E7D46] hover:bg-[#256638] disabled:opacity-50 disabled:pointer-events-none text-white font-black text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  {loading ? t.verifying : t.verifyOtp}
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Resend & Voice Call Options */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <button
                    type="button"
                    disabled={cooldown > 0 || loading}
                    onClick={handleSendOtp}
                    className="text-[#2E7D46] hover:underline font-bold disabled:text-gray-400 disabled:no-underline cursor-pointer"
                  >
                    {cooldown > 0 ? `${t.resendOtp} (${cooldown}${t.cooldownWait})` : t.resendOtp}
                  </button>

                  <button
                    type="button"
                    onClick={handleVoiceCallOtp}
                    disabled={loading}
                    className="flex items-center gap-1.5 text-[#5B6B5F] hover:text-[#16261B] font-bold cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t.voiceCallOtp}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 5: FARMER NAME (ONE QUESTION PER SCREEN) ── */}
          {step === "farmer_name" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep("otp")}
                  className="p-2 -ml-2 rounded-xl text-[#5B6B5F] hover:text-[#16261B] hover:bg-[#EEF2EA] transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleReadAloud(t.farmerNameTitle + ". " + t.farmerNameSub)}
                  className="p-2 rounded-xl bg-[#EEF2EA] text-[#2E7D46] hover:bg-[#DCEFE1] transition"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-[#2E7D46] bg-[#DCEFE1] px-3 py-1 rounded-full">
                  {t.step} 5 {t.of} {progress.total}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#16261B] tracking-tight">
                  {t.farmerNameTitle}
                </h2>
                <p className="text-xs sm:text-sm text-[#5B6B5F] font-semibold">{t.farmerNameSub}</p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    autoFocus
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    placeholder={t.farmerNamePlaceholder}
                    className="w-full p-4 pr-14 rounded-2xl border-2 border-[#D5DDD0] focus:border-[#2E7D46] bg-[#F7F9F5] focus:bg-white text-lg font-bold text-[#16261B] outline-hidden transition"
                  />
                  <button
                    type="button"
                    onClick={handleListenName}
                    className={`absolute right-3 p-2.5 rounded-xl border transition ${
                      isListeningName
                        ? "bg-red-500 text-white border-red-600 animate-pulse"
                        : "bg-[#EEF2EA] text-[#2E7D46] border-[#D5DDD0] hover:bg-[#DCEFE1]"
                    }`}
                    title="Speak Name"
                  >
                    {isListeningName ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                </div>

                {isListeningName && (
                  <p className="text-xs text-red-600 font-bold text-center animate-pulse">
                    🎙️ Listening... Speak your name clearly
                  </p>
                )}

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="button"
                  disabled={!farmerName.trim()}
                  onClick={() => {
                    setError("");
                    setStep("farmer_location");
                  }}
                  className="w-full py-4 bg-[#2E7D46] hover:bg-[#256638] disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>{t.next}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 6: FARMER LOCATION ── */}
          {step === "farmer_location" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep("farmer_name")}
                  className="p-2 -ml-2 rounded-xl text-[#5B6B5F] hover:text-[#16261B] hover:bg-[#EEF2EA] transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleReadAloud(t.locationTitle + ". " + t.locationSub)}
                  className="p-2 rounded-xl bg-[#EEF2EA] text-[#2E7D46] hover:bg-[#DCEFE1] transition"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-[#2E7D46] bg-[#DCEFE1] px-3 py-1 rounded-full">
                  {t.step} 6 {t.of} {progress.total}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#16261B] tracking-tight">
                  {t.locationTitle}
                </h2>
                <p className="text-xs sm:text-sm text-[#5B6B5F] font-semibold">{t.locationSub}</p>
              </div>

              {/* GPS One-Tap Button */}
              <button
                type="button"
                onClick={handleUseGps}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#EEF2EA] hover:bg-[#DCEFE1] border-2 border-[#2E7D46]/30 text-[#2E7D46] font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer active:scale-98 shadow-xs"
              >
                <MapPin className="w-4 h-4" />
                <span>{t.useGps}</span>
              </button>

              <div className="space-y-4 pt-1">
                {/* District */}
                <div>
                  <label className="block text-xs font-bold text-[#5B6B5F] mb-1.5 uppercase tracking-wider">
                    {t.district}
                  </label>
                  <select
                    value={district}
                    onChange={(e) => {
                      const d = e.target.value;
                      setDistrict(d);
                      const talukas = MAHA_DISTRICTS[d] || [];
                      if (talukas.length > 0) setTaluka(talukas[0]);
                    }}
                    className="w-full p-4 rounded-2xl border-2 border-[#D5DDD0] focus:border-[#2E7D46] bg-[#F7F9F5] focus:bg-white text-base font-bold text-[#16261B] outline-hidden transition cursor-pointer"
                  >
                    {Object.keys(MAHA_DISTRICTS).map((d) => (
                      <option key={d} value={d}>
                        {d} District (जिल्हा)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Taluka */}
                <div>
                  <label className="block text-xs font-bold text-[#5B6B5F] mb-1.5 uppercase tracking-wider">
                    {t.taluka}
                  </label>
                  <select
                    value={taluka}
                    onChange={(e) => setTaluka(e.target.value)}
                    className="w-full p-4 rounded-2xl border-2 border-[#D5DDD0] focus:border-[#2E7D46] bg-[#F7F9F5] focus:bg-white text-base font-bold text-[#16261B] outline-hidden transition cursor-pointer"
                  >
                    {(MAHA_DISTRICTS[district] || []).map((tal) => (
                      <option key={tal} value={tal}>
                        {tal} Taluka (तालुका)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Village */}
                <div>
                  <label className="block text-xs font-bold text-[#5B6B5F] mb-1.5 uppercase tracking-wider">
                    {t.village}
                  </label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="e.g. Rampur, Kasarwadi"
                    className="w-full p-4 rounded-2xl border-2 border-[#D5DDD0] focus:border-[#2E7D46] bg-[#F7F9F5] focus:bg-white text-base font-bold text-[#16261B] outline-hidden transition"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="button"
                  disabled={!taluka}
                  onClick={() => {
                    setError("");
                    setStep("farmer_animals");
                  }}
                  className="w-full py-4 bg-[#2E7D46] hover:bg-[#256638] text-white font-black text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>{t.next}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 7: FARMER ANIMALS (COUNTER TILES) ── */}
          {step === "farmer_animals" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep("farmer_location")}
                  className="p-2 -ml-2 rounded-xl text-[#5B6B5F] hover:text-[#16261B] hover:bg-[#EEF2EA] transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleReadAloud(t.animalsTitle + ". " + t.animalsSub)}
                  className="p-2 rounded-xl bg-[#EEF2EA] text-[#2E7D46] hover:bg-[#DCEFE1] transition"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-[#2E7D46] bg-[#DCEFE1] px-3 py-1 rounded-full">
                  {t.step} 7 {t.of} {progress.total}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#16261B] tracking-tight">
                  {t.animalsTitle}
                </h2>
                <p className="text-xs sm:text-sm text-[#5B6B5F] font-semibold">{t.animalsSub}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { id: "cow", name: t.species.cow, icon: "🐄" },
                  { id: "buffalo", name: t.species.buffalo, icon: "🐃" },
                  { id: "goat", name: t.species.goat, icon: "🐐" },
                  { id: "sheep", name: t.species.sheep, icon: "🐑" },
                  { id: "poultry", name: t.species.poultry, icon: "🐔" },
                ].map((item) => {
                  const count = animals[item.id] || 0;
                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-2xl border-2 flex items-center justify-between transition-all ${
                        count > 0
                          ? "border-[#2E7D46] bg-[#DCEFE1]/50 shadow-xs"
                          : "border-[#D5DDD0] bg-[#F7F9F5]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <div className="font-extrabold text-sm text-[#16261B]">{item.name}</div>
                          <div className="text-[10px] text-[#5B6B5F] font-semibold">
                            {count > 0 ? `${count} Registered` : "Tap + to add"}
                          </div>
                        </div>
                      </div>

                      {/* Counter +/- Buttons */}
                      <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#D5DDD0] shadow-2xs">
                        <button
                          type="button"
                          onClick={() =>
                            setAnimals((prev) => ({
                              ...prev,
                              [item.id]: Math.max(0, (prev[item.id] || 0) - 1),
                            }))
                          }
                          className="w-8 h-8 rounded-lg bg-[#EEF2EA] hover:bg-[#D5DDD0] text-[#16261B] flex items-center justify-center font-bold text-base transition cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-black text-sm text-[#16261B]">
                          {count}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setAnimals((prev) => ({
                              ...prev,
                              [item.id]: (prev[item.id] || 0) + 1,
                            }))
                          }
                          className="w-8 h-8 rounded-lg bg-[#2E7D46] hover:bg-[#256638] text-white flex items-center justify-center font-bold text-base transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setStep("consent");
                }}
                className="w-full py-4 bg-[#2E7D46] hover:bg-[#256638] text-white font-black text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98 mt-4"
              >
                <span>{t.next}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── STEP 8: VET FORM (ONE PAGE) ── */}
          {step === "vet_form" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep("otp")}
                  className="p-2 -ml-2 rounded-xl text-[#5B6B5F] hover:text-[#16261B] hover:bg-[#EEF2EA] transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleReadAloud(t.vetFormTitle + ". " + t.vetFormSub)}
                  className="p-2 rounded-xl bg-[#EEF2EA] text-[#2E7D46] hover:bg-[#DCEFE1] transition"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-[#E8A317] bg-[#FBEFCF] px-3 py-1 rounded-full">
                  Veterinary Credential Verification
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#16261B] tracking-tight">
                  {t.vetFormTitle}
                </h2>
                <p className="text-xs sm:text-sm text-[#5B6B5F] font-semibold">{t.vetFormSub}</p>
              </div>

              <div className="space-y-4 pt-1">
                {/* Doctor Name */}
                <div>
                  <label className="block text-xs font-bold text-[#5B6B5F] mb-1 uppercase tracking-wider">
                    {t.vetName} *
                  </label>
                  <div className="flex items-center border border-[#D5DDD0] focus-within:border-[#2E7D46] rounded-2xl overflow-hidden bg-[#F7F9F5]">
                    <span className="px-3.5 py-3 text-xs font-extrabold text-[#5B6B5F] border-r border-[#D5DDD0] bg-[#EEF2EA]">
                      Dr.
                    </span>
                    <input
                      type="text"
                      value={vetName}
                      onChange={(e) => setVetName(e.target.value)}
                      placeholder="e.g. Anil Kumar Verma"
                      className="w-full px-3 py-3 text-sm font-bold text-[#16261B] outline-hidden bg-transparent"
                    />
                  </div>
                </div>

                {/* Role Toggle: Vet vs Para-Vet */}
                <div>
                  <label className="block text-xs font-bold text-[#5B6B5F] mb-1.5 uppercase tracking-wider">
                    {t.vetTypeLabel} *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setVetRole("VET")}
                      className={`p-3 rounded-xl border text-xs font-black transition cursor-pointer text-center ${
                        vetRole === "VET"
                          ? "bg-[#2E7D46] text-white border-[#2E7D46] shadow-xs"
                          : "bg-[#F7F9F5] text-[#5B6B5F] border-[#D5DDD0]"
                      }`}
                    >
                      🩺 {t.vetTypes.vet}
                    </button>
                    <button
                      type="button"
                      onClick={() => setVetRole("PARA_VET")}
                      className={`p-3 rounded-xl border text-xs font-black transition cursor-pointer text-center ${
                        vetRole === "PARA_VET"
                          ? "bg-[#2E7D46] text-white border-[#2E7D46] shadow-xs"
                          : "bg-[#F7F9F5] text-[#5B6B5F] border-[#D5DDD0]"
                      }`}
                    >
                      🩹 {t.vetTypes.para}
                    </button>
                  </div>
                </div>

                {/* Council Registration Number */}
                <div>
                  <label className="block text-xs font-bold text-[#5B6B5F] mb-1 uppercase tracking-wider">
                    {t.regNo} *
                  </label>
                  <input
                    type="text"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value.toUpperCase())}
                    placeholder="e.g. MSVC-2021-0941"
                    className="w-full p-3.5 rounded-2xl border border-[#D5DDD0] focus:border-[#2E7D46] bg-[#F7F9F5] focus:bg-white text-sm font-bold text-[#16261B] outline-hidden uppercase tracking-wider transition"
                  />
                </div>

                {/* Upload Certificate */}
                <div>
                  <label className="block text-xs font-bold text-[#5B6B5F] mb-1.5 uppercase tracking-wider">
                    {t.uploadCert} *
                  </label>
                  <div className="border-2 border-dashed border-[#D5DDD0] hover:border-[#2E7D46] rounded-2xl p-4 text-center bg-[#F7F9F5] transition relative">
                    <input
                      type="file"
                      accept=".pdf,image/jpeg,image/png,image/webp"
                      onChange={handleCertificateUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    {uploadingCert ? (
                      <div className="py-2 text-xs font-bold text-[#2E7D46] animate-pulse">
                        Uploading Certificate Document...
                      </div>
                    ) : certificateUrl ? (
                      <div className="flex items-center justify-center gap-2 text-xs font-black text-[#2E7D46]">
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D46]" />
                        <span>{certificateFilename || "Certificate Uploaded"}</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload className="w-6 h-6 text-[#5B6B5F] mx-auto" />
                        <p className="text-xs font-bold text-[#16261B]">Click or Drag to Upload Certificate</p>
                        <p className="text-[10px] text-[#5B6B5F]">Supports PDF, JPG, PNG up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Service District & Taluka */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-[#5B6B5F] mb-1 uppercase tracking-wider">
                      {t.serviceDist} *
                    </label>
                    <select
                      value={serviceDistrict}
                      onChange={(e) => {
                        const d = e.target.value;
                        setServiceDistrict(d);
                        const talukas = MAHA_DISTRICTS[d] || [];
                        if (talukas.length > 0) setServiceTaluka(talukas[0]);
                      }}
                      className="w-full p-3 rounded-xl border border-[#D5DDD0] text-xs font-bold text-[#16261B] bg-white outline-hidden cursor-pointer"
                    >
                      {Object.keys(MAHA_DISTRICTS).map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#5B6B5F] mb-1 uppercase tracking-wider">
                      {t.serviceTal} *
                    </label>
                    <select
                      value={serviceTaluka}
                      onChange={(e) => setServiceTaluka(e.target.value)}
                      className="w-full p-3 rounded-xl border border-[#D5DDD0] text-xs font-bold text-[#16261B] bg-white outline-hidden cursor-pointer"
                    >
                      {(MAHA_DISTRICTS[serviceDistrict] || []).map((tal) => (
                        <option key={tal} value={tal}>
                          {tal}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="button"
                  disabled={!vetName.trim() || !regNo.trim() || !certificateUrl}
                  onClick={() => {
                    setError("");
                    setStep("consent");
                  }}
                  className="w-full py-4 bg-[#2E7D46] hover:bg-[#256638] disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>{t.next}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 9: CONSENT SCREEN (NEITHER BOX PRE-TICKED) ── */}
          {step === "consent" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(role === "FARMER" ? "farmer_animals" : "vet_form")}
                  className="p-2 -ml-2 rounded-xl text-[#5B6B5F] hover:text-[#16261B] hover:bg-[#EEF2EA] transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleReadAloud(t.consentTitle + ". " + t.consent1)}
                  className="p-2 rounded-xl bg-[#EEF2EA] text-[#2E7D46] hover:bg-[#DCEFE1] transition"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-[#2E7D46] bg-[#DCEFE1] px-3 py-1 rounded-full">
                  Terms & Consent • संमती
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#16261B] tracking-tight">
                  {t.consentTitle}
                </h2>
                <p className="text-xs sm:text-sm text-[#5B6B5F] font-semibold">{t.consentSub}</p>
              </div>

              <div className="space-y-3.5 pt-2">
                {/* Mandatory Consent 1 */}
                <label className="flex items-start gap-3 p-4 rounded-2xl border-2 border-[#D5DDD0] bg-[#F7F9F5] hover:bg-white transition cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={consentDataTreatment}
                    onChange={(e) => setConsentDataTreatment(e.target.checked)}
                    className="w-5 h-5 rounded-md text-[#2E7D46] focus:ring-[#2E7D46] mt-0.5 shrink-0 cursor-pointer"
                  />
                  <div className="text-xs font-bold text-[#16261B] leading-relaxed">
                    <span>{t.consent1}</span>
                  </div>
                </label>

                {/* Optional Consent 2 */}
                <label className="flex items-start gap-3 p-4 rounded-2xl border border-[#D5DDD0] bg-[#F7F9F5] hover:bg-white transition cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={consentMediaLocation}
                    onChange={(e) => setConsentMediaLocation(e.target.checked)}
                    className="w-5 h-5 rounded-md text-[#2E7D46] focus:ring-[#2E7D46] mt-0.5 shrink-0 cursor-pointer"
                  />
                  <div className="text-xs font-medium text-[#5B6B5F] leading-relaxed">
                    <span>{t.consent2}</span>
                  </div>
                </label>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="button"
                  disabled={!consentDataTreatment || loading}
                  onClick={() => {
                    if (role === "FARMER") handleCompleteFarmerSignup();
                    else handleCompleteVetSignup();
                  }}
                  className="w-full py-4 bg-[#2E7D46] hover:bg-[#256638] disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98 mt-4"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>{loading ? t.submitting : t.submitCreate}</span>
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 10: DONE SCREEN (FARMER VS VET) ── */}
          {step === "done" && (
            <div className="space-y-6 text-center py-4">
              {role === "FARMER" ? (
                <>
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#183921] via-[#2E7D46] to-[#3B9B58] text-white flex items-center justify-center mx-auto shadow-xl text-4xl animate-bounce">
                    🌾
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-black uppercase tracking-wider text-[#2E7D46] bg-[#DCEFE1] px-3 py-1 rounded-full">
                      Account Activated • खाते सक्रिय
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-[#16261B] tracking-tight">
                      {t.farmerDoneTitle}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#5B6B5F] font-semibold max-w-sm mx-auto">
                      {t.farmerDoneSub}
                    </p>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-[#EEF2EA] p-4 rounded-2xl border border-[#D5DDD0] text-left text-xs font-bold text-[#16261B] space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-[#5B6B5F]">Farmer Name:</span>
                      <span>{registeredUser?.name || farmerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5B6B5F]">Jurisdiction:</span>
                      <span>{village ? `${village}, ` : ""}{taluka}, {district}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5B6B5F]">Registered Phone:</span>
                      <span>+91 {phone}</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <Link
                      href="/farmer/animals"
                      className="w-full py-4 bg-[#2E7D46] hover:bg-[#256638] text-white font-black text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2 active:scale-98"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t.addFirstAnimal}</span>
                    </Link>

                    <Link
                      href="/farmer/report"
                      className="w-full py-3 bg-[#EEF2EA] hover:bg-[#D5DDD0] text-[#16261B] font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
                    >
                      <span>{t.goToPortal}</span>
                    </Link>
                  </div>
                </>
              ) : (
                /* Vet Under Review Screen */
                <>
                  <div className="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-md text-3xl">
                    ⏳
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-[#FBEFCF] px-3 py-1 rounded-full border border-amber-300">
                      Under Review • पडताळणी सुरू
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-[#16261B] tracking-tight">
                      {t.vetUnderReviewTitle}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#5B6B5F] font-semibold max-w-md mx-auto">
                      {t.vetUnderReviewSub}
                    </p>
                  </div>

                  {/* 3-Step Verification Progress Indicator */}
                  <div className="bg-[#FFFDF5] p-5 rounded-2xl border border-amber-200 text-left space-y-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                        ✓
                      </div>
                      <div className="text-xs font-bold text-[#16261B]">
                        Step 1: Application & Registration Submitted
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-black animate-pulse">
                        ⏳
                      </div>
                      <div className="text-xs font-bold text-amber-900">
                        Step 2: MSVC Certificate & Council Number Verification
                      </div>
                    </div>
                    <div className="flex items-center gap-3 opacity-50">
                      <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-black">
                        3
                      </div>
                      <div className="text-xs font-medium text-gray-600">
                        Step 3: Account Activated & Cases Dispatched
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#5B6B5F] font-medium leading-relaxed max-w-sm mx-auto">
                    {t.vetUnderReviewTime}
                  </p>

                  <div className="pt-2">
                    <Link
                      href="/"
                      className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#EEF2EA] hover:bg-[#D5DDD0] text-[#16261B] font-bold text-xs transition"
                    >
                      Return to Home Page
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Bottom Login Link */}
        {step !== "done" && (
          <div className="text-center mt-6 text-xs text-[#5B6B5F] font-bold">
            Already have an account?{" "}
            <Link href="/login" className="text-[#2E7D46] hover:underline font-black">
              Sign In (लॉग इन)
            </Link>
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="py-6 text-center text-[11px] text-[#5B6B5F] border-t border-[#D5DDD0]">
        Government of Maharashtra Animal Husbandry Department • Problem Statement SIH26128
      </footer>
    </div>
  );
}
