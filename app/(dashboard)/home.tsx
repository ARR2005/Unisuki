import Header from "@/components/header";
import BuyerScreen from "@/feature/home/buyerScreen";
import SellerScreen from "@/feature/home/sellerScreen";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Mode = "buyer" | "seller";

export default function Home() {
  const [activeMode, setActiveMode] = useState<Mode>("buyer");

  const renderModeButton = (mode: Mode, label: string) => {
    const isActive = activeMode === mode;

    return (
      <TouchableOpacity
        key={mode}
        accessibilityRole="button"
        accessibilityState={{ selected: isActive }}
        onPress={() => setActiveMode(mode)}
        style={[styles.modeButton, isActive && styles.activeModeButton]}
      >
        <Text style={[styles.modeLabel, isActive && styles.activeModeLabel]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.page}>
      <Header />
      <View style={styles.content}>
        <View style={styles.modeSwitcher}>
          {renderModeButton("buyer", "BUYER")}
          {renderModeButton("seller", "SELLER")}
        </View>

        <View style={styles.modeContent}>
          {activeMode === "buyer" ? <BuyerScreen /> : <SellerScreen />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { flex: 1, backgroundColor: "#ffffff" },
  modeSwitcher: {
    alignSelf: "center",
    flexDirection: "row",
    width: 240,
    marginTop: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
  },
  modeButton: {
    flex: 1,
    alignItems: "center",
    borderRadius: 999,
    paddingVertical: 10,
  },
  activeModeButton: {
    backgroundColor: "#ffffff",
    elevation: 1,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  modeLabel: { color: "#6b7280", fontSize: 12, fontWeight: "600" },
  activeModeLabel: { color: "#000000" },
  modeContent: { flex: 1, alignItems: "center", justifyContent: "center" },
});
