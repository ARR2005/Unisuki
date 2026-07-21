import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CreateProfileForm from "@/feature/validation/createProfileForm";
import {
  useInsertUserVerification,
  type VerificationProfileData,
} from "@/feature/validation/hooks/useInsertUserVerification";
import SubmitPictureScreen from "@/feature/validation/submitPictureScreen";
import TermAndCondition from "@/feature/validation/termAndCondition";
import { router } from "expo-router";

export default function Validation() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [profileData, setProfileData] = useState<VerificationProfileData>({
    name: "",
    username: "",
    idNumber: "",
    age: "",
    address: "",
  });
  const totalSteps = 2;
  const createProfileFormRef = useRef<{ validateForm: () => boolean }>(null);
  const submitPictureRef = useRef<{
    validateImages: () => boolean;
    getImages: () => Record<string, string | null>;
  }>(null);

  const next = () => setCurrentStep((s) => Math.min(s + 1, totalSteps));
  const prev = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const {
    insertUserVerification,
    isSubmitting,
    error: submissionError,
  } = useInsertUserVerification();

  const handleProceedToDashboard = () => {
    const isValid = submitPictureRef.current?.validateImages() ?? false;
    if (!isValid) return;
    setIsDialogOpen(true);
  };

  const handleSubmitVerification = async () => {
    if (!isChecked) return;
    const images = submitPictureRef.current?.getImages();
    if (!images) return;

    try {
      await insertUserVerification(profileData, {
        front: images.front,
        back: images.back,
        selfie: images.selfie,
      });
      setIsDialogOpen(false);
      router.push("/(dashboard)/home")
    } catch {
      // error is handled by the hook
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      const isValid = createProfileFormRef.current?.validateForm() ?? false;
      if (!isValid) return;
      next();
      return;
    }

    if (currentStep === totalSteps) {
      handleProceedToDashboard();
    }
  };

  // Dynamically render screen based on active step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CreateProfileForm
            ref={createProfileFormRef}
            onDataChange={setProfileData}
          />
        );
      case 2:
        return <SubmitPictureScreen ref={submitPictureRef} />;
      default:
        return <CreateProfileForm ref={createProfileFormRef} />;
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
              onPress={handleNext}
              className="rounded-lg bg-green-600 px-5  py-2.5"
              activeOpacity={0.8}
            >
              <Text className="font-semibold text-white">
                {currentStep === totalSteps
                  ? "Proceed to Dashboard"
                  : "Next Step"}
              </Text>
            </TouchableOpacity>
          </View>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="w-full max-w-xl">
              <DialogHeader>
                <DialogTitle>Terms and Conditions</DialogTitle>
                <DialogDescription>
                  By completing this form you have agreed with the Terms and
                  Conditions. Review the full details below, then confirm to
                  submit your verification. All details entered here will be
                  checked by the admin to ensure all information is correct.
                </DialogDescription>
              </DialogHeader>
              <View className="mt-2 flex-row items-center gap-3">
                {/* Checkbox Button */}
                <TouchableOpacity
                  onPress={() => setIsChecked((current) => !current)}
                  className="h-6 w-6 items-center justify-center rounded-md border border-gray-300 bg-white"
                  activeOpacity={0.7}
                >
                  {isChecked && (
                    <Ionicons name="checkmark" size={18} color="#16a34a" />
                  )}
                </TouchableOpacity>

                {/* Inline Text Wrapper */}
                <Text className="flex-1 text-sm text-gray-700">
                  By checking this box, I accept the{" "}
                  <Text
                    onPress={() => setShowTermsModal(true)}
                    className="font-semibold text-green-600 underline"
                  >
                    Terms and Conditions
                  </Text>
                </Text>
              </View>
              {submissionError ? (
                <Text className="mt-4 text-sm text-red-600">
                  {submissionError}
                </Text>
              ) : null}

              <TouchableOpacity
                onPress={handleSubmitVerification}
                disabled={isSubmitting || !isChecked}
                className={`mt-4 w-full rounded-xl bg-green-600 px-4 py-3 text-center ${
                  isSubmitting || !isChecked ? "opacity-70" : ""
                }`}
              >
                <Text className="text-center font-semibold text-white">
                  {isSubmitting ? "Submitting..." : "Confirm and Submit"}
                </Text>
              </TouchableOpacity>

              <Modal
                visible={showTermsModal}
                animationType="slide"
                onRequestClose={() => setShowTermsModal(false)}
              >
                <TermAndCondition
                  onClose={() => setShowTermsModal(false)}
                  onAgree={() => {
                    setIsChecked(true);
                    setShowTermsModal(false);
                  }}
                />
              </Modal>
            </DialogContent>
          </Dialog>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
