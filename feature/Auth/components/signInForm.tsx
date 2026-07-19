import { View, Text, useColorScheme, TouchableOpacity, TextInput } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons';

export default function SignInForm() {
  const isDark = useColorScheme() === 'dark';
  const [savePassword, setSavePassword] = useState(false);

  return (
    <View className="w-full">
      <View className="items-center mb-4">
        <Text className={`text-2xl font-bold tracking-widest text-center ${isDark ? "text-white" : "text-black"}`}>
          SIGN IN
        </Text>
        <Text className={`text-center ${isDark ? "text-white" : "text-black"}`}> 
          Welcome back!
        </Text>
      </View>
      
      {/* Input fields wrapper */}
      <View className="space-y-4 mx-2">
        
        {/* Email input */}
        <View className="flex-row items-center bg-white/30 py-3 px-4 my-1 rounded-2xl border border-white/30">
          <Ionicons name="mail-outline" size={20} color={isDark ? "white" : "black"} />
          <TextInput
            placeholder="Email"
            className={`flex-1 ml-3 ${isDark ? "text-white" : "text-black"}`}
            placeholderTextColor={isDark ? "#ccc" : "#000"}
            // value={email}
            // onChangeText={setEmail}
          />
        </View>

        {/* Password input */}
        <View className="flex-row items-center bg-white/30 py-3 px-4 my-1 rounded-2xl border border-white/30">
          <Ionicons name="lock-closed-outline" size={20} color={isDark ? "white" : "black"} />
          <TextInput
            placeholder="Password"
            secureTextEntry
            className={`flex-1 ml-3 ${isDark ? "text-white" : "text-black"}`}
            placeholderTextColor={isDark ? "#ccc" : "#000"}
            // value={password}
            // onChangeText={setPassword}
          />
        </View>

        {/* Options Row: Matching Checkbox and Forgot Password sizes */}
        <View className="flex-row items-center justify-between pt-2 px-1">
          {/* Custom Checkbox for Save Password */}
          <TouchableOpacity 
            onPress={() => setSavePassword(prev => !prev)}
            className="flex-row items-center py-1"
            activeOpacity={0.7}
          >
            {/* Box changed to rounded-md for a square checkbox look */}
            <View className={`w-6 h-6 rounded-md border items-center justify-center mr-2.5 ${
              savePassword 
                ? "bg-green-600 border-green-600" 
                : isDark ? "border-white/60" : "border-black/60"
            }`}>
              {savePassword && (
                /* Checkmark icon instead of a dot */
                <Ionicons name="checkmark" size={16} color="white" />
              )}
            </View>
            <Text className={`text-base font-medium ${isDark ? "text-white" : "text-black"}`}>
              Save password
            </Text>
          </TouchableOpacity>

          {/* Clickable Green Forgot Password Link */}
          <TouchableOpacity 
            // onPress={onForgotPasswordPress}
            className="py-1"
            activeOpacity={0.7}
          >
            <Text className="text-green-600 font-semibold text-base">
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* Submit button */}
      <TouchableOpacity 
        className="mx-2 mt-6"
        // onPress={onButtonPress}
      >
        <View className="bg-green-600 py-4 rounded-2xl shadow-lg active:bg-green-700">
          <Text className="text-white text-center font-bold text-lg">
            Sign In
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  )
}