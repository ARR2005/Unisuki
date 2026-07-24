import { useRedeemCoupons } from "@/feature/coupon/useRedeemCoupons";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

export default function RedeemCouponsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [inputCode, setInputText] = useState("");
  const {
    claimedCoupons,
    userPoints,
    loading,
    isSubmitting,
    redeemCoupon,
    availablePromos,
  } = useRedeemCoupons();

  const handleClaim = async (code: string) => {
    const success = await redeemCoupon(code);
    if (success) {
      setInputText("");
    }
  };

  return (
    <View className={`flex-1 ${isDark ? "bg-[#0e0e0e]" : "bg-[#f3f3f3]"}`}>
      <Stack.Screen
        options={{
          title: "Redeem Coupons",
          headerStyle: { backgroundColor: isDark ? "#0e0e0e" : "#ffffff" },
          headerTintColor: isDark ? "#ffffff" : "#111827",
        }}
      />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Top User Points Banner */}
        <View
          className={`p-4 rounded-2xl border mb-4 flex-row items-center justify-between ${
            isDark
              ? "bg-emerald-950/30 border-emerald-500/30"
              : "bg-emerald-50 border-emerald-200"
          }`}
        >
          <View className="flex-row items-center gap-2.5">
            <View className="w-10 h-10 rounded-xl bg-emerald-500/20 items-center justify-center">
              <Ionicons name="star" size={20} color="#059669" />
            </View>
            <View>
              <Text
                className={`text-xs font-semibold ${
                  isDark ? "text-emerald-400" : "text-emerald-800"
                }`}
              >
                Your Balance
              </Text>
              <Text
                className={`text-lg font-extrabold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {userPoints} Points
              </Text>
            </View>
          </View>
        </View>

        {/* Promo Code Input Card */}
        <View
          className={`p-4 rounded-2xl border mb-6 ${
            isDark
              ? "bg-[#0e0e0e]/40 border-slate-800"
              : "bg-white border-gray-200/80"
          }`}
        >
          <Text
            className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${
              isDark ? "text-emerald-400" : "text-emerald-800"
            }`}
          >
            Enter Promo Code
          </Text>

          <View className="flex-row items-center gap-2">
            <TextInput
              value={inputCode}
              onChangeText={setInputText}
              placeholder="e.g. SUKI5AVE or WELCOME10"
              placeholderTextColor={isDark ? "#64748b" : "#9ca3af"}
              autoCapitalize="characters"
              className={`flex-1 px-4 py-3 text-sm rounded-xl border ${
                isDark
                  ? "bg-slate-900/60 border-slate-800 text-white"
                  : "bg-gray-50 border-gray-200 text-gray-900"
              }`}
            />

            <TouchableOpacity
              disabled={isSubmitting || !inputCode.trim()}
              onPress={() => handleClaim(inputCode)}
              className={`px-5 py-3 rounded-xl bg-emerald-600 items-center justify-center ${
                isSubmitting || !inputCode.trim()
                  ? "opacity-50"
                  : "active:bg-emerald-700"
              }`}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-white font-bold text-sm">Redeem</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* System Available Vouchers Section */}
        <View className="mb-6">
          <Text
            className={`text-sm font-bold uppercase tracking-wider mb-3 ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Available Promos
          </Text>

          <View className="gap-3">
            {availablePromos.map((coupon) => {
              const isClaimed = claimedCoupons.some(
                (c) => c.code?.toUpperCase() === coupon.code.toUpperCase()
              );
              const hasEnoughPoints = userPoints >= coupon.pointsCost;

              return (
                <View
                  key={coupon.code}
                  className={`p-4 rounded-2xl border flex-row items-center justify-between ${
                    isDark
                      ? "bg-[#0e0e0e]/40 border-slate-800"
                      : "bg-white border-gray-200/80"
                  }`}
                >
                  <View className="flex-1 pr-3">
                    <View className="flex-row items-center gap-2 mb-1">
                      <View className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60">
                        <Text className="text-emerald-700 dark:text-emerald-400 font-extrabold text-xs">
                          {coupon.code}
                        </Text>
                      </View>
                      <View className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60">
                        <Text className="text-amber-700 dark:text-amber-400 font-bold text-[10px]">
                          {coupon.pointsCost} Points
                        </Text>
                      </View>
                    </View>

                    <Text
                      className={`font-bold text-sm ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {coupon.title}
                    </Text>
                    <Text
                      className={`text-xs mt-0.5 ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {coupon.description}
                    </Text>
                  </View>

                  <TouchableOpacity
                    disabled={isClaimed || !hasEnoughPoints || isSubmitting}
                    onPress={() => handleClaim(coupon.code)}
                    className={`px-3.5 py-2 rounded-xl border ${
                      isClaimed
                        ? isDark
                          ? "bg-slate-800/40 border-slate-800"
                          : "bg-gray-100 border-gray-200"
                        : !hasEnoughPoints
                        ? "bg-gray-300 border-gray-300 dark:bg-slate-800/50 dark:border-slate-800"
                        : "bg-emerald-600 border-emerald-600 active:bg-emerald-700"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        isClaimed || !hasEnoughPoints
                          ? isDark
                            ? "text-gray-500"
                            : "text-gray-400"
                          : "text-white"
                      }`}
                    >
                      {isClaimed
                        ? "Claimed"
                        : !hasEnoughPoints
                        ? "Need Points"
                        : "Claim"}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        {/* My Unlocked Coupons Section */}
        <View>
          <Text
            className={`text-sm font-bold uppercase tracking-wider mb-3 ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            My Unlocked Coupons ({claimedCoupons.length})
          </Text>

          {loading ? (
            <ActivityIndicator size="small" color="#059669" className="py-6" />
          ) : claimedCoupons.length === 0 ? (
            <View
              className={`p-6 rounded-2xl border items-center justify-center ${
                isDark
                  ? "bg-[#0e0e0e]/20 border-slate-800/60"
                  : "bg-white border-gray-200/60"
              }`}
            >
              <Ionicons
                name="ticket-outline"
                size={36}
                color={isDark ? "#475569" : "#9ca3af"}
              />
              <Text
                className={`text-sm font-semibold mt-2 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                No active coupons claimed yet
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {claimedCoupons.map((coupon) => (
                <View
                  key={coupon.id || coupon.code}
                  className={`p-4 rounded-2xl border flex-row items-center gap-3 ${
                    isDark
                      ? "bg-[#0e0e0e]/40 border-slate-800"
                      : "bg-white border-gray-200/80"
                  }`}
                >
                  <View className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 items-center justify-center">
                    <Ionicons name="pricetag" size={20} color="#059669" />
                  </View>

                  <View className="flex-1">
                    <Text
                      className={`font-bold text-sm ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {coupon.title || coupon.code}
                    </Text>
                    <Text
                      className={`text-xs mt-0.5 ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Discount: ₱{coupon.discountAmount}
                    </Text>
                  </View>

                  <View
                    className={`px-2.5 py-1 rounded-full border ${
                      coupon.isUsed
                        ? isDark
                          ? "bg-slate-800/40 border-slate-800"
                          : "bg-gray-100 border-gray-300"
                        : "bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700/50"
                    }`}
                  >
                    <Text
                      className={`font-bold text-[10px] ${
                        coupon.isUsed
                          ? isDark
                            ? "text-gray-500"
                            : "text-gray-400"
                          : "text-emerald-700 dark:text-emerald-400"
                      }`}
                    >
                      {coupon.isUsed ? "Used" : "Ready to use"}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}