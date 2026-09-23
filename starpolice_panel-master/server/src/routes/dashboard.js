import express from "express";
import Upload from "../models/Upload.js";
import Message from "../models/Message.js";
import QuestionPaper from "../models/QuestionPaper.js";
import ScheduledClass from "../models/ScheduledClass.js";
import StaffClassAttendance from "../models/StaffClassAttendance.js";
import StudentAttendance from "../models/StudentAttendance.js";
import { authRequired, adminPanelOnly, attachUser, requirePermission } from "../middleware/auth.js";

const router = express.Router();

function mapRecentUpload(item) {
  return {
    id: item._id.toString(),
    date: item.date,
    title: item.title || "",
    name: item.name,
    category: item.category,
  };
}

router.get("/stats", authRequired, adminPanelOnly, attachUser, requirePermission("admin:dashboard"), async (_req, res) => {
  try {
    const [totalUploads, activeDays, studentMessages, adminReplies, categoryGroups, recentUploads] =
      await Promise.all([
        Upload.countDocuments(),
        Upload.distinct("date"),
        Message.countDocuments({ senderRole: "student" }),
        Message.countDocuments({ senderRole: { $in: ["admin", "superadmin"] } }),
        Upload.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
        Upload.find().sort({ createdAt: -1 }).limit(5).select("date title name category"),
      ]);

    const categoryCounts = categoryGroups.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.json({
      totalUploads,
      activeDays: activeDays.length,
      studentMessages,
      adminReplies,
      categoryCounts,
      recentUploads: recentUploads.map(mapRecentUpload),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/student-stats", authRequired, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Student panel access required." });
    }

    const [materialCount, studyDays, adminMessages, latestUploads] = await Promise.all([
      Upload.countDocuments(),
      Upload.distinct("date"),
      Message.countDocuments({ senderRole: { $in: ["admin", "superadmin"] } }),
      Upload.find().sort({ createdAt: -1 }).limit(6).select("date title name category"),
    ]);

    res.json({
      materialCount,
      studyDays: studyDays.length,
      adminMessages,
      latestUploads: latestUploads.map(mapRecentUpload),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/staff-stats", authRequired, adminPanelOnly, attachUser, async (req, res) => {
  try {
    if (req.currentUser.role !== "staff") {
      return res.status(403).json({ message: "Staff panel access required." });
    }

    const userId = req.currentUser._id;
    const now = new Date();

    const [
      uploadCount,
      questionCount,
      classesAssigned,
      classesAttended,
      attendanceMarked,
      messagesSent,
      recentUploads,
      upcomingClasses,
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
      Upload.find({ uploadedBy: userId }).sort({ createdAt: -1 }).limit(5).select("date title name category"),
      ScheduledClass.find({ facultyId: userId, scheduledAt: { $gte: now } })
        .sort({ scheduledAt: 1 })
        .limit(5)
        .select("scheduledAt subject facultyName"),
    ]);

    const classAttendancePercent =
      classesAssigned > 0 ? Math.round((classesAttended / classesAssigned) * 100) : null;

    res.json({
      uploadCount,
      questionCount,
      classesAssigned,
      classesAttended,
      classAttendancePercent,
      attendanceMarked,
      messagesSent,
      recentUploads: recentUploads.map(mapRecentUpload),
      upcomingClasses: upcomingClasses.map((item) => ({
        id: item._id.toString(),
        scheduledAt: item.scheduledAt,
        subject: item.subject,
        facultyName: item.facultyName,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
