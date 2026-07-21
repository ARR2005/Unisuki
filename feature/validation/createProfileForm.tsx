import TermAndCondition from "@/feature/validation/termAndCondition";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface FormErrors {
  name?: string;
  username?: string;
  idNumber?: string;
  age?: string;
  address?: string;
  general?: string;
}

export default function CreateProfileForm() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    idNumber: "",
    age: "",
    address: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setIsKeyboardOpen(true);
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setIsKeyboardOpen(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Generic handler to update state properties
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field-specific error when user starts typing again
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Basic client-side validation logic
  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!formData.name) newErrors.name = "Full name is required.";
    if (!formData.username) newErrors.username = "Username is required.";
    if (!formData.idNumber) newErrors.idNumber = "ID Number is required.";

    const ageNum = Number(formData.age);
    if (!formData.age) {
      newErrors.age = "Age is required.";
    } else if (isNaN(ageNum) || ageNum < 14 || ageNum > 79) {
      newErrors.age = "Age must be a number between 14 and 79.";
    }

    if (!formData.address) newErrors.address = "Address is required.";

    if (!isAgreed) {
      newErrors.general = "You must agree to the Terms and Conditions.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleComplete = () => {
    if (!validateForm()) return;

    setIsLoading(true);
    // Simulate an async submit/API request
    setTimeout(() => {
      setIsLoading(false);
      alert("Profile created successfully!");
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
      keyboardVerticalOffset={0}
    >
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: isKeyboardOpen ? 220 : 24,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        scrollEnabled={true}
        automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
      >
        {/* Header */}
        <View className="my-4 w-full items-center justify-center gap-2">
          <Text className="text-4xl font-bold tracking-widest text-gray-900">
            Account Setup
          </Text>
          <Text className="text-base tracking-wider text-gray-600">
            Please provide your information to
          </Text>
          <Text className="text-base tracking-wider text-gray-600">
            create your account.
          </Text>
        </View>

        {/* Form Fields */}
        <View className="mb-6">
          {/* Full Name */}
          <View className="mb-3">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="font-semibold text-gray-800">Full Name</Text>
              <Text
                className={`text-xs ${
                  formData.name.length >= 49
                    ? "font-semibold text-red-500"
                    : "text-gray-500"
                }`}
              >
                {formData.name.length}/49
              </Text>
            </View>
            <View
              className={`flex-row items-center rounded-lg border px-4 py-1 ${
                errors.name ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
            >
              <Ionicons
                name="person-circle-outline"
                size={20}
                color={errors.name ? "#ef4444" : "#666"}
                style={{ marginRight: 8 }}
              />
              <TextInput
                placeholder="Enter your full name"
                value={formData.name}
                onChangeText={(value) => updateField("name", value)}
                className="flex-1 text-base text-gray-900"
                editable={!isLoading}
                placeholderTextColor="#999"
                maxLength={49}
              />
            </View>
            {errors.name && (
              <Text className="mt-1 text-xs font-semibold text-red-500">
                {errors.name}
              </Text>
            )}
          </View>

          {/* Username */}
          <View className="mb-3">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="font-semibold text-gray-800">Username</Text>
              <Text
                className={`text-xs ${
                  formData.username.length >= 14
                    ? "font-semibold text-red-500"
                    : "text-gray-500"
                }`}
              >
                {formData.username.length}/14
              </Text>
            </View>
            <View
              className={`flex-row items-center rounded-lg border px-4 py-1 ${
                errors.username ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={errors.username ? "#ef4444" : "#666"}
                style={{ marginRight: 8 }}
              />
              <TextInput
                placeholder="Enter your username"
                value={formData.username}
                onChangeText={(value) => updateField("username", value)}
                className="flex-1 text-base text-gray-900"
                editable={!isLoading}
                placeholderTextColor="#999"
                maxLength={14}
              />
            </View>
            {errors.username && (
              <Text className="mt-1 text-xs font-semibold text-red-500">
                {errors.username}
              </Text>
            )}
          </View>

          {/* ID Number */}
          <View className="mb-3">
            <Text className="mb-2 font-semibold text-gray-800">ID Number</Text>
            <View
              className={`flex-row items-center rounded-lg border px-4 py-1 ${
                errors.idNumber ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
            >
              <Ionicons
                name="card-outline"
                size={20}
                color={errors.idNumber ? "#ef4444" : "#666"}
                style={{ marginRight: 8 }}
              />
              <TextInput
                placeholder="12-1234-123"
                value={formData.idNumber}
                onChangeText={(value) => updateField("idNumber", value)}
                className="flex-1 text-base text-gray-900"
                editable={!isLoading}
                placeholderTextColor="#999"
              />
            </View>
            {errors.idNumber && (
              <Text className="mt-1 text-xs font-semibold text-red-500">
                {errors.idNumber}
              </Text>
            )}
          </View>

          {/* Age */}
          <View className="mb-3">
            <Text className="mb-2 font-semibold text-gray-800">
              Age <Text className="text-xs text-gray-500">(must be 14-79)</Text>
            </Text>
            <View
              className={`flex-row items-center rounded-lg border px-4 py-1 ${
                errors.age ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color={errors.age ? "#ef4444" : "#666"}
                style={{ marginRight: 8 }}
              />
              <TextInput
                placeholder="Your age"
                value={formData.age}
                onChangeText={(value) => updateField("age", value)}
                className="flex-1 text-base text-gray-900"
                keyboardType="number-pad"
                editable={!isLoading}
                placeholderTextColor="#999"
              />
            </View>
            {errors.age && (
              <Text className="mt-1 text-xs font-semibold text-red-500">
                {errors.age}
              </Text>
            )}
          </View>

          {/* Address */}
          <View className="mb-2">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="font-semibold text-gray-800">Address</Text>
              <Text
                className={`text-xs ${
                  formData.address.length >= 49
                    ? "font-semibold text-red-500"
                    : "text-gray-500"
                }`}
              >
                {formData.address.length}/49
              </Text>
            </View>
            <View
              className={`flex-row items-start rounded-lg border px-4 py-1 ${
                errors.address ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
            >
              <Ionicons
                name="location-outline"
                size={20}
                color={errors.address ? "#ef4444" : "#666"}
                style={{ marginRight: 8, marginTop: 8 }}
              />
              <TextInput
                placeholder="Your address"
                value={formData.address}
                onChangeText={(value) => updateField("address", value)}
                className="flex-1 text-base text-gray-900"
                multiline
                numberOfLines={3}
                editable={!isLoading}
                placeholderTextColor="#999"
                textAlignVertical="top"
                maxLength={49}
              />
            </View>
            {errors.address && (
              <Text className="mt-1 text-xs font-semibold text-red-500">
                {errors.address}
              </Text>
            )}
          </View>
        </View>

        {/* Checkbox and Terms */}
        <View className="mb-6 flex-row items-start">
        <TouchableOpacity
            onPress={() => setIsAgreed(!isAgreed)}
            className="mr-3 mt-0.5"
        >
            <Ionicons
            name={isAgreed ? "checkbox" : "square-outline"}
            size={24}
            color={isAgreed ? "#16a34a" : "#9ca3af"}
            />
        </TouchableOpacity>
        <View className="flex-1">
            <Text className="text-xs text-gray-600">
            By checking this box, I agree to the{" "}
            <Text
                onPress={() => setShowTerms(true)}
                className="font-bold text-green-600 underline"
            >
                Terms and Conditions
            </Text>
            . This is to help verify my identity and ensure the security of my account.
            </Text>
   
            {errors.general && (
            <Text className="mt-2 text-xs font-semibold text-red-500">
                {errors.general}
            </Text>
            )}
        </View>
        </View>

        <Modal visible={showTerms} animationType="slide">
          <TermAndCondition
            onClose={() => setShowTerms(false)}
            onAgree={() => {
              setIsAgreed(true);
              setShowTerms(false);
              setErrors((prev) => ({ ...prev, general: undefined }));
            }}
          />
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
