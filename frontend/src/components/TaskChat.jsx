import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { getBaseURL } from "../../utils/api";
import { useUser } from "../context/UserContext";


export default function TaskChat({ taskId, onClose }) {

    const { user } = useUser();

    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const socketRef = useRef(null);

    useEffect(() => {
        if (!taskId) return;

        const socket = io(getBaseURL(), {
            withCredentials: true,
        });

        socketRef.current = socket;

        // Receive new messages in real time
        socket.on("task:message", (newMessage) => {
            setMessages((prev) => {
                const alreadyExists = prev.some(
                    (item) => item._id === newMessage._id
                );

                return alreadyExists
                    ? prev
                    : [...prev, newMessage];
            });
        });

        socket.on("connect_error", (err) => {
            setError(err.message || "Unable to connect to chat");
        });

        // Join this task's chat room after connecting
        socket.on("connect", () => {
            socket.emit("task:join", taskId, (result) => {
                if (!result?.ok) {
                    setError(result?.error || "Unable to join chat");
                } else {
                    setError("");
                }
            });
        });

        // Load previous messages
        const fetchMessages = async () => {
            try {
                const res = await fetch(`${getBaseURL()}/tasks/${taskId}/messages`, {
                    credentials: "include",
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(
                        data.error || "Failed to load messages"
                    );
                }

                setMessages(data);
            } catch (err) {
                setError(err.message || "Failed to load messages");
            }
        };

        fetchMessages();

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [taskId]);


    const handleSendMessage = (e) => {
        e.preventDefault();

        const content = message.trim();
        const socket = socketRef.current;

        if (!content || !socket?.connected || sending) {
            return;
        }

        setSending(true);
        setError("");

        socket.emit(
            "task:send",
            { taskId, content },
            (result) => {
                setSending(false);

                if (!result?.ok) {
                    setError(result?.error || "Failed to send message");
                } else {
                    setMessage("");
                }
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="flex h-[600px] max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#121a2b] shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-white">
                            Task Discussion
                        </h2>
                        <p className="text-xs text-gray-400">
                            Collaborate on this task
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg px-3 py-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                {error && (
                    <div className="border-b border-red-500/20 bg-red-500/10 px-5 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                {/* Messages */}
                <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
                    {messages.length === 0 ? (
                        <div className="flex flex-1 items-center justify-center">
                            <p className="text-sm text-gray-500">
                                No messages yet. Start the conversation!
                            </p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const sender = msg.sender || {};
                            const isOwnMessage = String(sender._id) === String(user?._id);

                            const senderName =
                                sender.username ||
                                `${sender.firstName || ""} ${sender.lastName || ""}`.trim() ||
                                "User";

                            return (
                                <div
                                    key={msg._id}
                                    className={`flex flex-col gap-1 ${isOwnMessage ? "items-end" : "items-start"
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-violet-300">
                                            {isOwnMessage ? "You" : senderName}
                                        </span>

                                        <span className="text-xs text-gray-500">
                                            {msg.createdAt
                                                ? new Date(msg.createdAt).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })
                                                : ""}
                                        </span>
                                    </div>

                                    <div
                                        className={`w-fit max-w-[85%] break-words rounded-xl border px-4 py-3 text-sm ${isOwnMessage
                                                ? "border-violet-500/30 bg-violet-600/20 text-gray-100"
                                                : "border-white/10 bg-[#1b263b] text-gray-200"
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>


                {/* Message Input */}
                <form
                    onSubmit={handleSendMessage}
                    className="flex gap-3 border-t border-white/10 p-4"
                >
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={sending}
                        placeholder="Type a message..."
                        className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-violet-500"
                    />

                    <button
                        type="submit"
                        disabled={sending || !message.trim()}
                        className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {sending ? "Sending..." : "Send"}
                    </button>
                </form>

            </div>
        </div>
    );
}
