import { NextResponse } from "next/server";
import { approveVet } from "@/lib/user-db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const reviewerName = body.reviewerName || "State Veterinary Administrator";

    if (!id) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    const success = await approveVet(id, reviewerName);

    if (!success) {
      return NextResponse.json({ error: "Failed to approve veterinarian." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Veterinarian application approved successfully. Doctor can now receive clinical cases.",
      userId: id,
      newStatus: "APPROVED",
    });
  } catch (err: any) {
    console.error("Error approving vet:", err);
    return NextResponse.json(
      { error: "Internal server error during approval.", details: err?.message },
      { status: 500 }
    );
  }
}
