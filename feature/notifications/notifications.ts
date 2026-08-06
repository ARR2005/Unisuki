import { db } from "@/service/firebaseConfigs";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

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

  console.log("Creating/Updating notification", payload);

  try {
    const notificationIds: string[] = [];

    for (const recipientUid of recipientUids) {
      // Create a unique, deterministic ID for this recipient + chat combination
      // If chatId is not provided, fall back to buyerId + productId
      const baseIdentifier = payload.chatId || `${payload.buyerId}_${payload.productId}`;
      const customDocId = `${recipientUid}_${baseIdentifier}`;

      const notificationRef = doc(db, "notifications", customDocId);

      await setDoc(
        notificationRef,
        {
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
          read: false, // Reset to unread so recipient sees the updated notification
          createdAt: serverTimestamp(),
          createdAtFallback: new Date().toISOString(),
        },
        { merge: true } // Overwrites existing notification if it exists
      );

      notificationIds.push(customDocId);
    }

    console.log("Notification(s) updated in Firestore", {
      recipientUids,
      notificationIds,
    });
    return true;
  } catch (error) {
    console.error("Failed to save notification in Firestore", error, payload);
    return false;
  }
}