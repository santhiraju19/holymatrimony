export type SecureConnectCallTone =
  | "incoming"
  | "outgoing";

interface ToneStep {
  frequency: number;
  durationMs: number;
  delayMs: number;
}

const INCOMING_PATTERN: ToneStep[] = [
  {
    frequency: 880,
    durationMs: 450,
    delayMs: 180,
  },
  {
    frequency: 880,
    durationMs: 450,
    delayMs: 1700,
  },
];

const OUTGOING_PATTERN: ToneStep[] = [
  {
    frequency: 440,
    durationMs: 900,
    delayMs: 2100,
  },
];

class SecureConnectCallTonePlayer {
  private audioContext:
    AudioContext | null = null;

  private timeoutIds:
    number[] = [];

  private oscillators:
    OscillatorNode[] = [];

  private generation = 0;

  async start(
    type: SecureConnectCallTone
  ): Promise<void> {
    this.stop();

    if (
      typeof window === "undefined" ||
      typeof window.AudioContext ===
        "undefined"
    ) {
      return;
    }

    const generation =
      ++this.generation;

    try {
      const context =
        new window.AudioContext();

      this.audioContext = context;

      if (
        context.state === "suspended"
      ) {
        await context.resume();
      }

      if (
        generation !== this.generation
      ) {
        await context.close();
        return;
      }

      const pattern =
        type === "incoming"
          ? INCOMING_PATTERN
          : OUTGOING_PATTERN;

      this.schedulePattern(
        context,
        pattern,
        generation
      );
    } catch {
      /*
       * Browsers can block programmatic audio until
       * the page has received a user interaction.
       * Call functionality must continue even when
       * the optional ringing sound cannot start.
       */
      this.stop();
    }
  }

  stop(): void {
    ++this.generation;

    for (
      const timeoutId of this.timeoutIds
    ) {
      window.clearTimeout(
        timeoutId
      );
    }

    this.timeoutIds = [];

    for (
      const oscillator of this.oscillators
    ) {
      try {
        oscillator.stop();
      } catch {
        // Already stopped.
      }

      try {
        oscillator.disconnect();
      } catch {
        // Already disconnected.
      }
    }

    this.oscillators = [];

    const context =
      this.audioContext;

    this.audioContext = null;

    if (
      context &&
      context.state !== "closed"
    ) {
      void context.close();
    }
  }

  private schedulePattern(
    context: AudioContext,
    pattern: ToneStep[],
    generation: number
  ): void {
    let offsetMs = 0;

    for (const step of pattern) {
      this.scheduleTone(
        context,
        step.frequency,
        step.durationMs,
        offsetMs,
        generation
      );

      offsetMs +=
        step.durationMs +
        step.delayMs;
    }

    const repeatAfterMs =
      Math.max(offsetMs, 1000);

    const repeatId =
      window.setTimeout(() => {
        if (
          generation !==
            this.generation ||
          context.state === "closed"
        ) {
          return;
        }

        this.schedulePattern(
          context,
          pattern,
          generation
        );
      }, repeatAfterMs);

    this.timeoutIds.push(
      repeatId
    );
  }

  private scheduleTone(
    context: AudioContext,
    frequency: number,
    durationMs: number,
    delayMs: number,
    generation: number
  ): void {
    const timeoutId =
      window.setTimeout(() => {
        if (
          generation !==
            this.generation ||
          context.state === "closed"
        ) {
          return;
        }

        const oscillator =
          context.createOscillator();

        const gain =
          context.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value =
          frequency;

        gain.gain.value = 0.07;

        oscillator.connect(gain);
        gain.connect(
          context.destination
        );

        this.oscillators.push(
          oscillator
        );

        const now =
          context.currentTime;

        gain.gain.setValueAtTime(
          0.0001,
          now
        );

        gain.gain.exponentialRampToValueAtTime(
          0.07,
          now + 0.02
        );

        gain.gain.setValueAtTime(
          0.07,
          now +
            Math.max(
              durationMs / 1000 -
                0.04,
              0.03
            )
        );

        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          now +
            durationMs / 1000
        );

        oscillator.start(now);

        oscillator.stop(
          now +
            durationMs / 1000 +
            0.02
        );

        oscillator.onended = () => {
          try {
            oscillator.disconnect();
            gain.disconnect();
          } catch {
            // Already disconnected.
          }

          this.oscillators =
            this.oscillators.filter(
              (item) =>
                item !== oscillator
            );
        };
      }, delayMs);

    this.timeoutIds.push(
      timeoutId
    );
  }
}

export const secureConnectCallTone =
  new SecureConnectCallTonePlayer();
