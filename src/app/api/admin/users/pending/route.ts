import { NextResponse } from "next/server";
import { getAllVets } from "@/lib/user-db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "ALL"; // ALL, PENDING_REVIEW, APPROVED, REJECTED

    const allVets = await getAllVets(filter);
    const pendingOnly = await getAllVets("PENDING_REVIEW");

    return NextResponse.json({
      success: true,
      vets: allVets,
      pendingCount: pendingOnly.length,
      totalCount: allVets.length,
    });
  } catch (err: any) {
    console.error("Error in GET /api/admin/users/pending:", err);
    return NextResponse.json(
      { error: "Failed to fetch veterinary applications.", details: err?.message },
      { status: 500 }
    );
  }
}
