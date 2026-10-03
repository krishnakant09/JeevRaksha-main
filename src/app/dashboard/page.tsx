import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  AlertTriangle,
  Activity,
  CheckCircle,
  ShieldAlert,
  Users,
  ChevronRight,
  MapPin,
  FlaskConical,
  Bot,
  HeartPulse,
  Flame,
  ArrowUpRight,
  TrendingDown,
  Sparkles,
  Calendar,
  Layers,
  PhoneCall
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [
    totalAnimals,
    activeCases,
    highRiskZones,
    mediumRiskCount,
    lowRiskCount,
    totalVaccinations,
    recentReports,
    unreadAlerts,
    totalSamples,
    speciesStats,
    aggregateData,
  ] = await Promise.all([
    prisma.animal.count(),
    prisma.case.count({ where: { status: { not: "CLOSED" } } }),
    prisma.healthReport.count({ where: { riskLevel: "HIGH" } }),
    prisma.healthReport.count({ where: { riskLevel: "MEDIUM" } }),
    prisma.healthReport.count({ where: { riskLevel: "LOW" } }),
    prisma.vaccination.count(),
    prisma.healthReport.findMany({
      include: { animal: true, symptoms: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.alert.findMany({
      where: { isRead: false },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.sample.count(),
    prisma.animal.groupBy({
      by: ["species"],
      _count: { species: true },
      orderBy: { _count: { species: "desc" } },
      take: 5,
    }),
    prisma.healthReport.aggregate({
      _sum: {
        animalsAffected: true,
        deaths: true,
      },
    }),
  ]);

  const totalReports = highRiskZones + mediumRiskCount + lowRiskCount;
  const totalAffected = aggregateData._sum.animalsAffected || 0;
  const totalDeaths = aggregateData._sum.deaths || 0;
  const highRiskPct = totalReports > 0 ? Math.round((highRiskZones / totalReports) * 100) : 0;
  const medRiskPct = totalReports > 0 ? Math.round((mediumRiskCount / totalReports) * 100) : 0;
  const lowRiskPct = totalReports > 0 ? Math.max(0, 100 - highRiskPct - medRiskPct) : 100;

  return (
    <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Command Center Header */}
      <header className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Surveillance Grid Online
            </span>
            <span className="text-xs text-gray-400 font-medium hidden sm:inline">
              National Livestock Health Surveillance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Surveillance Command Center
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
            Real-time epidemiologic telemetry, outbreak cluster tracking & rapid veterinary triage
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/dashboard/map"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-500/20 transition-all hover:scale-[1.02]"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Outbreak Heatmap</span>
          </Link>
          <Link
            href="/dashboard/cases"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 transition"
          >
            <Activity className="w-3.5 h-3.5 text-gray-600" />
            <span>Manage Cases ({activeCases})</span>
          </Link>
          <Link
            href="/farmer/chat"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Vet Assistant</span>
          </Link>
        </div>
      </header>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {/* Active Cases */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-amber-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Active Cases</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">{activeCases}</p>
          <p className="text-[11px] font-semibold text-amber-600 mt-1 flex items-center gap-1">
            <span>In Triage / Review</span>
          </p>
        </div>

        {/* High Risk Hotspots */}
        <div className={`bg-white p-4 sm:p-5 rounded-2xl border ${highRiskZones > 0 ? "border-red-200 bg-red-50/20" : "border-gray-200/80"} shadow-xs hover:border-red-300 transition-all`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${highRiskZones > 0 ? "text-red-600" : "text-gray-500"}`}>
              High Risk
            </span>
            <div className={`w-7 h-7 rounded-lg ${highRiskZones > 0 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"} flex items-center justify-center`}>
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl sm:text-3xl font-black ${highRiskZones > 0 ? "text-red-600" : "text-gray-900"} mt-2`}>
            {highRiskZones}
          </p>
          <p className={`text-[11px] font-semibold ${highRiskZones > 0 ? "text-red-700" : "text-gray-400"} mt-1`}>
            {highRiskZones > 0 ? "Urgent intervention" : "Zero active alerts"}
          </p>
        </div>

        {/* Total Registered Livestock */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Registered</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">{totalAnimals}</p>
          <p className="text-[11px] font-semibold text-blue-600 mt-1">Live in registry</p>
        </div>

        {/* Affected Livestock */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-purple-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Affected</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">{totalAffected}</p>
          <p className="text-[11px] font-semibold text-purple-600 mt-1">
            {totalDeaths > 0 ? `⚠️ ${totalDeaths} deaths logged` : "No mortalities"}
          </p>
        </div>

        {/* Vaccinations */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Vaccinations</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">{totalVaccinations}</p>
          <p className="text-[11px] font-semibold text-emerald-600 mt-1">Inoculation records</p>
        </div>

        {/* Lab Samples */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Lab Samples</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <FlaskConical className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">{totalSamples}</p>
          <p className="text-[11px] font-semibold text-indigo-600 mt-1">Diagnostic queue</p>
        </div>
      </div>

      {/* Two Column Grid: Outbreak Severity Spectrum & Priority Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Outbreak Severity Spectrum (1 Col) */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-violet-600" />
                Risk Severity Breakdown
              </h2>
              <span className="text-xs font-bold text-gray-400">{totalReports} reports</span>
            </div>

            {/* Segmented Risk Bar */}
            <div className="w-full h-3 rounded-full bg-gray-100 flex overflow-hidden mb-4">
              <div
                style={{ width: `${highRiskPct}%` }}
                className="bg-red-500 transition-all duration-500"
                title={`High Risk: ${highRiskPct}%`}
              />
              <div
                style={{ width: `${medRiskPct}%` }}
                className="bg-amber-400 transition-all duration-500"
                title={`Medium Risk: ${medRiskPct}%`}
              />
              <div
                style={{ width: `${lowRiskPct}%` }}
                className="bg-emerald-500 transition-all duration-500"
                title={`Low Risk: ${lowRiskPct}%`}
              />
            </div>

            {/* Legend Stats */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-red-50/60 border border-red-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-xs font-bold text-red-900">Critical / High Risk</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-red-700">{highRiskZones} cases</span>
                  <span className="text-[10px] text-red-500 ml-1.5">({highRiskPct}%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-xs font-bold text-amber-900">Moderate / Medium Risk</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-amber-700">{mediumRiskCount} cases</span>
                  <span className="text-[10px] text-amber-500 ml-1.5">({medRiskPct}%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-emerald-900">Controlled / Low Risk</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-emerald-700">{lowRiskCount} cases</span>
                  <span className="text-[10px] text-emerald-500 ml-1.5">({lowRiskPct}%)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100">
            <Link
              href="/dashboard/map"
              className="text-xs font-bold text-violet-700 hover:text-violet-800 flex items-center justify-between group"
            >
              <span>View spatial outbreak cluster details</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Priority Alerts Strip (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  Active Telemetry & Urgent Alerts
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Automated algorithmic outbreak signals</p>
              </div>
              <Link
                href="/dashboard/alerts"
                className="text-xs font-bold text-violet-700 hover:text-violet-800 flex items-center gap-1"
              >
                <span>All Alerts</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {unreadAlerts.length === 0 ? (
              <div className="p-8 text-center bg-gray-50/60 rounded-xl border border-gray-100">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-xs font-bold text-gray-700">No Pending Urgent Alerts</p>
                <p className="text-[11px] text-gray-400 mt-0.5">All reported syndromic alerts have been reviewed by veterinarians.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {unreadAlerts.map((alert: any) => (
                  <div
                    key={alert.id}
                    className={`p-3.5 sm:p-4 rounded-xl border flex items-start gap-3.5 transition-all ${
                      alert.type === "HIGH_RISK"
                        ? "bg-red-50/80 border-red-200"
                        : "bg-amber-50/80 border-amber-200"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        alert.type === "HIGH_RISK"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xs font-extrabold uppercase tracking-wide ${
                            alert.type === "HIGH_RISK" ? "text-red-800" : "text-amber-800"
                          }`}
                        >
                          {alert.type.replace(/_/g, " ")}
                        </span>
                        <span className="text-[10px] text-gray-500 font-semibold shrink-0">
                          {new Date(alert.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p
                        className={`text-xs mt-1 font-medium leading-relaxed ${
                          alert.type === "HIGH_RISK" ? "text-red-900" : "text-amber-900"
                        }`}
                      >
                        {alert.message}
                      </p>
                      {alert.village && (
                        <p className="text-[11px] text-gray-600 mt-1 font-semibold flex items-center gap-1">
                          <span>📍 {alert.village}</span>
                          {alert.block && <span>· {alert.block}</span>}
                          {alert.district && <span>· {alert.district}</span>}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Operations Bar */}
          <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
              <span className="w-2 h-2 rounded-full bg-violet-600" />
              <span>Rapid Veterinary Action Available</span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/cases"
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
              >
                Assign Field Team
              </Link>
              <Link
                href="/farmer/chat"
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 transition"
              >
                Launch AI Diagnostic
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Species Surveillance Distribution & Fast Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Monitored Species Profile */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            Livestock Demographics
          </h2>
          <p className="text-xs text-gray-400 mb-4">Species breakdown in current surveillance database</p>

          <div className="space-y-3">
            {speciesStats.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No animals registered yet</p>
            ) : (
              speciesStats.map((item: any) => {
                const pct = totalAnimals > 0 ? Math.round((item._count.species / totalAnimals) * 100) : 0;
                return (
                  <div key={item.species} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-gray-700">
                      <span>{item.species}</span>
                      <span className="font-extrabold text-gray-900">
                        {item._count.species} <span className="text-[10px] text-gray-400 font-normal">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <Link
              href="/farmer/animals"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center justify-between"
            >
              <span>Explore Livestock Registry</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Recent Health Reports Feed (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-violet-600" />
                  Recent Health Incident Reports
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Live surveillance telemetry from field cases</p>
              </div>
              <Link
                href="/dashboard/cases"
                className="text-xs font-bold text-violet-700 hover:text-violet-800 flex items-center gap-1"
              >
                <span>View All Cases</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentReports.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                <p className="text-xs font-bold">No health incident reports found</p>
                <Link
                  href="/farmer/report"
                  className="text-xs text-violet-600 hover:underline mt-1 inline-block"
                >
                  File First Surveillance Report →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 overflow-x-auto">
                {recentReports.map((r: any) => (
                  <div
                    key={r.id}
                    className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/80 transition"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-gray-900">
                          {r.animal?.species || "Livestock"}
                        </span>
                        {r.animal?.breed && (
                          <span className="text-[11px] text-gray-500 font-medium">({r.animal.breed})</span>
                        )}
                        <span className="text-[10px] text-gray-400 font-mono">ID: {r.id.slice(0, 8)}</span>
                      </div>

                      <p className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-700">📍 {r.locationVillage}, {r.locationBlock}</span>
                        <span>·</span>
                        <span className="text-purple-700 font-bold">{r.animalsAffected} affected</span>
                        {r.deaths > 0 && (
                          <>
                            <span>·</span>
                            <span className="text-red-600 font-black">⚠️ {r.deaths} mortalities</span>
                          </>
                        )}
                        <span>·</span>
                        <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                      </p>

                      {r.symptoms?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {r.symptoms.slice(0, 4).map((s: any) => (
                            <span
                              key={s.id}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200/60"
                            >
                              {s.name}
                            </span>
                          ))}
                          {r.symptoms.length > 4 && (
                            <span className="text-[10px] text-gray-400 self-center">
                              +{r.symptoms.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold tracking-wide ${
                          r.riskLevel === "HIGH"
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : r.riskLevel === "MEDIUM"
                            ? "bg-amber-100 text-amber-700 border border-amber-200"
                            : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {r.riskLevel} · {r.riskScore}/100
                      </span>
                      <Link
                        href={`/dashboard/cases`}
                        className="text-xs font-bold text-violet-600 hover:text-violet-800 hover:underline"
                      >
                        Triage Case →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Automated NLP & Triage via Sarvam 105B Indic Model</span>
            <Link href="/farmer/report" className="text-violet-700 font-bold hover:underline">
              Submit Disease Incident →
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Action Station Card */}
      <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-purple-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-violet-300 bg-white/10 px-2 py-0.5 rounded-full">
              Rapid Response Protocol
            </span>
            <h2 className="text-lg sm:text-xl font-black mt-2 text-white">
              Official Veterinary Outbreak Intervention Station
            </h2>
            <p className="text-xs sm:text-sm text-violet-200 mt-1 max-w-2xl">
              Dispatch rapid field verification workers, send farmer SMS broadcast alerts, or review pending laboratory pathology cultures.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/dashboard/map"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-violet-900 hover:bg-violet-50 transition shadow-sm"
            >
              Open Outbreak Map
            </Link>
            <Link
              href="/dashboard/cases"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-violet-700 hover:bg-violet-600 text-white transition border border-violet-500/40"
            >
              Assign Field Visit
            </Link>
            <Link
              href="/dashboard/lab"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition border border-white/20"
            >
              Lab Pathology
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
