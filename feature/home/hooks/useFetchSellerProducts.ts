import { createAppNotification } from "@/feature/notifications/notifications";
import { auth, db } from "@/service/firebaseConfigs";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  Unsubscribe,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";

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
  userId?: string;
  isReserved?: boolean;
  status?: string; // "active", "sold", etc.
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
          const allProducts = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              ...(data as Omit<Product, "id">),
              userId: user.uid,
              status: data.status || "active",
            };
          });

          // Filter out items that have been sold
          const activeProducts = allProducts.filter(
            (product) => product.status !== "sold"
          );

          setProducts(activeProducts);
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

  const updateProduct = async (
    product: Product,
    newTitle: string,
    newPrice: string
  ) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return false;

    if (!newTitle.trim()) {
      setUpdateError("Title cannot be empty.");
      return false;
    }

    setIsUpdating(true);
    setUpdateError(null);

    try {
      const itemRef = doc(
        db,
        "user",
        currentUser.uid,
        "itemPosted",
        product.id
      );
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
      const itemRef = doc(db, "user", currentUser.uid, "itemPosted", productId);
      const itemSnap = await getDocs(
        query(collection(db, "user", currentUser.uid, "itemPosted"))
      );
      const itemExists = itemSnap.docs.some((snap) => snap.id === productId);

      if (!itemExists) {
        return true;
      }

      await deleteDoc(itemRef);

      const reservationChatsQuery = query(
        collection(db, "chats"),
        where("productId", "==", productId),
        where("sellerId", "==", currentUser.uid),
        where("type", "==", "reservation")
      );

      const reservationChats = await getDocs(reservationChatsQuery);

      for (const chatSnap of reservationChats.docs) {
        const chatData = chatSnap.data();
        const buyerId = chatData.buyerId;

        if (buyerId) {
          await createAppNotification({
            recipientUid: buyerId,
            title: "Listing deleted",
            body: "The seller removed this item, so it is no longer available.",
            type: "reservation",
            chatId: chatSnap.id,
            productId,
            sellerId: currentUser.uid,
            buyerId,
            routePath: "/(chat)/[chatId]",
            routeParams: {
              chatId: chatSnap.id,
              isReservation: "true",
            },
          });
        }
      }

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