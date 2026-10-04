import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  upsertFarmerUser,
  saveFarmerProfile,
  saveAnimalSummaries,
  recordConsent,
  logAudit,
} from "@/lib/user-db";

function normalizeIndianPhone(rawPhone: string): string | null {
  const digits = (rawPhone || "").replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const phone = normalizeIndianPhone(body.phone);
    const name = (body.name || "").trim();
    const district = (body.district || "").trim();
    const taluka = (body.taluka || "").trim();
    const village = (body.village || "").trim();
    const language = body.language || "mr";
    const animals = Array.isArray(body.animals) ? body.animals : [];
    const consent = body.consent || {};

    if (!phone) {
      return NextResponse.json({ error: "Valid 10-digit mobile number is required." }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: "Farmer name is required." }, { status: 400 });
    }

    if (!district || !taluka) {
      return NextResponse.json({ error: "District and Taluka are required for jurisdiction assignment." }, { status: 400 });
    }

    // Required consent: dataTreatment must be true
    if (!consent.dataTreatment) {
      return NextResponse.json(
        { error: "You must accept the mandatory data treatment terms to register." },
        { status: 400 }
      );
    }

    // Create or update farmer user
    const user = await upsertFarmerUser({
      phone,
      name,
      district,
      taluka,
      village,
      language,
    });

    // Save farmer profile
    await saveFarmerProfile(user.id, district, taluka, village);

    // Save animal summaries
    if (animals.length > 0) {
      await saveAnimalSummaries(user.id, animals);
    }

    // Record consents
    await recordConsent(user.id, "DATA_TREATMENT", true);
    if (consent.mediaLocationSharing) {
      await recordConsent(user.id, "MEDIA_LOCATION_SHARING", true);
    }

    // Audit log
    await logAudit(
      user.id,
      "SIGNUP_FARMER_COMPLETED",
      `Farmer ${name} registered in ${village || taluka}, ${district}`
    );

    const sessionToken = crypto.randomBytes(32).toString("hex");

    return NextResponse.json({
      success: true,
      message: "Farmer account created successfully.",
      token: sessionToken,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        status: user.status,
        language: user.language,
        district: user.jurisdictionDistrict,
        taluka: user.jurisdictionTaluka,
        village: user.jurisdictionVillage,
      },
    });
  } catch (err: any) {
    console.error("Error in /api/signup/farmer:", err);
    return NextResponse.json(
      { error: "Failed to register farmer. Please try again.", details: err?.message },
      { status: 500 }
    );
  }
}
