"use client";

import {
  Phone,
  ShieldCheck,
  Video,
} from "lucide-react";

import {
  useSecureConnect,
} from "../context/SecureConnectContext";

interface SecureConnectCallButtonsProps {
  userId: string;
  memberName: string;
}

export default function SecureConnectCallButtons({
  userId,
  memberName,
}: SecureConnectCallButtonsProps) {
  const {
    activeCall,
    busy,
    error,
    initiateCall,
    clearError,
  } = useSecureConnect();

  const callInProgress =
    activeCall !== null;

  const disabled =
    busy ||
    callInProgress ||
    !userId.trim();

  async function startCall(
    mediaType: "AUDIO" | "VIDEO"
  ): Promise<void> {
    if (disabled) {
      return;
    }

    clearError();

    try {
      await initiateCall(
        userId,
        mediaType
      );
    } catch {
      /*
       * SecureConnectContext owns the
       * user-safe API error message.
       */
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 shadow-sm">
      <div className="border-b border-blue-100 px-4 py-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0B2D5C] text-white shadow-sm">
            <ShieldCheck
              size={20}
              aria-hidden="true"
            />
          </span>

          <div>
            <h3 className="font-black text-[#0B2D5C]">
              Secure Connect
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Call {memberName} privately without
              revealing your phone number.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            void startCall(
              "AUDIO"
            );
          }}
          className="
            flex
            min-h-12
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-[#0B2D5C]
            px-4
            py-3
            text-sm
            font-bold
            text-white
            transition
            hover:bg-[#123C73]
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <Phone
            size={18}
            aria-hidden="true"
          />

          {busy
            ? "Connecting..."
            : "Secure Audio"}
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            void startCall(
              "VIDEO"
            );
          }}
          className="
            flex
            min-h-12
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-blue-200
            bg-white
            px-4
            py-3
            text-sm
            font-bold
            text-[#0B2D5C]
            transition
            hover:border-blue-300
            hover:bg-blue-50
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <Video
            size={18}
            aria-hidden="true"
          />

          {busy
            ? "Connecting..."
            : "Secure Video"}
        </button>
      </div>

      {error && !activeCall && (
        <div
          role="alert"
          className="mx-4 mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
        >
          {error}
        </div>
      )}

      <div className="border-t border-blue-100 bg-white/60 px-4 py-3">
        <p className="text-center text-[11px] leading-5 text-slate-400">
          Membership, privacy and call access are
          securely verified before connecting.
        </p>
      </div>
    </div>
  );
}
