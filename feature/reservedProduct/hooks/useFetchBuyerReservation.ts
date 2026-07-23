import { auth, db } from "@/service/firebaseConfigs";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

export function useFetchBuyerReservations() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setReservations([]);
        setLoading(false);
        return;
      }

      // Query 'chats' collection where type is 'reservation' and buyerId is current user
      const q = query(
        collection(db, "chats"),
        where("buyerId", "==", user.uid),
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
                sellerId: data.sellerId,
                buyerId: data.buyerId,
                title:
                  data.reservation?.itemTitle ||
                  data.lastMessage ||
                  "Reserved Item",
                price: data.reservation?.itemPrice || 0,
                transactionFee: data.reservation?.transactionFee || 0,
                totalPrice: data.reservation?.totalPrice || 0,
                imageUri: data.reservation?.itemImage || "",
                status,
                createdAt: data.reservation?.createdAt,
              };
            })
            .filter(Boolean);

          setReservations(items);
          setLoading(false);
        },
        (err) => {
          console.error("Firestore buyer reservations query error:", err);
          setLoading(false);
        },
      );

      return () => unsubscribeQuery();
    });

    return () => unsubscribeAuth();
  }, []);

  return { reservations, loading };
}
