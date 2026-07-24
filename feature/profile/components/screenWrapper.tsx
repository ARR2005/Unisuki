import React from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenWrapperProps {
  children: React.ReactNode;
  headerComponent?: React.ReactNode;
  footerComponent?: React.ReactNode;
  scrollable?: boolean;
  style?: string; // Tailwind / NativeWind classes
  contentContainerStyle?: string;
  bgContainerColor?: string;
}

export default function ScreenWrapper({
  children,
  headerComponent,
  footerComponent,
  scrollable = true,
  style = "",
  contentContainerStyle = "",
  bgContainerColor,
}: ScreenWrapperProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";


  return (
    <SafeAreaView

      className={`flex-1`}
    >


      {/* Header section (e.g., ProfileHeader or Custom TopBar) */}
      {headerComponent && <View className="px-4">{headerComponent}</View>}

      {/* Main Content Area */}
      {scrollable ? (
        <ScrollView
          className={`flex-1 ${style}`}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 24,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className={contentContainerStyle}>{children}</View>
        </ScrollView>
      ) : (
        <View className={`flex-1 px-4 ${style} ${contentContainerStyle}`}>
          {children}
        </View>
      )}

      {/* Fixed Footer section */}
      {footerComponent && <View className="p-4">{footerComponent}</View>}
    </SafeAreaView>
  );
}