import React, { useState, useEffect } from "react";

const EditTaskModal = ({ onClose, onSave, task }) => {
    const [title, setTitle] = useState(task?.title || "");
    const [description, setDescription] = useState(task?.description || "");
    const [priority, setPriority] = useState(task?.priority)

    useEffect(() => {
        console.log(task);
    }, [])

    const handleSave = () => {
        onSave({ title, description, priority })
    }

    const priorities = ["Low", "Medium", "High"]

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
            <div className="bg-white w-[500px] rounded-xl shadow-lg p-6 relative">

                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 text-xl cursor-pointer">
                    ✕
                </button>

                {/* Title */}
                <h2 className="text-xl font-semibold mb-5">Edit Task</h2>

                {/* Title Input */}
                <div className="mb-4">
                    <label className="block text-sm mb-1">Title</label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        type="text"
                        className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter title"
                    />
                </div>

                {/* Description */}
                <div className="mb-4">
                    <label className="block text-sm mb-1">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows="4"
                        className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Enter description"
                    ></textarea>
                </div>

                {/* Priority */}
                <div className="mb-6">
                    <label className="block text-sm mb-2">Priority</label>
                    <div className="flex gap-3">
                        {priorities.map(p => (

                            <div key={p} className="flex gap-3 w-fit ">
                                <button
                                    onClick={() => setPriority(p)}
                                    className={`px-4 py-2 border rounded-lg cursor-pointer text-gray-600
                                ${priority === p ? "bg-blue-500 text-white" : ""}
                                `}>
                                    {p}
                                </button>
                            </div>

                        ))}
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 border rounded-lg text-gray-600 cursor-pointer">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-5 py-2 bg-blue-600 text-white rounded-lg">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditTaskModal;