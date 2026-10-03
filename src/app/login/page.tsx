"use client";
import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Stethoscope, Shield, User, ArrowLeft, CheckCircle2, Sparkles, KeyRound } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const redirectParam = searchParams.get("redirect");

  const isVet = roleParam === "vet" || redirectParam?.includes("cases");
  const isAdmin = roleParam === "admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVet) {
      setEmail("vet@jeevraksha.in");
      setPassword("password123");
    } else if (isAdmin) {
      setEmail("admin@jeevraksha.in");
      setPassword("password123");
    }
  }, [isVet, isAdmin]);

  async function handleSubmit(e: React.FormEvent) {
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

      // Store user in localStorage for session
      localStorage.setItem("jeevraksha_user", JSON.stringify(data));

      // Save login history
      const historyStr = localStorage.getItem("jeevraksha_login_history");
      const history = historyStr ? JSON.parse(historyStr) : [];
      history.push({ email: data.email, role: data.role, timestamp: new Date().toISOString() });
      localStorage.setItem("jeevraksha_login_history", JSON.stringify(history));

      // Redirect destination
      if (redirectParam) {
        router.push(redirectParam);
      } else if (data.role === "FARMER") {
        router.push("/farmer/report");
      } else if (data.role === "VETERINARIAN") {
        router.push("/dashboard/cases");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  const fillCredentials = (userEmail: string, pass: string) => {
    setEmail(userEmail);
    setPassword(pass);
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#EEF2EA] flex flex-col items-center justify-center p-4 selection:bg-amber-200">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-[#D5DDD0]">
        {/* Header */}
        <div
          className={`px-8 py-6 text-white text-center transition-colors ${
            isVet
              ? "bg-gradient-to-r from-amber-600 to-yellow-600"
              : isAdmin
              ? "bg-gradient-to-r from-slate-900 to-gray-800"
              : "bg-gradient-to-r from-emerald-800 via-green-700 to-emerald-900"
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-2 text-2xl shadow-inner">
            {isVet ? "🩺" : isAdmin ? "🛡️" : "🐄"}
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {isVet ? "Doctor Portal Login" : isAdmin ? "Admin Command Login" : "JeevRaksha Login"}
          </h1>
          <p className="text-white/80 text-xs mt-1 font-medium">
            {isVet
              ? "पशु चिकित्सक अधिकृत प्रवेश (Veterinary Access)"
              : "National Livestock Early Warning & Health Grid"}
          </p>
        </div>

        {/* Doctor Notice Badge if required */}
        {isVet && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center gap-2.5 text-xs text-amber-900 font-semibold">
            <Stethoscope className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Case triage & prescriptions require an authorized doctor account.</span>
          </div>
        )}

        {/* Form Body */}
        <div className="px-8 py-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Official Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                placeholder={isVet ? "vet@jeevraksha.in" : "user@jeevraksha.in"}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Security Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-white rounded-xl font-bold text-sm active:scale-[0.98] transition shadow-md disabled:opacity-60 flex items-center justify-center gap-2 ${
                isVet
                  ? "bg-amber-600 hover:bg-amber-700"
                  : isAdmin
                  ? "bg-gray-900 hover:bg-black"
                  : "bg-[#2E7D46] hover:bg-[#256639]"
              }`}
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>{isVet ? "Authorize Doctor Access" : "Sign In to Portal"}</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-5 p-3.5 bg-gray-50/80 rounded-2xl border border-gray-200">
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2">
              Instant Demo Quick Fill (Password: password123)
            </p>
            <div className="grid grid-cols-1 gap-1.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => fillCredentials("state.officer@jeevraksha.in", "password123")}
                className={`p-2 rounded-lg text-left transition flex items-center justify-between ${
                  email === "state.officer@jeevraksha.in"
                    ? "bg-purple-100 text-purple-900 border border-purple-300"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span>🏛️</span>
                  <span><strong>State Officer:</strong> state.officer@jeevraksha.in (MH State)</span>
                </span>
                <span className="text-[10px] font-black text-purple-700 uppercase">State Wide</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials("pune.officer@jeevraksha.in", "password123")}
                className={`p-2 rounded-lg text-left transition flex items-center justify-between ${
                  email === "pune.officer@jeevraksha.in"
                    ? "bg-blue-100 text-blue-900 border border-blue-300"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span>🏢</span>
                  <span><strong>District Officer:</strong> pune.officer@jeevraksha.in (Pune)</span>
                </span>
                <span className="text-[10px] font-black text-blue-700 uppercase">District</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials("haveli.officer@jeevraksha.in", "password123")}
                className={`p-2 rounded-lg text-left transition flex items-center justify-between ${
                  email === "haveli.officer@jeevraksha.in"
                    ? "bg-indigo-100 text-indigo-900 border border-indigo-300"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span>📍</span>
                  <span><strong>Taluka Officer:</strong> haveli.officer@jeevraksha.in (Haveli)</span>
                </span>
                <span className="text-[10px] font-black text-indigo-700 uppercase">Taluka</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials("vet@jeevraksha.in", "password123")}
                className={`p-2 rounded-lg text-left transition flex items-center justify-between ${
                  email === "vet@jeevraksha.in"
                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span>🩺</span>
                  <span><strong>Doctor (Vet):</strong> vet@jeevraksha.in</span>
                </span>
                <span className="text-[10px] font-black text-amber-700 uppercase">Doctor</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials("admin@jeevraksha.in", "password123")}
                className={`p-2 rounded-lg text-left transition flex items-center justify-between ${
                  email === "admin@jeevraksha.in"
                    ? "bg-gray-200 text-gray-900 border border-gray-400"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span>⚙️</span>
                  <span><strong>System Admin:</strong> admin@jeevraksha.in</span>
                </span>
                <span className="text-[10px] font-black text-gray-700 uppercase">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials("farmer@jeevraksha.in", "password123")}
                className={`p-2 rounded-lg text-left transition flex items-center justify-between ${
                  email === "farmer@jeevraksha.in"
                    ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span>🌾</span>
                  <span><strong>Farmer:</strong> farmer@jeevraksha.in</span>
                </span>
                <span className="text-[10px] font-black text-emerald-700 uppercase">Farmer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-8 pb-6 text-center border-t border-gray-100 pt-4 bg-gray-50/50">
          <div className="mb-2 text-xs text-gray-600 font-semibold">
            Need an official field account?{" "}
            <Link href="/register" className="text-[#2E7D46] font-bold hover:underline">
              Register Here
            </Link>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 font-bold transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Public Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#EEF2EA] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
