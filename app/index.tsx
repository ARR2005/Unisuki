import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Text, View, useColorScheme } from "react-native";
import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import auth from "@/service/firebaseConfigs";
import { useAuthPersistence } from "@/feature/Auth/hooks/useAuthPersistence";

export default function SplashScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { getSavedLogin, clearLogin } = useAuthPersistence();
  const [statusMessage, setStatusMessage] = useState(
    "Checking your saved session..."
  );

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const savedLogin = await getSavedLogin();

        if (!savedLogin?.email || !savedLogin?.password) {
          if (isMounted) {
            router.replace("/(auth)");
          }
          return;
        }

        setStatusMessage("Restoring your session...");

        const credential = await signInWithEmailAndPassword(
          auth,
          savedLogin.email,
          savedLogin.password
        );

        const db = getFirestore();
        const verificationQuery = query(
          collection(db, "userVerifications"),
          where("uid", "==", credential.user.uid)
        );
        const verificationSnapshot = await getDocs(verificationQuery);

        const hasCompleteSetup = verificationSnapshot.docs.some((doc) => {
          const data = doc.data() as { isSetupComplete?: boolean };
          return data.isSetupComplete === true;
        });

        if (!isMounted) return;

        if (hasCompleteSetup) {
          router.replace("/(dashboard)/home");
        } else {
          router.replace("/(validation)/welcomeScreen");
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("Session restoration failed:", error);
        await clearLogin();
        router.replace("/(auth)");
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [clearLogin, getSavedLogin]);

  return (
    <View
      className={`flex-1 items-center justify-center p-4 ${
        isDark ? "bg-[#0e0e0e]" : "bg-[#f3f3f3]"
      }`}
    >
      <Image
        source={require("@/assets/images/react-logo.png")}
        className="w-80 h-80"
        resizeMode="contain"
      />
      <ActivityIndicator
        size="large"
        color="#059669"
        className="mt-8 scale-[1.5]"
      />
      <Text
        className={`mt-8 text-sm font-medium text-center ${
          isDark ? "text-gray-400" : "text-gray-600"
        }`}
      >
        {statusMessage}
      </Text>
    </View>
  );
}