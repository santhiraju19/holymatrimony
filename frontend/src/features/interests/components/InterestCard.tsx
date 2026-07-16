"use client";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

import { Interest } from "../types";

interface Props {
  interest: Interest;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
}

export default function InterestCard({
  interest,
  onAccept,
  onReject,
}: Props) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0B2D5C]">
            {interest.memberName}
          </h2>

          <p className="text-slate-500">
            {interest.status}
          </p>
        </div>

        {interest.status === "Pending" ? (
          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={() => onAccept(interest.id)}
            >
              Accept
            </Button>

            <Button
              variant="secondary"
              onClick={() => onReject(interest.id)}
            >
              Reject
            </Button>
          </div>
        ) : (
          <span
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              interest.status === "Accepted"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {interest.status}
          </span>
        )}
      </div>
    </Card>
  );
}