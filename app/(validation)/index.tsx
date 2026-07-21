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

import { View, Text } from 'react-native'
import React from 'react'
import { useState, useEffect } from 'react'

export default function index() {
  const [currentStep, setCurrentStep] = useState<number>(1);

  function handleNextStep() {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  }
  return (
    <View className="flex-1 items-center justify-start pt-10 bg-white">
      <View className="flex-row justify-around items-center w-full px-6">
        <View className="bg-black w-28 h-3 rounded-full "> </View>
        <View className={`bg-green-400 w-28 h-3 rounded-full ${currentStep >= 2 ? 'bg-green-400' : 'bg-black'}`}> </View>
        <View className={`bg-green-400 w-28 h-3 rounded-full ${currentStep >= 3 ? 'bg-green-400' : 'bg-black'}`}> </View>
      </View>

      


    </View>
  )
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
//             {/* Header */}
//             <View className="mb-1">
//               <View className="flex-row items-center mb-4">
//                 <Ionicons
//                   name="person-circle-outline"
//                   size={36}
//                   color="#16a34a"
//                 />
//                 <Text className="ml-3 text-2xl font-bold text-gray-900">
//                   Complete Your Profile
//                 </Text>
//               </View>
//               <Text className="text-base text-gray-600">
//                 Please provide information to help other students find and trust
//                 you on Unisuki.
//               </Text>
//             </View>

//             {/* Form Fields */}
//             <View className="mb-6">
//               {/* Name */}
//               <View className="mb-3">
//                 <View className="flex-row items-center justify-between mb-2">
//                   <Text className="font-semibold text-gray-800">Full Name</Text>
//                   <Text
//                     className={`text-xs ${formData.name.length >= 50 ? "text-red-500 font-semibold" : "text-gray-500"}`}
//                   >
//                     {formData.name.length}/49
//                   </Text>
//                 </View>
//                 <View
//                   className={`border rounded-lg px-4 py-1 flex-row items-center ${
//                     errors.name ? "border-red-500 bg-red-50" : "border-gray-300"
//                   }`}
//                 >
//                   <Ionicons
//                     name="person-circle-outline"
//                     size={20}
//                     color={errors.name ? "#ef4444" : "#666"}
//                     style={{ marginRight: 8 }}
//                   />
//                   <TextInput
//                     placeholder="Enter your full name"
//                     value={formData.name}
//                     onChangeText={(value) => updateField("name", value)}
//                     className="flex-1 text-base text-gray-900"
//                     editable={!isLoading}
//                     placeholderTextColor="#999"
//                     maxLength={49}
//                   />
//                 </View>
//                 {errors.name && (
//                   <Text className="mt-1 text-xs font-semibold text-red-500">
//                     {errors.name}
//                   </Text>
//                 )}
//               </View>

//               {/* Username */}
//               <View className="mb-3">
//                 <View className="flex-row items-center justify-between mb-2">
//                   <Text className="font-semibold text-gray-800">Username</Text>
//                   <Text
//                     className={`text-xs ${formData.username.length >= 15 ? "text-red-500 font-semibold" : "text-gray-500"}`}
//                   >
//                     {formData.username.length}/14
//                   </Text>
//                 </View>
//                 <View
//                   className={`border rounded-lg px-4 py-1 flex-row items-center ${
//                     errors.username
//                       ? "border-red-500 bg-red-50"
//                       : "border-gray-300"
//                   }`}
//                 >
//                   <Ionicons
//                     name="person-outline"
//                     size={20}
//                     color={errors.username ? "#ef4444" : "#666"}
//                     style={{ marginRight: 8 }}
//                   />
//                   <TextInput
//                     placeholder="Enter your username"
//                     value={formData.username}
//                     onChangeText={(value) => updateField("username", value)}
//                     className="flex-1 text-base text-gray-900"
//                     editable={!isLoading}
//                     placeholderTextColor="#999"
//                     maxLength={14}
//                   />
//                 </View>
//                 {errors.username && (
//                   <Text className="mt-1 text-xs font-semibold text-red-500">
//                     {errors.username}
//                   </Text>
//                 )}
//               </View>

//               {/* ID Number */}
//               <View className="mb-3">
//                 <Text className="mb-2 font-semibold text-gray-800">
//                   ID Number
//                 </Text>
//                 <View
//                   className={`border rounded-lg px-4 py-1 flex-row items-center ${
//                     errors.idNumber
//                       ? "border-red-500 bg-red-50"
//                       : "border-gray-300"
//                   }`}
//                 >
//                   <Ionicons
//                     name="card-outline"
//                     size={20}
//                     color={errors.idNumber ? "#ef4444" : "#666"}
//                     style={{ marginRight: 8 }}
//                   />
//                   <TextInput
//                     placeholder="12-1234-123"
//                     value={formData.idNumber}
//                     onChangeText={(value) => updateField("idNumber", value)}
//                     className="flex-1 text-base text-gray-900"
//                     editable={!isLoading}
//                     placeholderTextColor="#999"
//                   />
//                 </View>
//                 {errors.idNumber && (
//                   <Text className="mt-1 text-xs font-semibold text-red-500">
//                     {errors.idNumber}
//                   </Text>
//                 )}
//               </View>

//               {/* Age */}
//               <View className="mb-3">
//                 <Text className="mb-2 font-semibold text-gray-800">
//                   Age{" "}
//                   <Text className="text-xs text-gray-500">(must be 14-79)</Text>
//                 </Text>
//                 <View
//                   className={`border rounded-lg px-4 py-1 flex-row items-center ${
//                     errors.age ? "border-red-500 bg-red-50" : "border-gray-300"
//                   }`}
//                 >
//                   <Ionicons
//                     name="calendar-outline"
//                     size={20}
//                     color={errors.age ? "#ef4444" : "#666"}
//                     style={{ marginRight: 8 }}
//                   />
//                   <TextInput
//                     placeholder="Your age"
//                     value={formData.age}
//                     onChangeText={(value) => updateField("age", value)}
//                     className="flex-1 text-base text-gray-900"
//                     keyboardType="number-pad"
//                     editable={!isLoading}
//                     placeholderTextColor="#999"
//                   />
//                 </View>
//                 {errors.age && (
//                   <Text className="mt-1 text-xs font-semibold text-red-500">
//                     {errors.age}
//                   </Text>
//                 )}
//               </View>

//               {/* Address */}
//               <View className="mb-2">
//                 <View className="flex-row items-center justify-between mb-2">
//                   <Text className="font-semibold text-gray-800">Address</Text>
//                   <Text
//                     className={`text-xs ${formData.address.length >= 50 ? "text-red-500 font-semibold" : "text-gray-500"}`}
//                   >
//                     {formData.address.length}/49
//                   </Text>
//                 </View>
//                 <View
//                   className={`border rounded-lg px-4 py-1 flex-row items-start ${
//                     errors.address
//                       ? "border-red-500 bg-red-50"
//                       : "border-gray-300"
//                   }`}
//                 >
//                   <Ionicons
//                     name="location-outline"
//                     size={20}
//                     color={errors.address ? "#ef4444" : "#666"}
//                     style={{ marginRight: 8, marginTop: 8 }}
//                   />
//                   <TextInput
//                     placeholder="Your address"
//                     value={formData.address}
//                     onChangeText={(value) => updateField("address", value)}
//                     className="flex-1 text-base text-gray-900"
//                     multiline
//                     numberOfLines={3}
//                     editable={!isLoading}
//                     placeholderTextColor="#999"
//                     textAlignVertical="top"
//                     maxLength={49}
//                   />
//                 </View>
//                 {errors.address && (
//                   <Text className="mt-1 text-xs font-semibold text-red-500">
//                     {errors.address}
//                   </Text>
//                 )}
//               </View>
//             </View>

//             {/* Checkbox and Terms */}
//             <View className="flex-row items-start mb-6">
//               <TouchableOpacity
//                 onPress={() => setIsAgreed(!isAgreed)}
//                 className="mr-3 mt-0.5"
//               >
//                 <Ionicons
//                   name={isAgreed ? "checkbox" : "square-outline"}
//                   size={24}
//                   color={isAgreed ? "#16a34a" : "#9ca3af"}
//                 />
//               </TouchableOpacity>
//               <View className="flex-1">
//                 <Text className="text-xs text-gray-600">
//                   By checking this box, I agree to the{" "}
//                   <Text
//                     className="font-bold text-green-600"
//                     onPress={() => setShowTerms(true)}
//                   >
//                     Terms and Conditions
//                   </Text>
//                   . This information helps other students find and trust you on
//                   Unisuki.
//                 </Text>
//               </View>
//             </View>

//             {/* Submit Button */}
//             <TouchableOpacity
//               onPress={handleComplete}
//               disabled={isLoading || !isAgreed}
//               className={`p-2 rounded-lg items-center ${
//                 isLoading || !isAgreed ? "bg-gray-400" : "bg-tertiary"
//               }`}
//             >
//               {isLoading ? (
//                 <ActivityIndicator color="#fff" size="large" />
//               ) : (
//                 <View className="flex-row items-center">
//                   <Ionicons name="checkmark-done" size={20} color="#fff" />
//                   <Text className="ml-2 text-base font-bold text-white">
//                     Complete Profile
//                   </Text>
//                 </View>
//               )}
//             </TouchableOpacity>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       )}
//     </Modal>
//   );
// };

// export default ProfileCompletionModal;