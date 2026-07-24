"use client";

import Image from "next/image";

import Section from "@/components/ui/Section";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const stories = [
  {
    id: 1,
    groom: "John",
    bride: "Grace",
    church: "St. Mary's Church",
    location: "Guntur",
    married: "January 2026",
    image: "/images/hero-couple.jpg",
    quote:
      "We prayed for years before meeting each other. Holy Matrimony became God's instrument in bringing our families together.",
  },
  {
    id: 2,
    groom: "Daniel",
    bride: "Esther",
    church: "CSI Church",
    location: "Hyderabad",
    married: "March 2026",
    image: "/images/hero-couple.jpg",
    quote:
      "Finding someone who shared our faith and values felt impossible until Holy Matrimony introduced us.",
  },
  {
    id: 3,
    groom: "Samuel",
    bride: "Ruth",
    church: "Baptist Church",
    location: "Vijayawada",
    married: "May 2026",
    image: "/images/hero-couple.jpg",
    quote:
      "Our families instantly connected, and today we're grateful to begin our new journey together through God's grace.",
  },
];

export default function SuccessStories() {
  return (
    <Section className="bg-slate-50">
      <Container>
        <SectionHeading
          title="Success Stories"
          subtitle="Every marriage begins with faith, prayer, and God's perfect timing."
        />

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {stories.map((story) => (
            <Card
              key={story.id}
              className="overflow-hidden p-0"
            >
              <div className="relative h-64">
                <Image
                  src={story.image}
                  alt={`${story.groom} & ${story.bride}`}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-5 p-6">
                <div>
                  <h3 className="text-2xl font-bold text-[#0B2D5C]">
                    {story.groom} &amp; {story.bride}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {story.church}
                  </p>

                  <p className="text-sm text-slate-500">
                    {story.location}
                  </p>

                  <p className="mt-2 text-sm font-semibold text-[#D4AF37]">
                    Married • {story.married}
                  </p>
                </div>

                <div className="text-lg text-yellow-500">
                  ★★★★★
                </div>

                <p className="leading-7 text-slate-600">
                  "{story.quote}"
                </p>

                <Button variant="outline" fullWidth>
                  Read Story
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}