"use client";

import Card from "@/components/ui/Card";

import TrustScore from "./TrustScore";
import TrustItem from "./TrustItem";

import { trustPassport } from "../data";

export default function TrustPassport() {
  return (
    <Card>

      <div className="space-y-8">

        <div>

          <h2 className="text-3xl font-bold text-[#0B2D5C]">
            Trust Passport™
          </h2>

          <p className="mt-2 text-slate-500">
            This passport summarizes completed verifications to help members
            build confidence before requesting a Secure Introduction Meeting.
          </p>

        </div>

        <TrustScore
          score={trustPassport.score}
          level={trustPassport.level}
        />

        <div className="space-y-4">

          {trustPassport.items.map((item) => (
            <TrustItem
              key={item.id}
              title={item.title}
              description={item.description}
              verified={item.verified}
            />
          ))}

        </div>

        <div className="rounded-2xl border border-[#D4AF37]/30 bg-[#FFF9EB] p-5">

          <h3 className="font-semibold text-[#0B2D5C]">
            Privacy First
          </h3>

          <p className="mt-2 text-sm leading-7 text-slate-600">
            Holy Matrimony shares verification status without exposing
            personal information. Trust is increased while privacy remains
            protected.
          </p>

          <p className="mt-4 text-xs text-slate-500">
            Last Updated : {trustPassport.lastUpdated}
          </p>

        </div>

      </div>

    </Card>
  );
}