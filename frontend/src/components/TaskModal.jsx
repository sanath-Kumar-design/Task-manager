import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import {
  X,
  CalendarDays,
  Flag,
  Users,
  ListChecks,
  Plus,
  Trash2,
  Sparkles,
  LoaderCircle,
  CheckCircle2,
  FileText,
} from "lucide-react";

import { useUser } from "../context/UserContext";
import { getBaseURL } from "../../utils/api";
import GeminiLogo from "../assets/gemini-color.svg?react";

const selectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "#11141b",
    borderColor: state.isFocused ? "#5385ff" : "#303541",
    borderRadius: "10px",
    minHeight: "44px",
    boxShadow: "none",
    cursor: "pointer",
    "&:hover": {
      borderColor: "#5385ff",
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#1b202a",
    border: "1px solid #303541",
    borderRadius: "10px",
    overflow: "hidden",
    zIndex: 100,
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 110,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#253b69"
      : state.isFocused
        ? "#292f3c"
        : "#1b202a",
    color: "#e5e7eb",
    fontSize: "13px",
    cursor: "pointer",
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#253b69",
    borderRadius: "6px",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "#dbeafe",
    fontSize: "12px",
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#93b4ff",
    ":hover": {
      backgroundColor: "#374f7e",
      color: "#ffffff",
    },
  }),
  input: (base) => ({
    ...base,
    color: "#f3f4f6",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#737b8b",
    fontSize: "13px",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#f3f4f6",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "#858da0",
  }),
};

const inputClass =
  "w-full rounded-xl border border-[#303541] bg-[#11141b] px-3.5 py-3 text-sm text-gray-100 outline-none transition placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10";

const labelClass =
  "mb-2 flex items-center gap-2 text-sm font-medium text-gray-300";

const priorityStyles = {
  Low: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  Medium: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  High: "border-red-500/20 bg-red-500/10 text-red-400",
};

