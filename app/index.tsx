import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import "@/service/firebaseConfigs";
import { BlurView } from "expo-blur";
import { useEffect } from "react";



function RedirectToAuth() {
  return router.replace("/(validation)");
}

export default function AuthLayout() {


  return (
    <View>
      <TouchableOpacity
        className="bg-blue-500 p-4 w-32 rounded"
        onPress={() => {
          RedirectToAuth();
        }}
      >
        <Text>Login</Text>
      </TouchableOpacity>
    </View>
  );
}
