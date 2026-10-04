import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No certificate file provided." }, { status: 400 });
    }

    // Validate size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit. Please upload a smaller document." },
        { status: 400 }
      );
    }

    // Validate MIME type (Images & PDF only)
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF, JPG, and PNG documents are accepted." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Storage directory
    const certDir = path.join(process.cwd(), "public", "certificates");
    try {
      await mkdir(certDir, { recursive: true });
    } catch {
      // directory exists
    }

    const fileId = `cert_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const ext = path.extname(file.name) || (file.type === "application/pdf" ? ".pdf" : ".jpg");
    const filename = `${fileId}${ext}`;
    const filePath = path.join(certDir, filename);

    await writeFile(filePath, buffer);

    const fileUrl = `/certificates/${filename}`;

    return NextResponse.json({
      success: true,
      fileId,
      filename: file.name,
      fileUrl,
      sizeBytes: file.size,
    });
  } catch (err: any) {
    console.error("Certificate upload error:", err);
    return NextResponse.json(
      { error: "Failed to upload certificate. Please try again." },
      { status: 500 }
    );
  }
}
