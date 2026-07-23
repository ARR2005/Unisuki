import { CameraView, useCameraPermissions } from "expo-camera";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (!isScanning) return;
    setIsScanning(false);

    try {
      const parsed = JSON.parse(data);

      if (!parsed || typeof parsed !== "object") {
        throw new Error("Invalid payload format");
      }

      const payload = JSON.stringify(parsed);

      router.push({
        pathname: "/(scanner)/summary" as any,
        params: {
          payload,
          chatId: parsed.chatId || "",
          reservationId: parsed.reservationId || "",
          productId: parsed.productId || "",
          sellerId: parsed.sellerId || "",
          buyerId: parsed.buyerId || "",
          itemTitle:
            parsed.itemTitle || parsed.title || parsed.productName || "",
          sellerName: parsed.sellerName || parsed.seller || "",
          itemPrice: String(
            parsed.itemPrice || parsed.price || parsed.amount || "",
          ),
          transactionFee: String(parsed.transactionFee || parsed.fee || ""),
          totalPrice: String(parsed.totalPrice || parsed.total || ""),
        },
      });
    } catch (error) {
      console.error("QR scan error:", error);
      Alert.alert(
        "Invalid QR Code",
        "The scanned code did not contain valid transaction data. Please try again.",
        [{ text: "OK", onPress: () => setIsScanning(true) }],
      );
    }
  };

  if (!permission) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={styles.title}>Camera access is required</Text>
        <Text style={styles.description}>
          Allow camera permission so the app can scan your seller’s QR code.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => requestPermission()}
        >
          <Text style={styles.buttonText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={isScanning ? handleBarcodeScanned : undefined}
      />

      <View style={styles.overlay}>
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>Scan Seller QR</Text>
          <Text style={styles.headerSubtitle}>
            Point the camera at the seller’s QR code to continue.
          </Text>
        </View>

        <View style={styles.frame} />

        <View style={styles.footerCard}>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </Pressable>
          {!isScanning && (
            <TouchableOpacity
              style={styles.button}
              onPress={() => setIsScanning(true)}
            >
              <Text style={styles.buttonText}>Scan Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f9fafb",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 48,
  },
  headerCard: {
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 16,
    padding: 16,
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },
  headerSubtitle: { color: "#e5e7eb", fontSize: 14, marginTop: 4 },
  frame: {
    alignSelf: "center",
    width: 240,
    height: 240,
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  footerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  button: {
    backgroundColor: "#059669",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  buttonText: { color: "#fff", fontWeight: "700" },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  secondaryButtonText: { color: "#fff", fontWeight: "700" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  description: {
    fontSize: 14,
    color: "#4b5563",
    textAlign: "center",
    marginBottom: 20,
  },
});
