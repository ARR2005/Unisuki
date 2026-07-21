import { useState } from "react";
import {
    ActivityIndicator,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useForgotPassword } from "@/feature/Auth/hooks/useForgotPassword";

type ForgotPasswordModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function ForgotPasswordModal({
  open,
  onClose,
}: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");
  const { resetPassword, isResetting, error, successMessage } =
    useForgotPassword();

  async function handleResetPassword() {
    if (!email.trim()) return;

    try {
      await resetPassword(email.trim());
    } catch {
      // error is already handled in the hook
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogTrigger>
        <View />
      </DialogTrigger>

      <DialogContent className="w-full">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Enter your email and we’ll send you a password reset link.
          </DialogDescription>
        </DialogHeader>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          className="mt-2 rounded-xl border border-gray-300 px-4 py-3"
        />

        {error ? (
          <Text className="mt-3 text-sm text-red-500">{error}</Text>
        ) : null}

        {successMessage ? (
          <Text className="mt-3 text-sm text-green-600">{successMessage}</Text>
        ) : null}

        <TouchableOpacity
          onPress={handleResetPassword}
          disabled={isResetting}
          className={`mt-4 rounded-xl bg-red-500 px-4 py-3 ${isResetting ? "opacity-70" : ""}`}
        >
          {isResetting ? (
            <View className="flex-row items-center justify-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="ml-2 font-semibold text-white">Sending...</Text>
            </View>
          ) : (
            <Text className="text-center font-semibold text-white">
              Send Reset Link
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={onClose}>
          <Text className="text-center text-sm text-gray-600">Cancel</Text>
        </TouchableOpacity>
      </DialogContent>
    </Dialog>
  );
}
