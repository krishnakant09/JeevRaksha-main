"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Check, MapPin, Sparkles } from "lucide-react";
import FarmerNav from "@/components/farmer/FarmerNav";

const SPECIES_OPTIONS = [
  { id: "Cow", label: "Cow (गाय)", emoji: "🐄" },
  { id: "Buffalo", label: "Buffalo (भैंस)", emoji: "🐃" },
  { id: "Goat", label: "Goat (बकरी)", emoji: "🐐" },
  { id: "Sheep", label: "Sheep (भेड़)", emoji: "🐑" },
  { id: "Poultry", label: "Poultry (मुर्गी)", emoji: "🐔" },
  { id: "Pig", label: "Pig (सूअर)", emoji: "🐖" },
  { id: "Horse", label: "Horse (घोड़ा)", emoji: "🐎" },
  { id: "Camel", label: "Camel (ऊंट)", emoji: "🐪" },
];

export default function RegisterAnimalPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    species: "Cow",
    breed: "",
    age: "",
    gender: "Female",
    weight: "",
    village: "",
    block: "",
    district: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("jeevraksha_user");
    if (!stored) {
      router.push("/login");
      return;
    }
    const u = JSON.parse(stored);
    setUser(u);
  }, [router]);

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.species || !form.village || !form.block || !form.district) {
      setError("Please fill in all required fields marked with *");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/animals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ownerId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to register animal");
        setLoading(false);
        return;
      }
      router.push("/farmer/report");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f4fb] pb-24 md:pb-16">
      <FarmerNav userName={user?.name} />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-6">
        <div className="mb-4">
          <Link
            href="/farmer/animals"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-violet-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Livestock Registry</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-100">
          <div className="border-b border-gray-100 pb-4 mb-6">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Register Livestock Profile
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
              नया पशु पंजीकृत करें • Create a permanent digital health record
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Species Selector Grid */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Species (पशु का प्रकार) *
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {SPECIES_OPTIONS.map((opt) => {
                  const isSelected = form.species === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => set("species", opt.id)}
                      className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                        isSelected
                          ? "border-violet-600 bg-violet-50/50 shadow-xs scale-102"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      <span className="text-xs font-bold text-gray-800 text-center leading-tight">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Breed & Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Breed (नस्ल)
                </label>
                <input
                  type="text"
                  value={form.breed}
                  onChange={(e) => set("breed", e.target.value)}
                  placeholder="e.g. Sahiwal, Murrah, Jamnapari"
                  className="w-full px-3.5 py-3 border border-gray-300 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Gender (लिंग)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["Female", "Male"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => set("gender", g)}
                      className={`py-3 rounded-xl border text-xs font-bold transition ${
                        form.gender === g
                          ? "bg-violet-600 text-white border-violet-600 shadow-xs"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {g === "Female" ? "Female (मादा)" : "Male (नर)"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Age & Weight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Age in Years (आयु - वर्ष)
                </label>
                <input
                  type="number"
                  min="0"
                  max="35"
                  value={form.age}
                  onChange={(e) => set("age", e.target.value)}
                  placeholder="e.g. 4"
                  className="w-full px-3.5 py-3 border border-gray-300 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Approx Weight (वजन - कि.ग्रा.)
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.weight}
                  onChange={(e) => set("weight", e.target.value)}
                  placeholder="e.g. 350"
                  className="w-full px-3.5 py-3 border border-gray-300 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            {/* Location */}
            <div className="pt-2 border-t border-gray-100">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Livestock Location (स्थान विवरण) *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  required
                  type="text"
                  placeholder="Village / ग्राम *"
                  value={form.village}
                  onChange={(e) => set("village", e.target.value)}
                  className="w-full px-3.5 py-3 border border-gray-300 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-violet-500"
                />
                <input
                  required
                  type="text"
                  placeholder="Block / ब्लॉक *"
                  value={form.block}
                  onChange={(e) => set("block", e.target.value)}
                  className="w-full px-3.5 py-3 border border-gray-300 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-violet-500"
                />
                <input
                  required
                  type="text"
                  placeholder="District / जिला *"
                  value={form.district}
                  onChange={(e) => set("district", e.target.value)}
                  className="w-full px-3.5 py-3 border border-gray-300 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl font-black text-sm sm:text-base hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-200 transition active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? "Registering Livestock..." : "Register Animal (पंजीकरण करें)"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
