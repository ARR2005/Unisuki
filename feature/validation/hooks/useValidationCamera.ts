import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";

export type ValidationStepKey = "front" | "back" | "selfie";
export interface ValidationImage {
  uri: string;
  width?: number;
  height?: number;
}

export const useValidationCamera = () => {
  const [permission, setPermission] =
    useState<ImagePicker.PermissionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPermission = async () => {
      const currentPermission = await ImagePicker.getCameraPermissionsAsync();
      setPermission(currentPermission);
    };
    loadPermission();
  }, []);

  const requestPermission = async () => {
    const result = await ImagePicker.requestCameraPermissionsAsync();
    setPermission(result);
    if (!result.granted) {
      setError("Camera permission denied");
    }
    return result.granted;
  };

  const launchCamera = async () => {
    const currentPermission =
      permission ?? (await ImagePicker.getCameraPermissionsAsync());
    if (!currentPermission.granted) {
      const granted = await requestPermission();
      if (!granted) return null;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]) {
        return null;
      }

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
      } as ValidationImage;
    } catch (e) {
      setError("Failed to launch camera");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    permission,
    isLoading,
    error,
    requestPermission,
    launchCamera,
  };
};
