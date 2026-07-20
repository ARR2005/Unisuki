import { useAuthPersistence } from "@/feature/Auth/hooks/useAuthPersistence";
import auth from "@/service/firebaseConfigs";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";

export default function useSignIn() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { saveLogin } = useAuthPersistence();

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
        await saveLogin({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
        });
      }

      return userCredential.user;
    } catch (firebaseError: any) {
      setError(firebaseError.message);
      throw firebaseError;
    } finally {
      setIsLoading(false);
    }
  };

  return { signIn, isLoading, error };
}
