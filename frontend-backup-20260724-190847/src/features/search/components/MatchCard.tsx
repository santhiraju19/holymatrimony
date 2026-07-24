"use client";

import Link from "next/link";
import Card from "@/components/ui/Card";
import {
  Heart,
  BadgeCheck,
  MapPin,
  Briefcase,
} from "lucide-react";

interface Profile {
  id: number;
  name: string;
  age: number;
  profession: string;
  location: string;
  denomination: string;
}

interface MatchCardProps {
  profile: Profile;
}

export default function MatchCard({
  profile,
}: MatchCardProps) {
  return (
    <Card className="overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative">
        <div className="aspect-[4/5] bg-gradient-to-br from-slate-200 to-slate-300" />

        <button className="absolute right-4 top-4 rounded-full bg-white p-2 shadow transition hover:scale-110">
          <Heart size={18} />
        </button>

        <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white shadow">
          <BadgeCheck size={14} />
          Verified
        </div>
      </div>

      <div className="space-y-3 p-5">
        <div>
          <h2 className="text-xl font-bold text-[#0B2D5C]">
            {profile.name}
          </h2>

          <p className="text-slate-500">
            {profile.age} Years
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Briefcase size={16} />
          {profile.profession}
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MapPin size={16} />
          {profile.location}
        </div>

        <div className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium">
          {profile.denomination}
        </div>

        <Link href={`/profile/${profile.id}`}>
          <button className="mt-2 w-full rounded-xl bg-[#0B2D5C] py-3 font-semibold text-white transition hover:bg-[#123C73]">
            View Profile
          </button>
        </Link>
      </div>
    </Card>
  );
}