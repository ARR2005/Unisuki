import { useAuthPersistence } from "@/feature/Auth/hooks/useAuthPersistence";
import auth from "@/service/firebaseConfigs";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";

export default function useSignIn() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { saveLogin } = useAuthPersistence();

  const getFirebaseErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Invalid email or password. Please try again.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      case "auth/network-request-failed":
        return "Network error. Please check your internet connection.";
      default:
        return "Failed to sign in. Please check your credentials and try again.";
    }
  };

  const signIn = async (
    email: string,
    password: string,
    options?: { persistLogin?: boolean },
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      if (options?.persistLogin) {
        const token = await userCredential.user.getIdToken();

        await saveLogin({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          password,
          token,
        });
      }

      return userCredential;
    } catch (firebaseError: any) {
      const errorMessage = getFirebaseErrorMessage(firebaseError.code);
      setError(errorMessage);
      throw firebaseError;
    } finally {
      setIsLoading(false);
    }
  };

  return { signIn, isLoading, error };
}
