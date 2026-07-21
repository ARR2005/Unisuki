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

export function useInsertUserVerification() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const insertUserVerification = async (
    profileData: VerificationProfileData,
    images: VerificationImages,
  ) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const db = getFirestore(getApp());
      await addDoc(collection(db, "userVerifications"), {
        uid: auth.currentUser?.uid ?? null,
        profileData,
        images,
        agreedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        status: "pending",
      });
    } catch (err: any) {
      const message = err?.message ?? "Unable to submit verification.";
      setError(message);
      throw new Error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    insertUserVerification,
    isSubmitting,
    error,
  };
}
