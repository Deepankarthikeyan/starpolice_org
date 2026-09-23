export interface StaffPerformanceSummary {
  userId: string;
  name: string;
  email: string;
  staffType: "physical" | "subject" | null;
  subjectNames: string[];
  isActive: boolean;
  uploadCount: number;
  questionCount: number;
  classesAssigned: number;
  classesAttended: number;
  classesMissed: number;
  attendanceMarked: number;
  messagesSent: number;
  classAttendancePercent: number | null;
  activityScore: number | null;
  updatedAt?: string;
}

export interface StaffClassHistoryItem {
  id: string;
  scheduledAt: string;
  subject: string;
  facultyName: string;
  status: "present" | "absent" | "late" | "unmarked" | "upcoming";
  notes: string;
  attendanceId: string | null;
  isPast: boolean;
}

export interface StaffPerformanceDetail {
  staff: StaffPerformanceSummary;
  metrics: StaffPerformanceSummary;
  classHistory: StaffClassHistoryItem[];
  recentUploads: Array<{
    id: string;
    date: string;
    title: string;
    name: string;
    category: string;
    uploadedAt: string;
  }>;
}

export interface StaffDashboardStats {
  uploadCount: number;
  questionCount: number;
  classesAssigned: number;
  classesAttended: number;
  classAttendancePercent: number | null;
  attendanceMarked: number;
  messagesSent: number;
  recentUploads: Array<{
    id: string;
    date: string;
    name: string;
    title: string;
    category: string;
  }>;
  upcomingClasses: Array<{
    id: string;
    scheduledAt: string;
    subject: string;
    facultyName: string;
  }>;
}

export function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return `${value}%`;
}

export function classStatusLabel(status: StaffClassHistoryItem["status"]) {
  if (status === "present") return "Present";
  if (status === "absent") return "Absent";
  if (status === "late") return "Late";
  if (status === "upcoming") return "Upcoming";
  return "Unmarked";
}

export function classStatusBadge(status: StaffClassHistoryItem["status"]) {
  if (status === "present") return "badge bg-success";
  if (status === "absent") return "badge bg-danger";
  if (status === "late") return "badge bg-warning text-dark";
  if (status === "upcoming") return "badge bg-info text-dark";
  return "badge bg-secondary";
}
