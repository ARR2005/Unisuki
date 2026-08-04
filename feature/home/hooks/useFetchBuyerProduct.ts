import { auth, db } from "@/service/firebaseConfigs";
import {
  collectionGroup,
  onSnapshot,
  query,
  Unsubscribe,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { Image } from "react-native";

export type Product = {
  id: string;
  title?: string;
  description?: string;
  price?: number | string;
  imageUrl?: string;
  imageUri?: string;
  additionalImages?: string[];
  category?: string;
  condition?: string;
  sellerName?: string;
  userId: string; // The exact parent user document ID
  isReserved?: boolean; // Flag indicating if item is reserved
  status?: string; // Product status: "active", "sold", etc.
  tags?: {
    title?: string;
    type?: string;
  };
};

export function useFetchBuyerProduct(excludeOwnProducts: boolean = true) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const productsGroupRef = collectionGroup(db, "itemPosted");
    const q = query(productsGroupRef);

    const currentUserId = auth.currentUser?.uid;

    const unsubscribe: Unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedProducts: Product[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();

          // Extract parent doc ID directly from Firestore reference path:
          // user/{sellerUid}/itemPosted/{productId}
          const sellerUidFromPath =
            docSnap.ref.parent.parent?.id || data.userId;

          return {
            id: docSnap.id,
            ...(data as Omit<Product, "id">),
            userId: sellerUidFromPath,
            isReserved: Boolean(data.isReserved),
            status: data.status || "active",
            title: data.tags?.title || data.title || "Untitled Product",
            imageUrl:
              data.imageUrl ||
              data.imageUri ||
              "https://picsum.photos/id/26/400/300",
          };
        });

        const filteredProducts = fetchedProducts.filter((product) => {
          const isMyPost = product.userId === currentUserId;
          // Item must NOT be reserved AND status must NOT be "sold"
          const isAvailable = !product.isReserved && product.status !== "sold";

          return excludeOwnProducts ? !isMyPost && isAvailable : isMyPost;
        });

        setProducts(filteredProducts);
        setLoading(false);

        const imageUrls = filteredProducts
          .map((product) => product.imageUrl)
          .filter((url): url is string => Boolean(url));

        imageUrls.forEach((url) => {
          Image.prefetch(url).catch(() => {
            console.warn("Failed to prefetch image:", url);
          });
        });
      },
      (err) => {
        console.error("Firestore buyer fetch error:", err);
        setError("Failed to fetch products.");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [excludeOwnProducts]);

  return { products, loading, error };
}
