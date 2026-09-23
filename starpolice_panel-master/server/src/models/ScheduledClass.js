import mongoose from "mongoose";

const scheduledClassSchema = new mongoose.Schema(
  {
    scheduledAt: { type: Date, required: true },
    subject: { type: String, required: true, trim: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", default: null },
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    facultyName: { type: String, default: "" },
    notes: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

scheduledClassSchema.index({ scheduledAt: -1 });

export default mongoose.model("ScheduledClass", scheduledClassSchema);
