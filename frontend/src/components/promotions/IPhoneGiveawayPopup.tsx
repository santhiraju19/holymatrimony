"use client";

import Image from "next/image";
import Link from "next/link";
import { Crown, X } from "lucide-react";
import { useEffect, useState } from "react";

const SESSION_KEY = "hm_iphone_giveaway_seen_2026";

const CAMPAIGN_START = new Date("2026-09-01T00:00:00+05:30");
const CAMPAIGN_END = new Date("2026-09-30T23:59:59+05:30");

export default function IPhoneGiveawayPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const now = new Date();

    const campaignActive =
      now >= CAMPAIGN_START &&
      now <= CAMPAIGN_END;

    if (!campaignActive) {
      return;
    }

    const alreadySeen =
      sessionStorage.getItem(SESSION_KEY);

    if (alreadySeen) {
      return;
    }

    const timer = window.setTimeout(() => {
      setOpen(true);
    }, 500);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        closePopup();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open]);

  function markSeen() {
    sessionStorage.setItem(
      SESSION_KEY,
      "true"
    );
  }

  function closePopup() {
    markSeen();
    setOpen(false);
  }

  function handleRegister() {
    markSeen();
    setOpen(false);
  }

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 px-2 py-3 backdrop-blur-sm sm:px-6 sm:py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="giveaway-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closePopup();
        }
      }}
    >
      <div className="relative flex max-h-[96vh] w-full max-w-[760px] flex-col overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl sm:rounded-[28px]">
        <button
          type="button"
          onClick={closePopup}
          aria-label="Close promotion"
          className="absolute right-3 top-3 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-lg transition hover:scale-105 hover:bg-white"
        >
          <X className="h-5 w-5" />
        </button>

        <h2
          id="giveaway-title"
          className="sr-only"
        >
          Holy Matrimony Mega Giveaway
        </h2>

        <div className="min-h-0 flex-1 overflow-y-auto bg-[#fff8f8]">
          <Image
            src="/promotions/iphone-giveaway-sept-2026.jpeg"
            alt="Holy Matrimony Mega Giveaway promotion for Platinum members during September 2026."
            width={1024}
            height={1536}
            priority
            sizes="(max-width: 768px) 100vw, 760px"
            className="h-auto w-full"
          />
        </div>

        <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/membership"
              onClick={handleRegister}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-5 py-3 text-center font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Crown className="h-5 w-5" />
              Register for Platinum
            </Link>

            <button
              type="button"
              onClick={closePopup}
              className="min-h-12 rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-[#0B2D5C] transition hover:border-blue-500 hover:bg-blue-50"
            >
              Enter Website →
            </button>
          </div>

          <div className="mt-3 text-center text-xs leading-5 text-slate-500">
            Campaign period: September 1–30, 2026.
            <span className="ml-1 font-semibold">
              Terms & Conditions Apply.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
