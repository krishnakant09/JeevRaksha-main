import { NextResponse } from "next/server";
import { rejectVet } from "@/lib/user-db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const reason = (body.reason || "Council registration credentials could not be verified.").trim();
    const reviewerName = body.reviewerName || "State Veterinary Administrator";

    if (!id) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    const success = await rejectVet(id, reason, reviewerName);

    if (!success) {
      return NextResponse.json({ error: "Failed to reject veterinarian application." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Veterinarian application rejected.",
      userId: id,
      newStatus: "REJECTED",
      reason,
    });
  } catch (err: any) {
    console.error("Error rejecting vet:", err);
    return NextResponse.json(
      { error: "Internal server error during rejection.", details: err?.message },
      { status: 500 }
    );
  }
}
