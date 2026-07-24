import { auth, db } from "@/service/firebaseConfigs";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View, useColorScheme } from "react-native";

export default function Header() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [username, setUsername] = useState<string>("");
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setLoadingUser(false);
          return;
        }

        // 1. First check userVerifications for profileData.username
        const q = query(
          collection(db, "userVerifications"),
          where("uid", "==", currentUser.uid)
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          if (userData?.profileData?.username) {
            setUsername(userData.profileData.username);
            setLoadingUser(false);
            return;
          }
        }

        // 2. Fallback check user collection document (user/{uid})
        const userDocRef = doc(db, "user", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const uData = userDoc.data();
          const fetchedName =
            uData?.username || uData?.name || uData?.fullName;
          if (fetchedName) {
            setUsername(fetchedName);
            setLoadingUser(false);
            return;
          }
        }

        // 3. Auth Display Name Fallback
        setUsername(currentUser.displayName || currentUser.email?.split("@")[0] || "User");
      } catch (error) {
        console.error("Error fetching username:", error);
        setUsername("User");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    let unsubscribeNotifications: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeNotifications?.();
      unsubscribeNotifications = undefined;

      if (!user) {
        setUnreadCount(0);
        return;
      }

      const notificationsRef = collection(db, "notifications");
      const q = query(notificationsRef, where("recipientUid", "==", user.uid));

      unsubscribeNotifications = onSnapshot(q, (snapshot) => {
        const unread = snapshot.docs.filter(
          (docSnap) => !docSnap.data().read
        ).length;
        setUnreadCount(unread);
      });
    });

    return () => {
      unsubscribeAuth();
      unsubscribeNotifications?.();
    };
  }, []);

  const handleNotificationPress = () => {
    router.push("/(notification)");
  };

  return (
    <View className="w-full px-5 pt-6 pb-4">
      <View className="flex-row justify-between items-start">
        <View>
          <Text className={`text-lg font-medium ${isDark ? "text-emerald-400" : "text-emerald-800"}`}>
            Hello Welcome back!
          </Text>
          {loadingUser ? (
            <ActivityIndicator
              size="small"
              color="#059669"
              className="self-start mt-2 ml-6"
            />
          ) : (
            <Text className={`text-4xl ml-6 font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              {username || "Guest"}
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={handleNotificationPress}
          className={`p-3 rounded-full border ${
            isDark
              ? "bg-[#0e0e0e]/40 border-green-800"
              : "bg-white border-gray-200"
          }`}
          activeOpacity={0.7}
        >
          <Ionicons
            name="notifications-outline"
            size={22}
            color={isDark ? "#ffffff" : "#1F2937"}
          />
          {unreadCount > 0 && (
            <View className="absolute -top-1 -right-1 min-w-5 h-5 rounded-full bg-rose-500 items-center justify-center px-1">
              <Text className="text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}