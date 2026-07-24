import { TrustPassport } from "./types";

export const trustPassport: TrustPassport = {
  score: 92,

  level: "Highly Trusted",

  lastUpdated: "Today",

  items: [
    {
      id: "identity",
      title: "Identity Verified",
      description: "Government ID verified.",
      verified: true,
    },
    {
      id: "mobile",
      title: "Mobile Verified",
      description: "Mobile number confirmed.",
      verified: true,
    },
    {
      id: "email",
      title: "Email Verified",
      description: "Email address confirmed.",
      verified: true,
    },
    {
      id: "church",
      title: "Church Verified",
      description: "Church membership verified.",
      verified: true,
    },
    {
      id: "education",
      title: "Education Verified",
      description: "Pending verification.",
      verified: false,
    },
    {
      id: "employment",
      title: "Employment Verified",
      description: "Pending verification.",
      verified: false,
    },
    {
      id: "profile",
      title: "Profile Completed",
      description: "85% profile completed.",
      verified: true,
    },
  ],
};