import Header from "@/components/header";
import BuyerScreen from "@/feature/home/buyerScreen";
import SellerScreen from "@/feature/home/sellerScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, useColorScheme } from "react-native";

type Mode = "buyer" | "seller";
const ACTIVE_MODE_STORAGE_KEY = "@unisuki:active-mode";

export default function Home() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [activeMode, setActiveMode] = useState<Mode>("buyer");

  useEffect(() => {
    const loadActiveMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(ACTIVE_MODE_STORAGE_KEY);
        if (savedMode === "buyer" || savedMode === "seller") {
          setActiveMode(savedMode);
        }
      } catch (error) {
        console.warn("Unable to restore the selected mode:", error);
      }
    };

    loadActiveMode();
  }, []);

  const selectMode = async (mode: Mode) => {
    setActiveMode(mode);
    try {
      await AsyncStorage.setItem(ACTIVE_MODE_STORAGE_KEY, mode);
    } catch (error) {
      console.warn("Unable to save the selected mode:", error);
    }
  };

  const renderModeButton = (mode: Mode, label: string) => {
    const isActive = activeMode === mode;

    return (
      <TouchableOpacity
        key={mode}
        accessibilityRole="button"
        accessibilityState={{ selected: isActive }}
        onPress={() => selectMode(mode)}
        style={[
          styles.modeButton,
          isActive &&
            (isDark ? styles.activeModeButtonDark : styles.activeModeButton),
        ]}
      >
        <Text
          style={[
            styles.modeLabel,
            isDark && styles.modeLabelDark,
            isActive &&
              (isDark
                ? styles.activeModeLabelDark
                : styles.activeModeLabel),
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className={`flex-1`}>
      <View style={styles.content}>
        <Header />
        <View className={`pb-4 rounded-b-full `}>
          <View
            style={[
              styles.modeSwitcher,
              isDark && styles.modeSwitcherDark,
            ]}
          >
            {renderModeButton("buyer", "BUYER")}
            {renderModeButton("seller", "SELLER")}
          </View>
        </View>
        <View style={styles.modeContent}>
          {activeMode === "buyer" ? <BuyerScreen /> : <SellerScreen />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1 },
  modeSwitcher: {
    alignSelf: "center",
    flexDirection: "row",
    width: 240,
    padding: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 999,
    backgroundColor: "#ffffff",
  },
  modeSwitcherDark: {
    borderColor: "#1f2937",
    backgroundColor: "rgba(14, 14, 14, 0.2)",
  },
  modeButton: {
    flex: 1,
    alignItems: "center",
    borderRadius: 999,
    paddingVertical: 10,
  },
  activeModeButton: {
    backgroundColor: "#f3f3f3",
    elevation: 1,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activeModeButtonDark: {
    backgroundColor: "#065f46", // bg-emerald-900 / green-800 equivalent
    elevation: 1,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  modeLabel: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "600",
  },
  modeLabelDark: {
    color: "#9ca3af",
  },
  activeModeLabel: {
    color: "#000000",
  },
  activeModeLabelDark: {
    color: "#ffffff",
  },
  modeContent: { flex: 1 },
});