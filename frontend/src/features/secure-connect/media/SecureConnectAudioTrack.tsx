"use client";

import {
  RemoteTrack,
} from "livekit-client";

import {
  useEffect,
  useRef,
} from "react";

interface Props {
  track:
    RemoteTrack | null;
}

export default function SecureConnectAudioTrack({
  track,
}: Props) {
  const ref =
    useRef<HTMLAudioElement | null>(
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

    void element
      .play()
      .catch(() => {
        /*
         * Browser autoplay restrictions may
         * require the user's accept gesture.
         */
      });

    return () => {
      track.detach(element);
    };
  }, [track]);

  return (
    <audio
      ref={ref}
      autoPlay
      playsInline
      className="hidden"
    />
  );
}
