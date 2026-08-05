"use client";

import {
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  hasError?: boolean;
}

const OTP_LENGTH = 6;

export default function OtpInput({
  value,
  onChange,
  disabled = false,
  hasError = false,
}: OtpInputProps) {
  const inputRefs =
    useRef<Array<HTMLInputElement | null>>(
      []
    );

  const digits =
    Array.from(
      { length: OTP_LENGTH },
      (_, index) =>
        value[index] ?? ""
    );

  function focusInput(
    index: number
  ): void {
    inputRefs.current[index]?.focus();
    inputRefs.current[index]?.select();
  }

  function updateDigit(
    index: number,
    rawValue: string
  ): void {
    const digit =
      rawValue
        .replace(/\D/g, "")
        .slice(-1);

    const nextDigits = [
      ...digits,
    ];

    nextDigits[index] =
      digit;

    onChange(
      nextDigits.join("")
    );

    if (
      digit &&
      index < OTP_LENGTH - 1
    ) {
      focusInput(index + 1);
    }
  }

  function handleKeyDown(
    index: number,
    event: KeyboardEvent<HTMLInputElement>
  ): void {
    if (
      event.key === "Backspace" &&
      !digits[index] &&
      index > 0
    ) {
      focusInput(index - 1);
      return;
    }

    if (
      event.key === "ArrowLeft" &&
      index > 0
    ) {
      event.preventDefault();
      focusInput(index - 1);
      return;
    }

    if (
      event.key === "ArrowRight" &&
      index < OTP_LENGTH - 1
    ) {
      event.preventDefault();
      focusInput(index + 1);
    }
  }

  function handlePaste(
    event: ClipboardEvent<HTMLDivElement>
  ): void {
    event.preventDefault();

    const pastedValue =
      event.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, OTP_LENGTH);

    if (!pastedValue) {
      return;
    }

    onChange(pastedValue);

    const targetIndex =
      Math.min(
        pastedValue.length,
        OTP_LENGTH
      ) - 1;

    window.setTimeout(() => {
      focusInput(targetIndex);
    }, 0);
  }

  return (
    <div
      onPaste={handlePaste}
      className="grid grid-cols-6 gap-2 sm:gap-3"
    >
      {digits.map(
        (digit, index) => (
          <input
            key={index}
            ref={(element) => {
              inputRefs.current[index] =
                element;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={
              index === 0
                ? "one-time-code"
                : "off"
            }
            maxLength={1}
            disabled={disabled}
            value={digit}
            aria-label={`OTP digit ${
              index + 1
            }`}
            onChange={(event) =>
              updateDigit(
                index,
                event.target.value
              )
            }
            onKeyDown={(event) =>
              handleKeyDown(
                index,
                event
              )
            }
            className={[
              "aspect-square min-w-0 rounded-2xl border bg-white text-center text-xl font-black text-[#0B2D5C] outline-none transition sm:text-2xl",
              hasError
                ? "border-red-300 ring-2 ring-red-100"
                : "border-slate-300 focus:border-[#0B2D5C] focus:ring-4 focus:ring-blue-100",
              disabled
                ? "cursor-not-allowed bg-slate-100 opacity-60"
                : "",
            ].join(" ")}
          />
        )
      )}
    </div>
  );
}