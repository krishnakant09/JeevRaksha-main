"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, AlertTriangle, ShieldAlert } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-700",
  FIELD_VISIT: "bg-purple-100 text-purple-700",
  TREATMENT: "bg-orange-100 text-orange-700",
  LAB_TEST: "bg-indigo-100 text-indigo-700",
  RECOVERED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-600",
  REFERRED: "bg-red-100 text-red-700",
};

export default function CasesList({ initialCases }: { initialCases: any[] }) {
  const router = useRouter();
  const [cases, setCases] = useState(initialCases);
  const [user, setUser] = useState<any>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("jeevraksha_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const updateCase = async (id: string, updates: { status?: string; riskLevel?: string }) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/cases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        // Optimistic update locally
        setCases((prev) =>
          prev.map((c) => {
            if (c.id === id) {
              return {
                ...c,
                status: updates.status || c.status,
                healthReport: c.healthReport
                  ? { ...c.healthReport, riskLevel: updates.riskLevel || c.healthReport.riskLevel }
                  : null,
              };
            }
            return c;
          })
        );
        router.refresh();
      }
    } catch (e) {
      console.error(e);
      alert("Failed to update case");
    }
    setLoadingId(null);
  };

  if (cases.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
        <p className="text-gray-400 text-lg font-medium">No cases found</p>
        <p className="text-gray-400 text-sm mt-1">Cases are created automatically when a health report is submitted.</p>
      </div>
    );
  }

  const isAdminOrVet = user?.role === "ADMIN" || user?.role === "VETERINARIAN";

  return (
    <div className="space-y-4">
      {cases.map((c: any) => (
        <div key={c.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
          <div className="flex items-start justify-between p-5 gap-4 flex-col md:flex-row">
            <div className="min-w-0 flex-1 w-full">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-bold text-gray-800 text-lg">{c.animal.species} ({c.animal.breed || "Unknown"})</span>
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${STATUS_COLORS[c.status] || "bg-gray-100 text-gray-700"}`}>
                  {c.status.replace("_", " ")}
                </span>
                {c.healthReport?.riskLevel && (
                  <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold flex items-center gap-1 ${
                    c.healthReport.riskLevel === "HIGH" ? "bg-red-100 text-red-700 border border-red-200" :
                    c.healthReport.riskLevel === "MEDIUM" ? "bg-yellow-100 text-yellow-700 border border-yellow-200" :
                    "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  }`}>
                    {c.healthReport.riskLevel === "HIGH" && <ShieldAlert className="w-3 h-3" />}
                    {c.healthReport.riskLevel} RISK
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-500 mt-2 flex items-center gap-1.5 font-medium">
                📍 {c.animal.village}, {c.animal.block}
                <span className="text-gray-300">|</span>
                🩺 {c.veterinarian ? `Dr. ${c.veterinarian.name}` : "Unassigned"}
                <span className="text-gray-300">|</span>
                📅 {new Date(c.createdAt).toLocaleDateString()}
              </p>
              
              {c.healthReport?.symptoms?.length > 0 && (
                <p className="text-sm text-gray-600 mt-2 bg-gray-50 inline-block px-3 py-1.5 rounded-lg border border-gray-100">
                  <span className="font-semibold text-gray-700">Symptoms:</span> {c.healthReport.symptoms.map((s: any) => s.name).join(", ")}
                </p>
              )}
            </div>
            
            <div className="flex flex-col items-end shrink-0 w-full md:w-auto gap-3">
              <div className="text-right text-xs text-gray-400 w-full">
                <p className="font-mono bg-gray-50 px-2 py-1 rounded inline-block">ID: {c.id.substring(0, 8)}</p>
              </div>
              
              {/* Admin / Vet Controls */}
              {isAdminOrVet && (
                <div className="flex flex-col gap-2 w-full md:w-48 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Manage Case</p>
                  
                  <select
                    className="w-full text-xs font-semibold px-2 py-1.5 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50 cursor-pointer"
                    value={c.status}
                    disabled={loadingId === c.id}
                    onChange={(e) => updateCase(c.id, { status: e.target.value })}
                  >
                    <option value="NEW">New Case</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="FIELD_VISIT">Field Visit</option>
                    <option value="TREATMENT">Treatment</option>
                    <option value="LAB_TEST">Lab Test</option>
                    <option value="RECOVERED">Recovered</option>
                    <option value="CLOSED">Close Case</option>
                  </select>
                  
                  {c.healthReport && (
                    <select
                      className="w-full text-xs font-semibold px-2 py-1.5 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50 cursor-pointer"
                      value={c.healthReport.riskLevel}
                      disabled={loadingId === c.id}
                      onChange={(e) => updateCase(c.id, { riskLevel: e.target.value })}
                    >
                      <option value="LOW">Low Priority</option>
                      <option value="MEDIUM">Medium Priority</option>
                      <option value="HIGH">High Priority</option>
                    </select>
                  )}
                  
                  {loadingId === c.id && (
                    <div className="flex items-center justify-center gap-1 text-xs text-violet-600 mt-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Updating...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
