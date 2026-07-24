import { db } from "@/service/firebaseConfigs";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export type NotificationPayload = {
  recipientUid?: string;
  recipientUids?: string[];
  senderUid?: string;
  title: string;
  body: string;
  type: string;
  chatId?: string;
  productId?: string;
  sellerId?: string;
  buyerId?: string;
  routePath?: string;
  routeParams?: Record<string, string>;
};

export async function createAppNotification(payload: NotificationPayload) {
  const recipientUids = Array.from(
    new Set(
      [payload.recipientUid, ...(payload.recipientUids || [])].filter(
        (uid): uid is string => Boolean(uid),
      ),
    ),
  );

  if (recipientUids.length === 0) {
    console.warn(
      "Skipping notification because no recipientUid(s) were provided",
      payload,
    );
    return false;
  }

  console.log("Creating notification", payload);

  try {
    const notificationsRef = collection(db, "notifications");
    const notificationIds: string[] = [];

    for (const recipientUid of recipientUids) {
      const docRef = await addDoc(notificationsRef, {
        recipientUid,
        senderUid: payload.senderUid || "",
        title: payload.title,
        body: payload.body,
        type: payload.type,
        chatId: payload.chatId || "",
        productId: payload.productId || "",
        sellerId: payload.sellerId || "",
        buyerId: payload.buyerId || "",
        routePath: payload.routePath || "",
        routeParams: payload.routeParams || {},
        read: false,
        createdAt: serverTimestamp(),
        createdAtFallback: new Date().toISOString(),
      });

      notificationIds.push(docRef.id);
    }

    console.log("Notification(s) created in Firestore", {
      recipientUids,
      notificationIds,
    });
    return true;
  } catch (error) {
    console.error("Failed to save notification in Firestore", error, payload);
    return false;
  }
}
