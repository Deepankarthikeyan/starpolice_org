import type { ChatMessage, MessagingContact, UserRole } from "../types";
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

export type ConversationTypeFilter =
  | ""
  | "admin-group"
  | "staff-group"
  | "student-group"
  | "admin-student"
  | "student-admin"
  | "admin-staff"
  | "staff-admin"
  | "admin-admin"
  | "staff-student"
  | "student-staff";

export type ConversationTypeKey =
  | "admin-group"
  | "staff-group"
  | "student-group"
  | "admin-student"
  | "staff-student"
  | "staff-admin"
  | "admin-admin"
  | "private-other";

export const CONVERSATION_TYPE_FILTER_OPTIONS: { value: ConversationTypeFilter; label: string }[] = [
  { value: "", label: "All conversations" },
  { value: "admin-group", label: "Admin → Everyone (Group)" },
  { value: "staff-group", label: "Staff → Everyone (Group)" },
  { value: "student-group", label: "Student → Everyone (Group)" },
  { value: "admin-student", label: "Admin → Student" },
  { value: "student-admin", label: "Student → Admin" },
  { value: "admin-staff", label: "Admin → Staff" },
  { value: "staff-admin", label: "Staff → Admin" },
  { value: "admin-admin", label: "Admin → Admin" },
  { value: "staff-student", label: "Staff → Student" },
  { value: "student-staff", label: "Student → Staff" },
];

export type HistoryNavigation = {
  audience: InteractionAudience;
  contactId: string;
};

export type ContactNameLookup = {
  student: (id?: string | null) => string | null;
  staff: (id?: string | null) => string | null;
  admin: (id?: string | null) => string | null;
};

export function buildContactNameLookup(contacts: MessagingContact[]): ContactNameLookup {
  const students = new Map<string, string>();
  const staff = new Map<string, string>();
  const admins = new Map<string, string>();

  for (const contact of contacts) {
    if (contact.contactType === "student") students.set(contact.id, contact.name);
    if (contact.contactType === "staff") staff.set(contact.id, contact.name);
    if (contact.contactType === "admin") admins.set(contact.id, contact.name);
  }

  return {
    student: (id) => (id ? students.get(id) ?? null : null),
    staff: (id) => (id ? staff.get(id) ?? null : null),
    admin: (id) => (id ? admins.get(id) ?? null : null),
  };
}

function panelRole(role: UserRole): "admin" | "staff" | "student" {
  if (role === "staff") return "staff";
  if (role === "student") return "student";
  return "admin";
}

export function getConversationType(message: ChatMessage): ConversationTypeKey {
  if (message.channel === "group") {
    return `${panelRole(message.senderRole)}-group`;
  }

  const hasStudent = Boolean(message.threadStudentId);
  const hasStaff = Boolean(message.threadStaffId);
  const hasAdmin = Boolean(message.threadAdminId);

  if (hasStudent && hasStaff) return "staff-student";
  if (hasStudent && hasAdmin && !hasStaff) return "admin-student";
  if (hasStaff && hasAdmin && !hasStudent) return "staff-admin";
  if (hasStudent && !hasStaff && !hasAdmin) return "admin-student";

  return "private-other";
}

export function matchesConversationFilter(
  message: ChatMessage,
  filter: ConversationTypeFilter
): boolean {
  if (!filter) return true;

  const type = getConversationType(message);

  if (filter === "student-admin") return type === "admin-student";
  if (filter === "student-staff") return type === "staff-student";

  return type === filter;
}

export function historyConversationLabel(message: ChatMessage, names: ContactNameLookup) {
  const type = getConversationType(message);

  if (type === "admin-group") return "Admin → Everyone (Group)";
  if (type === "staff-group") return "Staff → Everyone (Group)";
  if (type === "student-group") return "Student → Everyone (Group)";

  if (type === "admin-student") {
    const studentName = names.student(message.threadStudentId);
    return studentName ? `Admin → Student: ${studentName}` : "Admin → Student";
  }

  if (type === "staff-student") {
    const studentName = names.student(message.threadStudentId);
    return studentName ? `Staff → Student: ${studentName}` : "Staff → Student";
  }

  if (type === "staff-admin") {
    const adminName = names.admin(message.threadAdminId);
    return adminName ? `Staff → Admin: ${adminName}` : "Staff → Admin";
  }

  if (type === "admin-admin") {
    const adminName = names.admin(message.threadAdminId);
    return adminName ? `Admin → Admin: ${adminName}` : "Admin → Admin";
  }

  return "Private chat";
}

/** @deprecated Use historyConversationLabel instead */
export function historyThreadLabel(message: ChatMessage) {
  return historyConversationLabel(message, {
    student: () => null,
    staff: () => null,
    admin: () => null,
  });
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
    conversationType?: ConversationTypeFilter;
    fromDate: string;
    toDate: string;
    contactNames?: ContactNameLookup;
  }
) {
  const query = options.search.trim().toLowerCase();
  let rows = [...messages];

  if (options.channel) {
    rows = rows.filter((item) => item.channel === options.channel);
  }

  if (options.conversationType) {
    rows = rows.filter((item) => matchesConversationFilter(item, options.conversationType!));
  }

  if (options.fromDate) {
    const from = new Date(`${options.fromDate}T00:00:00`);
    rows = rows.filter((item) => new Date(item.createdAt) >= from);
  }

  if (options.toDate) {
    const to = new Date(`${options.toDate}T23:59:59.999`);
    rows = rows.filter((item) => new Date(item.createdAt) <= to);
  }

  const names = options.contactNames ?? {
    student: () => null,
    staff: () => null,
    admin: () => null,
  };

  if (query) {
    rows = rows.filter((item) =>
      [
        item.message,
        item.senderName,
        item.senderEmail,
        historyConversationLabel(item, names),
        getConversationType(item),
      ]
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
