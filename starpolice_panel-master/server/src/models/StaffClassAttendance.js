import mongoose from "mongoose";

const staffClassAttendanceSchema = new mongoose.Schema(
  {
    staffUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    scheduledClassId: { type: mongoose.Schema.Types.ObjectId, ref: "ScheduledClass", required: true },
    status: {
      type: String,
      enum: ["present", "absent", "late"],
      default: "present",
    },
    notes: { type: String, default: "" },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

staffClassAttendanceSchema.index({ staffUserId: 1, scheduledClassId: 1 }, { unique: true });
staffClassAttendanceSchema.index({ staffUserId: 1, createdAt: -1 });

export default mongoose.model("StaffClassAttendance", staffClassAttendanceSchema);
