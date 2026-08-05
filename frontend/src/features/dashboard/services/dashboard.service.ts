import type {
  DashboardNotificationLike,
  DashboardNotificationSummary,
} from "@/features/dashboard/types";

function isMessageNotification(
  type?: string
): boolean {
  return type === "NEW_MESSAGE";
}

function isInterestNotification(
  type?: string
): boolean {
  return (
    type === "INTEREST_RECEIVED" ||
    type === "INTEREST_ACCEPTED" ||
    type === "INTEREST_DECLINED"
  );
}

export function summarizeNotifications(
  notifications: DashboardNotificationLike[]
): DashboardNotificationSummary {
  return notifications.reduce<DashboardNotificationSummary>(
    (summary, notification) => {
      summary.total += 1;

      if (!notification.read) {
        summary.unread += 1;
      }

      if (
        isMessageNotification(
          notification.type
        )
      ) {
        summary.messages += 1;
      }

      if (
        isInterestNotification(
          notification.type
        )
      ) {
        summary.interests += 1;
      }

      return summary;
    },
    {
      total: 0,
      unread: 0,
      messages: 0,
      interests: 0,
    }
  );
}