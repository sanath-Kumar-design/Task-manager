import React, { useState, useEffect } from "react";

const EditTaskModal = ({ onClose, onSave, task }) => {
    const [title, setTitle] = useState(task?.title || "");
    const [description, setDescription] = useState(
        task?.description || ""
    );
    const [priority, setPriority] = useState(
        task?.priority || "Medium"
    );
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setTitle(task?.title || "");
        setDescription(task?.description || "");
        setPriority(task?.priority || "Medium");
    }, [task]);

    const priorities = ["Low", "Medium", "High"];

    const handleSave = async (e) => {
        e.preventDefault();

        if (!title.trim()) return;

        try {
            setSaving(true);
            await onSave({
                title: title.trim(),
                description: description.trim(),
                priority,
            });
        } finally {
            setSaving(false);
        }
    };

    const priorityStyles = {
        Low: priority === "Low"
            ? "border-emerald-500 bg-emerald-500/15 text-emerald-300"
            : "border-white/10 text-gray-400 hover:border-emerald-500/50",
        Medium: priority === "Medium"
            ? "border-amber-500 bg-amber-500/15 text-amber-300"
            : "border-white/10 text-gray-400 hover:border-amber-500/50",
        High: priority === "High"
            ? "border-rose-500 bg-rose-500/15 text-rose-300"
            : "border-white/10 text-gray-400 hover:border-rose-500/50",
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <form
                onSubmit={handleSave}
                className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#121a2b] p-5 shadow-2xl sm:p-7"
            >
                {/* Header */}
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-white">
                            Edit Task
                        </h2>
                        <p className="mt-1 text-sm text-gray-400">
                            Update your task details.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close modal"
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                {/* Title */}
                <div className="mb-5">
                    <label
                        htmlFor="task-title"
                        className="mb-2 block text-sm font-medium text-gray-300"
                    >
                        Task title <span className="text-rose-400">*</span>
                    </label>

                    <input
                        id="task-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter task title"
                        maxLength={150}
                        required
                        className="w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    />
                </div>

                {/* Description */}
                <div className="mb-5">
                    <label
                        htmlFor="task-description"
                        className="mb-2 block text-sm font-medium text-gray-300"
                    >
                        Description
                    </label>

                    <textarea
                        id="task-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe what needs to be done..."
                        rows={4}
                        className="w-full resize-none rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-gray-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    />
                </div>

                {/* Priority */}
                <div className="mb-7">
                    <label className="mb-3 block text-sm font-medium text-gray-300">
                        Priority
                    </label>

                    <div className="grid grid-cols-3 gap-3">
                        {priorities.map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => setPriority(p)}
                                aria-pressed={priority === p}
                                className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${priorityStyles[p]}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={saving || !title.trim()}
                        className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditTaskModal;