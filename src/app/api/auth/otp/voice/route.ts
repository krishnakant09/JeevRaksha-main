import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateNumericOtp, hashOtp, sendOtpVoiceCall } from "@/lib/sms";
import { findOtpAttempt, saveOtpAttempt } from "@/lib/otp-db";
import { createOtpChallengeToken } from "@/lib/otp-token";

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
    const phone = normalizeIndianPhone(body.phone || "");

    if (!phone) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit Indian mobile number." },
        { status: 400 }
      );
    }

    // If caller specifies checkRegistered or purpose='login', ensure account exists
    if (body.checkRegistered || body.purpose === "login") {
      let existingUser: any = null;
      try {
        existingUser = await prisma.user.findFirst({
          where: { phone },
          select: { id: true, name: true, role: true, status: true },
        });
      } catch {
        const rawUsers: any[] = (await prisma.$queryRawUnsafe(
          "SELECT id, name, role, status FROM User WHERE phone = ? LIMIT 1",
          phone
        ).catch(() => [])) as any[];
        if (rawUsers && rawUsers.length > 0) existingUser = rawUsers[0];
      }

      if (!existingUser) {
        return NextResponse.json(
          {
            error: "This mobile number is not registered. Please create a new account to continue.",
            notRegistered: true,
          },
          { status: 404 }
        );
      }
    }

    const now = new Date();
    const existing = await findOtpAttempt(phone);

    if (existing) {
      const elapsedSeconds = (now.getTime() - new Date(existing.createdAt).getTime()) / 1000;
      if (elapsedSeconds < 30) {
        const remaining = Math.ceil(30 - elapsedSeconds);
        return NextResponse.json(
          {
            error: `Please wait ${remaining} seconds before requesting voice OTP call.`,
            cooldownRemaining: remaining,
          },
          { status: 429 }
        );
      }
    }

    const otp = generateNumericOtp();
    const hashedCode = hashOtp(otp);
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);

    await saveOtpAttempt(phone, hashedCode, expiresAt);

    const voiceResult = await sendOtpVoiceCall(phone, otp);

    const challengeToken = createOtpChallengeToken({
      phone,
      hashedCode,
      expiresAt: expiresAt.getTime(),
    });

    const response = NextResponse.json({
      success: true,
      message: "Voice call initiated. You will receive a call with the OTP momentarily.",
      phone: `+91 ${phone}`,
      expiresInSeconds: 300,
      cooldownSeconds: 30,
      debugOtp: voiceResult.debugOtp,
      otpChallengeToken: challengeToken,
    });

    response.cookies.set("jeevraksha_otp_challenge", challengeToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 300, // 5 minutes
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Error in /api/auth/otp/voice:", err);
    return NextResponse.json(
      { error: "Failed to initiate voice call. Please try again.", details: err?.message },
      { status: 500 }
    );
  }
}
