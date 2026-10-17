import express from "express";
import ScheduledClass from "../models/ScheduledClass.js";
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
    subject: record.subject,
    subjectId: record.subjectId ? record.subjectId.toString() : null,
    facultyId: record.facultyId ? record.facultyId.toString() : null,
    facultyName: record.facultyName || "",
    notes: record.notes || "",
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function formatClassMessage(scheduledClass) {
  const date = new Date(scheduledClass.scheduledAt);
  const dateStr = date.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  return [
    "Star Police Academy — Class Scheduled",
    `Subject: ${scheduledClass.subject}`,
    `Date: ${dateStr}`,
    `Time: ${timeStr}`,
    `Faculty: ${scheduledClass.facultyName || "Staff"}`,
    scheduledClass.notes ? `Notes: ${scheduledClass.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

router.get("/", ...scheduleGuard, async (_req, res) => {
  try {
    const classes = await ScheduledClass.find().sort({ scheduledAt: -1 }).limit(200);
    res.json(classes.map(mapScheduledClass));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", ...scheduleGuard, async (req, res) => {
  try {
    const { scheduledAt, subject, subjectId, facultyId, notes } = req.body;
    if (!scheduledAt || !subject?.trim() || !facultyId) {
      return res.status(400).json({ message: "Date & time, subject, and faculty are required." });
    }

    const faculty = await User.findOne({ _id: facultyId, role: { $in: ["staff", "admin", "superadmin"] } });
    if (!faculty) {
      return res.status(400).json({ message: "Selected faculty member not found." });
    }

    const scheduledClass = await ScheduledClass.create({
      scheduledAt: new Date(scheduledAt),
      subject: subject.trim(),
      subjectId: subjectId || null,
      facultyId: faculty._id,
      facultyName: faculty.name || faculty.email,
      notes: (notes || "").trim(),
      createdBy: req.user.id,
    });

    const notificationMessage = formatClassMessage(scheduledClass);
    await notifyAllStudents({
      title: "Class Scheduled",
      message: `${scheduledClass.subject} on ${new Date(scheduledClass.scheduledAt).toLocaleString("en-IN")}`,
      type: "system",
    });
    await notifyUsers([faculty._id], {
      title: "Class Assigned",
      message: notificationMessage.slice(0, 120),
      type: "system",
    });

    res.status(201).json({
      ...mapScheduledClass(scheduledClass),
      whatsAppMessage: notificationMessage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/whatsapp-broadcast/:id", ...scheduleGuard, async (req, res) => {
  try {
    const scheduledClass = await ScheduledClass.findById(req.params.id);
    if (!scheduledClass) {
      return res.status(404).json({ message: "Scheduled class not found." });
    }

    const message = formatClassMessage(scheduledClass);
    const students = await StudentOnboarding.find({ mobileNumber: { $ne: "" } }).select("mobileNumber firstName lastName");
    const faculty = await User.findById(scheduledClass.facultyId).select("email");

    const studentLinks = students
      .map((student) => {
        const digits = (student.mobileNumber || "").replace(/\D/g, "");
        if (!digits) return null;
        const phone = digits.length === 10 ? `91${digits}` : digits;
        return {
          name: [student.firstName, student.lastName].filter(Boolean).join(" "),
          phone,
          url: `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
        };
      })
      .filter(Boolean);

    let facultyLink = null;
    if (faculty?.email) {
      const staffOnboarding = await StudentOnboarding.findOne({ loginEmail: faculty.email }).select("mobileNumber");
      const digits = (staffOnboarding?.mobileNumber || "").replace(/\D/g, "");
      if (digits) {
        const phone = digits.length === 10 ? `91${digits}` : digits;
        facultyLink = {
          name: scheduledClass.facultyName,
          phone,
          url: `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
        };
      }
    }

    res.json({ message, studentLinks, facultyLink });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
