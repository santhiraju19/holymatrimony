"use client";

import {
  Phone,
  Video,
} from "lucide-react";

import { useSecureConnect } from "@/features/secure-connect/context/SecureConnectContext";

interface SecureConnectChatActionsProps {
  userId: string;
  memberName: string;
  compact?: boolean;
  showLabels?: boolean;
  disabled?: boolean;
}

export default function SecureConnectChatActions({
  userId,
  memberName,
  compact = false,
  showLabels = false,
  disabled = false,
}: SecureConnectChatActionsProps) {
  const {
    activeCall,
    busy,
    initiateCall,
  } = useSecureConnect();

  const unavailable =
    disabled ||
    busy ||
    Boolean(activeCall) ||
    !userId?.trim();

  async function startAudioCall() {
    if (unavailable) {
      return;
    }

    await initiateCall(
      userId,
      "AUDIO",
      {
        userId,
        memberId: null,
        displayName:
          memberName?.trim() ||
          "Holy Matrimony Member",
      }
    );
  }

  async function startVideoCall() {
    if (unavailable) {
      return;
    }

    await initiateCall(
      userId,
      "VIDEO",
      {
        userId,
        memberId: null,
        displayName:
          memberName?.trim() ||
          "Holy Matrimony Member",
      }
    );
  }

  const buttonClass = [
    "inline-flex shrink-0 items-center justify-center",
    "border border-slate-200 bg-white text-slate-600",
    "shadow-sm transition-all",
    "hover:border-blue-200 hover:bg-blue-50 hover:text-[#0B2D5C]",
    "disabled:cursor-not-allowed disabled:opacity-40",
    compact
      ? "h-8 min-w-8 rounded-lg px-2"
      : "h-9 min-w-9 rounded-xl px-3",
  ].join(" ");

  return (
    <div
      className="flex items-center gap-1.5"
      aria-label={`Secure Connect with ${memberName}`}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          void startAudioCall();
        }}
        disabled={unavailable}
        aria-label={`Secure audio call with ${memberName}`}
        title="Secure Audio"
        className={buttonClass}
      >
        <Phone
          size={compact ? 14 : 15}
          strokeWidth={2.2}
        />

        {showLabels && (
          <span className="ml-1.5 text-[11px] font-bold">
            Audio
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          void startVideoCall();
        }}
        disabled={unavailable}
        aria-label={`Secure video call with ${memberName}`}
        title="Secure Video"
        className={buttonClass}
      >
        <Video
          size={compact ? 14 : 15}
          strokeWidth={2.2}
        />

        {showLabels && (
          <span className="ml-1.5 text-[11px] font-bold">
            Video
          </span>
        )}
      </button>
    </div>
  );
}
