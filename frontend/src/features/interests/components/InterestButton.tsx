"use client";

import Link from "next/link";

import {
  CheckCircle2,
  Crown,
  Heart,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import useInterest from "../hooks/useInterest";

interface Props {
  receiverProfileId: string;
  memberName: string;
  message?: string;
}

function isInterestLimitError(
  message?: string | null
): boolean {
  if (!message) {
    return false;
  }

  const normalized =
    message
      .trim()
      .toLowerCase();

  return (
    normalized.includes(
      "free interests"
    ) ||
    normalized.includes(
      "unlimited interests"
    ) ||
    normalized.includes(
      "upgrade your membership"
    )
  );
}

export default function InterestButton({
  receiverProfileId,
  memberName,
  message,
}: Props) {
  const {
    loading,
    sent,
    error,
    sendInterest,
    clearError,
  } = useInterest();

  const [
    upgradeModalOpen,
    setUpgradeModalOpen,
  ] =
    useState(false);

  const [
    successModalOpen,
    setSuccessModalOpen,
  ] =
    useState(false);

  const interestLimitReached =
    isInterestLimitError(
      error
    );

  useEffect(() => {
    if (
      interestLimitReached
    ) {
      setUpgradeModalOpen(
        true
      );
    }
  }, [
    interestLimitReached,
  ]);

  async function handleSend(): Promise<void> {
    const success =
      await sendInterest(
        receiverProfileId,
        message
      );

    if (success) {
      setSuccessModalOpen(
        true
      );
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={
          loading ||
          sent
        }
        onClick={(
          event
        ) => {
          event.preventDefault();
          event.stopPropagation();

          void handleSend();
        }}
        className={[
          "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white transition",
          sent
            ? "cursor-default bg-emerald-600"
            : "bg-[#0B2D5C] hover:bg-[#123C73]",
          "disabled:opacity-70",
        ].join(" ")}
      >
        {loading ? (
          <>
            <Loader2
              size={18}
              className="animate-spin"
            />

            Sending...
          </>
        ) : sent ? (
          <>
            <CheckCircle2
              size={18}
            />

            Interest Sent
          </>
        ) : (
          <>
            <Heart
              size={18}
            />

            Express Interest
          </>
        )}
      </button>

      {/* Normal non-membership error */}

      {error &&
        !interestLimitReached && (
          <p className="mt-2 text-center text-xs font-semibold text-red-600">
            {error}
          </p>
        )}

      {/* =====================================================
          SUCCESS MODAL
          ===================================================== */}

      {successModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-sm overflow-hidden rounded-[26px] bg-white shadow-[0_28px_90px_rgba(2,6,23,0.35)]">

            <button
              type="button"
              onClick={() => {
                setSuccessModalOpen(
                  false
                );
              }}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <div className="px-6 py-7 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2
                  size={28}
                />
              </div>

              <h2 className="mt-4 text-xl font-black text-[#0B2D5C]">
                Interest Sent
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Your interest has been sent successfully to{" "}
                <span className="font-bold text-slate-800">
                  {memberName}
                </span>
                .
              </p>

              <button
                type="button"
                onClick={() => {
                  setSuccessModalOpen(
                    false
                  );
                }}
                className="mt-5 min-h-11 rounded-xl bg-[#0B2D5C] px-6 text-sm font-black text-white transition hover:bg-[#123C73]"
              >
                Done
              </button>

            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          MONTHLY LIMIT UPGRADE MODAL
          ===================================================== */}

      {upgradeModalOpen &&
        interestLimitReached && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="interest-limit-title"
          >
            <div className="relative w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-[0_28px_90px_rgba(2,6,23,0.35)]">

              <div className="relative overflow-hidden bg-gradient-to-br from-[#071B36] via-[#0B2D5C] to-[#174A87] px-6 pb-8 pt-6 text-white">

                <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-blue-400/20 blur-3xl" />

                <button
                  type="button"
                  onClick={() => {
                    setUpgradeModalOpen(
                      false
                    );

                    clearError();
                  }}
                  className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/10 transition hover:bg-white/20"
                  aria-label="Close membership upgrade"
                >
                  <X size={16} />
                </button>

                <div className="relative z-10">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#F2D675]/30 bg-[#D4AF37]/15 text-[#F2D675]">
                    <Heart
                      size={22}
                    />
                  </div>

                  <p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-[#F2D675]">
                    Monthly Interest Limit
                  </p>

                  <h2
                    id="interest-limit-title"
                    className="mt-1 text-2xl font-black tracking-[-0.03em]"
                  >
                    Unlock unlimited interests
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-blue-100">
                    You’ve used your free monthly interest allowance.
                    Upgrade your membership to keep connecting with
                    more compatible matches.
                  </p>

                </div>
              </div>

              <div className="px-6 py-5">

                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5">

                  <div className="flex items-start gap-3">

                    <Crown
                      size={18}
                      className="mt-0.5 shrink-0 text-[#B18416]"
                    />

                    <div>
                      <p className="text-sm font-black text-slate-900">
                        5 free interests each month
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        Eligible paid memberships remove the monthly
                        limit so you can express interest whenever
                        you find a suitable match.
                      </p>
                    </div>

                  </div>
                </div>

                <div className="mt-4 flex items-start gap-2.5 text-xs font-semibold text-slate-600">

                  <Sparkles
                    size={15}
                    className="mt-0.5 shrink-0 text-[#B18416]"
                  />

                  Unlimited interests are included with eligible
                  membership plans.

                </div>

                <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={() => {
                      setUpgradeModalOpen(
                        false
                      );

                      clearError();
                    }}
                    className="min-h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Maybe Later
                  </button>

                  <Link
                    href="/membership"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0B2D5C] to-blue-700 px-5 text-sm font-black text-white transition hover:shadow-lg"
                  >
                    <Crown
                      size={16}
                      className="text-[#F2D675]"
                    />

                    View Membership Plans
                  </Link>

                </div>
              </div>
            </div>
          </div>
        )}
    </>
  );
}
