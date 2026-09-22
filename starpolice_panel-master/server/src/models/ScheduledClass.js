import mongoose from "mongoose";

const scheduledClassSchema = new mongoose.Schema(
  {
    scheduledAt: { type: Date, required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", default: null },
    subjectName: { type: String, required: true, trim: true },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    staffName: { type: String, required: true, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

scheduledClassSchema.index({ scheduledAt: 1 });

export default mongoose.model("ScheduledClass", scheduledClassSchema);