export default function TaskModal({
  allowMultiple = true,
  isOpen,
  onClose,
}) {
  const { user } = useUser();

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Low");
  const [assignedTo, setAssignedTo] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generated, setGenerated] = useState(false);

  // Fetch users available for task assignment.
  useEffect(() => {
    if (!isOpen || !user?._id) return;

    const controller = new AbortController();

    async function fetchAssignableUsers() {
      try {
        const response = await fetch(
          `${getBaseURL()}/assignable-users/${user._id}`,
          {
            credentials: "include",
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Unable to load team members");
        }

        const data = await response.json();
        const users = Array.isArray(data) ? data : [];

        const allUsers = [
          ...users.filter(
            (person) =>
              person?._id &&
              String(person._id) !== String(user._id)
          ),
          user,
        ];

        setCollaborators(allUsers);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Failed to fetch assignable users:", error);
          toast.error("Unable to load team members");
        }
      }
    }

    fetchAssignableUsers();

    return () => controller.abort();
  }, [isOpen, user?._id]);

  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(event) {
      if (event.key === "Escape" && !submitting && !loadingAI) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, submitting, loadingAI]);

  const options = collaborators.map((person) => ({
    value: person._id,
    label:
      String(person._id) === String(user?._id)
        ? `${person.username} (me)`
        : person.username,
  }));

  const addSubtask = () => {
    const title = subtaskInput.trim();

    if (!title) return;

    if (subtasks.length >= 5) {
      toast.info("You can add up to 5 subtasks");
      return;
    }

    setSubtasks((previous) => [
      ...previous,
      {
        id: `${Date.now()}-${previous.length}`,
        text: title,
        done: false,
      },
    ]);

    setSubtaskInput("");
  };

  const handleSubtaskKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addSubtask();
    }
  };

  const removeSubtask = (id) => {
    setSubtasks((previous) =>
      previous.filter((subtask) => subtask.id !== id)
    );
  };

  const handleGenerate = async () => {
    if (!taskTitle.trim()) {
      toast.info("Enter a task title first");
      return;
    }

    setLoadingAI(true);

    try {
      const response = await fetch(
        `${getBaseURL()}/generate-subtasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: taskTitle.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !Array.isArray(data.subtasks)) {
        throw new Error(
          data.message || "Unable to generate subtasks"
        );
      }

      const formatted = data.subtasks
        .slice(0, 5)
        .map((item, index) => ({
          id: `${Date.now()}-${index}`,
          text:
            typeof item === "string"
              ? item
              : item.title || "",
          done: false,
        }))
        .filter((item) => item.text.trim());

      setSubtasks(formatted);
      setGenerated(true);

      if (formatted.length) {
        toast.success("Subtasks generated successfully");
      } else {
        toast.info("No subtasks were generated");
      }
    } catch (error) {
      console.error("Subtask generation failed:", error);
      toast.error(error.message || "Unable to generate subtasks");
    } finally {
      setLoadingAI(false);
    }
  };

  const resetForm = () => {
    setSelectedUsers([]);
    setTaskTitle("");
    setTaskDescription("");
    setDueDate("");
    setPriority("Low");
    setAssignedTo([]);
    setSubtasks([]);
    setSubtaskInput("");
    setGenerated(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user?._id) {
      toast.error("Please sign in before creating a task");
      return;
    }

    if (!taskTitle.trim()) {
      toast.error("Task title is required");
      return;
    }

    setSubmitting(true);

    try {
      const formattedSubTasks = subtasks.map((subtask) => ({
        title: subtask.text,
        isCompleted: subtask.done,
      }));

      const response = await fetch(`${getBaseURL()}/create-task`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskTitle: taskTitle.trim(),
          dueDate,
          priority,
          createdBy: user._id,
          taskDescription: taskDescription.trim(),
          assignedTo,
          subtasks: formattedSubTasks,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create task");
      }

      toast.success(data.message || "Task created successfully");
      resetForm();
      onClose();
    } catch (error) {
      console.error("Task creation failed:", error);
      toast.error(error.message || "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-task-title"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/[0.09] bg-[#151820] shadow-2xl shadow-black/50"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/[0.07] px-5 py-5 sm:px-7">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-400">
              <ListChecks size={22} />
            </div>

            <div>
              <h2
                id="create-task-title"
                className="text-lg font-semibold tracking-tight text-gray-100"
              >
                Create a new task
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Define your task and organize the next steps.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close dialog"
            className="rounded-lg p-2 text-gray-500 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
          >
            <X size={19} />
          </button>
        </div>

        {/* Scrollable form */}
        <form
          id="taskForm"
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 overflow-y-auto"
        >
          <div className="space-y-6 px-5 py-6 sm:px-7">
            {/* Title */}
            <div>
              <label htmlFor="task-title" className={labelClass}>
                <FileText size={15} className="text-gray-500" />
                Task title
                <span className="text-red-400">*</span>
              </label>

              <input
                id="task-title"
                type="text"
                value={taskTitle}
                onChange={(event) => setTaskTitle(event.target.value)}
                placeholder="e.g. Finish dashboard redesign"
                required
                maxLength={150}
                className={inputClass}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="task-description" className={labelClass}>
                Description
                <span className="font-normal text-gray-600">
                  Optional
                </span>
              </label>

              <textarea
                id="task-description"
                value={taskDescription}
                onChange={(event) =>
                  setTaskDescription(event.target.value)
                }
                placeholder="Add details, goals, or additional context..."
                rows={3}
                className={`${inputClass} resize-y leading-6`}
              />
            </div>

            {/* Date and priority */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="task-due-date" className={labelClass}>
                  <CalendarDays size={15} className="text-gray-500" />
                  Due date
                </label>

                <input
                  id="task-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="task-priority" className={labelClass}>
                  <Flag size={15} className="text-gray-500" />
                  Priority
                </label>

                <select
                  id="task-priority"
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                  className={`${inputClass} appearance-none`}
                >
                  <option value="Low">Low priority</option>
                  <option value="Medium">Medium priority</option>
                  <option value="High">High priority</option>
                </select>

                <div className="mt-2">
                  <span
                    className={`inline-flex rounded-md border px-2 py-1 text-[11px] font-medium ${priorityStyles[priority]}`}
                  >
                    {priority} priority
                  </span>
                </div>
              </div>
            </div>

            {/* Assign collaborators */}
            <div>
              <label className={labelClass}>
                <Users size={15} className="text-gray-500" />
                Assign to
                <span className="font-normal text-gray-600">
                  Optional
                </span>
              </label>

              <Select
                options={options}
                isMulti={allowMultiple}
                value={selectedUsers}
                onChange={(selection) => {
                  const users = selection
                    ? Array.isArray(selection)
                      ? selection
                      : [selection]
                    : [];

                  setSelectedUsers(users);
                  setAssignedTo(users.map((person) => person.value));
                }}
                styles={selectStyles}
                menuPortalTarget={
                  typeof document !== "undefined"
                    ? document.body
                    : undefined
                }
                placeholder="Choose team members..."
                noOptionsMessage={() => "No team members available"}
                closeMenuOnSelect={!allowMultiple}
              />
            </div>

            {/* Subtasks */}
            <div className="rounded-xl border border-white/[0.07] bg-[#11141b] p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-200">
                    <ListChecks size={16} className="text-gray-400" />
                    Subtasks
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Break this task into smaller steps.
                  </p>
                </div>

                <span className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 text-xs text-gray-400">
                  {subtasks.length}/5
                </span>
              </div>

              {/* AI generator */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loadingAI || submitting}
                className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-blue-400/20 bg-blue-500/[0.08] px-3 py-3 text-sm font-medium text-blue-300 transition hover:bg-blue-500/[0.14] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingAI ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Generating subtasks...
                  </>
                ) : (
                  <>
                    <Sparkles size={17} />
                    {generated
                      ? "Generate subtasks again"
                      : "Generate subtasks with AI"}
                    <img
                      src={GeminiLogo}
                      alt=""
                      className="h-4 w-4"
                    />
                  </>
                )}
              </button>

              {/* Manual subtask input */}
              <div className="flex gap-2">
                <input
                  value={subtaskInput}
                  onChange={(event) =>
                    setSubtaskInput(event.target.value)
                  }
                  onKeyDown={handleSubtaskKeyDown}
                  placeholder="Add a subtask..."
                  disabled={subtasks.length >= 5}
                  className={`${inputClass} min-w-0`}
                />

                <button
                  type="button"
                  onClick={addSubtask}
                  disabled={
                    !subtaskInput.trim() || subtasks.length >= 5
                  }
                  aria-label="Add subtask"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.04] text-gray-300 transition hover:bg-white/[0.09] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Plus size={19} />
                </button>
              </div>

              {/* Subtask list */}
              {subtasks.length > 0 && (
                <div className="mt-3 space-y-2">
                  {subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="group flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
                    >
                      <CheckCircle2
                        size={16}
                        className="shrink-0 text-gray-600"
                      />

                      <span className="min-w-0 flex-1 break-words text-sm text-gray-300">
                        {subtask.text}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeSubtask(subtask.id)}
                        aria-label={`Remove subtask ${subtask.text}`}
                        className="rounded-md p-1.5 text-gray-600 transition hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {subtasks.length === 0 && (
                <p className="mt-3 text-center text-xs text-gray-600">
                  No subtasks added yet.
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-white/[0.07] bg-[#151820] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <p className="hidden text-xs text-gray-600 sm:block">
              Fields marked * are required.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-xl border border-white/[0.09] px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/[0.05] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting || loadingAI}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <LoaderCircle size={16} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={17} />
                    Create task
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}