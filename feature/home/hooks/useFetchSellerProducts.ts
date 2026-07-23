import { useState, useEffect } from "react";
import { collection, onSnapshot, query, deleteDoc, updateDoc, doc, Unsubscribe } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/service/firebaseConfigs";

export type Product = {
  id: string;
  title?: string;
  description?: string;
  price?: number | string;
  imageUri?: string;
  imageUrl?: string;
  additionalImages?: string[];
  category?: string;
  condition?: string;
  tags?: {
    title?: string;
    type?: string;
  };
};

export function useFetchSellerProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeFirestore: Unsubscribe | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeFirestore?.();
      if (!user) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const userItemsRef = collection(db, "user", user.uid, "itemPosted");
      
      unsubscribeFirestore = onSnapshot(
        query(userItemsRef),
        (snapshot) => {
          setProducts(
            snapshot.docs.map((docSnap) => ({
              id: docSnap.id,
              ...(docSnap.data() as Omit<Product, "id">),
            }))
          );
          setLoading(false);
        },
        (error) => {
          console.error("Firestore read error:", error);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      unsubscribeFirestore?.();
    };
  }, []);

  return { products, loading };
}

// Update Product Hook
export function useUpdateProduct() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const updateProduct = async (product: Product, newTitle: string, newPrice: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return false;

    if (!newTitle.trim()) {
      setUpdateError("Title cannot be empty.");
      return false;
    }

    setIsUpdating(true);
    setUpdateError(null);

    try {
      const itemRef = doc(db, "user", currentUser.uid, "itemPosted", product.id);
      const parsedPrice = parseFloat(newPrice) || 0;

      if (product.tags) {
        await updateDoc(itemRef, {
          "tags.title": newTitle.trim(),
          price: parsedPrice,
        });
      } else {
        await updateDoc(itemRef, {
          title: newTitle.trim(),
          price: parsedPrice,
        });
      }
      return true;
    } catch (error) {
      console.error("Error updating item:", error);
      setUpdateError("Could not update listing. Please try again.");
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateProduct, isUpdating, updateError, setUpdateError };
}

// Delete Product Hook
export function useDeleteProduct() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const deleteProduct = async (productId: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return false;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteDoc(doc(db, "user", currentUser.uid, "itemPosted", productId));
      return true;
    } catch (error) {
      console.error("Error deleting item:", error);
      setDeleteError("Could not delete this listing. Please try again.");
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteProduct, isDeleting, deleteError, setDeleteError };
}