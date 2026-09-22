import type { ChatMessage } from "../types";

export function getMessageDateKey(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function getMessageThreadKey(message: ChatMessage) {
  if (message.channel === "group") return "group";
  return [
    "private",
    message.threadStudentId || "",
    message.threadStaffId || "",
    message.threadAdminId || "",
  ].join(":");
}

export function getDayThreadKey(message: ChatMessage) {
  return `${getMessageThreadKey(message)}:${getMessageDateKey(message.createdAt)}`;
}

export function formatReviewDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

export function formatReviewTime(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString();
}

export function formatRoleLabel(role?: string | null) {
  if (!role) return "—";
  if (role === "all") return "Everyone";
  if (role === "superadmin") return "Super Admin";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function getDayThreadMessages(messages: ChatMessage[], dayThreadKey: string) {
  return messages
    .filter((message) => getDayThreadKey(message) === dayThreadKey)
    .sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());
}

export function getReviewSenderKey(message: ChatMessage) {
  return message.senderId || `${message.senderRole}:${message.senderName}`;
}

export function getReviewAnchorSenderKey(messages: ChatMessage[]) {
  const first = messages[0];
  return first ? getReviewSenderKey(first) : "";
}

export function isReviewMessageOnRight(message: ChatMessage, anchorSenderKey: string) {
  if (!anchorSenderKey) return false;
  return getReviewSenderKey(message) !== anchorSenderKey;
}

export function getReviewSenderInitials(name?: string) {
  const trimmed = (name || "").trim();
  if (!trimmed) return "??";
  return trimmed.slice(0, 2).toUpperCase();
}
