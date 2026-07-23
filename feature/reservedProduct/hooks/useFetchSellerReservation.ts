import { auth, db } from "@/service/firebaseConfigs";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

export function useFetchSellerReservations() {
  const [sellerReservations, setSellerReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setSellerReservations([]);
        setLoading(false);
        return;
      }

      // Query chats where current logged-in user is the SELLER
      const q = query(
        collection(db, "chats"),
        where("sellerId", "==", user.uid),
        where("type", "==", "reservation"),
      );

      const unsubscribeQuery = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs
            .map((docSnap) => {
              const data = docSnap.data();
              const status = data.reservation?.status || "pending";

              if (status === "declined") {
                return null;
              }

              return {
                id: docSnap.id,
                chatId: data.chatId || docSnap.id,
                productId: data.productId,
                buyerId: data.buyerId,
                title:
                  data.reservation?.itemTitle ||
                  data.lastMessage ||
                  "Reserved Item",
                price: data.reservation?.itemPrice || 0,
                totalPrice: data.reservation?.totalPrice || 0,
                imageUri: data.reservation?.itemImage || "",
                status,
                createdAt: data.reservation?.createdAt,
              };
            })
            .filter(Boolean);

          setSellerReservations(items);
          setLoading(false);
        },
        (err) => {
          console.error("Error fetching seller reservations:", err);
          setLoading(false);
        },
      );

      return () => unsubscribeQuery();
    });

    return () => unsubscribeAuth();
  }, []);

  return { sellerReservations, loading };
}
