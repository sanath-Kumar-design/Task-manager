import mongoose from "mongoose";

const userTaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
  status: { type: String, enum: ["Pending", "Completed", "Overdue"], default: "Pending" },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, {timestamps: true});

export default mongoose.model("UserTask", userTaskSchema);
