import { prisma } from "@/lib/prisma";
import CasesList from "./CasesList";

export const dynamic = "force-dynamic";

export default async function CasesPage() {
  const cases = await prisma.case.findMany({
    include: {
      animal: true,
      veterinarian: { select: { id: true, name: true } },
      healthReport: {
        include: { symptoms: true },
      },
      treatments: { orderBy: { createdAt: "desc" }, take: 1 },
      samples: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Case Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{cases.length} total case{cases.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <CasesList initialCases={cases} />
    </div>
  );
}
