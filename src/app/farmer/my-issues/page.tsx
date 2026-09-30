"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  Clock,
  CheckCircle,
  PlusCircle,
  Loader2,
  MapPin,
  Calendar,
  Activity,
  ShieldAlert,
  ChevronRight,
  Stethoscope,
  Filter
} from "lucide-react";
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

export default function MyIssuesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "RESOLVED">("ALL");

  useEffect(() => {
    const stored = localStorage.getItem("jeevraksha_user");
    if (!stored) {
      router.push("/login");
      return;
    }
    const u = JSON.parse(stored);
    setUser(u);

    fetch(`/api/my-issues?userId=${u.id}`)
      .then((r) => r.json())
      .then((data) => {
        setIssues(data.issues || []);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [router]);

  const filteredIssues = issues.filter((issue) => {
    const caseStatus = issue.cases?.[0]?.status;
    const isResolved = caseStatus === "CLOSED" || caseStatus === "RECOVERED";
    if (filter === "ACTIVE") return !isResolved;
    if (filter === "RESOLVED") return isResolved;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f5f4fb] pb-24 md:pb-16">
      <FarmerNav userName={user?.name} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📋</span>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                My Reported Cases & Issues
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
              मेरी दर्ज रिपोर्टें • Live Veterinary Surveillance & Triage Tracker
            </p>
          </div>

          <Link
            href="/farmer/report"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-violet-200 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Report New Issue</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          {[
            { id: "ALL", label: "All Reports", count: issues.length },
            {
              id: "ACTIVE",
              label: "Active Cases",
              count: issues.filter((i) => i.cases?.[0]?.status !== "CLOSED" && i.cases?.[0]?.status !== "RECOVERED").length,
            },
            {
              id: "RESOLVED",
              label: "Resolved",
              count: issues.filter((i) => i.cases?.[0]?.status === "CLOSED" || i.cases?.[0]?.status === "RECOVERED").length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                filter === tab.id
                  ? "bg-violet-600 text-white shadow-xs"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  filter === tab.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-violet-600 animate-spin mb-3" />
            <p className="text-sm font-bold text-gray-500">Retrieving case updates...</p>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 shadow-xs border border-gray-100 text-center">
            <div className="w-20 h-20 bg-violet-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-4xl">
              🌿
            </div>
            <h2 className="text-lg font-bold text-gray-900">No Reports in this View</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-md mx-auto">
              Whenever you file an animal sickness report, its triage status, vet visits, and recovery milestones appear here in real-time.
            </p>
            <Link
              href="/farmer/report"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl shadow-md shadow-violet-200 transition"
            >
              <PlusCircle className="w-4 h-4" />
              File Disease Report
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIssues.map((issue) => {
              const isHigh = issue.riskLevel === "HIGH";
              const isMed = issue.riskLevel === "MEDIUM";
              const currentCase = issue.cases?.[0];
              const isResolved = currentCase?.status === "CLOSED" || currentCase?.status === "RECOVERED";

              return (
                <div
                  key={issue.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 hover:shadow-md hover:border-violet-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center text-3xl shrink-0">
                      {getSpeciesEmoji(issue.animal?.species)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isHigh
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : isMed
                              ? "bg-amber-100 text-amber-700 border border-amber-200"
                              : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {issue.riskLevel} Risk ({issue.riskScore}/100)
                        </span>

                        <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(issue.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-base text-gray-900 leading-tight">
                        {issue.animal?.species} {issue.animal?.breed ? `(${issue.animal.breed})` : ""}
                      </h3>

                      {/* Symptoms badges */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {issue.symptoms?.map((s: any) => (
                          <span
                            key={s.id || s.name}
                            className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[11px] font-semibold"
                          >
                            {s.name}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500 font-medium">
                        <span className="flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-violet-500" />
                          {issue.animalsAffected} affected
                          {issue.deaths > 0 && (
                            <strong className="text-red-600"> • {issue.deaths} dead</strong>
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-violet-500" />
                          {issue.locationVillage}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions Box */}
                  <div className="md:border-l md:border-gray-100 md:pl-6 md:w-56 shrink-0 flex flex-col justify-center">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1.5 tracking-wider">
                      Surveillance Status
                    </p>

                    {!currentCase ? (
                      <div className="flex items-center gap-2 text-amber-700 font-bold bg-amber-50 px-3 py-2 rounded-xl text-xs border border-amber-100">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>Triage Review</span>
                      </div>
                    ) : isResolved ? (
                      <div className="flex items-center gap-2 text-emerald-700 font-bold bg-emerald-50 px-3 py-2 rounded-xl text-xs border border-emerald-100">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Case Resolved</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-violet-700 font-bold bg-violet-50 px-3 py-2 rounded-xl text-xs border border-violet-100">
                        <Activity className="w-4 h-4 text-violet-600 animate-pulse" />
                        <span>Active Case ({currentCase.status})</span>
                      </div>
                    )}

                    {currentCase && (
                      <p className="text-[10px] text-gray-400 mt-2 font-mono">
                        Case ID: #{currentCase.id.slice(-6).toUpperCase()}
                      </p>
                    )}

                    <Link
                      href="/farmer/chat"
                      className="mt-3 text-xs font-bold text-violet-600 hover:text-violet-800 inline-flex items-center gap-1"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>Ask AI Doctor</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
