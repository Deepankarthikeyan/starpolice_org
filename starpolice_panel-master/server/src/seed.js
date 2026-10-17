import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import Subject from "./models/Subject.js";
import Exam from "./models/Exam.js";
import StudentOnboarding from "./models/StudentOnboarding.js";
import StudentExamMark from "./models/StudentExamMark.js";
import Lead from "./models/Lead.js";
import { defaultPermissionsForRole } from "./permissions.js";

dotenv.config();

const TEMP_SUBJECTS = [
  "General Knowledge",
  "English",
  "Tamil",
  "Mathematics",
  "Indian Polity",
  "Reasoning",
  "Long Run",
  "High Jump",
  "Shot Put",
  "100m Sprint",
];

const TEMP_EXAMS = [
  { name: "GK Test 1", examType: "written_exam", subject: "General Knowledge", totalMarks: 100 },
  { name: "English Test 1", examType: "written_exam", subject: "English", totalMarks: 50 },
  { name: "Tamil Test 1", examType: "written_exam", subject: "Tamil", totalMarks: 50 },
  { name: "Maths Test 1", examType: "written_exam", subject: "Mathematics", totalMarks: 100 },
  { name: "Polity Test 1", examType: "written_exam", subject: "Indian Polity", totalMarks: 50 },
  { name: "Reasoning Test 1", examType: "written_exam", subject: "Reasoning", totalMarks: 50 },
  { name: "1600m Run", examType: "physical_exam", subject: "Long Run", totalMarks: 100 },
  { name: "High Jump", examType: "physical_exam", subject: "High Jump", totalMarks: 50 },
  { name: "Shot Put", examType: "physical_exam", subject: "Shot Put", totalMarks: 50 },
  { name: "100m Sprint", examType: "physical_exam", subject: "100m Sprint", totalMarks: 100 },
];

const TEMP_STUDENTS = [
  {
    studentId: "SPA2025001",
    firstName: "Demo",
    lastName: "Student",
    gender: "male",
    batch: "Batch A",
    mobileNumber: "9876543210",
    email: "student@starpolice.academy",
    loginEmail: "student@starpolice.academy",
    course: "pc",
    residenceType: "Day Scholar",
    admissionDate: "2025-01-15",
  },
  {
    studentId: "SPA2025002",
    firstName: "Rajesh",
    lastName: "Kumar",
    gender: "male",
    batch: "Batch A",
    mobileNumber: "9876543211",
    email: "rajesh.kumar@example.com",
    course: "si",
    residenceType: "Day Scholar",
    admissionDate: "2025-01-15",
  },
  {
    studentId: "SPA2025003",
    firstName: "Priya",
    lastName: "Devi",
    gender: "female",
    batch: "Batch A",
    mobileNumber: "9876543212",
    email: "priya.devi@example.com",
    course: "army",
    residenceType: "Day Scholar",
    admissionDate: "2025-02-01",
  },
  {
    studentId: "SPA2025004",
    firstName: "Arun",
    lastName: "Murugan",
    gender: "male",
    batch: "Batch B",
    mobileNumber: "9876543213",
    email: "arun.murugan@example.com",
    course: "pc",
    residenceType: "Hostel",
    admissionDate: "2025-02-01",
  },
  {
    studentId: "SPA2025005",
    firstName: "Kavitha",
    lastName: "Selvam",
    gender: "female",
    batch: "Batch B",
    mobileNumber: "9876543214",
    email: "kavitha.selvam@example.com",
    course: "si",
    residenceType: "Hostel",
    admissionDate: "2025-02-01",
  },
];

