package com.theholymatrimony.backend.secureconnect.topup.service;

import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;

import java.util.Arrays;
import java.util.Locale;

public enum SecureConnectTopUpPackage {

    AUDIO_30(
            CallMediaType.AUDIO,
            30,
            4900
    ),

    AUDIO_60(
            CallMediaType.AUDIO,
            60,
            7900
    ),

    AUDIO_120(
            CallMediaType.AUDIO,
            120,
            12900
    ),

    VIDEO_30(
            CallMediaType.VIDEO,
            30,
            7900
    ),

    VIDEO_60(
            CallMediaType.VIDEO,
            60,
            12900
    ),

    VIDEO_120(
            CallMediaType.VIDEO,
            120,
            19900
    );

    private final CallMediaType mediaType;
    private final int minutes;
    private final int amountInPaise;

    SecureConnectTopUpPackage(
            CallMediaType mediaType,
            int minutes,
            int amountInPaise
    ) {
        this.mediaType = mediaType;
        this.minutes = minutes;
        this.amountInPaise = amountInPaise;
    }

    public CallMediaType getMediaType() {
        return mediaType;
    }

    public int getMinutes() {
        return minutes;
    }

    public long getSeconds() {
        return minutes * 60L;
    }

    public int getAmountInPaise() {
        return amountInPaise;
    }

    public String getCurrency() {
        return "INR";
    }

    public static SecureConnectTopUpPackage fromCode(
            String value
    ) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(
                    "A Secure Connect top-up package is required."
            );
        }

        String normalized =
                value
                        .trim()
                        .toUpperCase(Locale.ROOT)
                        .replace('-', '_');

        return Arrays
                .stream(values())
                .filter(
                        packageOption ->
                                packageOption
                                        .name()
                                        .equals(normalized)
                )
                .findFirst()
                .orElseThrow(
                        () ->
                                new IllegalArgumentException(
                                        "Invalid Secure Connect top-up package."
                                )
                );
    }
}
