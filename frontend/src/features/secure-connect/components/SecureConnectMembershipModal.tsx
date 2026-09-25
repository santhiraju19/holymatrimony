"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Crown, ShieldCheck, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SecureConnectMembershipModal({
  open,
  onClose,
}: Props) {
  useEffect(() => {
    if (!open) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/65 px-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="secure-connect-membership-title"
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close membership dialog"
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={20} />
        </button>

        <div className="px-7 pb-8 pt-10 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-yellow-50">
            <Crown
              size={38}
              className="text-amber-600"
            />
          </div>

          <h2
            id="secure-connect-membership-title"
            className="mt-6 text-2xl font-black text-[#0B2D5C]"
          >
            Membership Required
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            An active eligible membership is required
            to make Secure Connect calls.
          </p>

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-left">
            <ShieldCheck
              size={22}
              className="mt-0.5 shrink-0 text-blue-700"
            />

            <p className="text-sm leading-6 text-slate-700">
              Your purchased calling minutes are safe
              and never expire. You can use them again
              when you have an active eligible membership.
            </p>
          </div>

          <Link
            href="/membership"
            onClick={onClose}
            className="mt-7 flex min-h-12 w-full items-center justify-center rounded-xl bg-[#0B2D5C] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#123C73]"
          >
            View Membership Plans
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="mt-3 flex min-h-11 w-full items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
