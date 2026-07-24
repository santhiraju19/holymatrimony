export type BillingCycle = "monthly" | "quarterly" | "yearly";

export interface MembershipPlan {
  id: string;
  name: string;
  badge?: string;
  description: string;

  price: {
    monthly: number;
    quarterly: number;
    yearly: number;
  };

  popular?: boolean;

  buttonText: string;

  features: string[];

  limitations?: string[];
}

export const membershipPlans: MembershipPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Start your search with essential features.",

    price: {
      monthly: 0,
      quarterly: 0,
      yearly: 0,
    },

    buttonText: "Get Started",

    features: [
      "Create Profile",
      "Upload Photos",
      "Basic Search",
      "View Limited Profiles",
      "Express Interest (Limited)",
    ],

    limitations: [
      "Cannot View Contact Details",
      "No Unlimited Chat",
      "Limited Daily Matches",
    ],
  },

  {
    id: "silver",
    name: "Silver",
    badge: "Most Affordable",

    description: "Perfect for serious partner seekers.",

    price: {
      monthly: 499,
      quarterly: 1299,
      yearly: 4499,
    },

    buttonText: "Choose Silver",

    features: [
      "Everything in Free",
      "Unlimited Profile Views",
      "Unlimited Interests",
      "View Phone Number",
      "Priority Search",
      "Chat Access",
    ],
  },

  {
    id: "gold",
    name: "Gold",
    badge: "Most Popular",

    popular: true,

    description: "Unlock premium matchmaking features.",

    price: {
      monthly: 799,
      quarterly: 2199,
      yearly: 7499,
    },

    buttonText: "Choose Gold",

    features: [
      "Everything in Silver",
      "Highlighted Profile",
      "Unlimited Chat",
      "Who's Viewed Me",
      "Advanced Filters",
      "Priority Customer Support",
      "Compatibility Score",
    ],
  },

  {
    id: "platinum",
    name: "Platinum",
    badge: "Best Value",

    description: "Exclusive experience with maximum visibility.",

    price: {
      monthly: 1199,
      quarterly: 3299,
      yearly: 10999,
    },

    buttonText: "Choose Platinum",

    features: [
      "Everything in Gold",
      "Dedicated Relationship Manager",
      "Top Search Placement",
      "Verified Premium Badge",
      "Early Access to New Features",
      "Priority Verification",
      "VIP Support",
    ],
  },
];