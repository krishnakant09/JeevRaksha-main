import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyOtpHash } from "@/lib/sms";
import { findOtpAttempt, removeOtpAttempt } from "@/lib/otp-db";
import { verifyOtpChallengeToken } from "@/lib/otp-token";
import crypto from "crypto";

function normalizeIndianPhone(rawPhone: string): string | null {
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawPhone = body.phone || "";
    const otpCandidate = (body.otp || "").toString().trim();

    const phone = normalizeIndianPhone(rawPhone);
    if (!phone) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    if (!otpCandidate || otpCandidate.length !== 6 || !/^\d{6}$/.test(otpCandidate)) {
      return NextResponse.json(
        { error: "Please enter a valid 6-digit numeric OTP." },
        { status: 400 }
      );
    }

    // Find OTP attempt record from memory or database
    let attempt = await findOtpAttempt(phone);

    // If not found in DB or memory (e.g. serverless stateless request across instances), check challenge token
    if (!attempt) {
      const cookieHeader = req.headers.get("cookie") || "";
      const cookieTokenMatch = cookieHeader.match(/jeevraksha_otp_challenge=([^;]+)/);
      const tokenCandidate = body.otpChallengeToken || (cookieTokenMatch ? cookieTokenMatch[1] : null);

      if (tokenCandidate) {
        const decoded = verifyOtpChallengeToken(tokenCandidate);
        if (decoded && decoded.phone === phone) {
          attempt = {
            id: `token_${Date.now()}`,
            phone: decoded.phone,
            hashedCode: decoded.hashedCode,
            expiresAt: new Date(decoded.expiresAt),
            attempts: 1,
            createdAt: new Date(),
          };
        }
      }
    }

    if (!attempt) {
      return NextResponse.json(
        { error: "No active OTP request found. Please request a new OTP." },
        { status: 404 }
      );
    }

    // Check expiration
    if (new Date() > new Date(attempt.expiresAt)) {
      await removeOtpAttempt(phone);
      return NextResponse.json(
        { error: "OTP has expired. Please request a new code." },
        { status: 410 }
      );
    }

    // Verify cryptographic hash
    const isValid = verifyOtpHash(otpCandidate, attempt.hashedCode);
    if (!isValid) {
      return NextResponse.json(
        { error: "Incorrect OTP. Please check the code and try again." },
        { status: 400 }
      );
    }

    // Consume OTP so it cannot be replayed
    await removeOtpAttempt(phone);

    // Check if user already exists in User table
    let existingUser: any = null;
    try {
      existingUser = await prisma.user.findFirst({
        where: { phone },
        include: {
          farmerProfile: true,
          vetProfile: true,
          animalsSummary: true,
        },
      });
    } catch {
      // Fallback query if relations aren't dynamically loaded in cached client
      const rawUsers: any[] = await prisma.$queryRawUnsafe(
        "SELECT * FROM User WHERE phone = ? LIMIT 1",
        phone
      );
      if (rawUsers && rawUsers.length > 0) {
        existingUser = rawUsers[0];
      }
    }

    // Create session token
    const token = crypto.randomBytes(32).toString("hex");

    if (existingUser) {
      // Check status
      if (existingUser.status === "SUSPENDED" || existingUser.status === "REJECTED") {
        return NextResponse.json(
          {
            error: `Your account is ${existingUser.status.toLowerCase()}. Please contact department administration.`,
          },
          { status: 403 }
        );
      }

      // Log successful login audit
      await prisma.auditLog.create({
        data: {
          userId: existingUser.id,
          action: "AUTH_LOGIN_OTP_SUCCESS",
          details: `Phone ${phone} logged in via OTP`,
        },
      }).catch(() => {});

      const response = NextResponse.json({
        success: true,
        isNew: false,
        token,
        user: {
          id: existingUser.id,
          phone: existingUser.phone,
          name: existingUser.name,
          role: existingUser.role,
          status: existingUser.status,
          language: existingUser.language || "mr",
          jurisdictionDistrict: existingUser.jurisdictionDistrict,
          jurisdictionTaluka: existingUser.jurisdictionTaluka,
          jurisdictionVillage: existingUser.jurisdictionVillage,
          farmerProfile: existingUser.farmerProfile,
          vetProfile: existingUser.vetProfile,
        },
      });
      response.cookies.delete("jeevraksha_otp_challenge");
      return response;
    }

    // User is new: allow client to proceed to role and detail collection
    const response = NextResponse.json({
      success: true,
      isNew: true,
      phone,
      token,
      message: "Phone verified successfully. Please proceed with account details.",
    });
    response.cookies.delete("jeevraksha_otp_challenge");
    return response;
  } catch (err: any) {
    console.error("Error in /api/auth/otp/verify:", err);
    return NextResponse.json(
      { error: "Failed to verify OTP. Please try again.", details: err?.message },
      { status: 500 }
    );
  }
}
