import { useProfileEdit } from "@/hooks/useProfileEdit";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileEditPage() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const {
    profile,
    formData,
    errors,
    isLoading,
    isSaving,
    showLogoutConfirm,
    setShowLogoutConfirm,
    updateField,
    handleSaveProfile,
    handleLogout,
    auth,
  } = useProfileEdit();

  const currentUserEmail = auth.currentUser?.email;

  if (isLoading) {
    return (
      <SafeAreaView
        edges={["top"]}
        className={`flex-1 items-center justify-center ${
          isDark ? "bg-slate-900" : "bg-white"
        }`}
      >
        <ActivityIndicator size="large" color={isDark ? "#fff" : "#000"} />
        <Text className={`mt-4 ${isDark ? "text-white" : "text-gray-900"}`}>
          Loading profile...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["top"]}
      className={`flex-1 ${
        isDark ? "bg-gradient-professional-dark" : "bg-gradient-professional"
      }`}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View
          className={`flex-row items-center justify-between px-4 py-4 border-b ${
            isDark ? "border-green-400/20" : "border-green-300/30"
          }`}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons
              name="chevron-back"
              size={24}
              color={isDark ? "#22c55e" : "#16a34a"}
            />
          </TouchableOpacity>
          <Text
            className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
          >
            My Profile
          </Text>
          <View className="w-6" />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {/* User Info Section */}
          <View
            className={`mx-4 mt-6 p-5 rounded-2xl border ${
              isDark
                ? "bg-green-500/30 border-green-400/50"
                : "bg-green-100/60 border-green-300/70"
            } backdrop-blur-md`}
          >
            <View className="flex-row items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-emerald-500 items-center justify-center">
                <Ionicons name="person" size={32} color="#fff" />
              </View>
              <View className="flex-1 ml-4">
                <Text
                  className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  {formData.name || formData.username || "User"}
                </Text>
                <Text
                  className={`text-sm ${isDark ? "text-green-200/80" : "text-green-800/80"}`}
                >
                  {currentUserEmail}
                </Text>
              </View>
            </View>

            {profile?.avatar && (
              <Text
                className={`text-xs ${isDark ? "text-green-200/60" : "text-green-700/60"}`}
              >
                Member since {new Date(profile.createdAt).toLocaleDateString()}
              </Text>
            )}
          </View>

          {/* Edit Form */}
          <View className="mx-4 mt-8">
            <Text
              className={`text-lg font-bold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Edit Profile
            </Text>

            {/* Full Name */}
            <View className="mb-5">
              <View className="flex-row justify-between items-center mb-2">
                <Text
                  className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Full Name
                </Text>
                <Text
                  className={`text-xs ${formData.name.length >= 50 ? "text-red-500 font-semibold" : isDark ? "text-gray-400" : "text-gray-600"}`}
                >
                  {formData.name.length}/49
                </Text>
              </View>
              <View
                className={`border rounded-lg px-4 py-3 flex-row items-center ${
                  errors.name
                    ? "border-red-500 bg-red-50"
                    : isDark
                      ? "border-gray-600"
                      : "border-gray-300"
                }`}
              >
                <Ionicons
                  name="person-circle-outline"
                  size={20}
                  color={errors.name ? "#ef4444" : isDark ? "#999" : "#666"}
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  placeholder="Your full name"
                  value={formData.name}
                  onChangeText={(value) => updateField("name", value)}
                  className={`flex-1 text-base ${isDark ? "text-white" : "text-gray-900"}`}
                  editable={!isSaving}
                  placeholderTextColor="#999"
                  maxLength={49}
                />
              </View>
              {errors.name && (
                <View className="flex-row items-center mt-2 px-2">
                  <Ionicons name="alert-circle" size={14} color="#ef4444" />
                  <Text className="text-red-500 text-xs ml-1">
                    {errors.name}
                  </Text>
                </View>
              )}
            </View>

            {/* Username */}
            <View className="mb-5">
              <View className="flex-row justify-between items-center mb-2">
                <Text
                  className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Username
                </Text>
                <Text
                  className={`text-xs ${formData.username.length >= 15 ? "text-red-500 font-semibold" : isDark ? "text-gray-400" : "text-gray-600"}`}
                >
                  {formData.username.length}/14
                </Text>
              </View>
              <View
                className={`border rounded-lg px-4 py-3 flex-row items-center ${
                  errors.username
                    ? "border-red-500 bg-red-50"
                    : isDark
                      ? "border-gray-600"
                      : "border-gray-300"
                }`}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={errors.username ? "#ef4444" : isDark ? "#999" : "#666"}
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  placeholder="Your username"
                  value={formData.username}
                  onChangeText={(value) => updateField("username", value)}
                  className={`flex-1 text-base ${isDark ? "text-white" : "text-gray-900"}`}
                  editable={!isSaving}
                  placeholderTextColor="#999"
                  maxLength={14}
                />
              </View>
              {errors.username && (
                <View className="flex-row items-center mt-2 px-2">
                  <Ionicons name="alert-circle" size={14} color="#ef4444" />
                  <Text className="text-red-500 text-xs ml-1">
                    {errors.username}
                  </Text>
                </View>
              )}
            </View>

            {/* ID Number */}
            <View className="mb-5">
              <Text
                className={`font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}
              >
                ID Number
              </Text>
              <View
                className={`border rounded-lg px-4 py-3 flex-row items-center ${
                  errors.idNumber
                    ? "border-red-500 bg-red-50"
                    : isDark
                      ? "border-gray-600"
                      : "border-gray-300"
                }`}
              >
                <Ionicons
                  name="card-outline"
                  size={20}
                  color={errors.idNumber ? "#ef4444" : isDark ? "#999" : "#666"}
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  placeholder="Student/Employee ID"
                  value={formData.idNumber}
                  onChangeText={(value) => updateField("idNumber", value)}
                  className={`flex-1 text-base ${isDark ? "text-white" : "text-gray-900"}`}
                  editable={!isSaving}
                  placeholderTextColor="#999"
                />
              </View>
              {errors.idNumber && (
                <View className="flex-row items-center mt-2 px-2">
                  <Ionicons name="alert-circle" size={14} color="#ef4444" />
                  <Text className="text-red-500 text-xs ml-1">
                    {errors.idNumber}
                  </Text>
                </View>
              )}
            </View>

            {/* Age */}
            <View className="mb-5">
              <Text
                className={`font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Age{" "}
                <Text className="text-xs text-gray-500">(must be 14-79)</Text>
              </Text>
              <View
                className={`border rounded-lg px-4 py-3 flex-row items-center ${
                  errors.age
                    ? "border-red-500 bg-red-50"
                    : isDark
                      ? "border-gray-600"
                      : "border-gray-300"
                }`}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={errors.age ? "#ef4444" : isDark ? "#999" : "#666"}
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  placeholder="Your age"
                  value={formData.age}
                  onChangeText={(value) => updateField("age", value)}
                  className={`flex-1 text-base ${isDark ? "text-white" : "text-gray-900"}`}
                  keyboardType="number-pad"
                  editable={!isSaving}
                  placeholderTextColor="#999"
                />
              </View>
              {errors.age && (
                <View className="flex-row items-center mt-2 px-2">
                  <Ionicons name="alert-circle" size={14} color="#ef4444" />
                  <Text className="text-red-500 text-xs ml-1">
                    {errors.age}
                  </Text>
                </View>
              )}
            </View>

            {/* Address */}
            <View className="mb-8">
              <View className="flex-row justify-between items-center mb-2">
                <Text
                  className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Address
                </Text>
                <Text
                  className={`text-xs ${formData.address.length >= 50 ? "text-red-500 font-semibold" : isDark ? "text-gray-400" : "text-gray-600"}`}
                >
                  {formData.address.length}/49
                </Text>
              </View>
              <View
                className={`border rounded-lg px-4 py-3 flex-row items-start ${
                  errors.address
                    ? "border-red-500 bg-red-50"
                    : isDark
                      ? "border-gray-600"
                      : "border-gray-300"
                }`}
              >
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={errors.address ? "#ef4444" : isDark ? "#999" : "#666"}
                  style={{ marginRight: 8, marginTop: 8 }}
                />
                <TextInput
                  placeholder="Your address"
                  value={formData.address}
                  onChangeText={(value) => updateField("address", value)}
                  className={`flex-1 text-base ${isDark ? "text-white" : "text-gray-900"}`}
                  multiline
                  numberOfLines={3}
                  editable={!isSaving}
                  placeholderTextColor="#999"
                  textAlignVertical="top"
                  maxLength={49}
                />
              </View>
              {errors.address && (
                <View className="flex-row items-center mt-2 px-2">
                  <Ionicons name="alert-circle" size={14} color="#ef4444" />
                  <Text className="text-red-500 text-xs ml-1">
                    {errors.address}
                  </Text>
                </View>
              )}
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={async () => {
                await handleSaveProfile();
                router.back();
              }}
              disabled={isSaving}
              className={`p-4 rounded-lg items-center mb-4 ${
                isSaving ? "bg-gray-400" : "bg-green-600"
              }`}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" size="large" />
              ) : (
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-done" size={20} color="#fff" />
                  <Text className="text-white font-bold text-base ml-2">
                    Save Changes
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Info Text */}
            <Text
              className={`text-xs text-center mt-6 ${isDark ? "text-gray-500" : "text-gray-600"}`}
            >
              This information helps other students trust and find you on
              Unisuk.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
