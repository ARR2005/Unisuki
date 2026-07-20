import auth from "@/service/firebaseConfigs";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";

export function useForgotPassword() {
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetPassword = async (email: string) => {
    setError(null);
    setSuccessMessage(null);
    setIsResetting(true);

    try {
      await sendPasswordResetEmail(auth, email);
      const message = "Password reset email sent. Please check your inbox.";
      setSuccessMessage(message);
      return message;
    } catch (firebaseError: any) {
      const message =
        firebaseError?.message ?? "Unable to send password reset email.";
      setError(message);
      throw firebaseError;
    } finally {
      setIsResetting(false);
    }
  };

  return {
    resetPassword,
    isResetting,
    error,
    successMessage,
  };
}

export default useForgotPassword;
