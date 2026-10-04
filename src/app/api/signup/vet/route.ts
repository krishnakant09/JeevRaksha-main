import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  upsertVetUser,
  saveVetProfile,
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
    const vetType = body.role === "PARA_VET" ? "PARA_VET" : "VET";
    const registrationNo = (body.registrationNo || "").trim();
    const council = (body.council || "Maharashtra State Veterinary Council (MSVC)").trim();
    const certificateUrl = body.certificateUrl || "";
    const serviceDistrict = (body.serviceDistrict || "").trim();
    const serviceTaluka = (body.serviceTaluka || "").trim();
    const serviceVillages = (body.serviceVillages || "").trim();
    const languages = (body.languages || "mr,hi,en").toString();
    const availability = (body.availability || "Full Time").trim();
    const consent = body.consent || {};
    const language = body.language || "mr";

    if (!phone) {
      return NextResponse.json({ error: "Valid 10-digit mobile number is required." }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: "Doctor/Para-vet name is required." }, { status: 400 });
    }

    if (!registrationNo) {
      return NextResponse.json({ error: "Veterinary Council registration number is required." }, { status: 400 });
    }

    if (!certificateUrl) {
      return NextResponse.json({ error: "Registration certificate document upload is required." }, { status: 400 });
    }

    if (!serviceDistrict || !serviceTaluka) {
      return NextResponse.json({ error: "Service District and Taluka are required." }, { status: 400 });
    }

    if (!consent.dataTreatment) {
      return NextResponse.json(
        { error: "You must accept the mandatory verification terms to submit registration." },
        { status: 400 }
      );
    }

    // Upsert vet user with PENDING_REVIEW status
    const user = await upsertVetUser({
      phone,
      name,
      registrationNo,
      district: serviceDistrict,
      taluka: serviceTaluka,
      language,
    });

    // Save vet profile with certificate
    await saveVetProfile({
      userId: user.id,
      vetType,
      registrationNo,
      council,
      certificateUrl,
      serviceDistrict,
      serviceTaluka,
      serviceVillages,
      languages,
      availability,
    });

    // Record consent
    await recordConsent(user.id, "DATA_TREATMENT", true);

    // Audit log
    await logAudit(
      user.id,
      "SIGNUP_VET_SUBMITTED",
      `Vet application submitted by Dr. ${name}, Reg: ${registrationNo} (${serviceDistrict})`
    );

    const sessionToken = crypto.randomBytes(32).toString("hex");

    return NextResponse.json({
      success: true,
      message: "Application submitted. Your account is under verification.",
      token: sessionToken,
      status: "PENDING_REVIEW",
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        status: user.status,
        registrationNo: user.registrationNo,
        serviceDistrict,
        serviceTaluka,
      },
    });
  } catch (err: any) {
    console.error("Error in /api/signup/vet:", err);
    return NextResponse.json(
      { error: "Failed to submit vet registration. Please try again.", details: err?.message },
      { status: 500 }
    );
  }
}
