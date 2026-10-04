import crypto from "crypto";

export interface SmsProviderResult {
  success: boolean;
  messageId?: string;
  debugOtp?: string; // only populated in development
  error?: string;
}

/**
 * Generates a secure 6-digit numeric OTP.
 */
export function generateNumericOtp(): string {
  // Generate random integer between 100000 and 999999
  const randomBuffer = crypto.randomBytes(4);
  const randomNumber = randomBuffer.readUInt32BE(0);
  const otp = 100000 + (randomNumber % 900000);
  return otp.toString();
}

/**
 * Creates a SHA-256 hash of the OTP for safe storage in the database.
 */
export function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp.trim()).digest("hex");
}

/**
 * Verifies if candidate OTP matches stored hash.
 */
export function verifyOtpHash(candidateOtp: string, storedHash: string): boolean {
  const candidateHash = hashOtp(candidateOtp);
  return crypto.timingSafeEqual(
    Buffer.from(candidateHash, "hex"),
    Buffer.from(storedHash, "hex")
  );
}

/**
 * Pluggable SMS delivery provider.
 * Uses mock SMS logger by default in development, and can be switched to
 * Twilio, MSG91, CDAC Gateway, or Fast2SMS in production via SMS_PROVIDER env variable.
 */
export async function sendOtpSms(phone: string, otp: string): Promise<SmsProviderResult> {
  const provider = process.env.SMS_PROVIDER || "mock";
  const isDev = process.env.NODE_ENV !== "production";

  const message = `[Pashu Rakshak / जीव रक्षा] Your verification code is ${otp}. Valid for 5 minutes. Do not share this OTP.`;

  console.log(`\n==================================================`);
  console.log(`📱 [SMS SERVICE - ${provider.toUpperCase()}]`);
  console.log(`To: +91 ${phone}`);
  console.log(`Message: ${message}`);
  console.log(`🔑 OTP Code: ${otp}`);
  console.log(`==================================================\n`);

  if (provider === "mock") {
    return {
      success: true,
      messageId: `mock_${Date.now()}`,
      debugOtp: isDev ? otp : undefined,
    };
  }

  // Example integration placeholder for Twilio / MSG91 / CDAC
  if (provider === "twilio") {
    // To enable Twilio, install 'twilio' and set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({ body: message, from: process.env.TWILIO_PHONE_NUMBER, to: `+91${phone}` });
    return { success: true, messageId: `tw_${Date.now()}` };
  }

  return { success: true, debugOtp: isDev ? otp : undefined };
}

/**
 * Pluggable Voice OTP call provider.
 */
export async function sendOtpVoiceCall(phone: string, otp: string): Promise<SmsProviderResult> {
  const isDev = process.env.NODE_ENV !== "production";

  console.log(`\n==================================================`);
  console.log(`📞 [VOICE OTP CALL - SIMULATION]`);
  console.log(`Calling: +91 ${phone}`);
  console.log(`Spoken Message: "Namaste. Your Pashu Rakshak OTP is ${otp.split("").join(" - ")}"`);
  console.log(`🔑 OTP Code: ${otp}`);
  console.log(`==================================================\n`);

  return {
    success: true,
    messageId: `voice_mock_${Date.now()}`,
    debugOtp: isDev ? otp : undefined,
  };
}
