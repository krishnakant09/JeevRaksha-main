import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { upsertOfficerUser, logAudit } from "@/lib/user-db";

function normalizeIndianPhone(rawPhone: string): string | null {
  const digits = (rawPhone || "").replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return null;
}

// GET /api/invites/accept - Pre-check invite code
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = (searchParams.get("code") || "").trim().toUpperCase();

  if (!code) {
    return NextResponse.json({ error: "Invite code is required." }, { status: 400 });
  }

  // Pre-seeded or database invite
  let invite: any = null;
  try {
    const rows: any[] = await prisma.$queryRawUnsafe(
      "SELECT * FROM Invite WHERE code = ? LIMIT 1",
      code
    );
    if (rows && rows.length > 0) invite = rows[0];
  } catch {}

  // Allow standard demo government invite codes
  if (!invite && (code === "MAHA-GOV-2026" || code === "MAHA-VET-ADMIN" || code === "SIH-OFFICER-PUNE")) {
    return NextResponse.json({
      valid: true,
      role: code.includes("ADMIN") ? "ADMIN" : "DISTRICT_OFFICER",
      district: "Pune",
      taluka: "Haveli",
      message: "Valid Departmental Authorization Code",
    });
  }

  if (!invite) {
    return NextResponse.json({ error: "Invalid Departmental Invite Code." }, { status: 404 });
  }

  if (invite.usedAt) {
    return NextResponse.json({ error: "This invite code has already been redeemed." }, { status: 410 });
  }

  if (new Date() > new Date(invite.expiresAt)) {
    return NextResponse.json({ error: "This invite code has expired. Request a new invite from state administration." }, { status: 410 });
  }

  return NextResponse.json({
    valid: true,
    role: invite.role,
    district: invite.jurisdictionDistrict,
    taluka: invite.jurisdictionTaluka,
    message: "Valid Departmental Authorization Code",
  });
}

// POST /api/invites/accept - Complete officer registration
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const code = (body.code || "").trim().toUpperCase();
    const phone = normalizeIndianPhone(body.phone);
    const name = (body.name || "").trim();
    const designation = (body.designation || "").trim();

    if (!code) {
      return NextResponse.json({ error: "Invite code is required." }, { status: 400 });
    }

    if (!phone) {
      return NextResponse.json({ error: "Valid 10-digit mobile number is required." }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: "Official name is required." }, { status: 400 });
    }

    let role = "DISTRICT_OFFICER";
    let district = "Pune";
    let taluka = "Haveli";

    if (code === "MAHA-GOV-2026" || code === "MAHA-VET-ADMIN" || code === "SIH-OFFICER-PUNE") {
      role = code.includes("ADMIN") ? "ADMIN" : "DISTRICT_OFFICER";
    } else {
      let invite: any = null;
      try {
        const rows: any[] = await prisma.$queryRawUnsafe(
          "SELECT * FROM Invite WHERE code = ? LIMIT 1",
          code
        );
        if (rows && rows.length > 0) invite = rows[0];
      } catch {}

      if (!invite) {
        return NextResponse.json({ error: "Invalid Departmental Invite Code." }, { status: 404 });
      }
      if (invite.usedAt) {
        return NextResponse.json({ error: "This invite code has already been redeemed." }, { status: 410 });
      }
      if (new Date() > new Date(invite.expiresAt)) {
        return NextResponse.json({ error: "This invite code has expired." }, { status: 410 });
      }
      role = invite.role;
      district = invite.jurisdictionDistrict || "Pune";
      taluka = invite.jurisdictionTaluka || "Haveli";

      // Mark invite redeemed
      await prisma.$executeRawUnsafe(
        "UPDATE Invite SET usedAt = ?, usedByPhone = ? WHERE code = ?",
        new Date().toISOString(),
        phone,
        code
      ).catch(() => {});
    }

    // Upsert officer user
    const fullName = designation ? `${name} (${designation})` : name;
    const user = await upsertOfficerUser({
      phone,
      name: fullName,
      role,
      district,
      taluka,
    });

    // Audit log
    await logAudit(
      user.id,
      "OFFICER_INVITE_REDEEMED",
      `Officer ${fullName} activated with role ${role} in ${district}/${taluka}`
    );

    const sessionToken = crypto.randomBytes(32).toString("hex");

    return NextResponse.json({
      success: true,
      message: "Government official account activated successfully.",
      token: sessionToken,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        status: user.status,
        jurisdictionDistrict: user.jurisdictionDistrict,
        jurisdictionTaluka: user.jurisdictionTaluka,
      },
    });
  } catch (err: any) {
    console.error("Error in /api/invites/accept:", err);
    return NextResponse.json(
      { error: "Failed to redeem officer invite. Please try again.", details: err?.message },
      { status: 500 }
    );
  }
}
