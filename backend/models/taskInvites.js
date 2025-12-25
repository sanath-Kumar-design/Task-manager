import mongoose from "mongoose";

const taskInviteSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },

    token: {
      type: String,
      required: true,
      unique: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: ["owner", "member"], // flexible, not teacher/student
      default: "member",
    },

    expiresAt: {
      type: Date,
    },

    maxUses: {
      type: Number,
      default: 1,
    },

    usedCount: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const TaskInvite = mongoose.model("TaskInvite", taskInviteSchema);

export default TaskInvite;
