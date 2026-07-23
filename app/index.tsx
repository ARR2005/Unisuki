import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";
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
    <View className="bg-primary dark:bg-darkPrimary flex-1 items-center justify-center p-4">
      <Image
        source={require("@/assets/images/react-logo.png")}
        className="w-80 h-80"
        resizeMode="contain"
      />
      <ActivityIndicator
        size="large"
        color="orange"
        className="mt-8 scale-[2]"
      />
      <Text className="mt-8 text-sm text-gray-500 dark:text-gray-400 text-center font-medium">
        {statusMessage}
      </Text>
    </View>
  );
}