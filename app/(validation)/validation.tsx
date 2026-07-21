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

export default function Validation() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  const next = () => setCurrentStep((s) => Math.min(s + 1, totalSteps));
  const prev = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const handleProceedToDashboard = () => {
    alert("Proceeding to Dashboard...");
  };

  // Dynamically render screen based on active step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <CreateProfileForm />;
      case 2:
        return <SubmitPictureScreen />;
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
        <View className="flex-1 items-center justify-between pt-4 bg-white">
          {/* Progress Indicator Header */}
          <View className="w-full flex-row items-center justify-between px-6 py-2">
            {[1, 2].map((step) => (
              <View
                key={step}
                className={`h-2.5 flex-1 mx-1 rounded-full ${
                  currentStep >= step
                    ? "bg-green-600"
                    : "bg-gray-200 dark:bg-slate-700"
                }`}
              />
            ))}
          </View>

          {/* Active Step Content */}
          <View className="w-full flex-1">{renderStep()}</View>

          {/* Navigation Controls Footer */}
          <View className="pt-2 pb-10 w-full border-t border-slate-200 dark:border-slate-800 flex-row items-center justify-between px-6">
            <TouchableOpacity
              onPress={prev}
              disabled={currentStep === 1}
              className={`rounded-lg border border-gray-300 dark:border-slate-700 px-4 py-2.5 ${
                currentStep === 1
                  ? "opacity-0"
                  : "active:bg-gray-100 dark:active:bg-slate-800"
              }`}
            >
              <Text className="font-semibold text-gray-800 dark:text-slate-200">
                Previous Step
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={currentStep === totalSteps ? handleProceedToDashboard : next}
              className="rounded-lg bg-green-600 px-5  py-2.5"
              activeOpacity={0.8}
            >
              <Text className="font-semibold text-white">
                {currentStep === totalSteps ? "Proceed to Dashboard" : "Next Step"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}