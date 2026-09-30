import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AlertTriangle, Activity, CheckCircle, ShieldAlert, Users, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [totalAnimals, activeCases, highRiskZones, totalVaccinations, recentReports, unreadAlerts] = await Promise.all([
    prisma.animal.count(),
    prisma.case.count({ where: { status: { not: "CLOSED" } } }),
    prisma.healthReport.count({ where: { riskLevel: "HIGH" } }),
    prisma.vaccination.count(),
    prisma.healthReport.findMany({
      include: { animal: true, symptoms: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.alert.findMany({
      where: { isRead: false },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  return (
    <main className="p-6 md:p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Command Center</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time animal health surveillance</p>
        </div>
        {unreadAlerts.length > 0 && (
          <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-bold animate-pulse">
            {unreadAlerts.length} NEW ALERT{unreadAlerts.length > 1 ? "S" : ""}
          </span>
        )}
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Animals", value: totalAnimals, icon: Users, color: "blue" },
          { label: "Active Cases", value: activeCases, icon: Activity, color: "orange" },
          { label: "High Risk Zones", value: highRiskZones, icon: AlertTriangle, color: highRiskZones > 0 ? "red" : "gray" },
          { label: "Vaccinations", value: totalVaccinations, icon: CheckCircle, color: "green" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`bg-white p-5 rounded-xl shadow-sm border ${color === "red" && value > 0 ? "border-red-200" : "border-gray-100"} flex items-center justify-between`}>
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide ${color === "red" && value > 0 ? "text-red-500" : "text-gray-500"}`}>{label}</p>
              <p className={`text-3xl font-bold mt-1 ${color === "red" && value > 0 ? "text-red-600" : "text-gray-900"}`}>{value}</p>
            </div>
            <Icon className={`w-10 h-10 opacity-20 text-${color}-500`} />
          </div>
        ))}
      </div>

      {/* Alerts */}
      {unreadAlerts.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-gray-800">Priority Alerts</h2>
            <Link href="/dashboard/alerts" className="text-sm text-violet-700 hover:underline flex items-center">View all <ChevronRight className="w-4 h-4 ml-1" /></Link>
          </div>
          <div className="space-y-3">
            {unreadAlerts.map((alert: any) => (
              <div key={alert.id} className={`p-5 rounded-xl border flex items-start gap-4 ${alert.type === "HIGH_RISK" ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"}`}>
                <ShieldAlert className={`w-6 h-6 flex-shrink-0 mt-0.5 ${alert.type === "HIGH_RISK" ? "text-red-600" : "text-yellow-600"}`} />
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm ${alert.type === "HIGH_RISK" ? "text-red-800" : "text-yellow-800"}`}>{alert.type.replace("_", " ")}</p>
                  <p className={`text-sm mt-0.5 ${alert.type === "HIGH_RISK" ? "text-red-700" : "text-yellow-700"}`}>{alert.message}</p>
                  {alert.village && <p className="text-xs text-gray-500 mt-1">📍 {alert.village}, {alert.block}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Reports */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Recent Health Reports</h2>
          <Link href="/dashboard/cases" className="text-sm text-violet-700 hover:underline flex items-center">All cases <ChevronRight className="w-4 h-4 ml-1" /></Link>
        </div>
        {recentReports.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="font-medium">No health reports yet</p>
            <Link href="/farmer/report" className="text-sm text-violet-700 hover:underline mt-2 inline-block">Submit first report →</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentReports.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-800 text-sm">{r.animal.species} ({r.animal.breed || "Unknown"})</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    📍 {r.locationVillage} · {r.animalsAffected} affected{r.deaths > 0 ? ` · ⚠️ ${r.deaths} deaths` : ""} · {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                  {r.symptoms?.length > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">{r.symptoms.map((s: any) => s.name).join(", ")}</p>
                  )}
                </div>
                <span className={`ml-4 px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                  r.riskLevel === "HIGH" ? "bg-red-100 text-red-700" :
                  r.riskLevel === "MEDIUM" ? "bg-yellow-100 text-yellow-700" :
                  "bg-green-100 text-green-700"
                }`}>
                  {r.riskLevel} · {r.riskScore}/100
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
