"use client";

import Card from "@/components/ui/Card";

const guidelines = [
  {
    icon: "😊",
    title: "Clear Face",
    description: "Your face should be clearly visible.",
  },
  {
    icon: "💡",
    title: "Good Lighting",
    description: "Use natural or bright lighting.",
  },
  {
    icon: "👔",
    title: "Decent Attire",
    description: "Church or formal attire is recommended.",
  },
  {
    icon: "🚫",
    title: "Avoid Group Photos",
    description: "Upload photos with only yourself.",
  },
  {
    icon: "📅",
    title: "Recent Photo",
    description: "Use a photo taken within the last year.",
  },
  {
    icon: "😎",
    title: "No Sunglasses",
    description: "Keep your eyes visible.",
  },
];

export default function UploadGuidelines() {
  return (
    <Card>
      <h3 className="mb-5 text-lg font-semibold text-[#0B2D5C]">
        Photo Guidelines
      </h3>

      <div className="space-y-4">
        {guidelines.map((item) => (
          <div
            key={item.title}
            className="flex items-start gap-3"
          >
            <div className="text-2xl">{item.icon}</div>

            <div>
              <div className="font-medium">
                {item.title}
              </div>

              <div className="text-sm text-slate-500">
                {item.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}