import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import React from 'react'
import { useColorScheme } from 'react-native'
import { Ionicons } from '@expo/vector-icons';

export default function SignUpForm() {
  const isDark = useColorScheme() === 'dark';
  return (
    <View className="w-full">
      <View className="items-center mb-4">
        <Text className={`text-2xl font-bold tracking-widest text-center ${isDark ? "text-white" : "text-black"}`}>
          Create an Account
        </Text>
        <Text className={`text-center ${isDark ? "text-white" : "text-black"}`}> 
          Come and join our campus marketplace.
        </Text>
      </View>
      
      {/* Input fields wrapper applying mx-2 safely */}
      <View className="space-y-4 mx-2">
        
        {/* Email input */}
        <View className="flex-row items-center bg-white/30 py-3 px-4 my-1 rounded-2xl border border-white/30">
          <Ionicons name="mail-outline" size={20} color="black" />
          <TextInput
            placeholder="Email"
            className="flex-1 ml-3"
            placeholderTextColor="#000"
            // value={email}
            // onChangeText={setEmail}
          />
        </View>

        {/* Password input */}
        <View className="flex-row items-center bg-white/30 py-3 px-4 my-1 rounded-2xl border border-white/30">
          <Ionicons name="lock-closed-outline" size={20} color="black" />
          <TextInput
            placeholder="Password"
            secureTextEntry
            className="flex-1 ml-3 text-gray-800"
            placeholderTextColor="#000"
            // value={password}
            // onChangeText={setPassword}
          />
        </View>

        {/* Repeat Password input */}
        <View className="flex-row items-center bg-white/30 py-3 px-4 my-1 rounded-2xl border border-white/30">
          <Ionicons name="lock-closed-outline" size={20} color="black" />
          <TextInput
            placeholder="Confirm Password"
            secureTextEntry
            className="flex-1 ml-3 text-gray-800"
            placeholderTextColor="#000"
            // value={confirmPassword}
            // onChangeText={setConfirmPassword}
          />
        </View>
      </View>

      {/* Submit button changed to green matching the text color scheme */}
      <TouchableOpacity 
        className="mx-2 mt-6"
        // onPress={onButtonPress}
      >
        <View className="bg-green-600 py-4 rounded-2xl shadow-lg active:bg-green-700">
          <Text className="text-white text-center font-bold text-lg">
            Sign Up
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  )
}