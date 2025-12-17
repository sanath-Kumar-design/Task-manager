import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  username: { type: String },
  password: { type: String },
  googleId: { type: String },
  profilePic: { type: String, default: "" },
  isTestUser: { type: Boolean, default: false },
  invitedUser: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" }
    }
  ]
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;
