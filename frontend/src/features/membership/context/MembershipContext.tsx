"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";

import {
  BillingCycle,
  CheckoutData,
  MembershipPlan,
  MembershipTier,
} from "../types/membership";

import {
  getMembershipPlan,
  getPlanPrice,
} from "../data/plans";

interface MembershipContextType {
  selectedPlan: MembershipTier;
  billingCycle: BillingCycle;

  checkoutData: CheckoutData;

  couponCode: string;
  discount: number;
  gst: number;
  subtotal: number;
  total: number;

  plan?: MembershipPlan;

  setSelectedPlan: (plan: MembershipTier) => void;
  setBillingCycle: (cycle: BillingCycle) => void;
  updateCheckout: (data: Partial<CheckoutData>) => void;

  applyCoupon: (code: string, discount: number) => void;

  resetCheckout: () => void;
}

const MembershipContext = createContext<
  MembershipContextType | undefined
>(undefined);

const initialCheckout: CheckoutData = {
  plan: "free",
  billingCycle: "monthly",
  fullName: "",
  email: "",
  phone: "",
};

export function MembershipProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [checkoutData, setCheckoutData] =
    useState<CheckoutData>(initialCheckout);

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const plan = getMembershipPlan(checkoutData.plan);

  const subtotal = plan
    ? getPlanPrice(plan, checkoutData.billingCycle)
    : 0;

  const gst = Math.round((subtotal - discount) * 0.18);

  const total = subtotal - discount + gst;

  function setSelectedPlan(plan: MembershipTier) {
    setCheckoutData((prev) => ({
      ...prev,
      plan,
    }));
  }

  function setBillingCycle(cycle: BillingCycle) {
    setCheckoutData((prev) => ({
      ...prev,
      billingCycle: cycle,
    }));
  }

  function updateCheckout(data: Partial<CheckoutData>) {
    setCheckoutData((prev) => ({
      ...prev,
      ...data,
    }));
  }

  function applyCoupon(code: string, amount: number) {
    setCouponCode(code);
    setDiscount(amount);
  }

  function resetCheckout() {
    setCheckoutData(initialCheckout);
    setCouponCode("");
    setDiscount(0);
  }

  const value = useMemo(
    () => ({
      selectedPlan: checkoutData.plan,
      billingCycle: checkoutData.billingCycle,

      checkoutData,

      couponCode,
      discount,

      subtotal,
      gst,
      total,

      plan,

      setSelectedPlan,
      setBillingCycle,
      updateCheckout,

      applyCoupon,

      resetCheckout,
    }),
    [
      checkoutData,
      couponCode,
      discount,
      subtotal,
      gst,
      total,
      plan,
    ]
  );

  return (
    <MembershipContext.Provider value={value}>
      {children}
    </MembershipContext.Provider>
  );
}

export function useMembership() {
  const context = useContext(MembershipContext);

  if (!context) {
    throw new Error(
      "useMembership must be used inside MembershipProvider"
    );
  }

  return context;
}