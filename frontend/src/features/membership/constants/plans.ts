export interface MembershipPlan {
  title: string;
  price: string;
  description: string;
  buttonText: string;
  popular?: boolean;
  features: string[];
}

export const membershipPlans: MembershipPlan[] = [
  {
    title: "Free",
    price: "₹0",
    description: "Start your journey with a free account.",
    buttonText: "Register Free",
    features: [
      "Create Profile",
      "Upload Photos",
      "Browse Profiles",
      "Basic Search",
    ],
  },
  {
    title: "Premium",
    price: "₹999",
    description: "Perfect for active members.",
    buttonText: "Choose Premium",
    popular: true,
    features: [
      "Everything in Free",
      "Unlimited Interests",
      "Chat with Members",
      "View Contact Details",
      "Priority Search",
      "Profile Boost",
    ],
  },
  {
    title: "Elite",
    price: "₹1,999",
    description: "Designed for faster matchmaking.",
    buttonText: "Choose Elite",
    features: [
      "Everything in Premium",
      "Church Verified Badge",
      "Dedicated Relationship Manager",
      "Video Calling",
      "Unlimited Chats",
      "Priority Support",
    ],
  },
  {
    title: "Signature",
    price: "₹4,999",
    description: "Our complete premium experience.",
    buttonText: "Become Signature",
    features: [
      "Everything in Elite",
      "Personal Matchmaker",
      "Premium Profile Placement",
      "Marriage Assistance",
      "VIP Support",
      "Highest Search Priority",
    ],
  },
];