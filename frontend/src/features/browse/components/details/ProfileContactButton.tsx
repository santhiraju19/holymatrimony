"use client";

import Link from "next/link";

import {
  BadgeCheck,
  Crown,
  Loader2,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import { useState } from "react";

import {
  getApiErrorMessage,
} from "@/lib/api";

import {
  getProfileContact,
  type ProfileContact,
} from "../../api/profileContactApi";

interface ProfileContactButtonProps {
  profileId: string;
}

function isMembershipUpgradeError(
  message: string
): boolean {
  const normalized =
    message
      .trim()
      .toLowerCase();

  return (
    normalized.includes(
      "upgrade your membership"
    ) ||
    normalized.includes(
      "view contact details"
    )
  );
}

export default function ProfileContactButton({
  profileId,
}: ProfileContactButtonProps) {
  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    contact,
    setContact,
  ] =
    useState<ProfileContact | null>(
      null
    );

  const [
    contactModalOpen,
    setContactModalOpen,
  ] = useState(false);

  const [
    upgradeModalOpen,
    setUpgradeModalOpen,
  ] = useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  async function handleViewContact() {
    if (loading) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response =
        await getProfileContact(
          profileId
        );

      setContact(
        response
      );

      setContactModalOpen(
        true
      );

    } catch (
      caughtError: unknown
    ) {
      const message =
        getApiErrorMessage(
          caughtError,
          "Unable to load contact details."
        );

      if (
        isMembershipUpgradeError(
          message
        )
      ) {
        setUpgradeModalOpen(
          true
        );

        return;
      }

      setError(
        message
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          void handleViewContact();
        }}
        disabled={loading}
        className="
          flex
          min-h-11
          w-full
          items-center
          justify-center
          gap-2
          rounded-xl
          border
          border-blue-200
          bg-gradient-to-r
          from-blue-50
          via-white
          to-amber-50
          px-4
          text-sm
          font-black
          text-[#0B2D5C]
          transition
          hover:border-blue-300
          hover:bg-blue-50
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        {loading ? (
          <>
            <Loader2
              size={16}
              className="animate-spin"
            />

            Checking access...
          </>
        ) : (
          <>
            <LockKeyhole
              size={16}
              className="text-[#B18416]"
            />

            View Contact Details
          </>
        )}
      </button>

      {error && (
        <p className="mt-2 text-center text-xs font-semibold text-red-600">
          {error}
        </p>
      )}

      {/* =====================================================
          PAID MEMBER CONTACT MODAL
          ===================================================== */}

      {contactModalOpen &&
        contact && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
          >
            <div className="relative w-full max-w-md overflow-hidden rounded-[26px] bg-white shadow-[0_28px_90px_rgba(2,6,23,0.35)]">

              <div className="bg-gradient-to-br from-[#071B36] via-[#0B2D5C] to-[#174A87] px-6 py-5 text-white">

                <button
                  type="button"
                  onClick={() => {
                    setContactModalOpen(
                      false
                    );
                  }}
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/10"
                  aria-label="Close contact details"
                >
                  <X size={16} />
                </button>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[#F2D675]">
                  <Phone
                    size={20}
                  />
                </div>

                <p className="mt-3 text-[10px] font-black uppercase tracking-[0.17em] text-[#F2D675]">
                  Premium Contact Access
                </p>

                <h2 className="mt-1 text-xl font-black">
                  Contact Details
                </h2>

                <p className="mt-1 text-sm text-blue-100">
                  {contact.fullName}
                </p>
              </div>

              <div className="space-y-3 p-6">

                <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">

                  <Mail
                    size={17}
                    className="text-blue-700"
                  />

                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase text-slate-400">
                      Email
                    </p>

                    <p className="break-all text-sm font-bold text-slate-800">
                      {contact.email ||
                        "Not provided"}
                    </p>
                  </div>

                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">

                  <Phone
                    size={17}
                    className="text-emerald-700"
                  />

                  <div className="min-w-0 flex-1">

                    <div className="flex items-center gap-2">

                      <p className="text-[10px] font-black uppercase text-slate-400">
                        Mobile
                      </p>

                      {contact.mobileVerified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-black text-emerald-700">
                          <BadgeCheck
                            size={10}
                          />

                          Verified
                        </span>
                      )}

                    </div>

                    <p className="text-sm font-bold text-slate-800">
                      {contact.mobile ||
                        "Not provided"}
                    </p>
                  </div>

                </div>

                <div className="flex items-start gap-2 rounded-xl bg-blue-50 px-3 py-2.5 text-[10px] leading-4 text-blue-800">
                  <ShieldCheck
                    size={13}
                    className="mt-0.5 shrink-0"
                  />

                  Please use member contact information respectfully and only for genuine matrimonial communication.
                </div>

              </div>
            </div>
          </div>
        )}

      {/* =====================================================
          FREE MEMBER UPGRADE MODAL
          ===================================================== */}

      {upgradeModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-[0_28px_90px_rgba(2,6,23,0.35)]">

            <div className="relative overflow-hidden bg-gradient-to-br from-[#071B36] via-[#0B2D5C] to-[#174A87] px-6 pb-8 pt-6 text-white">

              <button
                type="button"
                onClick={() => {
                  setUpgradeModalOpen(
                    false
                  );
                }}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/10"
                aria-label="Close membership upgrade"
              >
                <X size={16} />
              </button>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#F2D675]/30 bg-[#D4AF37]/15 text-[#F2D675]">
                <Crown
                  size={23}
                />
              </div>

              <p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-[#F2D675]">
                Premium Contact Access
              </p>

              <h2 className="mt-1 text-2xl font-black">
                Unlock contact details
              </h2>

              <p className="mt-2 text-sm leading-6 text-blue-100">
                Upgrade your membership to securely view member contact information.
              </p>

            </div>

            <div className="px-6 py-5">

              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">

                <div className="flex items-start gap-3">

                  <Phone
                    size={17}
                    className="mt-0.5 text-[#B18416]"
                  />

                  <div>
                    <p className="text-sm font-black text-slate-900">
                      Connect when you are ready
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      Contact viewing is available from Silver membership and above.
                    </p>
                  </div>

                </div>
              </div>

              <div className="mt-5 flex items-center gap-2.5 text-xs font-semibold text-slate-600">
                <Sparkles
                  size={15}
                  className="text-[#B18416]"
                />

                Silver, Gold and Platinum members can access contact details.
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() => {
                    setUpgradeModalOpen(
                      false
                    );
                  }}
                  className="min-h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-700"
                >
                  Maybe Later
                </button>

                <Link
                  href="/membership"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0B2D5C] to-blue-700 px-5 text-sm font-black text-white"
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
