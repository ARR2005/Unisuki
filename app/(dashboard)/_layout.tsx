import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Standard icon package in Expo

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Hides the clunky default top header
        tabBarActiveTintColor: isDark ? '#10B981' : '#059669', // Beautiful green accent for active tab
        tabBarInactiveTintColor: isDark ? '#9CA3AF' : '#6B7280',
        
        // 1. The Magic Sauce: Make the default navigation bar completely clear
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0, // Removes the ugly native separator line
          elevation: 0,      // Removes Android shadows
          height: 60,
          paddingBottom: 8,
        },
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Search Tab */}
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}