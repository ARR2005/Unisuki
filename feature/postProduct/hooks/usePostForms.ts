import { useImage } from "@/context/storeImage";
import auth from "@/service/firebaseConfigs";
import * as ImagePicker from "expo-image-picker";
import {
  addDoc,
  collection,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  where,
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
    if (!formData.title.trim()) {
      return "Please enter a title for your post";
    }
    if (formData.title.length >= 25) {
      return `Title must be less than 25 characters (current: ${formData.title.length})`;
    }

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

    if (!formData.description.trim()) {
      return "Please enter a description";
    }

    const category = formData.category || "";

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

    return null;
  };

  const uploadAndPublish = async (): Promise<boolean> => {
    try {
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

      const db = getFirestore();

      // 1. Query userVerifications by uid field for currently logged-in user
      let sellerName = "Seller";
      try {
        const q = query(
          collection(db, "userVerifications"),
          where("uid", "==", userId)
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          sellerName =
            userData?.profileData?.username ||
            userData?.profileData?.name ||
            auth.currentUser?.displayName ||
            "Seller";
        } else if (auth.currentUser?.displayName) {
          sellerName = auth.currentUser.displayName;
        }
      } catch (profileError) {
        console.warn("Could not fetch seller profile name:", profileError);
      }

      // 2. Prepare payload with resolved sellerName attached
      const productData = {
        title: formData.title.trim(),
        price: parseFloat(formData.price),
        description: formData.description.trim(),
        imageUri: capturedImage.uri,
        imageUrl: capturedImage.uri,
        tags: formData.tags,
        type: formData.type || "miscellaneous",
        quantity: formData.quantity || 1,
        category: formData.category || "Miscellaneous",
        additionalImages: formData.additionalImages || [],
        sellerName, // Embedded username saved directly to product doc
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

      // 3. Save to user subcollection
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