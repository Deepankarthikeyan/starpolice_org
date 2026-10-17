export interface ScheduledClassRecord {
  id: string;
  scheduledAt: string;
  subject: string;
  subjectId: string | null;
  facultyId: string;
  facultyName: string;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScheduleClassFormState {
  scheduledAt: string;
  subject: string;
  subjectId: string;
  facultyId: string;
  notes: string;
}

export const emptyScheduleClassForm = (): ScheduleClassFormState => ({
  scheduledAt: "",
  subject: "",
  subjectId: "",
  facultyId: "",
  notes: "",
});
