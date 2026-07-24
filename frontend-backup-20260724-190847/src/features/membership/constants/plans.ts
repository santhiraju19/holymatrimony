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
    title: "Silver",
    price: "₹999",
    description: "Perfect for active members.",
    buttonText: "Choose Silver",
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
    title: "Gold",
    price: "₹1,499",
    description: "Designed for faster matchmaking.",
    buttonText: "Choose Gold",
    features: [
      "Everything in Silver",
      "Church Verified Badge",
      "Dedicated Relationship Manager",
      "Video Calling",
      "Unlimited Chats",
      "Priority Support",
    ],
  },
  {
    title: "Platinum",
    price: "₹2,499",
    description: "Our complete premium experience.",
    buttonText: "Become Platinum",
    features: [
      "Everything in Gold",
      "Personal Matchmaker",
      "Premium Profile Placement",
      "Marriage Assistance",
      "VIP Support",
      "Highest Search Priority",
    ],
  },
];