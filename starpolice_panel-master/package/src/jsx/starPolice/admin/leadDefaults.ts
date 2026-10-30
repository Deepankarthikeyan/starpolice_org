export type LeadStatus = "new" | "follow_up" | "rejected" | "converted";

export type LeadSource =
  | "website"
  | "walk_in"
  | "referral"
  | "phone"
  | "instagram"
  | "google"
  | "facebook"
  | "whatsapp"
  | "youtube"
  | "other"
  /** @deprecated legacy records only */
  | "social_media";

export type LeadCourse = "pc" | "si" | "army";

/** Lead status choice on Add/Edit form (empty = unchanged / stays New). */
export type LeadFormDisposition = "" | "follow_up" | "rejected";

export interface LeadRecord {
  id: string;
  leadId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  alternateMobileNumber: string;
  city: string;
  state: string;
  course: string;
  batch: string;
  previousQualification: string;
  careerGoal: string;
  source: LeadSource;
  status: LeadStatus;
  followUpNotes: string;
  nextFollowUpDate: string;
  rejectionReason: string;
  rejectedAt: string | null;
  convertedStudentOnboardingId: string | null;
  convertedUserId: string | null;
  convertedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadFormState {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  alternateMobileNumber: string;
  city: string;
  state: string;
  course: string;
  batch: string;
  previousQualification: string;
  careerGoal: string;
  source: LeadSource;
  leadDisposition: LeadFormDisposition;
  rejectionReason: string;
  followUpNotes: string;
  nextFollowUpDate: string;
}

export const LEAD_STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "follow_up", label: "Follow Up" },
  { value: "rejected", label: "Rejected" },
  { value: "converted", label: "Converted to Student" },
];

/** Status filter on Lead List (excludes "new"). */
export const LEAD_STATUS_FILTER_OPTIONS = LEAD_STATUS_OPTIONS.filter((item) => item.value !== "new");

export const LEAD_FORM_DISPOSITION_OPTIONS: {
  value: Exclude<LeadFormDisposition, "">;
  label: string;
}[] = [
  { value: "follow_up", label: "Follow up" },
  { value: "rejected", label: "Rejected" },
];

export const LEAD_SOURCE_OPTIONS: { value: LeadSource; label: string }[] = [
  { value: "walk_in", label: "Walk-in" },
  { value: "phone", label: "Phone" },
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "instagram", label: "Instagram" },
  { value: "google", label: "Google" },
  { value: "facebook", label: "Facebook" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "youtube", label: "YouTube" },
  { value: "other", label: "Other" },
];

export const LEAD_COURSE_OPTIONS: { value: LeadCourse; label: string }[] = [
  { value: "pc", label: "PC" },
  { value: "si", label: "SI" },
  { value: "army", label: "Army" },
];

const LEAD_COURSE_ALIASES: Record<string, LeadCourse> = {
  si: "si",
  pc: "pc",
  army: "army",
  "sub inspector": "si",
  "sub-inspector": "si",
  "police constable": "pc",
  constable: "pc",
};

/** Map stored course strings (SI, Army, etc.) to filter values si / pc / army. */
export function normalizeLeadCourse(course: string): LeadCourse | "" {
  const raw = (course || "").trim();
  if (!raw) return "";

  const lower = raw.toLowerCase();
  const alias = LEAD_COURSE_ALIASES[lower];
  if (alias) return alias;

  for (const option of LEAD_COURSE_OPTIONS) {
    if (lower === option.value || lower === option.label.toLowerCase()) {
      return option.value;
    }
  }

  return "";
}

export function leadRecordMatchesCourseFilter(recordCourse: string, filter: "" | LeadCourse): boolean {
  if (!filter) return true;
  return normalizeLeadCourse(recordCourse) === filter;
}

export function leadRecordMatchesStatusFilter(recordStatus: string, filter: "" | LeadStatus): boolean {
  if (!filter) return true;
  return recordStatus === filter;
}

export function formatLeadCourse(course: string) {
  const normalized = normalizeLeadCourse(course);
  if (normalized) {
    return LEAD_COURSE_OPTIONS.find((item) => item.value === normalized)?.label || normalized;
  }
  return course || "—";
}

