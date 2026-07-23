import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/service/firebaseConfigs";

export type ProductDetail = {
  id: string;
  userId?: string;
  sellerName?: string;
  title?: string;
  description?: string;
  price?: number;
  quantity?: number;
  category?: string;
  condition?: string;
  status?: string;
  sizes?: string;
  styles?: string;
  shoeSize?: string;
  amount?: string;
  stationaryType?: string;
  type?: string;
  imageUri?: string;
  imageUrl?: string;
  additionalImages?: string[];
  tags?: { title?: string; type?: string } | Array<{ title?: string; type?: string }>;
  publishedAt?: {
    seconds: number;
    nanoseconds: number;
  };
};

type UseProductDetailOptions = {
  productId?: string;
  sellerId?: string;
};

export function useProductDetail({ productId, sellerId }: UseProductDetailOptions = {}) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Sanitize input strings
    const cleanProductId = productId?.trim();
    const cleanSellerId = sellerId?.trim();

    // Guard against missing navigation parameters
    if (!cleanProductId || !cleanSellerId) {
      setLoading(false);
      setError("Missing product or seller identifier.");
      return;
    }

    setLoading(true);
    setError(null);

    // 2. Target path: user/{cleanSellerId}/itemPosted/{cleanProductId}
    const docRef = doc(db, "user", cleanSellerId, "itemPosted", cleanProductId);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const rawData = docSnap.data();

          // Resolve Image URL safely
          const mainImage =
            rawData.imageUrl ||
            rawData.imageUri ||
            (Array.isArray(rawData.additionalImages) && rawData.additionalImages[0]) ||
            "";

          // Resolve Title across potential object/array data formats
          const resolvedTitle =
            (typeof rawData.tags === "object" && !Array.isArray(rawData.tags) && rawData.tags?.title) ||
            (Array.isArray(rawData.tags) && rawData.tags[0]?.title) ||
            rawData.title ||
            rawData.description ||
            "Untitled Item";

          setProduct({
            id: docSnap.id,
            ...rawData,
            title: resolvedTitle,
            imageUrl: mainImage,
          } as ProductDetail);
        } else {
          setProduct(null);
          setError("Listing not found.");
        }
        setLoading(false);
      },
      (err) => {
        console.error("❌ Firestore read error:", err);
        setError("Failed to fetch listing details.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [productId, sellerId]);

  // Derived calculations for UI formatting
  const price = product?.price ?? 0;
  const transactionFee = price > 0 ? price * 0.02 : 0;
  const total = price + transactionFee;

  let publishedDateLabel = "";
  if (product?.publishedAt?.seconds) {
    publishedDateLabel = new Date(product.publishedAt.seconds * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return {
    loading,
    error,
    product,
    title: product?.title,
    price,
    image_uri: product?.imageUrl || product?.imageUri,
    additionalImages: Array.isArray(product?.additionalImages) ? product.additionalImages : [],
    description: product?.description,
    sellerName: product?.sellerName,
    category: product?.category,
    sizes: product?.sizes,
    styles: product?.styles,
    shoeSize: product?.shoeSize,
    amount: product?.amount,
    stationaryType: product?.stationaryType,
    transactionFee,
    total,
    publishedDateLabel,
  };
}