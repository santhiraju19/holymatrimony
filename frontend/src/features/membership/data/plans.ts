import {
  BillingCycle,
  MembershipPlan,
} from "../types/membership";

export const membershipPlans: MembershipPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Start your search with essential features.",
    badge: "Free",

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
      "Advanced Search",
      "Priority Search",
      "Chat Access",
      "View Contact Details",
      "120 Minutes Secure Audio Calling",
      "Receive Secure Video Calls",
      "Purchase Additional Audio Minutes",
    ],
  },

  {
    id: "gold",
    name: "Gold",
    badge: "Most Popular",

    description: "Unlock premium matchmaking features.",

    price: {
      monthly: 799,
      quarterly: 2199,
      yearly: 7499,
    },

    popular: true,

    buttonText: "Choose Gold",

    features: [
      "Silver Features (with Gold Calling Allowances)",
      "Unlimited Profile Views & Interests",
      "Advanced Search & Priority Search",
      "Chat & Contact Details",
      "Highlighted Profile",
      "Profile Boost",
      "Who's Viewed Me",
      "Compatibility Score",
      "Priority Customer Support",
      "60 Minutes Secure Audio Calling",
      "60 Minutes Secure Video Calling",
      "Purchase Additional Audio & Video Minutes",
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
      "Gold Features (with Unlimited Calling)",
      "Unlimited Secure Audio Calling",
      "Unlimited Secure Video Calling",
      "Highlighted Profile & Profile Boost",
      "Top Search Placement",
      "Dedicated Relationship Manager",
      "Verified Premium Badge",
      "Priority Church Verification",
      "Early Access to New Features",
      "Priority Customer Support",
    ],
  },
];

/**
 * Returns the price for the selected billing cycle.
 */
export function getPlanPrice(
  plan: MembershipPlan,
  billingCycle: BillingCycle
): number {
  return plan.price[billingCycle];
}

/**
 * Returns a membership plan by ID.
 */
export function getMembershipPlan(id: string): MembershipPlan | undefined {
  return membershipPlans.find((plan) => plan.id === id);
}