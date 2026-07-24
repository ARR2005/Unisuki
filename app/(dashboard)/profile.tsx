import AccordionItem from "@/components/ui/AccordionItem";
import LogoutModal from "@/feature/profile/components/logoutModal";
import ProfileHeader from "@/feature/profile/components/profileHeader";
import ScreenWrapper from "@/feature/profile/components/screenWrapper";
import { auth, db } from "@/service/firebaseConfigs";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Appearance,
  Switch,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

interface UserProfileDetails {
  name?: string;
  username?: string;
  age?: string;
  idNumber?: string;
  address?: string;
  role?: string;
}

export default function ProfileTab() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [isDarkModeEnabled, setIsDarkModeEnabled] = useState(isDark);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userDetails, setUserDetails] = useState<UserProfileDetails>({});

  const currentUser = auth.currentUser;

  // Listen to complete user profile in Firestore (user/{uid})
  useEffect(() => {
    if (!currentUser) return;

    const userRef = doc(db, "user", currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setUserDetails({
          name: data.name || "",
          username: data.username || data.name || "",
          age: data.age || "",
          idNumber: data.idNumber || "",
          address: data.address || "",
          role: data.Role || data.role || "user",
        });
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  const handleToggleDarkMode = (enabled: boolean) => {
    setIsDarkModeEnabled(enabled);
    Appearance.setColorScheme(enabled ? "dark" : "light");
  };

  const handlePressAdminVerification = () => {
    router.push("/(VerifyUser)");
  };

  const isAdmin =
    userDetails.role === "Admin" || userDetails.role === "admin";

  const userProfileHeader = {
    username:
      userDetails.username ||
      currentUser?.displayName ||
      currentUser?.email?.split("@")[0] ||
      "User",
    avatar: currentUser?.photoURL || undefined,
  };

  const iconColor = isDark ? "#10b981" : "#059669";

  return (
    <ScreenWrapper headerComponent={<ProfileHeader user={userProfileHeader} />}>
      <View
        className={`rounded-3xl overflow-hidden border ${
          isDark
            ? "bg-[#0e0e0e] border-[#01170f]"
            : "bg-[#f3f3f3] border-gray-200"
        }`}
      >
        {/* 1. Account Info */}
        <AccordionItem
          title="Account Info"
          icon="person-outline"
          isOpen={openAccordion === "info"}
          onPress={() => toggleAccordion("info")}
        >
          <View
            className={`p-4 gap-3.5 ${
              isDark
                ? "bg-[#0e0e0e] border-t border-[#01170f]"
                : "bg-white/60 border-t border-gray-200"
            }`}
          >
            {/* Full Name */}
            <View>
              <Text className="text-xs text-gray-400">Full Name</Text>
              <Text
                className={`text-sm font-semibold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {userDetails.name || currentUser?.displayName || "N/A"}
              </Text>
            </View>

            {/* Username */}
            <View>
              <Text className="text-xs text-gray-400">Username</Text>
              <Text
                className={`text-sm font-semibold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {userDetails.username || "N/A"}
              </Text>
            </View>

            {/* Email */}
            <View>
              <Text className="text-xs text-gray-400">Email</Text>
              <Text
                className={`text-sm font-semibold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {currentUser?.email || "N/A"}
              </Text>
            </View>

            {/* Age */}
            <View>
              <Text className="text-xs text-gray-400">Age</Text>
              <Text
                className={`text-sm font-semibold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {userDetails.age || "N/A"}
              </Text>
            </View>

            {/* ID Number */}
            <View>
              <Text className="text-xs text-gray-400">ID Number</Text>
              <Text
                className={`text-sm font-semibold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {userDetails.idNumber || "N/A"}
              </Text>
            </View>

            {/* Address */}
            <View>
              <Text className="text-xs text-gray-400">Address</Text>
              <Text
                className={`text-sm font-semibold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {userDetails.address || "N/A"}
              </Text>
            </View>
          </View>
        </AccordionItem>

        {/* 2. Admin Verification Control (Visible ONLY if Role === "Admin") */}
        {isAdmin && (
          <TouchableOpacity
            onPress={handlePressAdminVerification}
            className={`flex-row items-center p-4 border-b ${
              isDark ? "border-[#01170f]" : "border-gray-200"
            }`}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={22}
              color={iconColor}
            />
            <Text
              className={`flex-1 ml-4 text-base font-semibold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              User Verifications
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={isDark ? "#64748b" : "#9ca3af"}
            />
          </TouchableOpacity>
        )}

        {/* 3. Purchase History */}
        <TouchableOpacity
          onPress={() => router.push("/(profile)/purchase-history" as any)}
          className={`flex-row items-center p-4 border-b ${
            isDark ? "border-[#01170f]" : "border-gray-200"
          }`}
        >
          <Ionicons
            name="bag-handle-outline"
            size={22}
            color={iconColor}
          />
          <Text
            className={`flex-1 ml-4 text-base font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Purchase History
          </Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={isDark ? "#64748b" : "#9ca3af"}
          />
        </TouchableOpacity>

        {/* 4. Redeem Coupons */}
        <TouchableOpacity
          onPress={() => router.push("/(profile)/redeem-coupons" as any)}
          className={`flex-row items-center p-4 border-b ${
            isDark ? "border-[#01170f]" : "border-gray-200"
          }`}
        >
          <Ionicons
            name="ticket-outline"
            size={22}
            color={iconColor}
          />
          <Text
            className={`flex-1 ml-4 text-base font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Redeem Coupons
          </Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={isDark ? "#64748b" : "#9ca3af"}
          />
        </TouchableOpacity>

        {/* 5. Settings */}
        <AccordionItem
          title="Settings"
          icon="settings-outline"
          isOpen={openAccordion === "settings"}
          onPress={() => toggleAccordion("settings")}
        >
          <View
            className={
              isDark
                ? "bg-[#0e0e0e] border-t border-[#01170f]"
                : "bg-white/60 border-t border-gray-200"
            }
          >
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200/60 dark:border-[#01170f]">
              <Text
                className={`text-sm ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Notifications
              </Text>
              <Switch
                value={isNotificationsEnabled}
                onValueChange={setIsNotificationsEnabled}
                trackColor={{ false: "#9CA3AF", true: "#059669" }}
              />
            </View>

            <View className="flex-row justify-between items-center p-4">
              <Text
                className={`text-sm ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Dark Mode
              </Text>
              <Switch
                value={isDarkModeEnabled}
                onValueChange={handleToggleDarkMode}
                trackColor={{ false: "#9CA3AF", true: "#059669" }}
              />
            </View>
          </View>
        </AccordionItem>

        {/* 6. Help & Support */}
        <AccordionItem
          title="Help & Support"
          icon="help-circle-outline"
          isOpen={openAccordion === "help"}
          onPress={() => toggleAccordion("help")}
        >
          <View
            className={`p-4 ${
              isDark
                ? "bg-[#0e0e0e] border-t border-[#01170f]"
                : "bg-white/60 border-t border-gray-200"
            }`}
          >
            <Text
              className={`text-xs ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Need assistance? Reach out to support at support@unisuki.com.
            </Text>
          </View>
        </AccordionItem>

        {/* 7. Logout */}
        <TouchableOpacity
          className={`flex-row items-center p-4 border-t ${
            isDark ? "border-[#01170f]" : "border-gray-200"
          }`}
          onPress={() => setShowLogoutModal(true)}
        >
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text className="flex-1 ml-4 text-base font-semibold text-red-500">
            Logout
          </Text>
        </TouchableOpacity>
      </View>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        visible={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
       
      />
      <View className="h-16" />
    </ScreenWrapper>
  );
}