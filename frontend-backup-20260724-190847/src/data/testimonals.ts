export interface Testimonial {
  id: string;
  name: string;
  location: string;
  image: string;
  weddingDate: string;
  message: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Daniel & Esther",
    location: "Hyderabad",
    weddingDate: "Mar 2026",
    image: "/images/testimonials/couple-1.jpg",
    message:
      "Holy Matrimony helped us find each other through a Christ-centered journey. We are forever grateful.",
  },
  {
    id: "2",
    name: "Samuel & Ruth",
    location: "Bengaluru",
    weddingDate: "Jan 2026",
    image: "/images/testimonials/couple-2.jpg",
    message:
      "The church verification process gave both our families confidence. Everything felt genuine and trustworthy.",
  },
  {
    id: "3",
    name: "Joshua & Grace",
    location: "Chennai",
    weddingDate: "Nov 2025",
    image: "/images/testimonials/couple-3.jpg",
    message:
      "From the first conversation to our wedding day, God led every step. Thank you Holy Matrimony.",
  },
];