const TEMP_LEADS = [
  {
    leadId: "SPA-LEAD-2026-0001",
    firstName: "Vikram",
    middleName: "",
    lastName: "Rajan",
    email: "vikram.rajan@example.com",
    mobileNumber: "9001001001",
    city: "Chennai",
    state: "Tamil Nadu",
    course: "pc",
    batch: "Morning",
    source: "instagram",
    status: "new",
    createdAt: "2026-10-01T10:30:00.000Z",
  },
  {
    leadId: "SPA-LEAD-2026-0002",
    firstName: "Meena",
    middleName: "L",
    lastName: "Sundaram",
    email: "meena.sundaram@example.com",
    mobileNumber: "9001001002",
    city: "Coimbatore",
    state: "Tamil Nadu",
    course: "si",
    batch: "Evening",
    source: "google",
    status: "follow_up",
    followUpNotes: "Called twice; interested in SI batch starting next month.",
    nextFollowUpDate: "2026-10-20",
    createdAt: "2026-10-03T09:15:00.000Z",
  },
  {
    leadId: "SPA-LEAD-2026-0003",
    firstName: "Arjun",
    middleName: "",
    lastName: "Prakash",
    email: "arjun.prakash@example.com",
    mobileNumber: "9001001003",
    city: "Madurai",
    state: "Tamil Nadu",
    course: "army",
    batch: "Weekend",
    source: "facebook",
    status: "new",
    createdAt: "2026-10-05T14:00:00.000Z",
  },
  {
    leadId: "SPA-LEAD-2026-0004",
    firstName: "Divya",
    middleName: "",
    lastName: "Krishnan",
    email: "divya.k@example.com",
    mobileNumber: "9001001004",
    city: "Trichy",
    state: "Tamil Nadu",
    course: "pc",
    batch: "Morning",
    source: "whatsapp",
    status: "follow_up",
    followUpNotes: "Parent will visit campus on Saturday.",
    nextFollowUpDate: "2026-10-18",
    createdAt: "2026-10-07T11:45:00.000Z",
  },
  {
    leadId: "SPA-LEAD-2026-0005",
    firstName: "Suresh",
    middleName: "K",
    lastName: "Babu",
    email: "",
    mobileNumber: "9001001005",
    city: "Salem",
    state: "Tamil Nadu",
    course: "si",
    batch: "Morning",
    source: "youtube",
    status: "new",
    createdAt: "2026-10-08T08:20:00.000Z",
  },
  {
    leadId: "SPA-LEAD-2026-0006",
    firstName: "Karthik",
    middleName: "",
    lastName: "Vel",
    email: "karthik.vel@example.com",
    mobileNumber: "9001001006",
    city: "Chennai",
    state: "Tamil Nadu",
    course: "army",
    batch: "Evening",
    source: "walk_in",
    status: "follow_up",
    followUpNotes: "Needs fee structure PDF.",
    nextFollowUpDate: "2026-10-22",
    createdAt: "2026-10-09T16:30:00.000Z",
  },
  {
    leadId: "SPA-LEAD-2026-0007",
    firstName: "Anitha",
    middleName: "",
    lastName: "Ramesh",
    email: "anitha.r@example.com",
    mobileNumber: "9001001007",
    city: "Erode",
    state: "Tamil Nadu",
    course: "pc",
    batch: "Evening",
    source: "referral",
    status: "rejected",
    rejectionReason: "Joined another coaching center.",
    rejectedAt: "2026-10-10T12:00:00.000Z",
    createdAt: "2026-10-02T13:10:00.000Z",
  },
  {
    leadId: "SPA-LEAD-2026-0008",
    firstName: "Ravi",
    middleName: "",
    lastName: "Chandran",
    email: "ravi.c@example.com",
    mobileNumber: "9001001008",
    city: "Vellore",
    state: "Tamil Nadu",
    course: "si",
    batch: "Weekend",
    source: "phone",
    status: "new",
    createdAt: "2026-10-11T07:50:00.000Z",
  },
  {
    leadId: "SPA-LEAD-2026-0009",
    firstName: "Nandhini",
    middleName: "S",
    lastName: "Iyer",
    email: "nandhini.iyer@example.com",
    mobileNumber: "9001001009",
    city: "Chennai",
    state: "Tamil Nadu",
    course: "army",
    batch: "Morning",
    source: "website",
    status: "follow_up",
    followUpNotes: "Wants physical training schedule.",
    nextFollowUpDate: "2026-10-25",
    createdAt: "2026-10-12T10:05:00.000Z",
  },
  {
    leadId: "SPA-LEAD-2026-0010",
    firstName: "Gopal",
    middleName: "",
    lastName: "Mani",
    email: "gopal.mani@example.com",
    mobileNumber: "9001001010",
    city: "Tirunelveli",
    state: "Tamil Nadu",
    course: "pc",
    batch: "Weekend",
    source: "google",
    status: "new",
    createdAt: "2026-10-14T15:40:00.000Z",
  },
  {
    leadId: "SPA-LEAD-2026-0011",
    firstName: "Harini",
    middleName: "",
    lastName: "Subramanian",
    email: "harini.sub@example.com",
    mobileNumber: "9001001011",
    city: "Chennai",
    state: "Tamil Nadu",
    course: "si",
    batch: "Morning",
    source: "instagram",
    status: "new",
    createdAt: "2026-10-14T18:00:00.000Z",
  },
  {
    leadId: "SPA-LEAD-2026-0012",
    firstName: "Mohammed",
    middleName: "A",
    lastName: "Farook",
    email: "farook.m@example.com",
    mobileNumber: "9001001012",
    city: "Chennai",
    state: "Tamil Nadu",
    course: "army",
    batch: "Evening",
    source: "other",
    status: "follow_up",
    followUpNotes: "Follow up after board exam results.",
    nextFollowUpDate: "2026-10-30",
    createdAt: "2026-10-13T09:30:00.000Z",
  },
];

