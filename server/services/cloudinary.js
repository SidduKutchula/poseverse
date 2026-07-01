import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with environment variables
const cloudinaryName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryKey = process.env.CLOUDINARY_API_KEY;
const cloudinarySecret = process.env.CLOUDINARY_API_SECRET;

const isConfigured = cloudinaryName && cloudinaryKey && cloudinarySecret;

if (isConfigured) {
  cloudinary.config({
    cloud_name: cloudinaryName,
    api_key: cloudinaryKey,
    api_secret: cloudinarySecret,
  });
  console.log("Cloudinary service initialized successfully.");
} else {
  console.warn("\n[Warning] Cloudinary credentials missing from environment.");
  console.warn("Custom uploads will use local placeholder mock URLs.\n");
}

export const uploadToCloudinary = async (fileBuffer, options = {}) => {
  if (!isConfigured) {
    console.log("Cloudinary not configured. Simulating asset upload...");
    // Fallback: Return a beautiful Unsplash portrait reference URL to mimic successful upload
    return {
      secure_url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&fit=crop",
      public_id: `mock_cloudinary_asset_${Date.now()}`,
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "poseverse",
        ...options,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload failed:", error.message);
          return reject(error);
        }
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};
