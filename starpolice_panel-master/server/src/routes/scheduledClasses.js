import express from "express";
import ScheduledClass from "../models/ScheduledClass.js";
import Subject from "../models/Subject.js";
import User from "../models/User.js";
import StudentOnboarding from "../models/StudentOnboarding.js";
import { authRequired, adminPanelOnly, attachUser, requirePermission } from "../middleware/auth.js";
import { notifyAllStudents, notifyUsers } from "../utils/notifications.js";

const router = express.Router();

const scheduleGuard = [
  authRequired,
  adminPanelOnly,
  attachUser,
  requirePermission("admin:schedule"),
];

function mapScheduledClass(item) {
  const record = item.toObject ? item.toObject() : item;
  return {
    id: record._id.toString(),
    scheduledAt: record.scheduledAt,
    subjectId: record.subjectId ? record.subjectId.toString() : null,
    subjectName: record.subjectName,
    staffId: record.staffId.toString(),
    staffName: record.staffName,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function buildClassMessage({ scheduledAt, subjectName, staffName }) {
  const date = new Date(scheduledAt);
  const dateLabel = date.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeLabel = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return [
    "Star Police Academy — Class Scheduled",
    `Date: ${dateLabel}`,
    `Time: ${timeLabel}`,
    `Subject: ${subjectName}`,
    `Faculty: ${staffName}`,
  ].join("\n");
}

function buildWhatsAppLink(mobileNumber, message) {
  const digits = String(mobileNumber || "").replace(/\D/g, "");
  if (!digits) return null;
  const phone = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

router.get("/", ...scheduleGuard, async (_req, res) => {
  try {
    const records = await ScheduledClass.find().sort({ scheduledAt: -1 }).limit(200);
    res.json(records.map(mapScheduledClass));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", ...scheduleGuard, async (req, res) => {
  try {
    const { scheduledAt, subjectId, staffId } = req.body;
    if (!scheduledAt || !subjectId || !staffId) {
      return res.status(400).json({ message: "Date & time, subject, and faculty are required." });
    }

    const scheduleDate = new Date(scheduledAt);
    if (Number.isNaN(scheduleDate.getTime())) {
      return res.status(400).json({ message: "Invalid date & time." });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found." });
    }

    const staff = await User.findOne({ _id: staffId, role: "staff" });
    if (!staff) {
      return res.status(404).json({ message: "Staff member not found." });
    }

    const record = await ScheduledClass.create({
      scheduledAt: scheduleDate,
      subjectId: subject._id,
      subjectName: subject.name,
      staffId: staff._id,
      staffName: staff.name,
      createdBy: req.user.id,
    });

    const message = buildClassMessage({
      scheduledAt: scheduleDate,
      subjectName: subject.name,
      staffName: staff.name,
    });

    const notificationTitle = "Class Scheduled";
    await notifyAllStudents({
      title: notificationTitle,
      message,
      type: "system",
    });
    await notifyUsers([staff._id], {
      title: notificationTitle,
      message,
      type: "system",
    });

    const students = await StudentOnboarding.find({
      mobileNumber: { $exists: true, $ne: "" },
    }).select("firstName lastName mobileNumber studentId");

    const staffOnboarding = await StudentOnboarding.findOne({ userId: staff._id }).select("mobileNumber");
    const staffMobile = staffOnboarding?.mobileNumber || "";

    const whatsapp = {
      message,
      staff: {
        name: staff.name,
        link: buildWhatsAppLink(staffMobile, message),
      },
      students: students
        .map((student) => ({
          studentId: student.studentId,
          name: [student.firstName, student.lastName].filter(Boolean).join(" "),
          link: buildWhatsAppLink(student.mobileNumber, message),
        }))
        .filter((entry) => Boolean(entry.link)),
    };

    res.status(201).json({
      ...mapScheduledClass(record),
      notificationsSent: true,
      whatsapp,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
