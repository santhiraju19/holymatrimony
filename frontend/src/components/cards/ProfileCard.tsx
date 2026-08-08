"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Briefcase,
  CheckCircle2,
  Church,
  Heart,
  MapPin,
} from "lucide-react";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/button";
import Card from "@/components/ui/Card";

export interface ProfileCardProps {
  id: string;
  name: string;
  age: number;
  denomination: string;
  profession: string;
  location: string;
  image: string;
  verified: boolean;
  churchVerified?: boolean;
  completion?: number;
  onViewProfile?: (id: string) => void;
  onFavourite?: (id: string) => void;
}

export default function ProfileCard({
  id,
  name,
  age,
  denomination,
  profession,
  location,
  image,
  verified,
  churchVerified = false,
  completion = 100,
  onViewProfile,
  onFavourite,
}: ProfileCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="overflow-hidden p-0">
        <div className="relative aspect-[4/5]">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition duration-500 hover:scale-105"
            sizes="(max-width:768px) 100vw,
                   (max-width:1200px) 50vw,
                   25vw"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          <button
            type="button"
            onClick={() => onFavourite?.(id)}
            className="absolute right-4 top-4 rounded-full bg-white/90 p-3 backdrop-blur transition hover:scale-110"
          >
            <Heart className="h-5 w-5 text-rose-500" />
          </button>

          <div className="absolute bottom-5 left-5 right-5 text-white">
            <div className="mb-3 flex flex-wrap gap-2">
              {verified && (
                <Badge variant="success">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Verified
                </Badge>
              )}

              {churchVerified && (
                <Badge>
                  <Church className="mr-1 h-3 w-3" />
                  Church Verified
                </Badge>
              )}
            </div>

            <h3 className="text-2xl font-bold">
              {name}, {age}
            </h3>

            <p className="text-sm text-white/90">
              {denomination}
            </p>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center gap-3">
              <Briefcase className="h-4 w-4 text-blue-600" />
              {profession}
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-blue-600" />
              {location}
            </div>
          </div>

          <div>
            <div className="mb-2 flex justify-between text-xs font-medium text-slate-500">
              <span>Profile Completion</span>

              <span>{completion}%</span>
            </div>

            <div className="h-2 rounded-full bg-slate-200">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>

          <Button
            fullWidth
            onClick={() => onViewProfile?.(id)}
          >
            View Profile
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}