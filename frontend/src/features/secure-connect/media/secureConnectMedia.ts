import {
  DisconnectReason,
  LocalAudioTrack,
  LocalVideoTrack,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
  RoomEvent,
  Track,
  createLocalAudioTrack,
  createLocalVideoTrack,
} from "livekit-client";

import {
  CallMediaType,
  SecureConnectMediaCredentials,
} from "../types";

export type SecureConnectMediaStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export interface SecureConnectMediaCallbacks {
  onStatusChange?: (
    status: SecureConnectMediaStatus
  ) => void;

  onRemoteAudioTrack?: (
    track: RemoteTrack | null
  ) => void;

  onRemoteVideoTrack?: (
    track: RemoteTrack | null
  ) => void;

  onError?: (
    message: string
  ) => void;
}

export interface SecureConnectMediaSession {
  room: Room;
  mediaType: CallMediaType;

  microphoneTrack:
    LocalAudioTrack | null;

  cameraTrack:
    LocalVideoTrack | null;

  setMicrophoneEnabled: (
    enabled: boolean
  ) => Promise<void>;

  setCameraEnabled: (
    enabled: boolean
  ) => Promise<void>;

  disconnect: () => Promise<void>;
}

function userMediaErrorMessage(
  error: unknown,
  mediaType: CallMediaType
): string {
  if (
    error instanceof DOMException &&
    error.name === "NotAllowedError"
  ) {
    return mediaType === "VIDEO"
      ? "Microphone or camera permission was denied. Allow access in your browser and try again."
      : "Microphone permission was denied. Allow microphone access in your browser and try again.";
  }

  if (
    error instanceof DOMException &&
    error.name === "NotFoundError"
  ) {
    return mediaType === "VIDEO"
      ? "A microphone or camera could not be found on this device."
      : "A microphone could not be found on this device.";
  }

  if (
    error instanceof Error &&
    error.message
  ) {
    return error.message;
  }

  return "Unable to start the secure media connection.";
}

function findRemoteTrack(
  participant: RemoteParticipant,
  source: Track.Source
): RemoteTrack | null {
  for (
    const publication of
      participant.trackPublications.values()
  ) {
    if (
      publication.source === source &&
      publication.track
    ) {
      return publication.track;
    }
  }

  return null;
}

export async function createSecureConnectMediaSession(
  credentials: SecureConnectMediaCredentials,
  callbacks: SecureConnectMediaCallbacks = {}
): Promise<SecureConnectMediaSession> {
  const {
    onStatusChange,
    onRemoteAudioTrack,
    onRemoteVideoTrack,
    onError,
  } = callbacks;

  const room =
    new Room({
      adaptiveStream: true,
      dynacast: true,
    });

  let microphoneTrack:
    LocalAudioTrack | null = null;

  let cameraTrack:
    LocalVideoTrack | null = null;

  function refreshRemoteTracks(
    participant?: RemoteParticipant
  ) {
    const remote =
      participant ??
      Array.from(
        room.remoteParticipants.values()
      )[0];

    if (!remote) {
      onRemoteAudioTrack?.(null);
      onRemoteVideoTrack?.(null);
      return;
    }

    onRemoteAudioTrack?.(
      findRemoteTrack(
        remote,
        Track.Source.Microphone
      )
    );

    onRemoteVideoTrack?.(
      findRemoteTrack(
        remote,
        Track.Source.Camera
      )
    );
  }

  const handleTrackSubscribed = (
    _track: RemoteTrack,
    _publication: RemoteTrackPublication,
    participant: RemoteParticipant
  ) => {
    refreshRemoteTracks(participant);
  };

  const handleTrackUnsubscribed = (
    _track: RemoteTrack,
    _publication: RemoteTrackPublication,
    participant: RemoteParticipant
  ) => {
    refreshRemoteTracks(participant);
  };

  const handleParticipantConnected = (
    participant: RemoteParticipant
  ) => {
    refreshRemoteTracks(participant);
  };

  const handleParticipantDisconnected = () => {
    refreshRemoteTracks();
  };

  const handleDisconnected = (
    reason?: DisconnectReason
  ) => {
    microphoneTrack?.stop();
    cameraTrack?.stop();

    onRemoteAudioTrack?.(null);
    onRemoteVideoTrack?.(null);

    if (reason === DisconnectReason.ROOM_DELETED) {
      onError?.(
        "This call has been ended by the server."
      );
    }

    onStatusChange?.("disconnected");
  };

  room.on(
    RoomEvent.TrackSubscribed,
    handleTrackSubscribed
  );

  room.on(
    RoomEvent.TrackUnsubscribed,
    handleTrackUnsubscribed
  );

  room.on(
    RoomEvent.ParticipantConnected,
    handleParticipantConnected
  );

  room.on(
    RoomEvent.ParticipantDisconnected,
    handleParticipantDisconnected
  );

  room.on(
    RoomEvent.Disconnected,
    handleDisconnected
  );

  onStatusChange?.("connecting");

  try {
    await room.connect(
      credentials.serverUrl,
      credentials.participantToken,
      {
        autoSubscribe: true,
      }
    );

    /*
     * Create local tracks only after the
     * authenticated LiveKit connection succeeds.
     */
    microphoneTrack =
      await createLocalAudioTrack({
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      });

    await room.localParticipant.publishTrack(
      microphoneTrack,
      {
        source: Track.Source.Microphone,
      }
    );

    if (
      credentials.mediaType === "VIDEO"
    ) {
      cameraTrack =
        await createLocalVideoTrack();

      await room.localParticipant.publishTrack(
        cameraTrack,
        {
          source: Track.Source.Camera,
        }
      );
    }

    refreshRemoteTracks();

    onStatusChange?.("connected");
  } catch (error) {
    const message =
      userMediaErrorMessage(
        error,
        credentials.mediaType
      );

    onStatusChange?.("error");
    onError?.(message);

    microphoneTrack?.stop();
    cameraTrack?.stop();

    await room.disconnect();

    throw error;
  }

  return {
    room,
    mediaType:
      credentials.mediaType,

    microphoneTrack,
    cameraTrack,

    async setMicrophoneEnabled(
      enabled: boolean
    ): Promise<void> {
      if (!microphoneTrack) {
        return;
      }

      if (enabled) {
        await microphoneTrack.unmute();
      } else {
        await microphoneTrack.mute();
      }
    },

    async setCameraEnabled(
      enabled: boolean
    ): Promise<void> {
      if (!cameraTrack) {
        return;
      }

      if (enabled) {
        await cameraTrack.unmute();
      } else {
        await cameraTrack.mute();
      }
    },

    async disconnect():
      Promise<void> {
      try {
        if (microphoneTrack) {
          await room.localParticipant
            .unpublishTrack(
              microphoneTrack
            );

          microphoneTrack.stop();
        }

        if (cameraTrack) {
          await room.localParticipant
            .unpublishTrack(
              cameraTrack
            );

          cameraTrack.stop();
        }
      } finally {
        await room.disconnect();

        onRemoteAudioTrack?.(null);
        onRemoteVideoTrack?.(null);

        onStatusChange?.(
          "disconnected"
        );
      }
    },
  };
}
