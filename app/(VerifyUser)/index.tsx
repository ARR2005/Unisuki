import { createAppNotification } from "@/feature/notifications/notifications";
import { auth, db } from "@/service/firebaseConfigs";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export type VerificationRequest = {
  id: string; // Document ID in userVerifications
  uid: string;
  isVerified: boolean;
  isSetupComplete: boolean;
  images?: {
    front?: string;
    back?: string;
    selfie?: string;
  };
  profileData?: {
    name?: string;
    username?: string;
    idNumber?: string;
    age?: string;
    address?: string;
  };
  status: "pending" | "approved" | "rejected";
  createdAt?: any;
};

export default function AdminVerifyUsersScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState<VerificationRequest | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Real-time listener for all user verification submissions
  useEffect(() => {
    const q = collection(db, "userVerifications");
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as VerificationRequest[];

        // Sort pending requests to the top
        items.sort((a, b) => {
          if (a.status === "pending" && b.status !== "pending") return -1;
          if (a.status !== "pending" && b.status === "pending") return 1;
          return 0;
        });

        setRequests(items);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching user verifications:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleReviewAction = async (status: "approved" | "rejected") => {
    if (!selectedReq) return;
    setIsSubmitting(true);

    try {
      // 1. Update/Create status in userVerifications collection using setDoc with merge
      const verificationRef = doc(db, "userVerifications", selectedReq.id);
      await setDoc(
        verificationRef,
        {
          status,
          isVerified: status === "approved",
        },
        { merge: true }
      );

      // 2. Update/Create status in user collection using setDoc with merge
      if (selectedReq.uid) {
        const userRef = doc(db, "user", selectedReq.uid);
        await setDoc(
          userRef,
          {
            is_verified: status === "approved",
          },
          { merge: true }
        );

        // 3. Send notification to user
        await createAppNotification({
          recipientUid: selectedReq.uid,
          senderUid: auth.currentUser?.uid || "admin",
          title:
            status === "approved"
              ? "Identity Verification Approved 🎉"
              : "Identity Verification Rejected",
          body:
            status === "approved"
              ? "Your account verification is complete. You now have full access!"
              : "Your identity document could not be verified. Please resubmit clear photos.",
          type: "verification",
          routePath: "/profile",
        });
      }

      setSelectedReq(null);
    } catch (error) {
      console.error("Error updating verification request:", error);
      alert("Could not process review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 mt-[-38px]">
      {/* Header */}
      <View
        className={`flex-row items-center justify-between px-4 py-3.5 border-b ${
          isDark
            ? "border-slate-800 bg-[#0e0e0e]/40"
            : "border-gray-200/80 bg-white"
        }`}
      >
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons
            name="chevron-back"
            size={24}
            color={isDark ? "#fff" : "#111827"}
          />
        </TouchableOpacity>
        <Text
          className={`text-lg w-40 font-bold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Verify Users
        </Text>
        <View className="w-6" />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#059669" />
        </View>
      ) : requests.length === 0 ? (
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons
            name="checkmark-done-circle-outline"
            size={56}
            color={isDark ? "#9ca3af" : "#9ca3af"}
          />
          <Text
            className={`mt-3 font-semibold text-lg ${
              isDark ? "text-white" : "text-gray-700"
            }`}
          >
            No requests found
          </Text>
          <Text
            className={`text-xs mt-1 text-center ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            User verification submissions will show up here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => {
            const profile = item.profileData;
            return (
              <TouchableOpacity
                onPress={() => setSelectedReq(item)}
                className={`mb-3 p-4 rounded-2xl border ${
                  isDark
                    ? "bg-[#0e0e0e] border-slate-800"
                    : "bg-white border-gray-200/80"
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 mr-3">
                    <Text
                      className={`font-bold text-base ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {profile?.name || "Unknown Name"}
                    </Text>
                    <Text
                      className={`text-xs mt-0.5 ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      @{profile?.username || "no_username"} • ID:{" "}
                      {profile?.idNumber || "N/A"}
                    </Text>
                  </View>

                  <View
                    className={`px-3 py-1 rounded-full ${
                      item.status === "pending"
                        ? "bg-amber-100 dark:bg-amber-950/60"
                        : item.status === "approved"
                        ? "bg-emerald-100 dark:bg-emerald-950/60"
                        : "bg-rose-100 dark:bg-rose-950/60"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold capitalize ${
                        item.status === "pending"
                          ? "text-amber-700 dark:text-amber-400"
                          : item.status === "approved"
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-rose-700 dark:text-rose-400"
                      }`}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>

                {profile?.address ? (
                  <Text
                    numberOfLines={1}
                    className={`text-xs mt-2 ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    📍 {profile.address}
                  </Text>
                ) : null}
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Review Request Modal */}
      {selectedReq && (
        <Modal transparent animationType="slide" visible={!!selectedReq}>
          <View
            className={`flex-1 justify-end ${
              isDark ? "bg-black/60" : "bg-black/30"
            }`}
          >
            <View
              className={`max-h-[90%] rounded-t-3xl p-5 border-t ${
                isDark
                  ? "bg-[#0e0e0e] border-slate-800"
                  : "bg-[#f3f3f3] border-gray-200"
              }`}
            >
              {/* Modal Header */}
              <View className="flex-row items-center justify-between pb-3 border-b border-gray-200/80 dark:border-slate-800">
                <Text
                  className={`text-lg font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Review Application
                </Text>
                <TouchableOpacity onPress={() => setSelectedReq(null)}>
                  <Ionicons
                    name="close"
                    size={24}
                    color={isDark ? "#fff" : "#000"}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView className="my-4">
                {/* User Metadata */}
                <View
                  className={`p-4 rounded-xl mb-4 border ${
                    isDark
                      ? "bg-[#0e0e0e]/40 border-slate-800"
                      : "bg-white border-gray-200/80"
                  }`}
                >
                  <Text className="text-xs font-bold text-emerald-500 mb-2 uppercase">
                    Profile Information
                  </Text>
                  <Text
                    className={`text-sm ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    <Text className="font-semibold">Full Name:</Text>{" "}
                    {selectedReq.profileData?.name || "N/A"}
                  </Text>
                  <Text
                    className={`text-sm mt-1 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    <Text className="font-semibold">Username:</Text>{" "}
                    {selectedReq.profileData?.username || "N/A"}
                  </Text>
                  <Text
                    className={`text-sm mt-1 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    <Text className="font-semibold">ID Number:</Text>{" "}
                    {selectedReq.profileData?.idNumber || "N/A"}
                  </Text>
                  <Text
                    className={`text-sm mt-1 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    <Text className="font-semibold">Age:</Text>{" "}
                    {selectedReq.profileData?.age || "N/A"}
                  </Text>
                  <Text
                    className={`text-sm mt-1 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    <Text className="font-semibold">Address:</Text>{" "}
                    {selectedReq.profileData?.address || "N/A"}
                  </Text>
                </View>

                {/* Document Images Section Header */}
                <View className="flex-row items-center gap-2 mb-3 mt-1">
                  <Ionicons
                    name="document-text-outline"
                    size={16}
                    color="#10b981"
                  />
                  <Text className="text-xs font-black tracking-widest text-emerald-500 uppercase">
                    Submitted Documents
                  </Text>
                </View>

                {/* Document Cards List */}
                <View className="gap-4 mb-4">
                  {selectedReq.images?.front && (
                    <View>
                      <Text
                        className={`text-xs mb-1.5 font-semibold ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Student ID
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() =>
                          setPreviewImage(selectedReq.images?.front || null)
                        }
                        className={`relative overflow-hidden rounded-2xl border ${
                          isDark
                            ? "border-slate-800 bg-white/5"
                            : "border-gray-200 bg-black/5"
                        }`}
                      >
                        <Image
                          source={{ uri: selectedReq.images.front }}
                          className="w-full h-44"
                          resizeMode="cover"
                        />
                        <View className="absolute top-2.5 right-2.5 bg-black/60 px-2.5 py-1 rounded-full flex-row items-center gap-1 border border-white/20">
                          <Ionicons name="expand-outline" size={14} color="#fff" />
                          <Text className="text-[10px] font-bold text-white">
                            Tap to View
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}

                  {selectedReq.images?.back && (
                    <View>
                      <Text
                        className={`text-xs mb-1.5 font-semibold ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Government ID
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() =>
                          setPreviewImage(selectedReq.images?.back || null)
                        }
                        className={`relative overflow-hidden rounded-2xl border ${
                          isDark
                            ? "border-slate-800 bg-white/5"
                            : "border-gray-200 bg-black/5"
                        }`}
                      >
                        <Image
                          source={{ uri: selectedReq.images.back }}
                          className="w-full h-44"
                          resizeMode="cover"
                        />
                        <View className="absolute top-2.5 right-2.5 bg-black/60 px-2.5 py-1 rounded-full flex-row items-center gap-1 border border-white/20">
                          <Ionicons name="expand-outline" size={14} color="#fff" />
                          <Text className="text-[10px] font-bold text-white">
                            Tap to View
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}

                  {selectedReq.images?.selfie && (
                    <View>
                      <Text
                        className={`text-xs mb-1.5 font-semibold ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Selfie with ID
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() =>
                          setPreviewImage(selectedReq.images?.selfie || null)
                        }
                        className={`relative overflow-hidden rounded-2xl border ${
                          isDark
                            ? "border-slate-800 bg-white/5"
                            : "border-gray-200 bg-black/5"
                        }`}
                      >
                        <Image
                          source={{ uri: selectedReq.images.selfie }}
                          className="w-full h-44"
                          resizeMode="cover"
                        />
                        <View className="absolute top-2.5 right-2.5 bg-black/60 px-2.5 py-1 rounded-full flex-row items-center gap-1 border border-white/20">
                          <Ionicons name="expand-outline" size={14} color="#fff" />
                          <Text className="text-[10px] font-bold text-white">
                            Tap to View
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </ScrollView>

              {/* Action Buttons */}
              <View className="flex-row gap-3 pt-2 border-t border-gray-200/80 dark:border-slate-800">
                <TouchableOpacity
                  disabled={isSubmitting}
                  onPress={() => handleReviewAction("rejected")}
                  className="flex-1 py-3.5 rounded-xl border border-rose-500 items-center justify-center"
                >
                  <Text className="font-bold text-rose-500">Reject</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={isSubmitting}
                  onPress={() => handleReviewAction("approved")}
                  className="flex-1 py-3.5 rounded-xl bg-emerald-600 items-center justify-center"
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text className="font-bold text-white">Approve</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <Modal transparent visible={!!previewImage}>
          <View className="flex-1 bg-black items-center justify-center p-4">
            <TouchableOpacity
              onPress={() => setPreviewImage(null)}
              className="absolute top-12 right-6 z-10 p-2 bg-white/20 rounded-full"
            >
              <Ionicons name="close" size={26} color="#fff" />
            </TouchableOpacity>
            <Image
              source={{ uri: previewImage }}
              className="w-full h-4/5"
              resizeMode="contain"
            />
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}