import { useAuthPersistence } from "@/feature/Auth/hooks/useAuthPersistence";
import { auth } from "@/service/firebaseConfigs";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

interface LogoutModalProps {
  visible: boolean;
  onCancel: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ visible, onCancel }) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { clearLogin } = useAuthPersistence();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      // 1. Clear saved credentials from AsyncStorage
      await clearLogin();

      // 2. Sign out from Firebase Auth
      await signOut(auth);

      // 3. Close modal state & Navigate to Auth screen
      onCancel();
      router.replace("/(auth)");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      {/* Backdrop */}
      <View
        className={`flex-1 justify-center items-center px-4 ${
          isDark ? "bg-black/70" : "bg-black/30"
        }`}
      >
        {/* Modal Dialog Container */}
        <View
          className={`rounded-2xl p-6 w-full max-w-sm border ${
            isDark
              ? "bg-[#0e0e0e] border-slate-800"
              : "bg-[#f3f3f3] border-gray-200"
          }`}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 10,
            elevation: 5,
          }}
        >
          <Text
            className={`text-lg font-bold text-center ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Logout Confirmation
          </Text>

          <Text
            className={`text-sm text-center my-4 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Are you sure you want to logout?
          </Text>

          {/* Action Buttons */}
          <View className="flex-row justify-center gap-3 mt-2">
            <TouchableOpacity
              disabled={isLoggingOut}
              className={`flex-1 py-3 rounded-xl border active:opacity-80 ${
                isDark
                  ? "bg-[#0e0e0e]/40 border-slate-800"
                  : "bg-white border-gray-300"
              }`}
              onPress={onCancel}
            >
              <Text
                className={`text-center font-bold text-sm ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={isLoggingOut}
              className="flex-1 bg-red-600 py-3 rounded-xl active:bg-red-700 items-center justify-center"
              onPress={handleLogout}
            >
              {isLoggingOut ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-center font-bold text-white text-sm">
                  Logout
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LogoutModal;