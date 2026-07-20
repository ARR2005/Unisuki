
import { BlurView } from "expo-blur";
import React, { useEffect, useState } from "react";
import {
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";

import SignInForm from "@/feature/Auth/components/signInForm";
import SignUpForm from "@/feature/Auth/components/signUpForm";

export default function Index() {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const isDark = useColorScheme() === "dark";
  const [form, setForm] = useState(true);
  const blurTint = isDark ? "light" : "dark";

  function toggleForm() {
    setForm((prev) => !prev);
  }

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center justify-end flex-1 px-1">
            <View
                className={`w-full items-center justify-center ${
                isKeyboardVisible ? "pt-10 pb-6 mb-52" : "py-6"
                }`}
            >
                {/* Main Logo Graphic */}
                {!isKeyboardVisible && (
                <Image
                    source={require("@/assets/images/react-logo.png")}
                    className="w-[180px] h-[180px] my-10"
                    resizeMode="contain"
                />
            )}
            <View className="w-full px-4 ">
              <BlurView
                intensity={10}
                tint={blurTint}
                className={`w-full px-4 pt-5 pb-2 px-8  rounded-[20px] mt-2 border border-white/10  overflow-hidden `}
              >
                {form ? <SignInForm /> : <SignUpForm />}

                {/* Form Mode Toggle Button Link */}
                <TouchableOpacity onPress={toggleForm} className="mt-4">
                  <Text
                    className={`text-center ${isDark ? "text-white" : "text-black"}`}
                  >
                    {form
                      ? "Don't have an account? "
                      : "Already have an account? "}
                    <Text className="text-green-500 font-bold">
                      {form ? "Sign Up" : "Log In"}
                    </Text>
                  </Text>
                </TouchableOpacity>
              </BlurView>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
