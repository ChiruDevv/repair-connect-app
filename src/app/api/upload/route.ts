/*
 * POST /api/upload
 * 
 * Uploads an image or video to Cloudinary and returns the URL.
 * 
 * Flow:
 * 1. Receive file from FormData
 * 2. Validate file type (image/video only)
 * 3. Validate file size (max 5MB)
 * 4. Read file into a Buffer
 * 5. Stream upload to Cloudinary (not base64 - important for Vercel compatibility)
 * 6. Return the Cloudinary URL and public ID
 * 
 * Why stream instead of base64?
 * Base64 encoding increases file size by ~33%. A 5MB image becomes ~6.7MB in base64,
 * which exceeds Vercel's serverless body size limit (4.5MB on Hobby plan).
 * upload_stream sends the binary data directly without encoding overhead.
 */import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type (images and videos only)
    const allowedTypes = ["image/", "video/"];
    if (!allowedTypes.some(t => file.type.startsWith(t))) {
      return NextResponse.json({ error: "Only images and videos are allowed" }, { status: 400 });
    }

    // Validate file size (5MB limit)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    // Convert the file to a Buffer for streaming to Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Use upload_stream for better Vercel compatibility
    // Stream the file to Cloudinary (avoids base64 encoding overhead)
    const result = await new Promise<any>((resolve, reject) => {
      // Determine if this is an image or video for Cloudinary resource type
      const resourceType = file.type.startsWith("video/") ? "video" : "image";
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "repairconnect", resource_type: resourceType },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
