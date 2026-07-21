// import { Ionicons } from "@expo/vector-icons";
// import { getAuth } from "firebase/auth";
// import React, { useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Modal,
//   Platform,
//   ScrollView,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";

// import { View, Text, TouchableOpacity } from 'react-native'
// import React from 'react'
// import { useState, useEffect } from 'react'

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
import SubmitGovIdScreen from "@/feature/validation/submitIdScreen";
import SubmitUserIdScreen from "@/feature/validation/submitUserIdScreen";

export default function Index() {
  const [currentStep, setCurrentStep] = useState(1);

  const next = () => setCurrentStep((s) => Math.min(s + 1, 3));
  const prev = () => setCurrentStep((s) => Math.max(s - 1, 1));

  // Dynamically render the screen based on the current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <CreateProfileForm />;
      case 2:
        return <SubmitGovIdScreen />;
      case 3:
        return <SubmitUserIdScreen />;
      default:
        return <CreateProfileForm />;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 items-center justify-between pt-6">
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

          {/* Navigation Controls */}
          <View className="mb-6 w-full flex-row items-center justify-between px-6">
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

// interface ProfileCompletionModalProps {
//   visible: boolean;
//   onComplete: () => void;
// }

// export const ProfileCompletionModal: React.FC<ProfileCompletionModalProps> = ({
//   visible,
//   onComplete,
// }) => {
//   const [formData, setFormData] = useState({
//     name: "",
//     username: "",
//     idNumber: "",
//     age: "",
//     address: "",
//   });
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [isAgreed, setIsAgreed] = useState(false);
//   const [showTerms, setShowTerms] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isLoadingProfile, setIsLoadingProfile] = useState(false);

//   // Check authentication and load existing profile when modal opens
//   useEffect(() => {
//     if (visible) {
//       const auth = getAuth();
//       const currentUser = auth.currentUser;

//       if (!currentUser) {
//         setErrors((prev) => ({
//           ...prev,
//           general:
//             "You must be logged in to complete your profile. Please log in first.",
//         }));
//       } else {
//         // Load existing profile if it exists
//         loadExistingProfile();
//       }
//     }
//   }, [visible]);

//   const loadExistingProfile = async () => {
//     try {
//       setIsLoadingProfile(true);
//       const profile = await UserProfileService.getUserProfile();

//       if (profile) {
//         setFormData({
//           name: profile.name || "",
//           username: profile.username,
//           idNumber: profile.idNumber,
//           age: profile.age.toString(),
//           address: profile.address,
//         });
//       } else {
//         // No existing profile found
//       }
//     } catch (error) {
//       // Error loading existing profile
//     } finally {
//       setIsLoadingProfile(false);
//     }
//   };

//   const updateField = (field: string, value: string) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//     // Clear error for this field when user starts typing
//     if (errors[field]) {
//       setErrors((prev) => {
//         const newErrors = { ...prev };
//         delete newErrors[field];
//         return newErrors;
//       });
//     }
//   };

//   const validateForm = (): boolean => {
//     const newErrors: Record<string, string> = {};

//     // Name validation
//     if (!formData.name.trim()) {
//       newErrors.name = "Name is required";
//     } else if (formData.name.length < 2) {
//       newErrors.name = "Name must be at least 2 characters";
//     } else if (formData.name.length >= 50) {
//       newErrors.name = `Name must be less than 50 characters (current: ${formData.name.length})`;
//     }

//     // Username validation: <15 characters
//     if (!formData.username.trim()) {
//       newErrors.username = "Username is required";
//     } else if (formData.username.length >= 15) {
//       newErrors.username = `Username must be less than 15 characters (current: ${formData.username.length})`;
//     } else if (formData.username.length < 3) {
//       newErrors.username = "Username must be at least 3 characters";
//     }

//     const idPattern = /^\d{2}-\d{4}-\d{3}$/;
//     if (!formData.idNumber.trim()) {
//       newErrors.idNumber = "ID Number is required";
//     } else if (!idPattern.test(formData.idNumber)) {
//       newErrors.idNumber = "ID Number must be in format 12-1234-123";
//     }

//     // Age validation: >13 and <80
//     if (!formData.age.trim()) {
//       newErrors.age = "Age is required";
//     } else {
//       const age = Number(formData.age);
//       if (isNaN(age)) {
//         newErrors.age = "Age must be a valid number";
//       } else if (age <= 13) {
//         newErrors.age = "You must be older than 13 years";
//       } else if (age >= 80) {
//         newErrors.age = "Age must be less than 80 years";
//       }
//     }

//     // Address validation: <50 characters
//     if (!formData.address.trim()) {
//       newErrors.address = "Address is required";
//     } else if (formData.address.length >= 50) {
//       newErrors.address = `Address must be less than 50 characters (current: ${formData.address.length})`;
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleComplete = async () => {
//     if (!validateForm()) {
//       return;
//     }

//     if (!isAgreed) {
//       setErrors((prev) => ({
//         ...prev,
//         general: "You must agree to the Terms and Conditions to continue.",
//       }));
//       return;
//     }

//     setIsLoading(true);
//     try {
//       await UserProfileService.saveProfile({
//         name: formData.name,
//         username: formData.username,
//         idNumber: formData.idNumber,
//         age: Number(formData.age),
//         address: formData.address,
//         completedProfile: true,
//       });

//       onComplete();
//     } catch (error) {
//       const errorMessage =
//         error instanceof Error ? error.message : "Unknown error occurred";
//       setErrors((prev) => ({
//         ...prev,
//         general: `Failed to save profile: ${errorMessage}. Make sure you're logged in.`,
//       }));
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <Modal visible={visible} animationType="slide" transparent={false}>
//       {showTerms ? (
//         <View className="flex-1 pt-12 bg-white">

//         </View>
//       ) : (
//         <KeyboardAvoidingView
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//           className="flex-1 bg-white"
//         >
//           <ScrollView className="flex-1 px-12 pt-12">
//
//           </ScrollView>
//         </KeyboardAvoidingView>
//       )}
//     </Modal>
//   );
// };

// export default ProfileCompletionModal;
