import express from "express";
import User from "../models/User.js";
import Upload from "../models/Upload.js";
import QuestionPaper from "../models/QuestionPaper.js";
import ScheduledClass from "../models/ScheduledClass.js";
import StaffClassAttendance from "../models/StaffClassAttendance.js";
import StudentAttendance from "../models/StudentAttendance.js";
import Message from "../models/Message.js";
import Subject from "../models/Subject.js";
import {
  authRequired,
  adminPanelOnly,
  attachUser,
  requirePermission,
} from "../middleware/auth.js";

const router = express.Router();

const adminGuard = [
  authRequired,
  adminPanelOnly,
  attachUser,
  requirePermission("admin:staff-performance"),
];

function computeActivityScore(metrics) {
  const classScore =
    metrics.classesAssigned > 0
      ? Math.round((metrics.classesAttended / metrics.classesAssigned) * 100)
      : null;
  const uploadScore = Math.min(100, metrics.uploadCount * 10 + metrics.questionCount * 10);
  const attendanceScore = Math.min(100, metrics.attendanceMarked * 2);
  const parts = [classScore, uploadScore, attendanceScore].filter((v) => v !== null && v > 0);
  if (!parts.length) return null;
  return Math.round(parts.reduce((sum, v) => sum + v, 0) / parts.length);
}

async function buildStaffMetrics(userId) {
  const id = userId.toString();
  const now = new Date();

  const [
    uploadCount,
    questionCount,
    classesAssigned,
    classesAttended,
    attendanceMarked,
    messagesSent,
    classAttendanceRecords,
    assignedClasses,
    recentUploads,
  ] = await Promise.all([
    Upload.countDocuments({ uploadedBy: userId }),
    QuestionPaper.countDocuments({ uploadedBy: userId }),
    ScheduledClass.countDocuments({ facultyId: userId }),
    StaffClassAttendance.countDocuments({
      staffUserId: userId,
      status: { $in: ["present", "late"] },
    }),
    StudentAttendance.countDocuments({ markedBy: userId }),
    Message.countDocuments({ sender: userId }),
    StaffClassAttendance.find({ staffUserId: userId }).sort({ createdAt: -1 }),
    ScheduledClass.find({ facultyId: userId }).sort({ scheduledAt: -1 }).limit(50),
    Upload.find({ uploadedBy: userId }).sort({ createdAt: -1 }).limit(10).select("date title name category createdAt"),
  ]);

  const attendanceByClass = new Map(
    classAttendanceRecords.map((record) => [record.scheduledClassId.toString(), record])
  );

  const classHistory = assignedClasses.map((item) => {
    const attendance = attendanceByClass.get(item._id.toString());
    const isPast = new Date(item.scheduledAt) < now;
    return {
      id: item._id.toString(),
      scheduledAt: item.scheduledAt,
      subject: item.subject,
      facultyName: item.facultyName,
      status: attendance?.status || (isPast ? "unmarked" : "upcoming"),
      notes: attendance?.notes || "",
      attendanceId: attendance?._id?.toString() || null,
      isPast,
    };
  });

  const classesMissed = classHistory.filter(
    (item) => item.isPast && (item.status === "absent" || item.status === "unmarked")
  ).length;

  const metrics = {
    uploadCount,
    questionCount,
    classesAssigned,
    classesAttended,
    classesMissed,
    attendanceMarked,
    messagesSent,
    classAttendancePercent:
      classesAssigned > 0 ? Math.round((classesAttended / classesAssigned) * 100) : null,
    activityScore: null,
  };
  metrics.activityScore = computeActivityScore(metrics);

  return {
    metrics,
    classHistory,
    recentUploads: recentUploads.map((item) => ({
      id: item._id.toString(),
      date: item.date,
      title: item.title || "",
      name: item.name,
      category: item.category,
      uploadedAt: item.createdAt,
    })),
  };
}

async function mapStaffSummary(user) {
  const subjectIds = (user.subjectIds || []).map((id) => id.toString());
  const subjects = subjectIds.length
    ? await Subject.find({ _id: { $in: user.subjectIds } }).select("name")
    : [];
  const { metrics } = await buildStaffMetrics(user._id);

  return {
    userId: user._id.toString(),
    name: user.name,
    email: user.email,
    staffType: user.staffType || null,
    subjectNames: subjects.map((s) => s.name),
    isActive: user.isActive,
    ...metrics,
    updatedAt: user.updatedAt,
  };
}

router.get("/staff", ...adminGuard, async (_req, res) => {
  try {
    const staffUsers = await User.find({ role: "staff" }).sort({ name: 1 });
    const summaries = await Promise.all(staffUsers.map(mapStaffSummary));
    res.json(summaries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/me", authRequired, adminPanelOnly, attachUser, async (req, res) => {
  try {
    if (req.currentUser.role !== "staff") {
      return res.status(403).json({ message: "Staff panel access required." });
    }
    const summary = await mapStaffSummary(req.currentUser);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/me/detail", authRequired, adminPanelOnly, attachUser, async (req, res) => {
  try {
    if (req.currentUser.role !== "staff") {
      return res.status(403).json({ message: "Staff panel access required." });
    }
    const summary = await mapStaffSummary(req.currentUser);
    const detail = await buildStaffMetrics(req.currentUser._id);
    res.json({ staff: summary, ...detail });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/by-staff/:userId/detail", ...adminGuard, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.userId, role: "staff" });
    if (!user) {
      return res.status(404).json({ message: "Staff member not found." });
    }
    const summary = await mapStaffSummary(user);
    const detail = await buildStaffMetrics(user._id);
    res.json({ staff: summary, ...detail });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/by-staff/:userId/class-attendance", ...adminGuard, async (req, res) => {
  try {
    const { scheduledClassId, status, notes } = req.body;
    if (!scheduledClassId || !status) {
      return res.status(400).json({ message: "scheduledClassId and status are required." });
    }
    if (!["present", "absent", "late"].includes(status)) {
      return res.status(400).json({ message: "Invalid attendance status." });
    }

    const user = await User.findOne({ _id: req.params.userId, role: "staff" });
    if (!user) {
      return res.status(404).json({ message: "Staff member not found." });
    }

    const scheduledClass = await ScheduledClass.findOne({
      _id: scheduledClassId,
      facultyId: user._id,
    });
    if (!scheduledClass) {
      return res.status(404).json({ message: "Scheduled class not found for this staff member." });
    }

    const record = await StaffClassAttendance.findOneAndUpdate(
      { staffUserId: user._id, scheduledClassId },
      {
        staffUserId: user._id,
        scheduledClassId,
        status,
        notes: notes || "",
        markedBy: req.currentUser._id,
      },
      { upsert: true, new: true }
    );

    const summary = await mapStaffSummary(user);
    const detail = await buildStaffMetrics(user._id);
    res.json({
      attendance: {
        id: record._id.toString(),
        scheduledClassId,
        status: record.status,
        notes: record.notes,
      },
      staff: summary,
      ...detail,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
