"use client";

import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  ShieldCheck,
  Video,
  VideoOff,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useSecureConnect,
} from "../context/SecureConnectContext";

import SecureConnectAudioTrack from "../media/SecureConnectAudioTrack";
import SecureConnectVideoTrack from "../media/SecureConnectVideoTrack";
import useSecureConnectMedia from "../media/useSecureConnectMedia";

function formatDuration(
  totalSeconds: number
): string {
  const minutes =
    Math.floor(totalSeconds / 60);

  const seconds =
    totalSeconds % 60;

  return `${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

function mediaStatusLabel(
  status:
    | "idle"
    | "connecting"
    | "connected"
    | "disconnected"
    | "error"
): string {
  switch (status) {
    case "connecting":
      return "Connecting securely…";

    case "connected":
      return "Secure connection established";

    case "disconnected":
      return "Media disconnected";

    case "error":
      return "Media connection failed";

    default:
      return "Preparing secure connection…";
  }
}

export default function SecureConnectOverlay() {
  const {
    activeCall,
    socketStatus,
    busy,
    error,
    acceptCall,
    declineCall,
    cancelCall,
    endCall,
    clearCall,
  } =
    useSecureConnect();

  const media =
    useSecureConnectMedia(
      activeCall
    );

  const [
    elapsedSeconds,
    setElapsedSeconds,
  ] =
    useState(0);

  useEffect(() => {
    if (
      activeCall?.call.status !==
      "ACCEPTED"
    ) {
      setElapsedSeconds(0);
      return;
    }

    const answeredAt =
      activeCall.call.answeredAt
        ? new Date(
            activeCall.call.answeredAt
          ).getTime()
        : Date.now();

    const update = () => {
      const elapsed =
        Math.max(
          0,
          Math.floor(
            (
              Date.now() -
              answeredAt
            ) / 1000
          )
        );

      setElapsedSeconds(elapsed);
    };

    update();

    const timer =
      window.setInterval(
        update,
        1000
      );

    return () => {
      window.clearInterval(timer);
    };
  }, [
    activeCall?.call.callId,
    activeCall?.call.status,
    activeCall?.call.answeredAt,
  ]);

  if (!activeCall) {
    return null;
  }

  const {
    call,
    direction,
    otherMember,
  } =
    activeCall;

  const isVideo =
    call.mediaType === "VIDEO";

  const isIncoming =
    direction === "incoming";

  const isRinging =
    call.status === "RINGING";

  const isAccepted =
    call.status === "ACCEPTED";

  const isTerminal =
    [
      "DECLINED",
      "MISSED",
      "CANCELLED",
      "ENDED",
      "FAILED",
    ].includes(
      call.status
    );

  const memberName =
    otherMember?.displayName ||
    "Holy Matrimony Member";

  const terminalMessage =
    call.status === "DECLINED"
      ? "Call declined"
      : call.status === "MISSED"
        ? "Missed call"
        : call.status ===
            "CANCELLED"
          ? "Call cancelled"
          : call.status ===
              "FAILED"
            ? "Call failed"
            : "Call ended";

  return (
    <div
      className="
        fixed inset-0 z-[100]
        flex items-center justify-center
        bg-slate-950/70
        px-4 py-6
        backdrop-blur-md
      "
    >
      <div
        className={`
          relative overflow-hidden
          border border-white/10
          bg-slate-950
          text-white
          shadow-2xl
          ${
            isVideo &&
            isAccepted
              ? "h-[min(760px,92vh)] w-full max-w-5xl rounded-3xl"
              : "w-full max-w-md rounded-3xl"
          }
        `}
      >
        {isVideo &&
        isAccepted ? (
          <div className="relative h-full min-h-[560px]">
            <div className="absolute inset-0 bg-slate-900">
              {media.remoteVideoTrack ? (
                <SecureConnectVideoTrack
                  track={
                    media.remoteVideoTrack
                  }
                  className="
                    h-full w-full
                    object-cover
                  "
                />
              ) : (
                <div
                  className="
                    flex h-full
                    items-center
                    justify-center
                    bg-gradient-to-br
                    from-slate-900
                    via-slate-950
                    to-black
                  "
                >
                  <div className="text-center">
                    <div
                      className="
                        mx-auto mb-5
                        flex h-24 w-24
                        items-center
                        justify-center
                        rounded-full
                        bg-white/10
                        text-4xl
                        font-semibold
                      "
                    >
                      {memberName
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <p className="text-xl font-semibold">
                      {memberName}
                    </p>

                    <p className="mt-2 text-sm text-slate-400">
                      {media.status ===
                      "connected"
                        ? "Waiting for their camera…"
                        : mediaStatusLabel(
                            media.status
                          )}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div
              className="
                absolute left-0 right-0
                top-0
                flex items-start
                justify-between
                bg-gradient-to-b
                from-black/70
                to-transparent
                p-6
              "
            >
              <div>
                <div
                  className="
                    flex items-center
                    gap-2 text-sm
                    text-emerald-300
                  "
                >
                  <ShieldCheck
                    size={17}
                  />
                  Secure Video
                </div>

                <h2
                  className="
                    mt-1 text-xl
                    font-semibold
                  "
                >
                  {memberName}
                </h2>

                <p
                  className="
                    mt-1 text-sm
                    text-slate-300
                  "
                >
                  {formatDuration(
                    elapsedSeconds
                  )}
                </p>
              </div>

              <div
                className="
                  rounded-full
                  bg-black/40
                  px-3 py-1.5
                  text-xs
                  text-slate-200
                  backdrop-blur
                "
              >
                {mediaStatusLabel(
                  media.status
                )}
              </div>
            </div>

            <div
              className="
                absolute right-5
                top-24
                h-44 w-32
                overflow-hidden
                rounded-2xl
                border border-white/20
                bg-slate-800
                shadow-xl
                sm:h-52 sm:w-40
              "
            >
              {media.localVideoTrack &&
              media.cameraEnabled ? (
                <SecureConnectVideoTrack
                  track={
                    media.localVideoTrack
                  }
                  muted
                  className="
                    h-full w-full
                    object-cover
                  "
                />
              ) : (
                <div
                  className="
                    flex h-full
                    items-center
                    justify-center
                    text-slate-400
                  "
                >
                  <VideoOff
                    size={28}
                  />
                </div>
              )}

              <div
                className="
                  absolute bottom-2
                  left-2
                  rounded-full
                  bg-black/50
                  px-2 py-1
                  text-[11px]
                "
              >
                You
              </div>
            </div>

            <div
              className="
                absolute bottom-0
                left-0 right-0
                flex flex-col
                items-center
                bg-gradient-to-t
                from-black/80
                via-black/50
                to-transparent
                px-5 pb-7 pt-20
              "
            >
              {media.error && (
                <div
                  className="
                    mb-4 max-w-lg
                    rounded-xl
                    border
                    border-red-400/30
                    bg-red-500/15
                    px-4 py-2
                    text-center
                    text-sm
                    text-red-100
                  "
                >
                  {media.error}
                </div>
              )}

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    void media
                      .toggleMicrophone()
                  }
                  disabled={
                    media.status !==
                    "connected"
                  }
                  aria-label={
                    media.microphoneEnabled
                      ? "Mute microphone"
                      : "Unmute microphone"
                  }
                  className="
                    flex h-14 w-14
                    items-center
                    justify-center
                    rounded-full
                    bg-white/15
                    transition
                    hover:bg-white/25
                    disabled:opacity-40
                  "
                >
                  {media.microphoneEnabled ? (
                    <Mic size={23} />
                  ) : (
                    <MicOff
                      size={23}
                    />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void endCall()
                  }
                  disabled={busy}
                  aria-label="End call"
                  className="
                    flex h-16 w-16
                    items-center
                    justify-center
                    rounded-full
                    bg-red-600
                    shadow-lg
                    transition
                    hover:bg-red-500
                    disabled:opacity-50
                  "
                >
                  <PhoneOff
                    size={27}
                  />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void media
                      .toggleCamera()
                  }
                  disabled={
                    media.status !==
                    "connected" ||
                    !media.localVideoTrack
                  }
                  aria-label={
                    media.cameraEnabled
                      ? "Turn camera off"
                      : "Turn camera on"
                  }
                  className="
                    flex h-14 w-14
                    items-center
                    justify-center
                    rounded-full
                    bg-white/15
                    transition
                    hover:bg-white/25
                    disabled:opacity-40
                  "
                >
                  {media.cameraEnabled ? (
                    <Video
                      size={23}
                    />
                  ) : (
                    <VideoOff
                      size={23}
                    />
                  )}
                </button>
              </div>

              <p
                className="
                  mt-4 text-xs
                  text-slate-400
                "
              >
                Your phone number and email
                remain private.
              </p>
            </div>

            <SecureConnectAudioTrack
              track={
                media.remoteAudioTrack
              }
            />
          </div>
        ) : (
          <div className="p-7">
            <div
              className="
                flex items-start
                justify-between gap-4
              "
            >
              <div>
                <div
                  className="
                    flex items-center
                    gap-2 text-sm
                    font-medium
                    text-emerald-400
                  "
                >
                  <ShieldCheck
                    size={17}
                  />
                  Secure Connect
                </div>

                <h2
                  className="
                    mt-3 text-2xl
                    font-semibold
                  "
                >
                  {memberName}
                </h2>

                <p
                  className="
                    mt-1 text-sm
                    text-slate-400
                  "
                >
                  {isVideo
                    ? "Private video call"
                    : "Private audio call"}
                </p>
              </div>

              {isTerminal && (
                <button
                  type="button"
                  onClick={clearCall}
                  aria-label="Close"
                  className="
                    rounded-full
                    p-2
                    text-slate-400
                    transition
                    hover:bg-white/10
                    hover:text-white
                  "
                >
                  <X size={20} />
                </button>
              )}
            </div>

            <div
              className="
                my-8 flex
                justify-center
              "
            >
              <div
                className="
                  flex h-28 w-28
                  items-center
                  justify-center
                  rounded-full
                  bg-gradient-to-br
                  from-blue-500/30
                  to-indigo-500/20
                  text-4xl
                  font-semibold
                  ring-1
                  ring-white/10
                "
              >
                {memberName
                  .charAt(0)
                  .toUpperCase()}
              </div>
            </div>

            {isRinging && (
              <>
                <div className="text-center">
                  <p
                    className="
                      text-lg font-medium
                    "
                  >
                    {isIncoming
                      ? `Incoming ${
                          isVideo
                            ? "video"
                            : "audio"
                        } call`
                      : `Calling ${memberName}…`}
                  </p>

                  <p
                    className="
                      mt-2 text-sm
                      text-slate-400
                    "
                  >
                    {isIncoming
                      ? "Accept to start a private Secure Connect call."
                      : "Waiting for the member to answer."}
                  </p>
                </div>

                <div
                  className="
                    mt-7 flex
                    justify-center gap-5
                  "
                >
                  {isIncoming ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          void declineCall()
                        }
                        disabled={busy}
                        className="
                          flex h-14 w-14
                          items-center
                          justify-center
                          rounded-full
                          bg-red-600
                          transition
                          hover:bg-red-500
                          disabled:opacity-50
                        "
                        aria-label="Decline call"
                      >
                        <PhoneOff
                          size={24}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void acceptCall()
                        }
                        disabled={busy}
                        className="
                          flex h-14 w-14
                          items-center
                          justify-center
                          rounded-full
                          bg-emerald-600
                          transition
                          hover:bg-emerald-500
                          disabled:opacity-50
                        "
                        aria-label="Accept call"
                      >
                        {isVideo ? (
                          <Video
                            size={24}
                          />
                        ) : (
                          <Phone
                            size={24}
                          />
                        )}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        void cancelCall()
                      }
                      disabled={busy}
                      className="
                        flex h-14 w-14
                        items-center
                        justify-center
                        rounded-full
                        bg-red-600
                        transition
                        hover:bg-red-500
                        disabled:opacity-50
                      "
                      aria-label="Cancel call"
                    >
                      <PhoneOff
                        size={24}
                      />
                    </button>
                  )}
                </div>
              </>
            )}

            {isAccepted && (
              <>
                <div className="text-center">
                  <p
                    className="
                      text-2xl font-semibold
                    "
                  >
                    {formatDuration(
                      elapsedSeconds
                    )}
                  </p>

                  <p
                    className="
                      mt-2 text-sm
                      text-slate-400
                    "
                  >
                    {mediaStatusLabel(
                      media.status
                    )}
                  </p>

                  {media.error && (
                    <p
                      className="
                        mt-3 rounded-xl
                        border
                        border-red-400/20
                        bg-red-500/10
                        p-3
                        text-sm
                        text-red-200
                      "
                    >
                      {media.error}
                    </p>
                  )}
                </div>

                <div
                  className="
                    mt-7 flex
                    justify-center gap-4
                  "
                >
                  <button
                    type="button"
                    onClick={() =>
                      void media
                        .toggleMicrophone()
                    }
                    disabled={
                      media.status !==
                      "connected"
                    }
                    className="
                      flex h-14 w-14
                      items-center
                      justify-center
                      rounded-full
                      bg-white/10
                      transition
                      hover:bg-white/20
                      disabled:opacity-40
                    "
                    aria-label={
                      media.microphoneEnabled
                        ? "Mute microphone"
                        : "Unmute microphone"
                    }
                  >
                    {media.microphoneEnabled ? (
                      <Mic size={23} />
                    ) : (
                      <MicOff
                        size={23}
                      />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      void endCall()
                    }
                    disabled={busy}
                    className="
                      flex h-16 w-16
                      items-center
                      justify-center
                      rounded-full
                      bg-red-600
                      transition
                      hover:bg-red-500
                      disabled:opacity-50
                    "
                    aria-label="End call"
                  >
                    <PhoneOff
                      size={26}
                    />
                  </button>
                </div>

                <SecureConnectAudioTrack
                  track={
                    media.remoteAudioTrack
                  }
                />
              </>
            )}

            {isTerminal && (
              <div className="text-center">
                <p
                  className="
                    text-xl font-semibold
                  "
                >
                  {terminalMessage}
                </p>

                {call.durationSeconds != null &&
                  call.durationSeconds >
                    0 && (
                    <p
                      className="
                        mt-2 text-sm
                        text-slate-400
                      "
                    >
                      Duration{" "}
                      {formatDuration(
                        call.durationSeconds
                      )}
                    </p>
                  )}

                <button
                  type="button"
                  onClick={clearCall}
                  className="
                    mt-6 rounded-xl
                    bg-white
                    px-6 py-3
                    font-semibold
                    text-slate-900
                    transition
                    hover:bg-slate-100
                  "
                >
                  Close
                </button>
              </div>
            )}

            {(error ||
              socketStatus !==
                "connected") && (
              <div
                className="
                  mt-6 rounded-xl
                  border
                  border-amber-400/20
                  bg-amber-400/10
                  p-3
                  text-sm
                  text-amber-100
                "
              >
                {error ??
                  "Secure signaling is reconnecting…"}
              </div>
            )}

            <div
              className="
                mt-7 border-t
                border-white/10
                pt-4 text-center
                text-xs
                leading-5
                text-slate-500
              "
            >
              Secure Connect keeps your phone
              number, email and personal contact
              details private.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
