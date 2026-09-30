"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

      // Store user in localStorage for MVP session
      localStorage.setItem("jeevraksha_user", JSON.stringify(data));
      
      // Save login history
      const historyStr = localStorage.getItem("jeevraksha_login_history");
      const history = historyStr ? JSON.parse(historyStr) : [];
      history.push({ email: data.email, role: data.role, timestamp: new Date().toISOString() });
      localStorage.setItem("jeevraksha_login_history", JSON.stringify(history));

      // Redirect based on role
      if (data.role === "FARMER") {
        router.push("/farmer/report");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-violet-700 px-8 py-6 text-white text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">JeevRaksha</h1>
          <p className="text-violet-200 text-sm mt-1">Animal Health Surveillance System</p>
        </div>

        {/* Form */}
        <div className="px-8 py-8">
          <h2 className="text-xl font-bold text-gray-800 mb-1">Sign In</h2>
          <p className="text-sm text-gray-500 mb-6">पशु स्वास्थ्य सुरक्षा प्रणाली में आपका स्वागत है</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                placeholder="e.g. farmer@jeevraksha.in"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-violet-600 text-white rounded-lg font-bold text-base hover:bg-violet-700 active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-bold text-gray-600 mb-2">Demo Accounts (password: password123)</p>
            <div className="space-y-1 text-xs text-gray-500">
              <button onClick={() => { setEmail("farmer@jeevraksha.in"); setPassword("password123"); }} className="block text-left w-full hover:text-violet-600 transition">🌾 Farmer: farmer@jeevraksha.in</button>
              <button onClick={() => { setEmail("vet@jeevraksha.in"); setPassword("password123"); }} className="block text-left w-full hover:text-violet-600 transition">🩺 Vet: vet@jeevraksha.in</button>
              <button onClick={() => { setEmail("admin@jeevraksha.in"); setPassword("password123"); }} className="block text-left w-full hover:text-violet-600 transition">⚙️ Admin: admin@jeevraksha.in</button>
            </div>
          </div>
        </div>

        <div className="px-8 pb-6 text-center">
          <div className="mb-4 text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/register" className="text-violet-600 font-bold hover:underline">
              Sign Up
            </Link>
          </div>
          <Link href="/" className="text-sm text-gray-500 hover:text-violet-700">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
