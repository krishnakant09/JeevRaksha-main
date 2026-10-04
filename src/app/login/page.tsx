"use client";
import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Stethoscope,
  Shield,
  User,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  KeyRound,
  Phone,
  ArrowRight,
  AlertCircle,
  PhoneCall,
  Lock
} from "lucide-react";

type PortalType = "farmer" | "vet" | "admin";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const redirectParam = searchParams.get("redirect");

  // Determine initial portal based on query or redirect
  const initialPortal: PortalType =
    roleParam === "vet" || redirectParam?.includes("cases") || redirectParam?.includes("alerts") || redirectParam?.includes("lab")
      ? "vet"
      : roleParam === "admin" || redirectParam === "/dashboard" || redirectParam?.includes("map") || redirectParam?.includes("approvals")
      ? "admin"
      : "farmer";

  const [portal, setPortal] = useState<PortalType>(initialPortal);
  const [authMode, setAuthMode] = useState<"otp" | "password">("otp");

  // Phone OTP state
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [otpChallengeToken, setOtpChallengeToken] = useState<string | null>(null);

  // Email / Password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Set default credentials whenever portal changes
  useEffect(() => {
    setError("");
    if (portal === "vet") {
      setEmail("vet@jeevraksha.in");
      setPassword("password123");
      setPhone("9876501234");
    } else if (portal === "admin") {
      setEmail("admin@jeevraksha.in");
      setPassword("password123");
      setPhone("9988776655");
    } else {
      setEmail("farmer@jeevraksha.in");
      setPassword("password123");
      setPhone("6398704992");
    }
  }, [portal]);

  // Cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Switch Portal Handler
  const handleSwitchPortal = (target: PortalType) => {
    setPortal(target);
    setError("");
    setOtpSent(false);
    setOtp("");
    setDebugOtp(null);
    setOtpChallengeToken(null);
  };

  // Helper: Verify if account matches the portal and determine destination
  const validateAndGetDestination = (userRole: string, userStatus?: string): string | null => {
    // 1. Doctor Portal check
    if (portal === "vet") {
      if (userRole !== "VETERINARIAN") {
        setError(
          `Access Denied: This account has the role "${userRole}". Only licensed Veterinary Doctors can log into the Doctor Portal. Please switch to the ${
            userRole === "FARMER" ? "Farmer Portal" : "Admin Command Center"
          }.`
        );
        return null;
      }
      // If approved or pending, vet goes to case management (layout will show pending notice if not approved)
      if (redirectParam && (redirectParam.startsWith("/dashboard/cases") || redirectParam.startsWith("/dashboard/alerts") || redirectParam.startsWith("/dashboard/lab"))) {
        return redirectParam;
      }
      return "/dashboard/cases";
    }

    // 2. Admin Portal check
    if (portal === "admin") {
      const isOfficial =
        userRole === "ADMIN" ||
        userRole === "STATE_OFFICER" ||
        userRole === "DISTRICT_OFFICER" ||
        userRole === "TALUKA_OFFICER";

      if (!isOfficial) {
        setError(
          `Access Denied: This account has the role "${userRole}". Only Government Administrators and Officers can access the Admin Command Center.`
        );
        return null;
      }
      if (redirectParam && (redirectParam === "/dashboard" || redirectParam.startsWith("/dashboard/map") || redirectParam.startsWith("/dashboard/approvals"))) {
        return redirectParam;
      }
      return "/dashboard";
    }

    // 3. Farmer Portal check
    if (portal === "farmer") {
      if (userRole !== "FARMER") {
        setError(
          `Access Denied: This account has the role "${userRole}". Only registered Farmers can access the Farmer Portal. Please use the ${
            userRole === "VETERINARIAN" ? "Doctor Portal" : "Admin Command Center"
          }.`
        );
        return null;
      }
      if (redirectParam && redirectParam.startsWith("/farmer/")) {
        return redirectParam;
      }
      return "/farmer/report";
    }

    return "/";
  };

  // Handle Send OTP
  async function handleSendOtp(e?: React.FormEvent) {
    if (e) e.preventDefault();
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

      setOtpSent(true);
      setCooldown(data.cooldownSeconds || 30);
      if (data.debugOtp) setDebugOtp(data.debugOtp);
      if (data.otpChallengeToken) setOtpChallengeToken(data.otpChallengeToken);
    } catch {
      setError("Network error while sending OTP.");
    } finally {
      setLoading(false);
    }
  }

  // Handle Verify OTP
  async function handleVerifyOtp(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter 6-digit OTP.");
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

      if (data.isNew) {
        // If not registered yet, redirect to complete signup
        router.push("/register");
        return;
      }

      const userRole = data.user?.role || "FARMER";
      const targetDestination = validateAndGetDestination(userRole, data.user?.status);

      if (!targetDestination) {
        // Validation failed, role does not match this portal
        setLoading(false);
        return;
      }

      // Save user session
      localStorage.setItem("jeevraksha_user", JSON.stringify(data.user));
      if (data.token) localStorage.setItem("jeevraksha_token", data.token);

      router.push(targetDestination);
    } catch {
      setError("Network error while verifying OTP.");
    } finally {
      setLoading(false);
    }
  }

  // Handle Voice Call OTP
  async function handleVoiceCallOtp() {
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
  }

  // Handle Password Submit
  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // Strict role portal check
      const targetDestination = validateAndGetDestination(data.role, data.status);
      if (!targetDestination) {
        // Blocked because role does not match selected portal
        setLoading(false);
        return;
      }

      localStorage.setItem("jeevraksha_user", JSON.stringify(data));

      const historyStr = localStorage.getItem("jeevraksha_login_history");
      const history = historyStr ? JSON.parse(historyStr) : [];
      history.push({ email: data.email, role: data.role, timestamp: new Date().toISOString() });
      localStorage.setItem("jeevraksha_login_history", JSON.stringify(history));

      router.push(targetDestination);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  const fillCredentials = (userEmail: string, pass: string) => {
    setEmail(userEmail);
    setPassword(pass);
    setAuthMode("password");
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#EEF2EA] flex flex-col items-center justify-center p-4 selection:bg-[#2E7D46] selection:text-white">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-[#D5DDD0]">
        {/* Header with dynamic role styling */}
        <div
          className={`px-8 py-6 text-white text-center transition-colors ${
            portal === "vet"
              ? "bg-gradient-to-r from-amber-600 to-yellow-600"
              : portal === "admin"
              ? "bg-gradient-to-r from-slate-900 via-gray-900 to-indigo-950"
              : "bg-gradient-to-r from-[#183921] via-[#215A33] to-[#2E7D46]"
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-2 text-2xl shadow-inner">
            {portal === "vet" ? "🩺" : portal === "admin" ? "🛡️" : "🌾"}
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            {portal === "vet"
              ? "Doctor Portal Login"
              : portal === "admin"
              ? "Admin Command Login"
              : "Farmer Portal Login"}
          </h1>
          <p className="text-white/80 text-xs mt-1 font-medium">
            {portal === "vet"
              ? "पशु चिकित्सक अधिकृत प्रवेश (Veterinary Clinical Access)"
              : portal === "admin"
              ? "National Livestock Surveillance Grid (Officials Only)"
              : "पशु पालक अधिकृत प्रवेश (Livestock Owner Portal)"}
          </p>
        </div>

        {/* Portal Switcher Tabs */}
        <div className="p-2 bg-[#F1F4EE] border-b border-[#D5DDD0]">
          <div className="grid grid-cols-3 gap-1 p-1 bg-white rounded-2xl border border-[#D5DDD0]/70">
            <button
              type="button"
              onClick={() => handleSwitchPortal("farmer")}
              className={`py-2 text-[11px] font-black rounded-xl transition cursor-pointer flex items-center justify-center gap-1 ${
                portal === "farmer"
                  ? "bg-[#2E7D46] text-white shadow-xs"
                  : "text-[#5B6B5F] hover:text-[#16261B] hover:bg-[#EEF2EA]"
              }`}
            >
              <span>🌾 Farmer</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchPortal("vet")}
              className={`py-2 text-[11px] font-black rounded-xl transition cursor-pointer flex items-center justify-center gap-1 ${
                portal === "vet"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-[#5B6B5F] hover:text-[#16261B] hover:bg-amber-50"
              }`}
            >
              <span>🩺 Doctor</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchPortal("admin")}
              className={`py-2 text-[11px] font-black rounded-xl transition cursor-pointer flex items-center justify-center gap-1 ${
                portal === "admin"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-[#5B6B5F] hover:text-[#16261B] hover:bg-slate-100"
              }`}
            >
              <span>🛡️ Admin</span>
            </button>
          </div>
        </div>

        {/* Auth Mode Tabs (Phone OTP vs Password) */}
        <div className="flex border-b border-[#D5DDD0] bg-[#F7F9F5]">
          <button
            type="button"
            onClick={() => {
              setAuthMode("otp");
              setError("");
            }}
            className={`flex-1 py-3 text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
              authMode === "otp"
                ? "bg-white text-[#2E7D46] border-b-2 border-[#2E7D46] shadow-2xs"
                : "text-[#5B6B5F] hover:text-[#16261B]"
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Mobile OTP (मोबाईल OTP)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode("password");
              setError("");
            }}
            className={`flex-1 py-3 text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
              authMode === "password"
                ? "bg-white text-[#2E7D46] border-b-2 border-[#2E7D46] shadow-2xs"
                : "text-[#5B6B5F] hover:text-[#16261B]"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Email & Password (पासवर्ड)</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="px-8 py-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {/* ── MODE 1: PHONE OTP LOGIN ── */}
          {authMode === "otp" && (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-[#5B6B5F] mb-1.5">
                      Registered Mobile Number ({portal === "vet" ? "Doctor Mobile" : portal === "admin" ? "Official Mobile" : "Farmer Mobile"})
                    </label>
                    <div className="flex items-center border-2 border-[#D5DDD0] focus-within:border-[#2E7D46] rounded-2xl overflow-hidden bg-[#F7F9F5]">
                      <span className="px-3.5 py-3 text-sm font-black text-[#2E7D46] border-r border-[#D5DDD0] bg-[#EEF2EA] select-none">
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
                          setPhone(e.target.value.replace(/\D/g, ""));
                          setError("");
                        }}
                        placeholder="10-digit mobile number"
                        className="w-full px-3 py-3 text-base font-black text-[#16261B] outline-hidden bg-transparent"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || phone.replace(/\D/g, "").length !== 10}
                    className={`w-full py-3.5 text-white font-black text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 ${
                      portal === "vet"
                        ? "bg-amber-600 hover:bg-amber-700"
                        : portal === "admin"
                        ? "bg-slate-900 hover:bg-black"
                        : "bg-[#2E7D46] hover:bg-[#256638]"
                    }`}
                  >
                    <span>{loading ? "Sending OTP..." : "Send Verification OTP (OTP पाठवा)"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold text-[#5B6B5F]">
                    <span>Sent to +91 {phone}</span>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[#2E7D46] hover:underline font-black cursor-pointer"
                    >
                      Change Number
                    </button>
                  </div>

                  {debugOtp && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-950 font-bold">
                      <span>🔑 Demo OTP: <strong className="font-mono text-sm text-[#2E7D46]">{debugOtp}</strong></span>
                      <button
                        type="button"
                        onClick={() => setOtp(debugOtp)}
                        className="px-2 py-0.5 bg-[#2E7D46] text-white rounded text-[10px] font-black cursor-pointer"
                      >
                        Fill
                      </button>
                    </div>
                  )}

                  <div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      autoFocus
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/\D/g, ""));
                        setError("");
                      }}
                      placeholder="• • • • • •"
                      className="w-full text-center py-3.5 rounded-2xl border-2 border-[#D5DDD0] focus:border-[#2E7D46] bg-[#F7F9F5] text-2xl font-black tracking-[0.25em] text-[#16261B] outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className={`w-full py-3.5 text-white font-black text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 ${
                      portal === "vet"
                        ? "bg-amber-600 hover:bg-amber-700"
                        : portal === "admin"
                        ? "bg-slate-900 hover:bg-black"
                        : "bg-[#2E7D46] hover:bg-[#256638]"
                    }`}
                  >
                    <span>{loading ? "Verifying..." : "Verify & Sign In (प्रवेश करा)"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      disabled={cooldown > 0 || loading}
                      onClick={() => handleSendOtp()}
                      className="text-[#2E7D46] font-bold hover:underline disabled:text-gray-400 disabled:no-underline cursor-pointer"
                    >
                      {cooldown > 0 ? `Resend (${cooldown}s)` : "Resend OTP"}
                    </button>
                    <button
                      type="button"
                      onClick={handleVoiceCallOtp}
                      disabled={loading}
                      className="text-[#5B6B5F] font-bold hover:text-[#16261B] flex items-center gap-1 cursor-pointer"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
                      <span>Voice Call OTP</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ── MODE 2: EMAIL / PASSWORD LOGIN ── */}
          {authMode === "password" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#5B6B5F] mb-1.5">
                  {portal === "vet"
                    ? "Doctor Email Address"
                    : portal === "admin"
                    ? "Government Official Email"
                    : "Farmer Email"}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#D5DDD0] rounded-xl text-sm text-[#16261B] bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2E7D46] transition"
                  placeholder={
                    portal === "vet"
                      ? "vet@jeevraksha.in"
                      : portal === "admin"
                      ? "admin@jeevraksha.in"
                      : "farmer@jeevraksha.in"
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#5B6B5F] mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#D5DDD0] rounded-xl text-sm text-[#16261B] bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2E7D46] transition"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 text-white rounded-xl font-black text-sm active:scale-[0.98] transition shadow-md disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer ${
                  portal === "vet"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : portal === "admin"
                    ? "bg-slate-900 hover:bg-black"
                    : "bg-[#2E7D46] hover:bg-[#256638]"
                }`}
              >
                {loading ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>
                      {portal === "vet"
                        ? "Authorize Doctor Clinic"
                        : portal === "admin"
                        ? "Access Admin Command Center"
                        : "Enter Farmer Portal"}
                    </span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo Credentials tailored to selected Portal */}
          <div className="mt-5 p-3.5 bg-gray-50/90 rounded-2xl border border-gray-200">
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2 flex items-center justify-between">
              <span>{portal.toUpperCase()} Portal Test Accounts</span>
              <span className="text-gray-400 font-normal">Pass: password123</span>
            </p>

            {portal === "vet" && (
              <div className="space-y-1.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => fillCredentials("vet@jeevraksha.in", "password123")}
                  className={`w-full p-2.5 rounded-xl text-left transition flex items-center justify-between cursor-pointer ${
                    email === "vet@jeevraksha.in"
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>🩺</span>
                    <span><strong>Dr. Anil Verma:</strong> vet@jeevraksha.in</span>
                  </span>
                  <span className="text-[9px] font-black text-amber-800 uppercase bg-amber-200/60 px-2 py-0.5 rounded-full">
                    Approved Vet
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => fillCredentials("applicant.vet@jeevraksha.in", "password123")}
                  className={`w-full p-2 rounded-xl text-left transition flex items-center justify-between cursor-pointer ${
                    email === "applicant.vet@jeevraksha.in"
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>⏳</span>
                    <span><strong>Dr. Sneha (Applicant):</strong> applicant.vet@jeevraksha.in</span>
                  </span>
                  <span className="text-[9px] font-black text-orange-700 uppercase bg-orange-100 px-2 py-0.5 rounded-full">
                    Pending Review
                  </span>
                </button>
              </div>
            )}

            {portal === "admin" && (
              <div className="space-y-1.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => fillCredentials("admin@jeevraksha.in", "password123")}
                  className={`w-full p-2.5 rounded-xl text-left transition flex items-center justify-between cursor-pointer ${
                    email === "admin@jeevraksha.in"
                      ? "bg-purple-100 text-purple-900 border border-purple-300"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>🛡️</span>
                    <span><strong>System Admin:</strong> admin@jeevraksha.in</span>
                  </span>
                  <span className="text-[9px] font-black text-purple-800 uppercase bg-purple-200/60 px-2 py-0.5 rounded-full">
                    Full Admin
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => fillCredentials("state.officer@jeevraksha.in", "password123")}
                  className={`w-full p-2 rounded-xl text-left transition flex items-center justify-between cursor-pointer ${
                    email === "state.officer@jeevraksha.in"
                      ? "bg-indigo-100 text-indigo-900 border border-indigo-300"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>🏛️</span>
                    <span><strong>State Officer:</strong> state.officer@jeevraksha.in</span>
                  </span>
                  <span className="text-[9px] font-black text-indigo-800 uppercase bg-indigo-100 px-2 py-0.5 rounded-full">
                    State Wide
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => fillCredentials("pune.officer@jeevraksha.in", "password123")}
                  className={`w-full p-2 rounded-xl text-left transition flex items-center justify-between cursor-pointer ${
                    email === "pune.officer@jeevraksha.in"
                      ? "bg-blue-100 text-blue-900 border border-blue-300"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>📍</span>
                    <span><strong>District Officer:</strong> pune.officer@jeevraksha.in</span>
                  </span>
                  <span className="text-[9px] font-black text-blue-800 uppercase bg-blue-100 px-2 py-0.5 rounded-full">
                    Pune Dist
                  </span>
                </button>
              </div>
            )}

            {portal === "farmer" && (
              <div className="space-y-1.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => fillCredentials("farmer@jeevraksha.in", "password123")}
                  className={`w-full p-2.5 rounded-xl text-left transition flex items-center justify-between cursor-pointer ${
                    email === "farmer@jeevraksha.in"
                      ? "bg-green-100 text-green-900 border border-green-300"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>🌾</span>
                    <span><strong>Ramesh Patil:</strong> farmer@jeevraksha.in</span>
                  </span>
                  <span className="text-[9px] font-black text-green-800 uppercase bg-green-200/60 px-2 py-0.5 rounded-full">
                    Dairy Farmer
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPhone("6398704992");
                    setAuthMode("otp");
                    setError("");
                  }}
                  className={`w-full p-2 rounded-xl text-left transition flex items-center justify-between cursor-pointer ${
                    phone === "6398704992" && authMode === "otp"
                      ? "bg-green-100 text-green-900 border border-green-300"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>📱</span>
                    <span><strong>Mobile OTP Farmer:</strong> 6398704992</span>
                  </span>
                  <span className="text-[9px] font-black text-green-800 uppercase bg-green-100 px-2 py-0.5 rounded-full">
                    OTP Quick
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Links */}
          <div className="mt-6 pt-4 border-t border-[#D5DDD0] text-center text-xs text-[#5B6B5F]">
            <p>
              New user?{" "}
              <Link href="/register" className="font-black text-[#2E7D46] hover:underline">
                Create an Account (नवीन खाते तयार करा)
              </Link>
            </p>
            <p className="mt-2 text-[11px]">
              <Link href="/" className="hover:text-[#16261B] inline-flex items-center gap-1 font-semibold">
                <ArrowLeft className="w-3 h-3" /> Back to Home Page
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#EEF2EA] flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
