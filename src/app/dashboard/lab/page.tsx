import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SAMPLE_STATUS_COLORS: Record<string, string> = {
  COLLECTED: "bg-blue-100 text-blue-700",
  SENT_TO_LAB: "bg-yellow-100 text-yellow-700",
  RECEIVED: "bg-purple-100 text-purple-700",
  TESTING: "bg-orange-100 text-orange-700",
  RESULT_AVAILABLE: "bg-green-100 text-green-700",
};

export default async function LabPage() {
  const samples = await prisma.sample.findMany({
    include: {
      animal: true,
      laboratory: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Laboratory Samples</h1>
          <p className="text-sm text-gray-500 mt-0.5">{samples.length} total sample{samples.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {samples.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-lg font-medium">No samples found</p>
          <p className="text-gray-400 text-sm mt-1">Lab samples are collected and logged by field veterinarians.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {["Sample ID", "Type", "Animal", "Village", "Laboratory", "Status", "Result", "Collected"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {samples.map((s: any) => (
                <tr key={s.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-4 text-xs font-mono text-gray-500">{s.id.substring(0, 8)}</td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-800">{s.sampleType}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{s.animal.species} ({s.animal.breed || "?"})</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{s.animal.village}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{s.laboratory?.name || "—"}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${SAMPLE_STATUS_COLORS[s.status] || "bg-gray-100 text-gray-700"}`}>
                      {s.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold">
                    {s.result ? (
                      <span className="text-green-700">{s.result}</span>
                    ) : (
                      <span className="text-gray-400">Pending</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-400">{new Date(s.collectionDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
