/*
 * Cloudinary Configuration
 * 
 * Cloudinary is a cloud image/video hosting service. We use it because:
 * 1. Vercel serverless has no persistent filesystem - local file storage won't work
 * 2. Cloudinary provides a free tier with 25GB storage
 * 3. Images are served via CDN (fast worldwide)
 * 4. Built-in image transformations (resize, crop, etc.)
 * 
 * All images are stored in the "repairconnect" folder on Cloudinary.
 */import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
