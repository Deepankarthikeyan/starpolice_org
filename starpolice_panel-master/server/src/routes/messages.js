import express from "express";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { authRequired, attachUser } from "../middleware/auth.js";
import { hasAnyPermission } from "../permissions.js";
import { notifyAllUsers, notifyUsers } from "../utils/notifications.js";
import {
  getMessagingContacts,
  resolveMessagePanel,
} from "../services/messagingContacts.js";

const router = express.Router();

function mapMessage(item) {
  return {
    id: item._id.toString(),
    senderId: item.sender?.toString?.() ?? String(item.sender),
    senderRole: item.senderRole,
    senderName: item.senderName,
    senderEmail: item.senderEmail,
    message: item.message,
    channel: item.channel || "group",
    threadStudentId: item.threadStudentId ? item.threadStudentId.toString() : null,
    threadStaffId: item.threadStaffId ? item.threadStaffId.toString() : null,
    threadAdminId: item.threadAdminId ? item.threadAdminId.toString() : null,
    createdAt: item.createdAt,
  };
}

function canViewMessages(user) {
  return (
    user.role === "superadmin" ||
    hasAnyPermission(user, ["admin:messages", "student:messages", "student:dashboard"])
  );
}

function canSendMessages(user, panel) {
  if (user.role === "superadmin") return true;
  if ((panel === "admin" || panel === "staff") && hasAnyPermission(user, ["admin:messages"])) {
    return true;
  }
  if (panel === "student" && hasAnyPermission(user, ["student:messages"])) return true;
  return false;
}

function noStaffThreadFilter() {
  return {
    $or: [{ threadStaffId: null }, { threadStaffId: { $exists: false } }],
  };
}

function isAdminSideRole(role) {
  return role === "admin" || role === "superadmin";
}

function adminPeerThreadFilter(user, adminUserId) {
  return {
    channel: "private",
    $and: [
      {
        $or: [
          { threadAdminId: adminUserId, sender: user._id },
          { threadAdminId: user._id, sender: adminUserId },
        ],
      },
      { $or: [{ threadStudentId: null }, { threadStudentId: { $exists: false } }] },
      { $or: [{ threadStaffId: null }, { threadStaffId: { $exists: false } }] },
    ],
  };
}

function buildUserHistoryFilter(user) {
  const userId = user._id;

  if (user.role === "student") {
    return {
      $or: [
        { channel: "group" },
        {
          channel: "private",
          $or: [{ sender: userId }, { threadStudentId: userId }],
        },
      ],
    };
  }

  if (user.role === "staff") {
    return {
      $or: [
        { channel: "group" },
        {
          channel: "private",
          $or: [{ sender: userId }, { threadStaffId: userId }],
        },
      ],
    };
  }

  return {
    $or: [
      { channel: "group" },
      {
        channel: "private",
        $or: [
          { sender: userId },
          { threadAdminId: userId },
          {
            threadStudentId: { $ne: null },
            $or: [
              { threadAdminId: null },
              { threadAdminId: { $exists: false } },
              { threadAdminId: userId },
            ],
          },
          {
            threadStaffId: { $ne: null },
            threadAdminId: userId,
          },
        ],
      },
    ],
  };
}

