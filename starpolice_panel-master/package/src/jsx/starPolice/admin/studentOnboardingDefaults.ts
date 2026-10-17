export type ResidenceType = "Day Scholar" | "Hostel" | "";

export type OnboardingCourse = "si" | "pc" | "army";

export const ONBOARDING_COURSE_OPTIONS: { value: OnboardingCourse; label: string }[] = [
  { value: "si", label: "SI" },
  { value: "pc", label: "PC" },
  { value: "army", label: "Army" },
];

export const ONBOARDING_PAYMENT_FILTER_OPTIONS = [
  { value: "Paid", label: "Paid" },
  { value: "Partial", label: "Partial Payment" },
] as const;

const ONBOARDING_COURSE_ALIASES: Record<string, OnboardingCourse> = {
  si: "si",
  pc: "pc",
  army: "army",
  "sub inspector": "si",
  "sub-inspector": "si",
  "police constable": "pc",
  "constable": "pc",
};

/** Map stored course strings (SI, Army, legacy labels) to filter option values. */
export function normalizeOnboardingCourse(course: string): OnboardingCourse | "" {
  const raw = (course || "").trim();
  if (!raw) return "";

  const lower = raw.toLowerCase();
  const alias = ONBOARDING_COURSE_ALIASES[lower];
  if (alias) return alias;

  for (const option of ONBOARDING_COURSE_OPTIONS) {
    if (lower === option.value || lower === option.label.toLowerCase()) {
      return option.value;
    }
  }

  return "";
}

export function onboardingRecordMatchesCourseFilter(
  recordCourse: string,
  filter: "" | OnboardingCourse,
): boolean {
  if (!filter) return true;
  return normalizeOnboardingCourse(recordCourse) === filter;
}

export function normalizeOnboardingPaymentStatus(status: string): string {
  const value = (status || "").trim();
  if (value === "Partial Payment") return "Partial";
  return value;
}

export function onboardingRecordMatchesPaymentFilter(recordStatus: string, filter: string): boolean {
  if (!filter) return true;
  return normalizeOnboardingPaymentStatus(recordStatus) === filter;
}

export function formatOnboardingCourse(course: string) {
  const normalized = normalizeOnboardingCourse(course);
  if (normalized) {
    return ONBOARDING_COURSE_OPTIONS.find((item) => item.value === normalized)?.label || normalized;
  }
  return course || "—";
}

export function onboardingAdmissionOnDate(admissionDate: string, filterDate: string) {
  if (!filterDate) return true;
  if (!admissionDate) return false;
  return admissionDate.slice(0, 10) === filterDate;
}

export interface OnboardingMaterial {
  id?: string;
  materialName: string;
  date: string;
  given: boolean;
}

export interface OnboardingActivityLog {
  id?: string;
  action: "created" | "updated";
  description: string;
  performedBy: string | null;
  performedByName: string;
  performedAt?: string;
  changes: Array<{
    field: string;
    oldValue: string;
    newValue: string;
  }>;
}

