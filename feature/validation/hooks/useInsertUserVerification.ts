import { getApp } from "firebase/app";
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
} from "firebase/firestore";
import { useState } from "react";

import auth from "@/service/firebaseConfigs";

export interface VerificationProfileData {
  name: string;
  username: string;
  idNumber: string;
  age: string;
  address: string;
}

export type VerificationImages = {
  front: string | null;
  back: string | null;
  selfie: string | null;
};

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

// Helper function to upload a single local URI to Cloudinary
async function uploadToCloudinary(uri: string): Promise<string> {
  console.log("📁 Uploading image to Cloudinary:", uri);

  // Guard check for missing environment variables
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    console.error("❌ Cloudinary Config Missing:", { CLOUD_NAME, UPLOAD_PRESET });
    throw new Error("Missing Cloudinary configuration in environment variables.");
  }

  const formData = new FormData();
  formData.append("file", {
    uri,
    type: "image/jpeg",
    name: "upload.jpg",
  } as any);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(CLOUDINARY_URL, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("❌ Cloudinary Upload Error:", data);
    throw new Error(data.error?.message || "Failed to upload image to Cloudinary.");
  }

  console.log("✅ Cloudinary Upload Success URL:", data.secure_url);
  return data.secure_url; 
}

export function useInsertUserVerification() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const insertUserVerification = async (
    profileData: VerificationProfileData,
    images: VerificationImages,
  ) => {
    console.log("🚀 Starting verification submission process...");
    console.log("📝 Profile Data:", profileData);
    console.log("🖼️ Local Image Paths:", images);

    setIsSubmitting(true);
    setError(null);

    try {
      if (!auth.currentUser) {
        throw new Error("You must be logged in to submit verification.");
        }  

      if (!images.front || !images.back || !images.selfie) {
        console.warn("⚠️ Missing one or more images before upload.");
        throw new Error(
          "Please capture all 3 required images before submitting.",
        );
      }

      // 2. Upload all 3 images in parallel to Cloudinary
      console.log("⏳ Uploading all 3 images in parallel...");
      const [frontUrl, backUrl, selfieUrl] = await Promise.all([
        uploadToCloudinary(images.front),
        uploadToCloudinary(images.back),
        uploadToCloudinary(images.selfie),
      ]);

      const uploadedImages = {
        front: frontUrl,
        back: backUrl,
        selfie: selfieUrl,
      };

      console.log("✅ All images uploaded successfully:", uploadedImages);

      // 3. Save profile data + Cloudinary HTTPS URLs to Firestore
      console.log("💾 Writing verification document to Firestore...");
      const db = getFirestore(getApp());
      const docRef = await addDoc(collection(db, "userVerifications"), {
        uid: auth.currentUser?.uid ?? null,
        profileData,
        images: uploadedImages,
        isVerified: false,
        isSetupComplete: true,
        agreedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        status: "pending",
      });

      console.log("🎉 Document written to Firestore with ID:", docRef.id);
    } catch (err: any) {
      const message = err?.message ?? "Unable to submit verification.";
      console.error("❌ Verification Submission Failed:", message);
      setError(message);
      throw new Error(message);
    } finally {
      setIsSubmitting(false);
      console.log("🏁 Verification submission process ended.");
    }
  };

  return {
    insertUserVerification,
    isSubmitting,
    error,
  };
}