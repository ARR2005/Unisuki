import { sendEmailVerification, type User } from "firebase/auth";
import { useState } from "react";

export function useEmailVerification() {
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const sendVerificationEmail = async (user: User) => {
    setError(null);
    setSuccessMessage(null);
    setIsSendingVerification(true);

    try {
      await sendEmailVerification(user);
      const message = "Please verify your account in your Gmail inbox.";
      setSuccessMessage(message);
      return message;
    } catch (firebaseError: any) {
      const message =
        firebaseError?.message ?? "Unable to send verification email.";
      setError(message);
      throw firebaseError;
    } finally {
      setIsSendingVerification(false);
    }
  };

  return {
    sendVerificationEmail,
    isSendingVerification,
    error,
    successMessage,
  };
}

export default useEmailVerification;
