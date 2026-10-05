"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, ArrowLeft, HeartPulse, MapPin, Calendar, Weight, PlusCircle, AlertCircle, Loader2 } from "lucide-react";
import FarmerNav from "@/components/farmer/FarmerNav";

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

export default function AnimalsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [animals, setAnimals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored =
      localStorage.getItem("pashurakshak_user") ||
      localStorage.getItem("jeevraksha_user");
    if (!stored) {
      router.push("/login");
      return;
    }
    const u = JSON.parse(stored);
    setUser(u);

    fetch(`/api/animals?ownerId=${u.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAnimals(data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f5f4fb] pb-24 md:pb-16">
      <FarmerNav userName={user?.name} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐮</span>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                My Livestock Registry
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
              मेरे पंजीकृत पशु • Digital Livestock Health Registry
            </p>
          </div>

          <Link
            href="/farmer/animals/register"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-violet-200 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Register New Animal</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-violet-600 animate-spin mb-3" />
            <p className="text-sm font-bold text-gray-500">Loading livestock records...</p>
          </div>
        ) : animals.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 shadow-xs border border-gray-100 text-center">
            <div className="w-20 h-20 bg-violet-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-4xl">
              🌾
            </div>
            <h2 className="text-lg font-bold text-gray-900">No Animals Registered Yet</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-md mx-auto">
              Add your cattle, buffalo, goats, or poultry to easily file health reports and receive automated vaccination alerts.
            </p>
            <Link
              href="/farmer/animals/register"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl shadow-md shadow-violet-200 transition"
            >
              <Plus className="w-4 h-4" />
              Register Your First Animal
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {animals.map((animal) => (
              <div
                key={animal.id}
                className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 hover:shadow-md hover:border-violet-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center text-3xl">
                        {getSpeciesEmoji(animal.species)}
                      </div>
                      <div>
                        <h3 className="font-black text-base text-gray-900 leading-tight">
                          {animal.species}
                        </h3>
                        <p className="text-xs font-bold text-violet-700 mt-0.5">
                          {animal.breed ? `Breed: ${animal.breed}` : "Indigenous Breed"}
                        </p>
                        <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                          ID: #{animal.id.slice(-6).toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-[11px] font-bold">
                      {animal.gender || "Animal"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100 text-center">
                    <div className="bg-gray-50/80 p-2 rounded-xl">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Age</p>
                      <p className="text-xs font-black text-gray-800 mt-0.5">
                        {animal.age ? `${animal.age} Yrs` : "N/A"}
                      </p>
                    </div>
                    <div className="bg-gray-50/80 p-2 rounded-xl">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Weight</p>
                      <p className="text-xs font-black text-gray-800 mt-0.5">
                        {animal.weight ? `${animal.weight} kg` : "N/A"}
                      </p>
                    </div>
                    <div className="bg-gray-50/80 p-2 rounded-xl">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Village</p>
                      <p className="text-xs font-black text-gray-800 mt-0.5 truncate" title={animal.village}>
                        {animal.village}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-gray-400 flex items-center gap-1 font-medium">
                    <MapPin className="w-3 h-3 text-violet-500" />
                    {animal.block ? `${animal.block}, ` : ""}{animal.district}
                  </span>

                  <Link
                    href={`/farmer/report`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-bold rounded-lg border border-violet-100 transition"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Report Sickness</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
