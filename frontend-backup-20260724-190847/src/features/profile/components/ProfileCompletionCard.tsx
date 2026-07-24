"use client";

import Card from "@/components/ui/Card";
import ProfileProgress from "./ProfileProgress";

interface ProfileCompletionCardProps {
  percentage: number;
  completed: string[];
  pending: string[];
}

export default function ProfileCompletionCard({
  percentage,
  completed,
  pending,
}: ProfileCompletionCardProps) {
  return (
    <Card>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[#0B2D5C]">
            Complete Your Profile
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            A complete profile improves trust and helps you receive better
            matches.
          </p>
        </div>

        <ProfileProgress percentage={percentage} />

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-600">
              Completed
            </h3>

            <div className="space-y-2">
              {completed.length === 0 ? (
                <p className="text-sm text-slate-400">
                  No sections completed yet.
                </p>
              ) : (
                completed.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
                  >
                    <span>✅</span>
                    <span>{item}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-amber-600">
              Remaining
            </h3>

            <div className="space-y-2">
              {pending.length === 0 ? (
                <p className="text-sm text-emerald-600 font-medium">
                  🎉 Your profile is complete!
                </p>
              ) : (
                pending.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700"
                  >
                    <span>⚠️</span>
                    <span>{item}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}