export interface StudentOnboardingRecord {
  id: string;
  studentId: string;
  userId: string | null;
  loginActive?: boolean;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  nationality: string;
  aadhaarOrPassport: string;
  profilePhotoUrl: string;
  mobileNumber: string;
  alternateMobileNumber: string;
  email: string;
  parentMobileNumber: string;
  parentEmail: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  district: string;
  state: string;
  country: string;
  pinCode: string;
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  motherOccupation: string;
  guardianName: string;
  guardianRelationship: string;
  annualFamilyIncome: string;
  schoolName: string;
  previousQualification: string;
  boardUniversity: string;
  yearOfPassing: string;
  percentageCgpa: string;
  mediumOfInstruction: string;
  course: string;
  batch: string;
  branchCampus: string;
  section: string;
  admissionDate: string;
  modeOfLearning: string;
  residenceType: ResidenceType;
  duration: string;
  expectedCompletionDate: string;
  aadhaarCardUrl: string;
  panCardUrl: string;
  passportUrl: string;
  drivingLicenceUrl: string;
  communityCertificateUrl: string;
  transferCertificateUrl: string;
  migrationCertificateUrl: string;
  birthCertificateUrl: string;
  emergencyContactName: string;
  emergencyRelationship: string;
  emergencyMobile: string;
  emergencyAlternateNumber: string;
  username: string;
  loginEmail: string;
  registrationFee: string;
  courseFee: string;
  scholarship: string;
  discount: string;
  paymentMethod: string;
  paymentStatus: string;
  balanceAmount: string;
  transactionId: string;
  receiptNumber: string;
  materials: OnboardingMaterial[];
  activityLogs?: OnboardingActivityLog[];
  medicalConditions: string;
  allergies: string;
  disabilities: string;
  emergencyNotes: string;
  languagesKnown: string;
  computerSkills: string;
  careerGoal: string;
  preferredCommunicationLanguage: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  studentSignatureUrl: string;
  parentSignatureUrl: string;
  declarationDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export type StudentOnboardingFormState = Omit<
  StudentOnboardingRecord,
  "id" | "userId" | "createdAt" | "updatedAt"
> & {
  password: string;
  confirmPassword: string;
  grantLogin: boolean;
};

export const emptyStudentOnboardingForm = (): StudentOnboardingFormState => ({
  studentId: "",
  firstName: "",
  middleName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  bloodGroup: "",
  nationality: "",
  aadhaarOrPassport: "",
  profilePhotoUrl: "",
  mobileNumber: "",
  alternateMobileNumber: "",
  email: "",
  parentMobileNumber: "",
  parentEmail: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  district: "",
  state: "",
  country: "India",
  pinCode: "",
  fatherName: "",
  fatherOccupation: "",
  motherName: "",
  motherOccupation: "",
  guardianName: "",
  guardianRelationship: "",
  annualFamilyIncome: "",
  schoolName: "",
  previousQualification: "",
  boardUniversity: "",
  yearOfPassing: "",
  percentageCgpa: "",
  mediumOfInstruction: "",
  course: "",
  batch: "",
  branchCampus: "",
  section: "",
  admissionDate: "",
  modeOfLearning: "",
  residenceType: "",
  duration: "",
  expectedCompletionDate: "",
  aadhaarCardUrl: "",
  panCardUrl: "",
  passportUrl: "",
  drivingLicenceUrl: "",
  communityCertificateUrl: "",
  transferCertificateUrl: "",
  migrationCertificateUrl: "",
  birthCertificateUrl: "",
  emergencyContactName: "",
  emergencyRelationship: "",
  emergencyMobile: "",
  emergencyAlternateNumber: "",
  username: "",
  loginEmail: "",
  registrationFee: "",
  courseFee: "",
  scholarship: "",
  discount: "",
  paymentMethod: "",
  paymentStatus: "",
  balanceAmount: "",
  transactionId: "",
  receiptNumber: "",
  materials: [],
  medicalConditions: "",
  allergies: "",
  disabilities: "",
  emergencyNotes: "",
  languagesKnown: "",
  computerSkills: "",
  careerGoal: "",
  preferredCommunicationLanguage: "",
  termsAccepted: false,
  privacyAccepted: false,
  studentSignatureUrl: "",
  parentSignatureUrl: "",
  declarationDate: "",
  password: "",
  confirmPassword: "",
  grantLogin: false,
});

export function parseFeeAmount(value: string) {
  const parsed = Number.parseFloat(String(value || "").replace(/[^0-9.-]/g, ""));
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function calculateTotalFees(record: Pick<StudentOnboardingRecord, "registrationFee" | "courseFee" | "scholarship" | "discount">) {
  return (
    parseFeeAmount(record.registrationFee) +
    parseFeeAmount(record.courseFee) -
    parseFeeAmount(record.scholarship) -
    parseFeeAmount(record.discount)
  );
}

export function displayBalanceAmount(record: Pick<StudentOnboardingRecord, "paymentStatus" | "balanceAmount">) {
  if (record.paymentStatus === "Paid") return "0";
  if (record.paymentStatus === "Partial") return record.balanceAmount || "—";
  return "—";
}
