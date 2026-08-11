import {
  ChatMessage,
  ConversationUser,
} from "@/features/chat/types";

const INDIA_TIME_ZONE =
  "Asia/Kolkata";

const INDIA_LOCALE =
  "en-IN";

/*
 * ============================================================
 * BACKEND DATE PARSER
 * ============================================================
 *
 * Spring sends LocalDateTime values such as:
 *
 * 2026-08-11T11:04:33.711106
 *
 * The database/backend stores application timestamps in UTC,
 * but LocalDateTime does not include a timezone suffix.
 *
 * JavaScript would otherwise interpret that value as the
 * browser's local timezone.
 *
 * We explicitly treat timezone-less backend timestamps as UTC.
 */

export function parseBackendDate(
  value?: string | null
): Date | null {
  if (!value?.trim()) {
    return null;
  }

  let normalized =
    value.trim();

  /*
   * PostgreSQL/Jackson may occasionally provide
   * a space instead of T.
   */
  normalized =
    normalized.replace(
      " ",
      "T"
    );

  /*
   * JavaScript only needs millisecond precision.
   * Convert microseconds/nanoseconds safely.
   */
  normalized =
    normalized.replace(
      /(\.\d{3})\d+/,
      "$1"
    );

  /*
   * If there is no Z or explicit UTC offset,
   * treat this backend LocalDateTime as UTC.
   */
  const hasTimezone =
    /(?:Z|[+-]\d{2}:?\d{2})$/i.test(
      normalized
    );

  if (!hasTimezone) {
    normalized =
      `${normalized}Z`;
  }

  const date =
    new Date(normalized);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
}

/*
 * ============================================================
 * INDIA CALENDAR HELPERS
 * ============================================================
 */

function getIndiaDateKey(
  date: Date
): string {
  const parts =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone:
          INDIA_TIME_ZONE,

        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    ).formatToParts(date);

  const year =
    parts.find(
      (part) =>
        part.type === "year"
    )?.value ?? "";

  const month =
    parts.find(
      (part) =>
        part.type === "month"
    )?.value ?? "";

  const day =
    parts.find(
      (part) =>
        part.type === "day"
    )?.value ?? "";

  return `${year}-${month}-${day}`;
}

function getIndiaYear(
  date: Date
): number {
  const year =
    new Intl.DateTimeFormat(
      "en",
      {
        timeZone:
          INDIA_TIME_ZONE,

        year: "numeric",
      }
    ).format(date);

  return Number(year);
}

function getYesterdayIndiaDateKey(): string {
  const now =
    new Date();

  /*
   * Moving back 24 hours is safe for IST because
   * India does not observe daylight saving time.
   */
  const yesterday =
    new Date(
      now.getTime() -
        24 * 60 * 60 * 1000
    );

  return getIndiaDateKey(
    yesterday
  );
}

/*
 * ============================================================
 * MESSAGE SORTING
 * ============================================================
 */

export function sortMessagesChronologically(
  messages: ChatMessage[]
): ChatMessage[] {
  return [...messages].sort(
    (first, second) => {
      const firstDate =
        parseBackendDate(
          first.createdAt
        );

      const secondDate =
        parseBackendDate(
          second.createdAt
        );

      return (
        (firstDate?.getTime() ?? 0) -
        (secondDate?.getTime() ?? 0)
      );
    }
  );
}

export function mergeMessages(
  current: ChatMessage[],
  incoming: ChatMessage[]
): ChatMessage[] {
  const messageMap =
    new Map<
      string,
      ChatMessage
    >();

  for (
    const message of current
  ) {
    messageMap.set(
      message.id,
      message
    );
  }

  for (
    const message of incoming
  ) {
    messageMap.set(
      message.id,
      message
    );
  }

  return sortMessagesChronologically(
    Array.from(
      messageMap.values()
    )
  );
}

/*
 * ============================================================
 * MESSAGE OWNERSHIP
 * ============================================================
 */

