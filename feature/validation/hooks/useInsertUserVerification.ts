import { createAppNotification } from "@/feature/notifications/notifications";
import auth from "@/service/firebaseConfigs";
import { getApp } from "firebase/app";
import {
    addDoc,
    collection,
    getDocs,
    getFirestore,
    serverTimestamp,
} from "firebase/firestore";
import { useState } from "react";
import * as FileSystem from 'expo-file-system';
import { Platform } from "react-native";

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
  console.log("📁 Uploading image to Cloudinary from original URI:", uri);

  let uploadUri = uri;
  // On Android, if the URI is a content URI, copy it to a temporary file
  // to ensure it can be uploaded correctly.
  if (Platform.OS === 'android' && uri.startsWith('content://')) {
    try {
      const tempDir = FileSystem.cacheDirectory + 'cloudinary-uploads/';
      await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true });
      const tempFilePath = tempDir + uri.split('/').pop();
      await FileSystem.copyAsync({ from: uri, to: tempFilePath });
      uploadUri = tempFilePath;
      console.log("📄 Copied content URI to temporary file:", uploadUri);
    } catch (e) {
      console.error("Failed to copy content URI to temporary file", e);
      throw e; // re-throw the error to be caught by the outer try-catch
    }
  }

  // Guard check for missing environment variables
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    console.error("❌ Cloudinary Config Missing:", {
      CLOUD_NAME,
      UPLOAD_PRESET,
    });
    throw new Error(
      "Missing Cloudinary configuration in environment variables.",
    );
  }

  const formData = new FormData();
  
  const file: { uri: string, type: string, name: string } = {
    uri: uploadUri,
    type: 'image/jpeg',
    name: 'upload.jpg',
  };

  const fileExtension = uploadUri.split('.').pop()?.toLowerCase();
  if (fileExtension === 'png') {
    file.type = 'image/png';
  } else if (fileExtension === 'jpg' || fileExtension === 'jpeg') {
    file.type = 'image/jpeg';
  }
  
  const fileName = uploadUri.split('/').pop();
  if (fileName) {
    file.name = fileName;
  }
  
  console.log('📄 Uploading file with details:', file);

  formData.append("file", file as any);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const response = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Cloudinary Upload Error:", { 
        status: response.status,
        statusText: response.statusText,
        error: data.error 
      });
      throw new Error(
        data.error?.message || `Failed to upload image to Cloudinary. Status: ${response.status}`,
      );
    }

    console.log("✅ Cloudinary Upload Success URL:", data.secure_url);
    return data.secure_url;
  } catch (error) {
    console.error("🚨 Fetch request to Cloudinary failed:", error);
    throw error;
  } finally {
    // Clean up the temporary file if it was created
    if (uploadUri !== uri) {
      await FileSystem.deleteAsync(uploadUri, { idempotent: true });
      console.log("🗑️ Deleted temporary file:", uploadUri);
    }
  }
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

      const adminsSnapshot = await getDocs(collection(db, "user"));
      const adminRecipientUids = adminsSnapshot.docs
        .filter((userDoc) => {
          const role = userDoc.data().Role || userDoc.data().role || "";
          return String(role).toLowerCase() === "admin";
        })
        .map((userDoc) => userDoc.id);

      if (adminRecipientUids.length > 0) {
        await createAppNotification({
          recipientUids: adminRecipientUids,
          senderUid: auth.currentUser?.uid || "",
          title: "New verification request",
          body: `${profileData.name || "A new user"} has completed account setup and is waiting for verification.`,
          type: "verification",
          routePath: "/verifyUsers",
        });
      }
    } catch (err: any) {
      const message = err?.message ?? "Unable to submit verification.";
      console.error("Verification Submission Failed:", message);
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