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

export function leadCreatedOnDate(createdAt: string, filterDate: string) {
  if (!filterDate) return true;
  if (!createdAt) return false;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return false;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}` === filterDate;
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
