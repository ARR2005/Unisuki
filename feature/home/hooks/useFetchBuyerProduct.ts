import { useState, useEffect } from "react";
import { collectionGroup, onSnapshot, query, Unsubscribe } from "firebase/firestore";
import { db } from "@/service/firebaseConfigs";

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
  tags?: {
    title?: string;
    type?: string;
  };
};

export function useFetchBuyerProduct() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Queries all subcollections named 'itemPosted' across all users
    const productsGroupRef = collectionGroup(db, "itemPosted");
    const q = query(productsGroupRef);

    const unsubscribe: Unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedProducts: Product[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...(data as Omit<Product, "id">),
            // Fallbacks for title and image fields to map cleanly to components
            title: data.tags?.title || data.title || "Untitled Product",
            imageUrl: data.imageUrl || data.imageUri || "https://picsum.photos/id/26/400/300",
          };
        });

        setProducts(fetchedProducts);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore buyer fetch error:", err);
        setError("Failed to fetch products.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { products, loading, error };
}