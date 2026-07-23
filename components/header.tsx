import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import auth from "@/service/firebaseConfigs";

export default function Header() {
  const [username, setUsername] = useState<string>("");
  const [loadingUser, setLoadingUser] = useState<boolean>(true);

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

  const handleNotificationPress = () => {
    // Add default notification action or leave empty
  };

  return (
    <View className="w-full bg-white px-5 pt-12 pb-4 border-b border-gray-100 shadow-sm">
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
          onPress={handleNotificationPress}
          className="p-2 bg-gray-50 rounded-full border border-gray-100"
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={22} color="#1F2937" />
        </TouchableOpacity>
      </View>
    </View>
  );
}