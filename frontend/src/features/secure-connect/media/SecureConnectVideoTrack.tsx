"use client";

import {
  LocalVideoTrack,
  RemoteTrack,
} from "livekit-client";

import {
  useEffect,
  useRef,
} from "react";

interface Props {
  track:
    | LocalVideoTrack
    | RemoteTrack
    | null;

  muted?: boolean;

  className?: string;
}

export default function SecureConnectVideoTrack({
  track,
  muted = false,
  className = "",
}: Props) {
  const ref =
    useRef<HTMLVideoElement | null>(
      null
    );

  useEffect(() => {
    const element =
      ref.current;

    if (
      !track ||
      !element
    ) {
      return;
    }

    track.attach(element);

    return () => {
      track.detach(element);
    };
  }, [track]);

  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted={muted}
      className={className}
    />
  );
}
