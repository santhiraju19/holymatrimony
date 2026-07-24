export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
  popular?: boolean;
  features: string[];
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    duration: "Forever",
    description: "Start your journey with Holy Matrimony.",
    features: [
      "Create Profile",
      "Browse Verified Profiles",
      "Limited Interests",
      "Basic Search",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 999,
    duration: "3 Months",
    description: "Most popular plan for serious matchmaking.",
    popular: true,
    features: [
      "Unlimited Interests",
      "Unlimited Profile Views",
      "View Contact Details",
      "WhatsApp Connect",
      "Advanced Filters",
      "Church Verified Matches",
      "Priority Listing",
    ],
  },
  {
    id: "elite",
    name: "Elite",
    price: 2499,
    duration: "12 Months",
    description: "Premium experience with maximum visibility.",
    features: [
      "Everything in Premium",
      "Profile Boost",
      "Dedicated Relationship Manager",
      "Priority Support",
      "Featured Profile",
      "Early Access to New Features",
    ],
  },
];