import { auth, db } from "@/service/firebaseConfigs";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

export default function Checker() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const userRef = doc(db, "user", currentUser.uid);

    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const verified =
            data.is_verified === true || data.is_verified === "true";

          if (verified) {
            // Replace navigation stack to Home/Dashboard once verified
            router.replace("/(dashboard)/home");
            return;
          }
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error checking verification status:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut(auth);
      router.replace("/(auth)/login"); // Adjust route if your login page path differs
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <View
        className={`flex-1 justify-center items-center ${
          isDark ? "bg-[#0e0e0e]" : "bg-[#f3f3f3]"
        }`}
      >
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center px-6">
      <View className="items-center justify-center">
        <Image
          source={require("@/assets/images/icon/dashboardLogo.png")}
          className="w-72 h-72 items-center justify-center"
          resizeMode="contain"
        />
      </View>

      {/* Main Title */}
      <Text
        className={`text-2xl font-extrabold text-center tracking-tight ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        Account Verification Pending
      </Text>

      {/* Verification Time Description */}
      <Text
        className={`mt-3 text-center text-base font-medium leading-6 ${
          isDark ? "text-gray-400" : "text-gray-600"
        }`}
      >
        Please wait for the admin to verify your account.
      </Text>

      {/* Working Days Highlight Card */}
      <View
        className={`mt-6 w-full p-4 rounded-2xl border items-center flex-row justify-center gap-2 ${
          isDark
            ? "bg-[#0e0e0e] border-[#01170f]"
            : "bg-white border-gray-200"
        }`}
      >
        <Ionicons
          name="calendar-outline"
          size={20}
          color={isDark ? "#10b981" : "#059669"}
        />
        <Text
          className={`text-sm font-semibold ${
            isDark ? "text-gray-200" : "text-gray-800"
          }`}
        >
          Estimated processing time:{" "}
          <Text className="text-emerald-500 dark:text-emerald-400 font-bold">
            1–3 working days
          </Text>
        </Text>
      </View>

      {/* Logout / Back to Login Button */}
      <TouchableOpacity
        onPress={handleLogout}
        disabled={isLoggingOut}
        activeOpacity={0.8}
        className="mt-8 w-full py-3.5 rounded-2xl bg-emerald-600 dark:bg-[#065f46] flex-row items-center justify-center gap-2"
      >
        {isLoggingOut ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <>
            <Ionicons name="log-out-outline" size={20} color="#ffffff" />
            <Text className="text-white font-bold text-base">
              Back to Login
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}