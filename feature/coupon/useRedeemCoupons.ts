import { auth, db } from "@/service/firebaseConfigs";
import {
  addDoc,
  collection,
  doc,
  increment,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

export interface Coupon {
  id?: string;
  code: string;
  title: string;
  discountAmount: number;
  pointsCost: number; // Points required to claim
  description: string;
  expiryDate?: string;
  claimedAt?: any;
  isUsed?: boolean;
}

// 5 System Coupons based on 50 points = ₱5 ratio
export const SYSTEM_COUPONS: Coupon[] = [
  {
    code: "SUKI5AVE",
    title: "₱5 Welcome to Unisuki",
    discountAmount: 5,
    pointsCost: 0,
    description: "Enjoy ₱5 off on any campus purchase.",
    expiryDate: "Dec 31, 2026",
  },
  {
    code: "WELCOME10",
    title: "₱10 Off Welcome Coupon",
    discountAmount: 10,
    pointsCost: 100,
    description: "Enjoy ₱10 off on your campus purchase.",
    expiryDate: "Dec 31, 2026",
  },
  {
    code: "CAMPUS15",
    title: "₱15 Off Campus Saver",
    discountAmount: 15,
    pointsCost: 150,
    description: "Save ₱15 on qualifying campus items.",
    expiryDate: "Dec 31, 2026",
  },
  {
    code: "STUDENT20",
    title: "₱20 Off Student Pass",
    discountAmount: 20,
    pointsCost: 200,
    description: "Exclusive discount pass for verified students.",
    expiryDate: "Nov 30, 2026",
  },
  {
    code: "MEGA50",
    title: "₱50 Off Mega Reward",
    discountAmount: 50,
    pointsCost: 500,
    description: "Get ₱50 off on high-value marketplace items.",
    expiryDate: "Dec 31, 2026",
  },
];

export function useRedeemCoupons() {
  const [claimedCoupons, setClaimedCoupons] = useState<Coupon[]>([]);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUser = auth.currentUser;

  // Real-time listener for user profile (points) and claimed coupons
  useEffect(() => {
    if (!currentUser) {
      setClaimedCoupons([]);
      setUserPoints(0);
      setLoading(false);
      return;
    }

    // 1. Listen to user points in user/{uid}
    const userDocRef = doc(db, "user", currentUser.uid);
    const unsubUser = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserPoints(Number(data.points || 0));
        }
      },
      (err) => console.error("Error loading user points:", err)
    );

    // 2. Listen to claimed coupons in user/{uid}/claimedCoupons
    const couponsRef = collection(
      db,
      "user",
      currentUser.uid,
      "claimedCoupons"
    );

    const unsubCoupons = onSnapshot(
      couponsRef,
      (snapshot) => {
        const coupons = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Coupon),
        }));
        setClaimedCoupons(coupons);
        setLoading(false);
      },
      (err) => {
        console.error("Error listening to user coupons:", err);
        setLoading(false);
      }
    );

    return () => {
      unsubUser();
      unsubCoupons();
    };
  }, [currentUser]);

  /**
   * Case-insensitive check if code is already claimed
   */
  const isCouponClaimed = (code: string): boolean => {
    const formatted = code.trim().toUpperCase();
    return claimedCoupons.some(
      (c) => c.code?.trim().toUpperCase() === formatted
    );
  };

  /**
   * Case-insensitive check if code was already used
   */
  const isCouponUsed = (code: string): boolean => {
    const formatted = code.trim().toUpperCase();
    const found = claimedCoupons.find(
      (c) => c.code?.trim().toUpperCase() === formatted
    );
    return Boolean(found?.isUsed);
  };

  /**
   * Claims/redeems a promo code using user points
   */
  const redeemCoupon = async (codeToClaim: string): Promise<boolean> => {
    if (!currentUser) {
      Alert.alert("Error", "Please log in to redeem coupons.");
      return false;
    }

    const formattedCode = codeToClaim.trim().toUpperCase();

    if (!formattedCode) {
      Alert.alert("Error", "Please enter a valid coupon code.");
      return false;
    }

    // 1. Check if the code exists in available system promos
    const matchedCoupon = SYSTEM_COUPONS.find(
      (c) => c.code.toUpperCase() === formattedCode
    );

    if (!matchedCoupon) {
      Alert.alert(
        "Invalid Code",
        "The promo code entered does not exist or is invalid."
      );
      return false;
    }

    // 2. Check if user already claimed this coupon
    if (isCouponClaimed(formattedCode)) {
      if (isCouponUsed(formattedCode)) {
        Alert.alert(
          "Coupon Used",
          "This coupon has already been used and cannot be redeemed again."
        );
      } else {
        Alert.alert(
          "Already Claimed",
          "You have already claimed this coupon. It is saved in your unlocked coupons."
        );
      }
      return false;
    }

    // 3. Verify user has enough points
    if (userPoints < matchedCoupon.pointsCost) {
      Alert.alert(
        "Insufficient Points",
        `You need ${matchedCoupon.pointsCost} points to claim this coupon. You currently have ${userPoints} points.`
      );
      return false;
    }

    setIsSubmitting(true);

    try {
      // Deduct points from user profile
      const userDocRef = doc(db, "user", currentUser.uid);
      await updateDoc(userDocRef, {
        points: increment(-matchedCoupon.pointsCost),
      });

      // Add coupon to user's claimedCoupons collection
      const userCouponsRef = collection(
        db,
        "user",
        currentUser.uid,
        "claimedCoupons"
      );

      await addDoc(userCouponsRef, {
        code: matchedCoupon.code,
        title: matchedCoupon.title,
        discountAmount: matchedCoupon.discountAmount,
        pointsCost: matchedCoupon.pointsCost,
        description: matchedCoupon.description,
        claimedAt: serverTimestamp(),
        isUsed: false,
      });

      Alert.alert(
        "Coupon Claimed! 🎉",
        `You used ${matchedCoupon.pointsCost} points to unlock "${matchedCoupon.title}".`
      );
      return true;
    } catch (err) {
      console.error("Error redeeming coupon with points:", err);
      Alert.alert("Error", "Could not redeem coupon. Please try again.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Active, unused coupons ready for checkout
   */
  const validCouponsForPurchase = claimedCoupons.filter(
    (coupon) => !coupon.isUsed
  );

  return {
    claimedCoupons,
    validCouponsForPurchase,
    userPoints,
    loading,
    isSubmitting,
    isCouponClaimed,
    isCouponUsed,
    redeemCoupon,
    availablePromos: SYSTEM_COUPONS,
  };
}