import type { ChatMessage, UserRole } from "../types";
import {
  GROUP_CONTACT_ID,
  adminContactId,
  staffContactId,
  studentContactId,
} from "./interactionHelpers";

export type InteractionAudience = "group" | "student" | "staff" | "admin";

export type InteractionHistorySortKey = "createdAt" | "senderName";
export type InteractionHistorySortDir = "asc" | "desc";
export type InteractionHistoryChannelFilter = "" | "group" | "private";

export type HistoryNavigation = {
  audience: InteractionAudience;
  contactId: string;
};

export function historyThreadLabel(message: ChatMessage) {
  if (message.channel === "group") return "Group";
  if (message.threadStudentId && message.threadStaffId) return "Student ↔ Staff";
  if (message.threadStudentId && message.threadAdminId) return "Student ↔ Admin";
  if (message.threadStaffId && message.threadAdminId) return "Staff ↔ Admin";
  return "Private";
}

export function resolveHistoryMessageNavigation(
  message: ChatMessage,
  viewerRole: UserRole
): HistoryNavigation | null {
  if (message.channel === "group") {
    return { audience: "group", contactId: GROUP_CONTACT_ID };
  }

  if (message.threadStudentId) {
    if (viewerRole === "student") {
      if (message.threadStaffId) {
        return { audience: "staff", contactId: staffContactId(message.threadStaffId) };
      }
      if (message.threadAdminId) {
        return { audience: "admin", contactId: adminContactId(message.threadAdminId) };
      }
      return null;
    }
    return { audience: "student", contactId: studentContactId(message.threadStudentId) };
  }

  if (message.threadStaffId && message.threadAdminId) {
    if (viewerRole === "staff") {
      return { audience: "admin", contactId: adminContactId(message.threadAdminId) };
    }
    return { audience: "staff", contactId: staffContactId(message.threadStaffId) };
  }

  return null;
}

export function filterAndSortMessages(
  messages: ChatMessage[],
  options: {
    search: string;
    sortKey: InteractionHistorySortKey;
    sortDir: InteractionHistorySortDir;
    channel: InteractionHistoryChannelFilter;
    fromDate: string;
    toDate: string;
  }
) {
  const query = options.search.trim().toLowerCase();
  let rows = [...messages];

  if (options.channel) {
    rows = rows.filter((item) => item.channel === options.channel);
  }

  if (options.fromDate) {
    const from = new Date(`${options.fromDate}T00:00:00`);
    rows = rows.filter((item) => new Date(item.createdAt) >= from);
  }

  if (options.toDate) {
    const to = new Date(`${options.toDate}T23:59:59.999`);
    rows = rows.filter((item) => new Date(item.createdAt) <= to);
  }

  if (query) {
    rows = rows.filter((item) =>
      [item.message, item.senderName, item.senderEmail, historyThreadLabel(item)]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }

  rows.sort((left, right) => {
    if (options.sortKey === "senderName") {
      const result = left.senderName.localeCompare(right.senderName, undefined, { sensitivity: "base" });
      return options.sortDir === "asc" ? result : -result;
    }

    const leftTime = new Date(left.createdAt).getTime();
    const rightTime = new Date(right.createdAt).getTime();
    const result = leftTime - rightTime;
    return options.sortDir === "asc" ? result : -result;
  });

  return rows;
}
