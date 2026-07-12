import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Standard icon package in Expo

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="home" options={{
        title: "Home",        // tabBarIcon: ({ color, size }) => (
        //   <Ionicons name="home" size={size} color={color} />
        // ),
      }} />
      
      <Tabs.Screen name="message" options={{
        title: "Message",
        // tabBarIcon: ({ color, size }) => (
        //   <Ionicons name="home" size={size} color={color} />
        // ),
      }} />
      
      <Tabs.Screen name="camera" options={{
        title: "Camera",        // tabBarIcon: ({ color, size }) => (
        //   <Ionicons name="home" size={size} color={color} />
        // ),
      }} />
      
      <Tabs.Screen name="reserve" options={{
        title: "Reserve",        // tabBarIcon: ({ color, size }) => (
        //   <Ionicons name="home" size={size} color={color} />
        // ),
      }} />
      
      <Tabs.Screen name="profile" options={{
        title: "Profile",
        // tabBarIcon: ({ color, size }) => (
        //   <Ionicons name="home" size={size} color={color} />
        // ),
      }} />

    </Tabs>
  );
}