export function formatLeadCreatedDate(createdAt: string) {
  if (!createdAt) return "—";
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function localDateKey(date = new Date()) {
  const year = date.getFullYear(), month = String(date.getMonth() + 1).padStart(2, "0"), day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}
export function isLeadFollowUpOverdue(date: string) { return Boolean(date && date < localDateKey()); }
export type LeadFollowUpTiming = "expired" | "today" | "tomorrow" | "later" | "none";
export function leadFollowUpTiming(date: string, today = localDateKey()): LeadFollowUpTiming {
  if (!date) return "none";
  if (date < today) return "expired";
  if (date === today) return "today";
  const tomorrow = new Date(`${today}T00:00:00`);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date === localDateKey(tomorrow)) return "tomorrow";
  return "later";
}
export function leadFollowUpBadgeClass(date: string) {
  const timing = leadFollowUpTiming(date);
  if (timing === "expired") return "bg-danger";
  if (timing === "today") return "bg-warning text-dark";
  if (timing === "tomorrow") return "bg-success";
  return "bg-info text-dark";
}
export function leadFollowUpLabel(date: string) {
  const timing = leadFollowUpTiming(date);
  if (timing === "expired") return "Expired Due";
  if (timing === "today") return "Today Follow-up";
  if (timing === "tomorrow") return "Tomorrow Follow-up";
  return "Follow-up";
}
export function formatLeadFollowUpDate(value: string) {
  if (!value) return "-";
  const date = new Date(value + "T00:00:00");
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
export function leadCreatedDateKey(createdAt: string) {
  if (!createdAt) return "";
  const isoDay = createdAt.match(/^(\d{4}-\d{2}-\d{2})/)?.[1];
  if (isoDay) return isoDay;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Inclusive range on lead created date (YYYY-MM-DD). Either bound may be empty. */
export function leadCreatedInDateRange(createdAt: string, fromDate: string, toDate: string) {
  if (!fromDate && !toDate) return true;
  const key = leadCreatedDateKey(createdAt);
  if (!key) return false;
  if (fromDate && key < fromDate) return false;
  if (toDate && key > toDate) return false;
  return true;
}

export function sourceLabel(source: LeadSource) {
  return LEAD_SOURCE_OPTIONS.find((item) => item.value === source)?.label || source;
}

export function emptyLeadForm(): LeadFormState {
  return {
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    alternateMobileNumber: "",
    city: "",
    state: "",
    course: "",
    batch: "",
    previousQualification: "",
    careerGoal: "",
    source: "other",
    leadDisposition: "",
    rejectionReason: "",
    followUpNotes: "",
    nextFollowUpDate: "",
  };
}

export function recordToForm(record: LeadRecord): LeadFormState {
  return {
    firstName: record.firstName,
    middleName: record.middleName,
    lastName: record.lastName,
    email: record.email,
    mobileNumber: record.mobileNumber,
    alternateMobileNumber: record.alternateMobileNumber,
    city: record.city,
    state: record.state,
    course: record.course,
    batch: record.batch,
    previousQualification: record.previousQualification,
    careerGoal: record.careerGoal,
    source: record.source,
    leadDisposition:
      record.status === "follow_up" || record.status === "rejected" ? record.status : "",
    rejectionReason: record.rejectionReason || "",
    followUpNotes: record.followUpNotes,
    nextFollowUpDate: record.nextFollowUpDate,
  };
}

export function fullLeadName(record: Pick<LeadRecord, "firstName" | "middleName" | "lastName">) {
  return [record.firstName, record.middleName, record.lastName].filter(Boolean).join(" ");
}

export function statusBadgeClass(status: LeadStatus) {
  if (status === "follow_up") return "bg-warning text-dark";
  if (status === "rejected") return "bg-danger";
  if (status === "converted") return "bg-success";
  return "bg-secondary";
}

export function statusLabel(status: LeadStatus) {
  return LEAD_STATUS_OPTIONS.find((item) => item.value === status)?.label || status;
}

export function leadRecordMatchesSearch(lead: LeadRecord, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const name = fullLeadName(lead).toLowerCase();
  const courseLabel = formatLeadCourse(lead.course).toLowerCase();
  const courseValue = normalizeLeadCourse(lead.course);
  const statusText = statusLabel(lead.status as LeadStatus).toLowerCase();
  const sourceText = sourceLabel(lead.source).toLowerCase();
  return (
    lead.leadId.toLowerCase().includes(q) ||
    name.includes(q) ||
    lead.email.toLowerCase().includes(q) ||
    lead.mobileNumber.includes(q) ||
    (lead.batch || "").toLowerCase().includes(q) ||
    (lead.city || "").toLowerCase().includes(q) ||
    (lead.course || "").toLowerCase().includes(q) ||
    courseLabel.includes(q) ||
    courseValue.includes(q) ||
    statusText.includes(q) ||
    sourceText.includes(q)
  );
}
