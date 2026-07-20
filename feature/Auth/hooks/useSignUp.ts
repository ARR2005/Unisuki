import { useAuthPersistence } from "@/feature/Auth/hooks/useAuthPersistence";
import auth from "@/service/firebaseConfigs";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";

export function useSignUp() {
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { saveLogin } = useAuthPersistence();

  const signUp = async (email: string, password: string) => {
    setIsSigningUp(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      await saveLogin({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
      });

      return userCredential.user;
    } catch (firebaseError: any) {
      const message = firebaseError?.message ?? "Unable to create account.";
      setError(message);
      throw firebaseError;
    } finally {
      setIsSigningUp(false);
    }
  };

  return { signUp, isSigningUp, error };
}

export default useSignUp;