function parseHistoryDate(value, endOfDay = false) {
  if (!value || typeof value !== "string") return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const date = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function buildPrivateFilter(user, { studentUserId, staffUserId, adminUserId }) {
  if (adminUserId && user.role === "staff") {
    return {
      channel: "private",
      threadStaffId: user._id,
      threadAdminId: adminUserId,
    };
  }

  if (adminUserId && isAdminSideRole(user.role)) {
    return adminPeerThreadFilter(user, adminUserId);
  }

  if (adminUserId && user.role === "student") {
    return {
      channel: "private",
      threadStudentId: user._id,
      threadAdminId: adminUserId,
      ...noStaffThreadFilter(),
    };
  }

  if (staffUserId && user.role === "student") {
    return {
      channel: "private",
      threadStudentId: user._id,
      threadStaffId: staffUserId,
    };
  }

  if (staffUserId && isAdminSideRole(user.role)) {
    return {
      channel: "private",
      threadStaffId: staffUserId,
      threadAdminId: user._id,
    };
  }

  if (studentUserId) {
    if (user.role === "staff") {
      return {
        channel: "private",
        threadStudentId: studentUserId,
        threadStaffId: user._id,
      };
    }

    if (isAdminSideRole(user.role)) {
      return {
        channel: "private",
        threadStudentId: studentUserId,
        $or: [
          { threadAdminId: null, threadStaffId: null },
          { threadAdminId: { $exists: false }, threadStaffId: { $exists: false } },
          { threadAdminId: user._id },
        ],
      };
    }
  }

  return null;
}

router.get("/contacts", authRequired, attachUser, async (req, res) => {
  try {
    const user = req.currentUser;
    const panel = resolveMessagePanel(user, req.user.panel);

    if (!canViewMessages(user)) {
      return res.status(403).json({ message: "You do not have permission to view message contacts." });
    }

    const scopeParam = req.query.scope;
    const scope =
      scopeParam === "admin" ||
      scopeParam === "staff" ||
      scopeParam === "student" ||
      scopeParam === "all"
        ? scopeParam
        : "all";
    const contacts = await getMessagingContacts(user, panel, scope);
    return res.json(contacts);
  } catch (error) {
    res.status(error.message.includes("Unsupported panel") ? 400 : 500).json({ message: error.message });
  }
});

router.get("/history", authRequired, attachUser, async (req, res) => {
  try {
    const user = req.currentUser;
    if (!canViewMessages(user)) {
      return res.status(403).json({ message: "You do not have permission to view message history." });
    }

    const visibilityFilter = buildUserHistoryFilter(user);
    const filter = { $and: [visibilityFilter] };

    const channelParam = req.query.channel;
    if (channelParam === "group" || channelParam === "private") {
      filter.$and.push({ channel: channelParam });
    }

    const fromDate = parseHistoryDate(req.query.from);
    const toDate = parseHistoryDate(req.query.to, true);
    if (fromDate || toDate) {
      const createdAt = {};
      if (fromDate) createdAt.$gte = fromDate;
      if (toDate) createdAt.$lte = toDate;
      filter.$and.push({ createdAt });
    }

    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    if (search) {
      const pattern = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$and.push({
        $or: [{ message: pattern }, { senderName: pattern }, { senderEmail: pattern }],
      });
    }

    const sortParam = req.query.sort === "asc" ? "asc" : "desc";
    const sortKey = req.query.sortKey === "senderName" ? "senderName" : "createdAt";
    const sortDir = sortParam === "asc" ? 1 : -1;
    const limit = Math.min(Math.max(Number(req.query.limit) || 500, 1), 1000);

    const messages = await Message.find(filter)
      .sort({ [sortKey]: sortDir, createdAt: sortDir })
      .limit(limit);

    res.json(messages.map(mapMessage));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", authRequired, attachUser, async (req, res) => {
  try {
    const user = req.currentUser;
    if (!canViewMessages(user)) {
      return res.status(403).json({ message: "You do not have permission to view messages." });
    }

    const channel = req.query.channel === "private" ? "private" : "group";
    if (channel === "group") {
      const messages = await Message.find({ channel: "group" }).sort({ createdAt: 1 }).limit(200);
      return res.json(messages.map(mapMessage));
    }

    const { studentUserId, staffUserId, adminUserId } = req.query;
    const filter = buildPrivateFilter(user, { studentUserId, staffUserId, adminUserId });

    if (!filter) {
      return res.status(400).json({
        message: "Provide studentUserId, staffUserId, or adminUserId for private messages.",
      });
    }

    if (filter.threadStudentId) {
      const student = await User.findOne({ _id: filter.threadStudentId, role: "student" }).select("_id");
      if (!student) {
        return res.status(404).json({ message: "Student not found." });
      }
    }

    if (filter.threadStaffId) {
      const staff = await User.findOne({ _id: filter.threadStaffId, role: "staff" }).select("_id");
      if (!staff) {
        return res.status(404).json({ message: "Staff member not found." });
      }
    }

    if (filter.threadAdminId) {
      const admin = await User.findOne({
        _id: filter.threadAdminId,
        role: { $in: ["admin", "superadmin"] },
      }).select("_id");
      if (!admin) {
        return res.status(404).json({ message: "Admin not found." });
      }
    }

    const messages = await Message.find(filter).sort({ createdAt: 1 }).limit(200);
    res.json(messages.map(mapMessage));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", authRequired, attachUser, async (req, res) => {
  try {
    const user = req.currentUser;
    const panel = req.user.panel;
    if (!canSendMessages(user, panel)) {
      return res.status(403).json({ message: "You do not have permission to send messages." });
    }

    const { message, channel = "group", studentUserId, staffUserId, adminUserId } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ message: "Message is required." });
    }

    const resolvedChannel = channel === "private" ? "private" : "group";
    let threadStudentId = null;
    let threadStaffId = null;
    let threadAdminId = null;

    if (resolvedChannel === "private") {
      if (user.role === "student") {
        if (adminUserId) {
          const admin = await User.findOne({
            _id: adminUserId,
            role: { $in: ["admin", "superadmin"] },
          }).select("_id");
          if (!admin) {
            return res.status(404).json({ message: "Admin not found." });
          }
          threadStudentId = user._id;
          threadAdminId = admin._id;
        } else if (staffUserId) {
          const staff = await User.findOne({ _id: staffUserId, role: "staff" }).select("_id");
          if (!staff) {
            return res.status(404).json({ message: "Staff member not found." });
          }
          threadStudentId = user._id;
          threadStaffId = staff._id;
        } else {
          return res.status(400).json({ message: "staffUserId or adminUserId is required for private messages." });
        }
      } else if (adminUserId && user.role === "staff") {
        const admin = await User.findOne({
          _id: adminUserId,
          role: { $in: ["admin", "superadmin"] },
        }).select("_id");
        if (!admin) {
          return res.status(404).json({ message: "Admin not found." });
        }
        threadStaffId = user._id;
        threadAdminId = admin._id;
      } else if (staffUserId && isAdminSideRole(user.role)) {
        const staff = await User.findOne({ _id: staffUserId, role: "staff" }).select("_id");
        if (!staff) {
          return res.status(404).json({ message: "Staff member not found." });
        }
        threadStaffId = staff._id;
        threadAdminId = user._id;
      } else if (adminUserId && isAdminSideRole(user.role)) {
        const admin = await User.findOne({
          _id: adminUserId,
          role: { $in: ["admin", "superadmin"] },
        }).select("_id");
        if (!admin) {
          return res.status(404).json({ message: "Admin not found." });
        }
        threadAdminId = admin._id;
      } else if (studentUserId && (isAdminSideRole(user.role) || user.role === "staff")) {
        const student = await User.findOne({ _id: studentUserId, role: "student" }).select("_id");
        if (!student) {
          return res.status(404).json({ message: "Student not found." });
        }
        threadStudentId = student._id;
        if (user.role === "staff") {
          threadStaffId = user._id;
        }
      } else {
        return res.status(400).json({ message: "studentUserId, staffUserId, or adminUserId is required." });
      }
    }

    const entry = await Message.create({
      sender: req.user.id,
      senderRole: req.user.role,
      senderName: req.user.name,
      senderEmail: req.user.email,
      message: message.trim(),
      channel: resolvedChannel,
      threadStudentId,
      threadStaffId,
      threadAdminId,
    });

    if (resolvedChannel === "group") {
      await notifyAllUsers({
        title: "Group Message",
        message: message.trim().slice(0, 80),
        type: "message",
      });
    } else if (threadStaffId && threadAdminId && !threadStudentId) {
      const recipients = [threadStaffId, threadAdminId].filter(
        (id) => id.toString() !== req.user.id.toString()
      );
      await notifyUsers(recipients, {
        title: "Private Message",
        message: `${req.user.name}: ${message.trim().slice(0, 80)}`,
        type: "message",
      });
    } else if (threadStaffId && threadAdminId) {
      await notifyUsers([threadAdminId], {
        title: "Staff Message",
        message: `${req.user.name}: ${message.trim().slice(0, 80)}`,
        type: "message",
      });
    } else if (threadStaffId && threadStudentId) {
      if (user.role === "student") {
        await notifyUsers([threadStaffId], {
          title: "New Student Message",
          message: `${req.user.name}: ${message.trim().slice(0, 80)}`,
          type: "message",
        });
      } else {
        await notifyUsers([threadStudentId], {
          title: "Private Message",
          message: message.trim().slice(0, 80),
          type: "message",
        });
      }
    } else if (threadAdminId && threadStudentId) {
      await notifyUsers([threadAdminId], {
        title: "New Student Message",
        message: `${req.user.name}: ${message.trim().slice(0, 80)}`,
        type: "message",
      });
    } else if (threadStudentId) {
      await notifyUsers([threadStudentId], {
        title: "Private Message",
        message: message.trim().slice(0, 80),
        type: "message",
      });
    }

    res.status(201).json(mapMessage(entry));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
