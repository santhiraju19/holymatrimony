"use client";

import { useEffect, useState } from "react";

import InterestCard from "./InterestCard";

import { Interest } from "../types";
import { interestService } from "../services/interest.service";

export default function ReceivedInterestList() {
  const [interests, setInterests] = useState<Interest[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setInterests(await interestService.list());
  }

  async function accept(id: number) {
    await interestService.update(id, "Accepted");
    load();
  }

  async function reject(id: number) {
    await interestService.update(id, "Rejected");
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-[#0B2D5C]">
        Received Interests
      </h1>

      {interests.map((interest) => (
        <InterestCard
          key={interest.id}
          interest={interest}
          onAccept={accept}
          onReject={reject}
        />
      ))}

      {interests.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          No interests received yet.
        </div>
      )}
    </div>
  );
}