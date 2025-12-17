
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import UserTasks from "./models/UserTasks.js";
import User from "./models/User.js";
import bcrypt from "bcrypt";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from 'cookie-parser';
import { OAuth2Client } from "google-auth-library";
import FriendRequest from "./models/friendRequestSchema.js"
import multer from "multer";
import path from "path";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

dotenv.config();
const app = express();
app.use(cookieParser());
app.use(express.json());

const allowedOrigins = [
    "http://localhost:5173",
    "http://192.168.0.106:5173",
    "https://task-manager-klkv.vercel.app"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Origin", allowedOrigins.includes(req.headers.origin) ? req.headers.origin : "");
    res.header("Access-Control-Allow-Methods", "GET,OPTIONS,POST,PUT,DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
});
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `profile-${Date.now()}${ext}`);
    }
});

const upload = multer({ storage })

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));


app.post("/signUp", async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const normalizedEmail = email.toLowerCase();

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ error: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            firstName,
            lastName,
            email: normalizedEmail,
            password: hashedPassword,
            verified: true,
        });

        await newUser.save();

        const token = jwt.sign(
            { id: newUser._id, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
        });

        res.status(201).json({
            message: "Account created successfully!",
            user: {
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});


app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(400).json({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Wrong password" });
        }

        const token = jwt.sign(
            { id: existingUser._id, email: existingUser.email },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });

        console.log("Login cookie set:", token);

        res.status(200).json({ message: "Login successful" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});



export const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "No token" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid token" });
    }
};


app.post("/username", authMiddleware, async (req, res) => {
    try {
        const { username } = req.body;

        const existingUser = await User.findOne({ username, _id: { $ne: req.userId } });
        if (existingUser) return res.status(400).json({ error: "Username already taken" });


        const user = await User.findByIdAndUpdate(
            req.userId,
            { username },
            { new: true }
        );

        res.json({ message: "Username updated", user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/userInfo", async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "No token found" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("firstName lastName email username profilePic");
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json(user);
    } catch (err) {
        console.error("Error verifying token:", err);
        res.status(401).json({ error: "Invalid token" });
    }
});





app.get("/search-username", async (req, res) => {
    const q = req.query.q;
    if (!q) return res.json([]);

    try {
        const users = await User.find({ username: { $regex: `^${q}`, $options: "i" } })
            .limit(5)
            .select("username profilePic");
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// SEND INVITE

app.post("/send-invite", async (req, res) => {
    const { fromUserId, toUsername } = req.body;

    try {
        const toUser = await User.findOne({ username: toUsername });
        if (!toUser) {
            return res.status(400).json({ message: "User not found" });
        }

        const existingInvite = await FriendRequest.findOne({
            from: fromUserId,
            to: toUser._id,
        });
        if (existingInvite) {
            return res.status(400).json({ message: "Request already sent" });
        }

        const request = await FriendRequest.create({
            from: fromUserId,
            to: toUser._id,
        });

        res.status(201).json({ message: "Invite sent successfully", request });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});


app.get("/friend-requests/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const requests = await FriendRequest.find({ to: userId })
            .populate("from", "username profilePic");
        res.json(requests)
    } catch (err) {
        res.status(500).json({ error: "Server error" })
    }
});


app.post("/accept-request", async (req, res) => {
    const { id } = req.body;
    const request = await FriendRequest.findById(id)

    if (!request) {
        return res.status(400).json({ error: "No request found" })
    }

    if (request.status !== "pending") {
        return res.status(400).json({ error: "No pending request" })
    }

    request.status = "accepted";
    await request.save()
    res.status(200).json({ message: "Accepted" })
})

app.post("/create-task", async (req, res) => {
    const { taskTitle, taskDescription, dueDate, priority, assignedTo, createdBy } = req.body;
    try {
        const newTask = new UserTasks({
            title: taskTitle,
            description: taskDescription,
            dueDate,
            priority,
            assignedTo,
            createdBy,
        })
        await newTask.save()

        return res.status(200).json({ message: "Task Updated" })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error" });
    }
})

app.get("/assignable-users/:userId", async (req, res) => {
    const currentUserId = req.params.userId;

    try {
        const invites = await FriendRequest.find({
            status: "accepted",
            $or: [
                { from: currentUserId },
                { to: currentUserId }
            ]
        }).populate("from to", "username _id");

        const usersToAssign = invites.map(inv =>
            inv.from._id.toString() === currentUserId ? inv.to : inv.from
        );

        const uniqueUsers = [...new Map(usersToAssign.map(u => [u._id.toString(), u])).values()];

        res.json(uniqueUsers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});



app.get("/show-task", async (req, res) => {
    const userId = req.query.userId;

    const tasks = await UserTasks.find({ createdBy: userId })
        .populate("assignedTo", "username profilePic");
    res.json(tasks);
});

app.post("/upload", upload.single("profilePic"), async (req, res) => {
    const { userId } = req.body;
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" })
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    await User.findByIdAndUpdate(userId, { profilePic: fileUrl });
    res.json({ message: "Uploaded successfully", fileUrl });
});

app.delete("/delete-task/:id", async (req, res) => {
    const task = req.params.id;
    try {
        if (!task) {
            return res.status(400).json({ message: "No task Selected" })
        }
        await UserTasks.findByIdAndDelete(task)
        res.json({ message: "Task deleted" })
    } catch (err) {
        console.log(err);
    }
})

app.patch("/completed-task/:id", async (req, res) => {
    try {
        const task = await UserTasks.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        if (task.isCompleted) {
            return res.json({ message: "Task already completed", task });
        }

        task.isCompleted = true;
        await task.save();

        res.json({ message: "Task marked completed", task });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

app.use("/uploads", express.static("uploads"));

app.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged Out Successfully" })
})

app.delete("/delete-account", authMiddleware, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.userId);
        res.clearCookie("token");
        res.status(200).json({ message: "Account deleted" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
})


const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));





