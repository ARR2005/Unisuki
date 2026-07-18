import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Standard icon package in Expo
import CustomNavBar from '../../components/CustomNavbar';

export default function TabsLayout() {
  return (
    <Tabs 
      tabBar={ (props) => <CustomNavBar {...props} /> } 
      screenOptions={{
        headerShown: false
      }}
      >

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
        title: "Post Product",        // tabBarIcon: ({ color, size }) => (
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
