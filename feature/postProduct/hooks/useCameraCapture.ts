import { useImage } from "../../../context/storeImage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

export const useCameraCapture = () => {
  const router = useRouter();
  const { setCapturedImage, setUploadError } = useImage();
  const [permission, setPermission] = useState<ImagePicker.PermissionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadPermission = async () => {
      const currentPermission = await ImagePicker.getCameraPermissionsAsync();
      setPermission(currentPermission);
    };

    loadPermission();
  }, []);


  // CAMERA PERMISSION HANDLING
  const handleRequestPermission = async () => {
    const result = await ImagePicker.requestCameraPermissionsAsync();
    setPermission(result);
    if (!result.granted) {
      setUploadError("Camera permission denied");
    }
  };

  // CAMERA CAPTURE 
  const useCamera = async () => {
    const currentPermission = permission ?? (await ImagePicker.getCameraPermissionsAsync());

    if (!currentPermission.granted) {
      const requested = await ImagePicker.requestCameraPermissionsAsync();
      setPermission(requested);

      if (!requested.granted) {
        setUploadError("Camera permission denied");
        return;
      }
    }

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images",
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const capturedImage = result.assets[0];

      setCapturedImage({
        uri: capturedImage.uri,
        width: capturedImage.width,
        height: capturedImage.height,
      });

      router.push("/(post)/postForm");
    } catch (error) {
      setUploadError("Failed to capture image");
    } finally {
      setIsLoading(false);
    }
  };

  // GALLERY PICKING HANDLING
  const useGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        setUploadError("Gallery permissions are required to pick images");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      setCapturedImage({
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
      });

      router.push("/(post)/postForm");
    } catch {
      setUploadError("Failed to pick image from gallery");
    }
  };

  return {
    permission,
    isLoading,
    handleRequestPermission,
    useCamera,
    useGallery,
  };
};