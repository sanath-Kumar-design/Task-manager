import { useState, useRef, useEffect } from "react";
import { BsSend } from "react-icons/bs";
import { getBaseURL } from "../../utils/api";

export default function TaskChatModel({ open, onClose, taskId, currentTask }) {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState("")

    const chatRef = useRef();

    useEffect(() => {
        function handleClickOutside(event) {
            if (chatRef.current && !chatRef.current.contains(event.target)) {
                onClose();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose])


    const handleSend = async () => {
        if (!input.trim()) return;

        const newMsg = {
            text: input,
            sender: "user"
        };

        setMessages(prev => [...prev, newMsg]);
        setInput("")

        const res = await fetch(`${getBaseURL()}/tasks/${taskId}/ai-chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: [{ role: "user", content: input }],
                task: currentTask   // send task data
            })
        });

        const data = await res.json();

        const aiMsg = {
            text: data.reply,
            sender: "ai"
        };

        setMessages(prev => [...prev, aiMsg]);
    };

    useEffect(() => {
        const saved = localStorage.getItem(`chat-${taskId}`);
        if (saved) {
            setMessages(JSON.parse(saved));
        }
    }, [taskId]);

    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem(`chat-${taskId}`, JSON.stringify(messages));
        }
    }, [messages, taskId]);

    function UserMessage({ text }) {
        return (
            <div className="ml-auto bg-gray-100 p-2 rounded-lg max-w-[70%] break-words w-fit px-5">
                {text}
            </div>
        );
    }

    function AiMessage({ text }) {
        return (
            <div className="mr-auto bg-blue-100 p-2 rounded-lg max-w-[70%] break-words whitespace-pre-wrap w-fit px-5">
                {text}
            </div>
        );
    }
    return (
        <>
            <div ref={chatRef}
                className={`fixed right-5 w-150 h-96 bg-white shadow-xl rounded-2xl flex flex-col border border-gray-300 z-50
      transition-all duration-300 ease-in-out
      ${open ? "bottom-20 opacity-100" : "bottom-[-500px] opacity-0"}`}
            >

                {/* Header */}
                <div className="p-3 border-b border-gray-300 font-semibold flex justify-between bg-wh">
                    Task Chat
                    <button className="cursor-pointer" onClick={onClose}>✖</button>
                </div>

                {/* Messages */}
                <div className="flex-1 p-3 overflow-y-auto space-y-2 text-sm bg-white">

                    {messages.map((msg, index) => (
                        msg.sender === "user"
                            ? <UserMessage key={index} text={msg.text} />
                            : <AiMessage key={index} text={msg.text} />
                    ))}

                </div>

                {/* Input */}
                <div className="p-2 border-t border-gray-300 flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Type..."
                        className="flex-1 border rounded-lg px-2 py-1 text-sm outline-none"
                    />
                    <button onClick={handleSend} className="bg-blue-600 text-white px-3 rounded-lg">
                        <BsSend />
                    </button>
                </div>
            </div>
        </>
    );
}