async function seedLeads(superadminId) {
  let count = 0;
  for (const item of TEMP_LEADS) {
    const { leadId, createdAt, rejectedAt, ...rest } = item;
    const update = {
      ...rest,
      leadId,
      createdBy: superadminId,
      alternateMobileNumber: rest.alternateMobileNumber || "",
      batch: rest.batch || "",
      previousQualification: rest.previousQualification || "",
      careerGoal: rest.careerGoal || "",
      followUpNotes: rest.followUpNotes || "",
      nextFollowUpDate: rest.nextFollowUpDate || "",
      rejectionReason: rest.rejectionReason || "",
      rejectedAt: rejectedAt ? new Date(rejectedAt) : null,
    };

    const lead = await Lead.findOneAndUpdate({ leadId }, update, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });

    if (createdAt) {
      await Lead.updateOne({ _id: lead._id }, { $set: { createdAt: new Date(createdAt) } });
    }
    count += 1;
  }
  console.log(`Seeded ${count} demo leads.`);
}

async function seedSubjects(superadminId) {
  const subjectMap = new Map();
  for (const name of TEMP_SUBJECTS) {
    const subject = await Subject.findOneAndUpdate(
      { name },
      { name, isActive: true, createdBy: superadminId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    subjectMap.set(name, subject);
  }
  console.log(`Seeded ${subjectMap.size} subjects.`);
  return subjectMap;
}

async function seedExams(subjectMap, superadminId) {
  const examMap = new Map();
  for (const item of TEMP_EXAMS) {
    const subject = subjectMap.get(item.subject);
    const exam = await Exam.findOneAndUpdate(
      { name: item.name, examType: item.examType },
      {
        name: item.name,
        examType: item.examType,
        subjectId: subject?._id || null,
        totalMarks: item.totalMarks,
        isActive: true,
        createdBy: superadminId,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    examMap.set(`${item.examType}:${item.name}`, exam);
  }
  console.log(`Seeded ${examMap.size} exams.`);
  return examMap;
}

async function seedStudents(superadminId, studentUserId) {
  const studentMap = new Map();
  for (const item of TEMP_STUDENTS) {
    const update = {
      ...item,
      termsAccepted: true,
      privacyAccepted: true,
      createdBy: superadminId,
    };
    if (item.loginEmail === "student@starpolice.academy" && studentUserId) {
      update.userId = studentUserId;
    }
    const student = await StudentOnboarding.findOneAndUpdate(
      { studentId: item.studentId },
      update,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    studentMap.set(item.studentId, student);
  }
  console.log(`Seeded ${studentMap.size} student onboarding records.`);
  return studentMap;
}

async function seedSampleMarks(studentMap, examMap) {
  const demoStudent = studentMap.get("SPA2025001");
  if (!demoStudent) return;

  const sampleMarks = [
    { examKey: "written_exam:GK Test 1", scoredMarks: 72, remarks: "Good effort" },
    { examKey: "written_exam:English Test 1", scoredMarks: 38, remarks: "" },
    { examKey: "written_exam:Tamil Test 1", scoredMarks: 42, remarks: "" },
    { examKey: "physical_exam:1600m Run", scoredMarks: 80, remarks: "Completed in time" },
    { examKey: "physical_exam:High Jump", scoredMarks: 35, remarks: "" },
  ];

  let count = 0;
  for (const mark of sampleMarks) {
    const exam = examMap.get(mark.examKey);
    if (!exam) continue;
    await StudentExamMark.findOneAndUpdate(
      { studentOnboardingId: demoStudent._id, examId: exam._id },
      {
        studentOnboardingId: demoStudent._id,
        examId: exam._id,
        scoredMarks: mark.scoredMarks,
        remarks: mark.remarks,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    count += 1;
  }
  console.log(`Seeded ${count} sample exam marks for demo student.`);
}

async function seed() {
  await connectDB(process.env.MONGODB_URI);

  const password = await bcrypt.hash("superadmin123", 10);
  const superadmin = await User.findOneAndUpdate(
    { email: "superadmin@starpolice.academy" },
    {
      name: "Super Admin",
      email: "superadmin@starpolice.academy",
      password,
      role: "superadmin",
      isActive: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log("Seeded superadmin: superadmin@starpolice.academy / superadmin123");

  const studentPassword = await bcrypt.hash("student123", 10);
  const studentPermissions = [
    "student:dashboard",
    "student:materials",
    "student:messages",
    "student:calendar",
    "student:performance",
  ];
  const studentUser = await User.findOneAndUpdate(
    { email: "student@starpolice.academy" },
    {
      name: "Demo Student",
      email: "student@starpolice.academy",
      password: studentPassword,
      role: "student",
      isActive: true,
      permissions: studentPermissions,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log("Seeded student: student@starpolice.academy / student123");

  const staffPassword = await bcrypt.hash("staff123", 10);
  const staffPermissions = defaultPermissionsForRole("staff");
  await User.findOneAndUpdate(
    { email: "staff@starpolice.academy" },
    {
      name: "Demo Staff",
      email: "staff@starpolice.academy",
      password: staffPassword,
      role: "staff",
      isActive: true,
      permissions: staffPermissions,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log("Seeded staff: staff@starpolice.academy / staff123");

  const subjectMap = await seedSubjects(superadmin._id);
  const examMap = await seedExams(subjectMap, superadmin._id);
  const writtenSubjectIds = [
    subjectMap.get("General Knowledge")?._id,
    subjectMap.get("English")?._id,
    subjectMap.get("Tamil")?._id,
  ].filter(Boolean);

  await User.findOneAndUpdate(
    { email: "staff@starpolice.academy" },
    {
      staffType: "subject",
      subjectIds: writtenSubjectIds,
    }
  );
  console.log("Seeded staff subjects: General Knowledge, English, Tamil");

  const studentMap = await seedStudents(superadmin._id, studentUser._id);
  await seedSampleMarks(studentMap, examMap);
  await seedLeads(superadmin._id);

  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
