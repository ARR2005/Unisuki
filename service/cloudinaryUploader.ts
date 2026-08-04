import Constants from "expo-constants";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

const expoExtra =
  (Constants as any)?.expoConfig?.extra ??
  (Constants as any)?.manifest?.extra ??
  {};

const CLOUD_NAME =
  process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ??
  expoExtra.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET =
  process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET ??
  expoExtra.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export async function uploadToCloudinary(uri: string): Promise<string> {
  console.log("Cloudinary config:", { CLOUD_NAME, UPLOAD_PRESET });
  let uploadUri = uri;

  if (Platform.OS === "android" && uri.startsWith("content://")) {
    try {
      const tempDir = FileSystem.cacheDirectory + "cloudinary-uploads/";
      await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true });
      const tempFilePath = tempDir + uri.split("/").pop();
      await FileSystem.copyAsync({ from: uri, to: tempFilePath });
      uploadUri = tempFilePath;
    } catch (e) {
      console.error("Failed to copy content URI to temporary file", e);
      throw e;
    }
  }

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    console.error("Cloudinary configuration missing", {
      CLOUD_NAME,
      UPLOAD_PRESET,
    });
    throw new Error("Cloudinary is not configured");
  }

  const formData = new FormData();

  const fileExtension = uploadUri.split(".").pop()?.toLowerCase();
  const file: { uri: string; type: string; name: string } = {
    uri: uploadUri,
    type: fileExtension === "png" ? "image/png" : "image/jpeg",
    name: uploadUri.split("/").pop() || "upload.jpg",
  };

  formData.append("file", file as any);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const response = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Cloudinary upload failed", {
        status: response.status,
        error: data.error,
      });
      throw new Error(data.error?.message || "Cloudinary upload failed");
    }

    return data.secure_url as string;
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    throw err;
  } finally {
    if (uploadUri !== uri) {
      try {
        await FileSystem.deleteAsync(uploadUri, { idempotent: true });
      } catch (e) {
        // ignore
      }
    }
  }
}

export default uploadToCloudinary;
