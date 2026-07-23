export interface CheckoutData {
  plan: "silver" | "gold" | "platinum";
  billing: "monthly" | "quarterly" | "yearly";

  fullName: string;
  email: string;
  phone: string;

  coupon?: string;

  gstNumber?: string;
}