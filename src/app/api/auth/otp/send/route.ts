import { NextResponse } from "next/server";
import { generateNumericOtp, hashOtp, sendOtpSms } from "@/lib/sms";
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
    const rawPhone = body.phone || "";
    const phone = normalizeIndianPhone(rawPhone);

    if (!phone) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit Indian mobile number." },
        { status: 400 }
      );
    }

    const now = new Date();

    // Check existing OTP attempt for cooldown and rate limiting
    const existing = await findOtpAttempt(phone);

    if (existing) {
      const elapsedSeconds = (now.getTime() - new Date(existing.createdAt).getTime()) / 1000;
      
      // 30 seconds resend cooldown
      if (elapsedSeconds < 30) {
        const remaining = Math.ceil(30 - elapsedSeconds);
        return NextResponse.json(
          {
            error: `Please wait ${remaining} seconds before requesting a new OTP.`,
            cooldownRemaining: remaining,
          },
          { status: 429 }
        );
      }

      // Max attempts limit per hour (rate limiting)
      if (existing.attempts >= 10 && elapsedSeconds < 3600) {
        return NextResponse.json(
          {
            error: "Too many OTP attempts for this number. Please try again after 1 hour.",
          },
          { status: 429 }
        );
      }
    }

    // Generate 6-digit OTP and 5-minute expiry
    const otp = generateNumericOtp();
    const hashedCode = hashOtp(otp);
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes

    // Save in OtpAttempt table
    await saveOtpAttempt(phone, hashedCode, expiresAt);

    // Send SMS via mock/live provider
    const sendResult = await sendOtpSms(phone, otp);

    // Create stateless challenge token for cross-lambda resilience on Vercel
    const challengeToken = createOtpChallengeToken({
      phone,
      hashedCode,
      expiresAt: expiresAt.getTime(),
    });

    const response = NextResponse.json({
      success: true,
      message: "6-digit OTP sent successfully.",
      phone: `+91 ${phone}`,
      expiresInSeconds: 300,
      cooldownSeconds: 30,
      debugOtp: sendResult.debugOtp, // provided in dev mode or mock mode for testing convenience
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
    console.error("Error in /api/auth/otp/send:", err);
    return NextResponse.json(
      { error: "Failed to send OTP. Please try again.", details: err?.message },
      { status: 500 }
    );
  }
}
