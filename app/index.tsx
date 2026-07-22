import { useAuthPersistence } from "@/feature/Auth/hooks/useAuthPersistence";
import auth from "@/service/firebaseConfigs";
import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function SplashScreen() {
  const { getSavedLogin, clearLogin } = useAuthPersistence();
  const [statusMessage, setStatusMessage] = useState(
    "Checking your saved session...",
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
          savedLogin.password,
        );

        const db = getFirestore();
        const verificationQuery = query(
          collection(db, "userVerifications"),
          where("uid", "==", credential.user.uid),
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
      } catch {
        if (!isMounted) return;
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
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#16a34a" />
      <Text className="mt-4 text-base text-gray-600">{statusMessage}</Text>
    </View>
  );
}
