import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Ensure public/temp directory exists
    const tempDir = path.join(process.cwd(), "public", "temp");
    try {
      await mkdir(tempDir, { recursive: true });
    } catch (e) {
      // Directory might already exist
    }

    // Save with unique name to prevent collisions
    const uniqueFilename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(tempDir, uniqueFilename);
    
    await writeFile(filePath, buffer);

    // Return the URL that can be used to access the file
    // In Next.js, anything in public/ is served at the root
    // For Puter.js to access this, it needs the absolute URL
    
    // Attempt to construct the host URL (e.g., http://localhost:3000 or production domain)
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const fileUrl = `${protocol}://${host}/temp/${uniqueFilename}`;

    return NextResponse.json({ 
      success: true, 
      path: `/temp/${uniqueFilename}`,
      url: fileUrl 
    });
    
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
