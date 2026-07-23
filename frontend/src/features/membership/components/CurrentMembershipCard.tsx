"use client";

import { useEffect, useState } from "react";
import { Calendar, Crown, ShieldCheck } from "lucide-react";
import { getMembership } from "@/services/membership/membershipService";
import type { MembershipResponse } from "@/services/membership/types";

export default function CurrentMembershipCard() {
  const [membership, setMembership] =
    useState<MembershipResponse | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMembership() {
      try {
        const data = await getMembership();
        setMembership(data);
      } catch (error) {
        console.error(error);

        // Temporary fallback until backend is complete
        setMembership({
          plan: "FREE",
          billingCycle: "MONTHLY",
          status: "ACTIVE",
          startDate: new Date().toISOString(),
          expiryDate: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    }

    loadMembership();
  }, []);

  if (loading) {
    return (
      <div className="rounded-3xl border bg-white p-8 shadow-sm">
        Loading membership...
      </div>
    );
  }

  if (!membership) {
    return null;
  }

  return (
    <div className="rounded-3xl border bg-white p-8 shadow-sm">
      <div className="flex items-center gap-3">
        <Crown className="text-primary" size={28} />

        <div>
          <h2 className="text-2xl font-bold">
            Current Membership
          </h2>

          <p className="text-gray-500">
            Your active subscription
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl bg-gray-50 p-5">
          <p className="text-sm text-gray-500">
            Plan
          </p>

          <h3 className="mt-2 text-xl font-bold">
            {membership.plan}
          </h3>
        </div>

        <div className="rounded-2xl bg-gray-50 p-5">
          <p className="text-sm text-gray-500">
            Billing Cycle
          </p>

          <h3 className="mt-2 text-xl font-bold">
            {membership.billingCycle}
          </h3>
        </div>

        <div className="rounded-2xl bg-gray-50 p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck
              size={18}
              className="text-green-600"
            />

            <span className="text-sm text-gray-500">
              Status
            </span>
          </div>

          <h3 className="mt-2 text-xl font-bold text-green-600">
            {membership.status}
          </h3>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-3 rounded-2xl bg-blue-50 p-4">
        <Calendar
          className="text-primary"
          size={20}
        />

        <span>
          Expires on{" "}
          <strong>
            {new Date(
              membership.expiryDate
            ).toLocaleDateString()}
          </strong>
        </span>
      </div>
    </div>
  );
}