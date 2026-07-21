import dashboardLogo from "@/assets/images/icon/dashboardLogo.png";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface WelcomeScreenProps {
  onGetStarted: () => void | Promise<void>;
  disabled?: boolean;
}

export default function WelcomeScreen({
  onGetStarted,
  disabled = false,
}: WelcomeScreenProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Smooth Scale Pulsing Sequence
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  // Handle custom button logic before proceeding
  const handlePress = async () => {
    router.push("/(validation)/validation");
  };

  return (
    <View className="flex-1 items-center justify-between px-6 py-12">
      {/* Logo Container */}
      <View className="flex-1 items-center justify-center">
        <Image
          source={dashboardLogo}
          className="h-[320px] w-[320px]"
          resizeMode="contain"
        />
      </View>

      {/* Subtitle */}
      <Text className="text-center text-sm leading-6 text-gray-600 dark:text-slate-400 mb-8 px-4">
        Start your account setup and join the campus marketplace
      </Text>

      {/* Pulsing Dashed Border Ring + Button */}
      <View className="relative items-center justify-center my-4">
        {/* Pulsing Dashed Outer Ring */}
        <Animated.View
          style={[
            {
              transform: [{ scale: pulseAnim }],
              borderStyle: "dashed",
              borderWidth: 1.2,
              borderColor: "#16a34a",
            },
          ]}
          className="absolute h-20 w-64 rounded-full"
        />

        {/* Action Button */}
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.8}
          disabled={disabled || loading}
          className={`rounded-full bg-green-600 px-20 py-4 shadow-lg ${
            disabled || loading ? "opacity-50" : ""
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-xl font-bold text-white">Get Started</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}