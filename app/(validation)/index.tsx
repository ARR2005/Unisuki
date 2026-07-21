

import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import CreateProfileForm from "@/feature/validation/createProfileForm";
import SubmitPictureScreen from "@/feature/validation/submitPictureScreen";
import WelcomeScreen from "@/feature/validation/welcomeScreen";

export default function Index() {
  const [currentStep, setCurrentStep] = useState(1);

  const next = () => setCurrentStep((s) => Math.min(s + 1, 3));
  const prev = () => setCurrentStep((s) => Math.max(s - 1, 1));

  // Dynamically render the screen based on the current step
  const renderStep = () => {
    switch (currentStep) {

      case 1:
        return <WelcomeScreen />;
        case 2:
        return <CreateProfileForm />;
        case 3:
        return <SubmitPictureScreen/>;
      default:
        return <CreateProfileForm />;
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 items-center justify-between pt-6 bg-white">
          {/* Progress Indicator */}
          <View className="w-full flex-row items-center justify-around px-6">
            {[1, 2, 3].map((step) => (
              <View
                key={step}
                className={`h-2.5 w-28 rounded-full ${
                  currentStep >= step ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            ))}
          </View>

          {/* Active Step Content */}
          <View className="w-full flex-1">{renderStep()}</View>

          {/* Navigation Controls  */}
          <View className="mb-6 py-4 w-full border-t border-t-slate-200 flex-row items-center justify-between px-6">
            <TouchableOpacity
              onPress={prev}
              disabled={currentStep === 1}
              className={`rounded-lg border border-gray-300 px-4 py-2 ${
                currentStep === 1 ? "opacity-30" : "active:bg-gray-100"
              }`}
            >
              <Text className="font-semibold text-gray-800">Previous Step</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={next}
              disabled={currentStep === 3}
              className={`rounded-lg bg-green-600 px-4 py-2 ${
                currentStep === 3 ? "opacity-30" : "active:bg-green-700"
              }`}
            >
              <Text className="font-semibold text-white">Next Step</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


