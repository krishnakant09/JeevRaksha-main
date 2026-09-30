"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("FARMER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
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
          <p className="text-violet-200 text-sm mt-1">Create an Account</p>
        </div>

        {/* Form */}
        <div className="px-8 py-8">
          <h2 className="text-xl font-bold text-gray-800 mb-1">Sign Up</h2>
          <p className="text-sm text-gray-500 mb-6">Join the Animal Health Surveillance System</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                placeholder="e.g. Ramesh Singh"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">I am a...</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
              >
                <option value="FARMER">Farmer (किसान)</option>
                <option value="VETERINARIAN">Veterinarian (पशु चिकित्सक)</option>
                <option value="FIELD_WORKER">Field Worker (क्षेत्र कार्यकर्ता)</option>
              </select>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-violet-600 text-white rounded-lg font-bold text-base hover:bg-violet-700 active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-violet-600 font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>

        <div className="px-8 pb-6 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-violet-700">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
