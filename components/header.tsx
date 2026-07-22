import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import auth from "@/service/firebaseConfigs";

const MODE_STORAGE_KEY = "@user_active_mode";

interface HeaderProps {
  activeMode?: "buyer" | "seller";
  onModeChange: (mode: "buyer" | "seller") => void;
  onNotificationPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeMode = "buyer",
  onModeChange,
  onNotificationPress,
}) => {
  const [username, setUsername] = useState<string>("");
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [mode, setMode] = useState<"buyer" | "seller">(activeMode);

  useEffect(() => {
    const loadSavedMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(MODE_STORAGE_KEY);
        if (savedMode === "buyer" || savedMode === "seller") {
          setMode(savedMode);
          onModeChange(savedMode); // Notify parent of saved state
        }
      } catch (error) {
        console.error("Failed to load mode from storage:", error);
      }
    };

    loadSavedMode();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setLoadingUser(false);
          return;
        }

        const db = getFirestore();
        const q = query(
          collection(db, "userVerifications"),
          where("uid", "==", currentUser.uid)
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setUsername(userData?.profileData?.username || "User");
        } else {
          setUsername("User");
        }
      } catch (error) {
        console.error("Error fetching username:", error);
        setUsername("User");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserData();
  }, []);

  // 2. Save mode to AsyncStorage when user toggles
  const handleModeSwitch = async (newMode: "buyer" | "seller") => {
    try {
      setMode(newMode);
      onModeChange(newMode); // Notify parent component
      await AsyncStorage.setItem(MODE_STORAGE_KEY, newMode); 
    } catch (error) {
      console.error("Failed to save mode to storage:", error);
    }
  };

  return (
    <View className="w-full bg-white px-5 pt-12 pb-4 border-b border-gray-100 shadow-sm">
      {/* Top Row: Greeting & Bell Icon */}
      <View className="flex-row justify-between items-start">
        <View>
          <Text className="text-gray-500 text-sm font-medium">Hello!</Text>
          {loadingUser ? (
            <ActivityIndicator size="small" color="#4F46E5" className="self-start mt-1" />
          ) : (
            <Text className="text-gray-900 text-xl font-bold mt-0.5">
              {username || "Guest"}
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={onNotificationPress}
          className="p-2 bg-gray-50 rounded-full border border-gray-100"
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={22} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* Mode Switcher Buttons */}
      <View className="items-center mt-4">
        <View className="flex-row bg-gray-100 p-1 rounded-full w-56 border border-gray-200">
          <TouchableOpacity
            onPress={() => handleModeSwitch("buyer")}
            className={`flex-1 py-1.5 rounded-full items-center justify-center ${
              mode === "buyer" ? "bg-indigo-600 shadow-sm" : "bg-transparent"
            }`}
            activeOpacity={0.8}
          >
            <Text
              className={`text-xs font-semibold ${
                mode === "buyer" ? "text-white" : "text-gray-600"
              }`}
            >
              Buyer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleModeSwitch("seller")}
            className={`flex-1 py-1.5 rounded-full items-center justify-center ${
              mode === "seller" ? "bg-indigo-600 shadow-sm" : "bg-transparent"
            }`}
            activeOpacity={0.8}
          >
            <Text
              className={`text-xs font-semibold ${
                mode === "seller" ? "text-white" : "text-gray-600"
              }`}
            >
              Seller
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Header;