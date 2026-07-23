import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuthPersistence } from "@/feature/Auth/hooks/useAuthPersistence";
import auth from "@/service/firebaseConfigs";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

export default function Profile() {
  const { clearLogin } = useAuthPersistence();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      await clearLogin();
      await signOut(auth);
      setIsLogoutDialogOpen(false);
      router.replace("/(auth)");
    } catch {
      setLogoutError("Unable to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-slate-100">
      <Text className="mb-6 text-2xl font-semibold text-slate-900">Profile</Text>
      <Pressable
        className="rounded-lg bg-red-600 px-6 py-3 active:bg-red-700"
        onPress={() => setIsLogoutDialogOpen(true)}
      >
        <Text className="font-semibold text-white">Log out</Text>
      </Pressable>

      <Dialog
        open={isLogoutDialogOpen}
        onOpenChange={(open) => !isLoggingOut && setIsLogoutDialogOpen(open)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Log out?</DialogTitle>
            <DialogDescription>
              You will need to sign in again to access your account.
            </DialogDescription>
          </DialogHeader>

          {logoutError && (
            <Text className="mb-4 text-sm text-red-600">{logoutError}</Text>
          )}

          <View className="flex-row justify-end gap-3">
            <Pressable
              className="rounded-lg border border-slate-300 px-4 py-2"
              disabled={isLoggingOut}
              onPress={() => setIsLogoutDialogOpen(false)}
            >
              <Text className="font-medium text-slate-700">Cancel</Text>
            </Pressable>
            <Pressable
              className="min-w-24 flex-row items-center justify-center rounded-lg bg-red-600 px-4 py-2 active:bg-red-700"
              disabled={isLoggingOut}
              onPress={handleLogout}
            >
              {isLoggingOut ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="font-semibold text-white">Log out</Text>
              )}
            </Pressable>
          </View>
        </DialogContent>
      </Dialog>
    </View>
  );
}
