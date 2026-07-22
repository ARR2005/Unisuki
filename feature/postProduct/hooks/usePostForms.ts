import { useImage } from "@/context/storeImage";
import auth from "@/service/firebaseConfigs";
import * as ImagePicker from "expo-image-picker";
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export interface PostData {
  title: string;
  price: string;
  description: string;
  tags: string[];
  type?: string;
  quantity?: number;
  imageUri?: string;
  category?: string;
  additionalImages?: string[];
  // Clothes-specific
  sizes?: string;
  styles?: string;
  // Shoes-specific
  shoeSize?: string;
  // Stationery-specific
  amount?: string;
  stationeryType?: string;
  // Publish datetime
  publishedAt?: Date | string;
}

export const usePostForm = () => {
  const { capturedImage, setIsUploadingImage, setUploadError, clearImage } =
    useImage();
  //   const DatabaseService = useDatabase();
  const [formData, setFormData] = useState<PostData>({
    title: "",
    price: "",
    description: "",
    tags: [],
    category: "Miscellaneous",
    type: "miscellaneous",
    quantity: 1,
    additionalImages: [],
    sizes: "",
    styles: "",
    shoeSize: "",
    amount: "",
    stationeryType: "",
    publishedAt: new Date(),
  });
  const [tagInput, setTagInput] = useState("");
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    setIsAuthenticated(!!auth.currentUser);
    setCurrentUser(auth.currentUser);

    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  const updateFormField = (field: keyof PostData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (tagInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      price: "",
      description: "",
      tags: [],
      category: "Miscellaneous",
      type: "miscellaneous",
      quantity: 1,
      additionalImages: [],
      sizes: "",
      styles: "",
      shoeSize: "",
      amount: "",
      stationeryType: "",
      publishedAt: new Date(),
    });
    setTagInput("");
    setPublishSuccess(false);
    clearImage();
  };

  const validateForm = (): string | null => {
    // Title validation: <25 characters
    if (!formData.title.trim()) {
      return "Please enter a title for your post";
    }
    if (formData.title.length >= 25) {
      return `Title must be less than 25 characters (current: ${formData.title.length})`;
    }

    // Price validation
    if (!formData.price.trim()) {
      return "Please enter a price";
    }
    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return "Price must be a valid positive number";
    }
    if (priceNum >= 50000) {
      return "Price must be under ₱50,000";
    }

    // Description validation
    if (!formData.description.trim()) {
      return "Please enter a description";
    }

    // Category-specific validations (optional fields)
    const category = (formData as any).category || "";
    // Sizes and styles are now optional for Clothes
    // No validation required for optional category fields

    if (category === "Shoes") {
      if (!formData.shoeSize?.trim()) {
        return "Please specify shoe sizing";
      }
    }

    if (category === "Stationery") {
      if (!formData.amount?.trim()) {
        return "Please specify amount for stationery items";
      }
      if (!formData.stationeryType?.trim()) {
        return "Please specify type of stationery";
      }
    }

    return null; // No errors
  };

  const uploadAndPublish = async (): Promise<boolean> => {
    try {
      // Validate form first
      const validationError = validateForm();
      if (validationError) {
        setUploadError(validationError);
        return false;
      }

      if (!formData.title || !formData.price) {
        setUploadError("Please fill in title and price");
        return false;
      }

      if (!capturedImage) {
        setUploadError("No image captured");
        return false;
      }

      setIsUploadingImage(true);
      setPublishSuccess(false);

      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error("Please sign in before publishing your item.");
      }

      const productData = {
        title: formData.title.trim(),
        price: parseFloat(formData.price),
        description: formData.description.trim(),
        imageUri: capturedImage.uri,
        tags: formData.tags,
        type: formData.type || "miscellaneous",
        quantity: formData.quantity || 1,
        category: formData.category || "Miscellaneous",
        additionalImages: formData.additionalImages || [],
        ...(formData.category === "Clothes"
          ? {
              sizes: formData.sizes?.trim() || "",
              styles: formData.styles?.trim() || "",
            }
          : {}),
        ...(formData.category === "Shoes"
          ? { shoeSize: formData.shoeSize?.trim() || "" }
          : {}),
        ...(formData.category === "Stationery"
          ? {
              amount: formData.amount?.trim() || "",
              stationeryType: formData.stationeryType?.trim() || "",
            }
          : {}),
        publishedAt: serverTimestamp(),
        userId,
        status: "active",
      };

      const db = getFirestore();
      await addDoc(collection(db, "user", userId, "itemPosted"), productData);

      setIsUploadingImage(false);
      setUploadError(null);
      setPublishSuccess(true);

      resetForm();
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to publish post";
      setUploadError(errorMessage);
      setIsUploadingImage(false);
      return false;
    }
  };

  const addAdditionalImage = (imageUri: string) => {
    setFormData((prev) => ({
      ...prev,
      additionalImages: [...(prev.additionalImages || []), imageUri],
    }));
  };

  const removeAdditionalImage = (imageUri: string) => {
    setFormData((prev) => ({
      ...prev,
      additionalImages: (prev.additionalImages || []).filter(
        (uri) => uri !== imageUri,
      ),
    }));
  };

  const pickAdditionalImages = async () => {
    try {
      const permission = await ImagePicker.getMediaLibraryPermissionsAsync();
      let status = permission.status;

      if (status !== "granted") {
        const requestPermission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        status = requestPermission.status;
      }

      if (status !== "granted") {
        setUploadError(
          "Photo access is required to add images. Please allow access in your device settings.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 5 - (formData.additionalImages?.length || 0),
      });

      if (!result.canceled) {
        const newImages = result.assets.map((asset) => asset.uri);
        const currentImages = formData.additionalImages || [];
        const combinedImages = [...currentImages, ...newImages].slice(0, 5);
        setFormData((prev) => ({
          ...prev,
          additionalImages: combinedImages,
        }));
      }
    } catch {
      setUploadError("Failed to pick images");
    }
  };

  return {
    formData,
    tagInput,
    capturedImage,
    publishSuccess,
    isAuthenticated,
    currentUser,
    updateFormField,
    setTagInput,
    addTag,
    removeTag,
    uploadAndPublish,
    resetForm,
    addAdditionalImage,
    removeAdditionalImage,
    pickAdditionalImages,
  };
};
