import type { BaseEntity } from "@/shared/types";

// ─── Appointment Status ─────────────────────────────────────────────────────

export type AppointmentStatus =
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

// ─── Notification ───────────────────────────────────────────────────────────

export type NotificationChannel = "inapp" | "sms";
export type NotificationStatus = "pending" | "sent" | "failed";

export interface Notification extends BaseEntity {
  channel: NotificationChannel;
  targetType: "appointment" | "consultation";
  targetId: number;
  recipientPhone: string;
  message: string;
  status: NotificationStatus;
  scheduledFor: string;
  sentAt: string | null;
}

// ─── Reminder Helpers ───────────────────────────────────────────────────────

export function getUpcomingReminders(
  notifications: Notification[],
  withinHours = 48
): Notification[] {
  const cutoff = Date.now() + withinHours * 60 * 60 * 1000;
  return notifications.filter(
    (n) => new Date(n.scheduledFor).getTime() <= cutoff
  );
}
