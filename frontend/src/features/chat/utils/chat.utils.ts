import {
  ChatMessage,
  ConversationUser,
} from "@/features/chat/types";

export function sortMessagesChronologically(
  messages: ChatMessage[]
): ChatMessage[] {
  return [...messages].sort(
    (first, second) =>
      new Date(first.createdAt).getTime() -
      new Date(second.createdAt).getTime()
  );
}

export function mergeMessages(
  current: ChatMessage[],
  incoming: ChatMessage[]
): ChatMessage[] {
  const messageMap = new Map<
    string,
    ChatMessage
  >();

  for (const message of current) {
    messageMap.set(message.id, message);
  }

  for (const message of incoming) {
    messageMap.set(message.id, message);
  }

  return sortMessagesChronologically(
    Array.from(messageMap.values())
  );
}

export function isOwnMessage(
  message: ChatMessage,
  otherUserId: string
): boolean {
  /*
   * Every conversation is one-to-one.
   * A message not sent by the other user
   * was sent by the logged-in user.
   */
  return message.senderId !== otherUserId;
}

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
    .map((part) => part.charAt(0))
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

export function formatConversationTime(
  dateValue?: string | null
): string {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();

  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
    return new Intl.DateTimeFormat(
      undefined,
      {
        hour: "numeric",
        minute: "2-digit",
      }
    ).format(date);
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    date.getFullYear() ===
      yesterday.getFullYear() &&
    date.getMonth() ===
      yesterday.getMonth() &&
    date.getDate() ===
      yesterday.getDate();

  if (isYesterday) {
    return "Yesterday";
  }

  if (
    date.getFullYear() ===
    now.getFullYear()
  ) {
    return new Intl.DateTimeFormat(
      undefined,
      {
        month: "short",
        day: "numeric",
      }
    ).format(date);
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(date);
}

export function formatMessageTime(
  dateValue: string
): string {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(date);
}

export function formatMessageDate(
  dateValue: string
): string {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();

  const sameDay =
    date.toDateString() === now.toDateString();

  if (sameDay) {
    return "Today";
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (
    date.toDateString() ===
    yesterday.toDateString()
  ) {
    return "Yesterday";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      weekday: "short",
      month: "short",
      day: "numeric",
      year:
        date.getFullYear() ===
        now.getFullYear()
          ? undefined
          : "numeric",
    }
  ).format(date);
}

export function shouldShowDateDivider(
  current: ChatMessage,
  previous?: ChatMessage
): boolean {
  if (!previous) {
    return true;
  }

  return (
    new Date(current.createdAt).toDateString() !==
    new Date(previous.createdAt).toDateString()
  );
}