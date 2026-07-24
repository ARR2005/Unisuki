import React from "react";
import { Image, Text, View, useColorScheme } from "react-native";

interface ProfileHeaderProps {
  user: {
    username?: string;
    avatar?: string;
  } | null;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  if (!user) return null;

  const displayInitial = user.username?.[0]?.toUpperCase() || "U";

  return (
    <View className="items-center py-6">
      {user.avatar ? (
        <Image
          source={{ uri: user.avatar }}
          className={`w-24 h-24 rounded-full border-4 ${
            isDark ? "border-slate-700" : "border-white"
          }`}
        />
      ) : (
        <View
          className={`w-24 h-24 rounded-full border-4 items-center justify-center bg-emerald-600 ${
            isDark ? "border-slate-700" : "border-white"
          }`}
        >
          <Text className="text-white text-3xl font-bold">
            {displayInitial}
          </Text>
        </View>
      )}

      <Text
        className={`text-xl font-bold mt-3 ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        {user.username || "User"}
      </Text>

      <Text
        className={`text-xs mt-0.5 font-medium ${
          isDark ? "text-emerald-400" : "text-emerald-700"
        }`}
      >
        Unisuki Member
      </Text>
    </View>
  );
};

export default ProfileHeader;