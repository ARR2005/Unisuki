import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { app } from "./firebaseConfigs";

// Get a reference to the Firebase Storage service
const storage = getStorage(app);

/**
 * Uploads a file to Firebase Storage and returns the download URL.
 * @param uri The local URI of the file to upload.
 * @param path The path in Firebase Storage to upload the file to.
 * @returns A promise that resolves with the public download URL of the uploaded file.
 */
export const uploadImageAndGetDownloadURL = async (uri: string, path: string): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, path);
    const uploadTask = await uploadBytesResumable(storageRef, blob);
    const downloadURL = await getDownloadURL(uploadTask.ref);
    return downloadURL;
  } catch (error) {
    console.error("Image upload failed:", error);
    throw new Error("Image upload failed");
  }
};
