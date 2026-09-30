import { prisma } from "@/lib/prisma";
import MapWrapper from "../../../../components/maps/MapWrapper";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const reports = await prisma.healthReport.findMany({
    include: { symptoms: true },
    orderBy: { createdAt: "desc" },
  });

  const highRisk = reports.filter((r: any) => r.riskLevel === "HIGH").length;
  const mediumRisk = reports.filter((r: any) => r.riskLevel === "MEDIUM").length;

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Geospatial Risk Map</h1>
          <p className="text-sm text-gray-500 mt-0.5">Outbreak cluster visualization — {reports.length} active report{reports.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> HIGH ({highRisk})</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span> MEDIUM ({mediumRisk})</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> LOW ({reports.length - highRisk - mediumRisk})</span>
        </div>
      </div>

      {reports.length === 0 && (
        <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-lg text-sm">
          No health reports in the database. Submit a report to see outbreak clusters on the map.
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <MapWrapper reports={reports} />
      </div>

      {/* Report list below map */}
      {reports.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Report Details</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {reports.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="font-semibold text-sm text-gray-800">{r.locationVillage}, {r.locationBlock}</p>
                  <p className="text-xs text-gray-500">{r.animalsAffected} affected · {r.deaths} deaths · {new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${r.riskLevel === "HIGH" ? "bg-red-100 text-red-700" : r.riskLevel === "MEDIUM" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                  {r.riskLevel} · {r.riskScore}/100
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