export function isOwnMessage(
  message: ChatMessage,
  otherUserId: string
): boolean {
  /*
   * Every conversation is one-to-one.
   *
   * A message not sent by the other user
   * was sent by the logged-in user.
   */
  return (
    message.senderId !==
    otherUserId
  );
}

/*
 * ============================================================
 * USER HELPERS
 * ============================================================
 */

export function getInitials(
  fullName?: string
): string {
  if (!fullName?.trim()) {
    return "HM";
  }

  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(
      (part) =>
        part.charAt(0)
    )
    .join("")
    .toUpperCase();
}

export function getUserLocation(
  user: ConversationUser
): string {
  return [
    user.city,
    user.state,
    user.country,
  ]
    .filter(Boolean)
    .join(", ");
}

/*
 * ============================================================
 * CONVERSATION LIST TIME
 * ============================================================
 */

export function formatConversationTime(
  dateValue?: string | null
): string {
  const date =
    parseBackendDate(
      dateValue
    );

  if (!date) {
    return "";
  }

  const now =
    new Date();

  const dateKey =
    getIndiaDateKey(
      date
    );

  const todayKey =
    getIndiaDateKey(
      now
    );

  if (
    dateKey === todayKey
  ) {
    return new Intl.DateTimeFormat(
      INDIA_LOCALE,
      {
        timeZone:
          INDIA_TIME_ZONE,

        hour: "numeric",
        minute: "2-digit",

        hour12: true,
      }
    ).format(date);
  }

  const yesterdayKey =
    getYesterdayIndiaDateKey();

  if (
    dateKey ===
    yesterdayKey
  ) {
    return "Yesterday";
  }

  if (
    getIndiaYear(date) ===
    getIndiaYear(now)
  ) {
    return new Intl.DateTimeFormat(
      INDIA_LOCALE,
      {
        timeZone:
          INDIA_TIME_ZONE,

        month: "short",
        day: "numeric",
      }
    ).format(date);
  }

  return new Intl.DateTimeFormat(
    INDIA_LOCALE,
    {
      timeZone:
        INDIA_TIME_ZONE,

      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(date);
}

/*
 * ============================================================
 * MESSAGE TIME
 * ============================================================
 */

export function formatMessageTime(
  dateValue: string
): string {
  const date =
    parseBackendDate(
      dateValue
    );

  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat(
    INDIA_LOCALE,
    {
      timeZone:
        INDIA_TIME_ZONE,

      hour: "numeric",
      minute: "2-digit",

      hour12: true,
    }
  ).format(date);
}

/*
 * ============================================================
 * MESSAGE DATE DIVIDER
 * ============================================================
 */

export function formatMessageDate(
  dateValue: string
): string {
  const date =
    parseBackendDate(
      dateValue
    );

  if (!date) {
    return "";
  }

  const now =
    new Date();

  const dateKey =
    getIndiaDateKey(
      date
    );

  if (
    dateKey ===
    getIndiaDateKey(now)
  ) {
    return "Today";
  }

  if (
    dateKey ===
    getYesterdayIndiaDateKey()
  ) {
    return "Yesterday";
  }

  return new Intl.DateTimeFormat(
    INDIA_LOCALE,
    {
      timeZone:
        INDIA_TIME_ZONE,

      weekday: "short",
      month: "short",
      day: "numeric",

      year:
        getIndiaYear(date) ===
        getIndiaYear(now)
          ? undefined
          : "numeric",
    }
  ).format(date);
}

/*
 * ============================================================
 * DATE DIVIDER CHECK
 * ============================================================
 */

export function shouldShowDateDivider(
  current: ChatMessage,
  previous?: ChatMessage
): boolean {
  if (!previous) {
    return true;
  }

  const currentDate =
    parseBackendDate(
      current.createdAt
    );

  const previousDate =
    parseBackendDate(
      previous.createdAt
    );

  if (
    !currentDate ||
    !previousDate
  ) {
    return false;
  }

  return (
    getIndiaDateKey(
      currentDate
    ) !==
    getIndiaDateKey(
      previousDate
    )
  );
}