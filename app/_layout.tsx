
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme, Image, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PortalHost } from "@rn-primitives/portal";
import { ImageProvider } from "../context/storeImage";

import "../global.css";

const transparentNavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "transparent",
  },
};

const MainLayout = () => {
  const isDark = useColorScheme() === "dark";
  const backgroundImage = isDark
    ? require("../assets/darkBackground.png")
    : require("../assets/whiteBackground.png");

  return (
    <ThemeProvider value={transparentNavigationTheme}>
      <View style={styles.container}>
        <StatusBar
          style={isDark ? "light" : "dark"}
          translucent
          backgroundColor="transparent"
        />

        <View pointerEvents="none" style={styles.background}>
          <Image
            source={backgroundImage}
            resizeMode="cover"
            style={styles.background}
          />
        </View>

        <Stack screenOptions={{ contentStyle: styles.transparentContent }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/index" options={{ headerShown: false }} />
          <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
          <Stack.Screen name="(post)/postForm" options={{ headerShown: false }} />
          <Stack.Screen name="(validation)/welcomeScreen" options={{ headerShown: false }} />
          <Stack.Screen name="(validation)/validation" options={{ headerShown: false }} />
        </Stack>
        <PortalHost />
      </View>
    </ThemeProvider>
  );
};

export default function RootLayout() {
  return (
    <ImageProvider>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <MainLayout />
      </SafeAreaView>
    </ImageProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    height: "100%",
    width: "100%",
    position: "absolute",
  },
  transparentContent: {
    backgroundColor: "transparent",
  },
});
