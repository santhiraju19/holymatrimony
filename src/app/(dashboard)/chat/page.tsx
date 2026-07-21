"use client";

import Card from "@/components/ui/Card";

export default function ChatPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-[#0B2D5C]">
        Messages
      </h1>

      <Card>
        <div className="py-24 text-center text-slate-500">
          No conversations yet.
        </div>
      </Card>
    </div>
  );
}