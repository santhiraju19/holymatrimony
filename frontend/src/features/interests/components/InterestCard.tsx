"use client";

import Link from "next/link";
import {
  Check,
  Church,
  Clock3,
  MapPin,
  UserRound,
  X,
} from "lucide-react";

import type {
  Interest,
  InterestStatus,
} from "../types";

import { resolveBrowsePhotoUrl } from "@/features/browse/utils/photoUrl";

interface InterestCardProps {
  interest: Interest;
  updating: boolean;
  onAccept: (interestId: string) => void;
  onDecline: (interestId: string) => void;
}

function formatStatus(
  status: InterestStatus
): string {
  if (status === "ACCEPTED") {
    return "Accepted";
  }

  if (status === "DECLINED") {
    return "Declined";
  }

  return "Pending";
}

function formatDate(
  value: string
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
}

export default function InterestCard({
  interest,
  updating,
  onAccept,
  onDecline,
}: InterestCardProps) {
  const sender = interest.sender;

  const displayName =
    sender?.fullName?.trim() ||
    "Holy Matrimony Member";

  const photoUrl =
    resolveBrowsePhotoUrl(
      sender?.primaryPhotoUrl
    );

  const location = [
    sender?.city,
    sender?.state,
    sender?.country,
  ]
    .filter(Boolean)
    .join(", ");

  const profileHref =
    sender?.profileId
      ? `/browse/${sender.profileId}`
      : null;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid sm:grid-cols-[190px_minmax(0,1fr)]">
        <div className="relative min-h-[230px] bg-gradient-to-br from-blue-50 to-indigo-100">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={`${displayName} profile`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-[230px] items-center justify-center">
              <UserRound
                size={70}
                strokeWidth={1.3}
                className="text-blue-300"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between p-5 sm:p-6">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-[#0B2D5C]">
                  {displayName}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {[
                    sender?.age
                      ? `${sender.age} years`
                      : null,
                    sender?.gender,
                  ]
                    .filter(Boolean)
                    .join(" • ") ||
                    "Profile details unavailable"}
                </p>
              </div>

              <StatusBadge
                status={interest.status}
              />
            </div>

            <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <Detail
                icon={<Church size={17} />}
                value={
                  sender?.denomination ||
                  "Denomination not specified"
                }
              />

              <Detail
                icon={<MapPin size={17} />}
                value={
                  location ||
                  "Location not specified"
                }
              />

              <Detail
                icon={<UserRound size={17} />}
                value={
                  sender?.profession ||
                  "Profession not specified"
                }
              />

              <Detail
                icon={<Clock3 size={17} />}
                value={formatDate(
                  interest.createdAt
                )}
              />
            </div>

            {interest.message && (
              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Message
                </p>

                <p className="mt-2 leading-6 text-slate-700">
                  {interest.message}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {profileHref && (
              <Link
                href={profileHref}
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                View Profile
              </Link>
            )}

            {interest.status === "PENDING" && (
              <>
                <button
                  type="button"
                  disabled={updating}
                  onClick={() =>
                    onDecline(interest.id)
                  }
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <X size={18} />
                  Decline
                </button>

                <button
                  type="button"
                  disabled={updating}
                  onClick={() =>
                    onAccept(interest.id)
                  }
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Check size={18} />
                  {updating
                    ? "Updating..."
                    : "Accept"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function Detail({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-blue-600">
        {icon}
      </span>

      <span className="truncate">
        {value}
      </span>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: InterestStatus;
}) {
  const styles =
    status === "ACCEPTED"
      ? "bg-emerald-100 text-emerald-700"
      : status === "DECLINED"
        ? "bg-red-100 text-red-700"
        : "bg-amber-100 text-amber-700";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${styles}`}
    >
      {formatStatus(status)}
    </span>
  );
}