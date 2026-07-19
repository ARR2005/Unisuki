import { useImage } from "@/context/storeImage";
// import { uploadImageToCloudinary } from "@/services/config/cloudinaryConfig";
// import UserProfileService from "@/services/profile/UserProfileService";
import * as ImagePicker from "expo-image-picker";
import { getAuth } from "firebase/auth";
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

  // Check authentication status on mount and when auth state changes
  // useEffect(() => {
  //   const auth = getAuth();

  //   // Set initial state
  //   setIsAuthenticated(!!auth.currentUser);
  //   setCurrentUser(auth.currentUser);

  //   // Listen for auth state changes
  //   const unsubscribe = auth.onAuthStateChanged((user) => {
  //     setIsAuthenticated(!!user);
  //     setCurrentUser(user);
  //   });

  //   return () => unsubscribe();
  // }, []);

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
    if (priceNum >= 100000) {
      return "Price must be under ₱100,000";
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

      // Step 1: Upload main image to Cloudinary
    //   const imageUrl = await uploadImageToCloudinary(capturedImage.uri);

      // Step 1b: Upload additional images to Cloudinary
      let additionalImageUrls: string[] = [];
    //   if (formData.additionalImages && formData.additionalImages.length > 0) {
    //     for (const imageUri of formData.additionalImages) {
    //       // Only upload if it's a local file (not already a URL)
    //       if (imageUri.startsWith("file://") || imageUri.startsWith("/")) {
    //         try {
    //           const uploadedUrl = await uploadImageToCloudinary(imageUri);
    //           additionalImageUrls.push(uploadedUrl);
    //         } catch (error) {
    //           // Continue with other images if one fails
    //         }
    //       } else {
    //         additionalImageUrls.push(imageUri);
    //       }
    //     }
    //   }

    //   // Step 2: Get seller name from profile
    //   let sellerName =
    //     currentUser?.displayName || currentUser?.email || "Anonymous Seller";
    //   try {
    //     const userProfile = await UserProfileService.getUserProfile();
    //     if (userProfile?.username) {
    //       sellerName = userProfile.username;
    //     }
    //   } catch (error) {
    //     // Use fallback name if profile fetch fails
    //   }

    //   // Step 3: Prepare product data for Firebase
    //   const productData: any = {
    //     title: formData.title,
    //     price: parseFloat(formData.price),
    //     description: formData.description,
    //     image_uri: imageUrl, // Cloudinary URL
    //     type: formData.type || "miscellaneous",
    //     quantity: formData.quantity || 1,
    //     tags: formData.tags,
    //     category: formData.category || "Miscellaneous",
    //     sellerName: sellerName,
    //   };

    //   // Add category-specific fields
    //   if (formData.category === "Clothes") {
    //     // Only add sizes and styles if they are provided
    //     if (formData.sizes?.trim()) {
    //       productData.sizes = formData.sizes;
    //     }
    //     if (formData.styles?.trim()) {
    //       productData.styles = formData.styles;
    //     }
    //   } else if (formData.category === "Shoes") {
    //     productData.shoeSize = formData.shoeSize;
    //   } else if (formData.category === "Stationery") {
    //     productData.amount = formData.amount;
    //     productData.stationeryType = formData.stationeryType;
    //   }

    //   // Add publish datetime
    //   productData.publishedAt = formData.publishedAt || new Date();

    //   // Add additional images if any were uploaded
    //   if (additionalImageUrls.length > 0) {
    //     productData.additionalImages = additionalImageUrls;
    //   }

    //   // Step 4: Save to Firebase under user's itemsPosted
    //   const productId = await DatabaseService.addProduct(productData);

    //   setIsUploadingImage(false);
    //   setUploadError(null);
    //   setPublishSuccess(true);

      // Clear form for next post
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
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        setUploadError("Camera roll permissions are required to add images");
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
    } catch (error) {
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
