export interface FeaturedProfile {
  id: string;
  name: string;
  age: number;
  denomination: string;
  profession: string;
  location: string;
  image: string;
  verified: boolean;
  churchVerified: boolean;
  completion: number;
}

export const featuredProfiles: FeaturedProfile[] = [
  {
    id: "HM001",
    name: "Sarah",
    age: 27,
    denomination: "CSI",
    profession: "Software Engineer",
    location: "Hyderabad",
    image: "/images/profiles/profile-1.jpg",
    verified: true,
    churchVerified: true,
    completion: 98,
  },
  {
    id: "HM002",
    name: "John",
    age: 30,
    denomination: "Baptist",
    profession: "Doctor",
    location: "Bengaluru",
    image: "/images/profiles/profile-2.jpg",
    verified: true,
    churchVerified: true,
    completion: 96,
  },
  {
    id: "HM003",
    name: "Grace",
    age: 26,
    denomination: "Pentecostal",
    profession: "Architect",
    location: "Chennai",
    image: "/images/profiles/profile-3.jpg",
    verified: true,
    churchVerified: false,
    completion: 91,
  },
  {
    id: "HM004",
    name: "David",
    age: 29,
    denomination: "Methodist",
    profession: "Chartered Accountant",
    location: "Vijayawada",
    image: "/images/profiles/profile-4.jpg",
    verified: true,
    churchVerified: true,
    completion: 99,
  },
];