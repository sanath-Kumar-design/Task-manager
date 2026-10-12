import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import { getBaseURL } from "../../utils/api";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCheck,
  FaChevronDown,
  FaCircle,
  FaClock,
  FaPlus,
  FaTrash,
  FaUsers,
  FaEdit,
  FaRobot,
  FaListUl,
  FaFlag,
  FaTimes,
  FaSave,
} from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { toast } from "react-toastify";
import CircularProgress from "../components/CircularProgress";
import EditTaskModal from "../components/EditTaskModal";
import DeleteSubTaskModal from "../components/DeleteSubTaskModal";
import TaskChatModel from "../components/TaskChatModel";
import TaskChat from "../components/TaskChat";

const Homepage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [task, setTask] = useState(null);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [collaborators, setCollaborators] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [savingSubtask, setSavingSubtask] = useState(null);
  const [addingSubtask, setAddingSubtask] = useState(false);

  const [showInput, setShowInput] = useState(false);
  const [addSubTask, setAddSubTask] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSubTask, setSelectedSubTask] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [teamChatOpen, setTeamChatOpen] = useState(false);

  // Fetch task
  const fetchTask = useCallback(async () => {
    if (!id) {
      setLoadError("No task ID was provided.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError("");

    try {
      const response = await fetch(`${getBaseURL()}/task/${id}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Unable to load this task.");
      }

      const data = await response.json();

      if (!data || !data._id) {
        throw new Error("Task not found.");
      }

      setTask(data);
    } catch (error) {
      console.error("Failed to fetch task:", error);
      setLoadError(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  // Fetch assigned members
  useEffect(() => {
    let cancelled = false;

    const fetchUsers = async () => {
      const ids = task?.assignedTo;

      if (!Array.isArray(ids) || ids.length === 0) {
        setAssignedUsers([]);
        return;
      }

      try {
        const response = await fetch(`${getBaseURL()}/api/users/bulk`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids }),
        });

        if (!response.ok) {
          throw new Error("Unable to load assigned members.");
        }

        const data = await response.json();

        if (!cancelled) {
          setAssignedUsers(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to fetch assigned users:", error);
          setAssignedUsers([]);
        }
      }
    };

    fetchUsers();

    return () => {
      cancelled = true;
    };
  }, [task?.assignedTo]);

  const handleToggle = async (subtaskId) => {
    if (!task || savingSubtask) return;

    const previousTask = task;

    setSavingSubtask(subtaskId);

    // Optimistic UI update
    setTask((previous) => ({
      ...previous,
      subtasks: (previous.subtasks || []).map((subtask) =>
        subtask._id === subtaskId
          ? { ...subtask, isCompleted: !subtask.isCompleted }
          : subtask
      ),
    }));

    try {
      const response = await fetch(
        `${getBaseURL()}/tasks/${task._id}/subtasks/${subtaskId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Unable to update subtask.");
      }
    } catch (error) {
      console.error("Subtask update failed:", error);
      setTask(previousTask);
      toast.error(error.message || "Unable to update subtask.");
    } finally {
      setSavingSubtask(null);
    }
  };

  const handleAddSubTask = async (event) => {
    event?.preventDefault();

    const title = addSubTask.trim();

    if (!title || !task || addingSubtask) return;

    setAddingSubtask(true);

    try {
      const response = await fetch(
        `${getBaseURL()}/add-subTasks/${task._id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title }),
        }
      );

      if (!response.ok) {
        throw new Error("Unable to add subtask.");
      }

      const updatedTask = await response.json();

      setTask(updatedTask);
      setAddSubTask("");
      setShowInput(false);
      toast.success("Subtask added");
    } catch (error) {
      console.error("Adding subtask failed:", error);
      toast.error(error.message || "Unable to add subtask.");
    } finally {
      setAddingSubtask(false);
    }
  };

  const handleSave = async (updatedData) => {
    if (!task) return;

    try {
      const response = await fetch(
        `${getBaseURL()}/edit-task/${task._id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) {
        throw new Error("Unable to save task changes.");
      }

      const updatedTask = await response.json();

      setTask(updatedTask);
      setIsEditOpen(false);
      toast.success("Task updated");
    } catch (error) {
      console.error("Saving task failed:", error);
      toast.error(error.message || "Unable to update task.");
    }
  };

  const handleDeleteSubTask = async () => {
    if (!selectedSubTask) return;

    try {
      const response = await fetch(
        `${getBaseURL()}/deleteSubTask/${selectedSubTask._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Unable to delete subtask.");
      }

      setTask((previous) => ({
        ...previous,
        subtasks: (previous.subtasks || []).filter(
          (subtask) => subtask._id !== selectedSubTask._id
        ),
      }));

      setIsDeleteOpen(false);
      setSelectedSubTask(null);
      toast.success("Subtask deleted");
    } catch (error) {
      console.error("Deleting subtask failed:", error);
      toast.error(error.message || "Unable to delete subtask.");
    }
  };

  const subtasks = task?.subtasks || [];
  const total = subtasks.length;
  const completed = subtasks.filter((subtask) => subtask.isCompleted).length;
  const percentage =
    total === 0 ? 0 : Math.round((completed / total) * 100);

  const priorityStyles = {
    High: "border-red-400/20 bg-red-400/10 text-red-300",
    Medium: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    Low: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  };

  const priorityStyle =
    priorityStyles[task?.priority] ||
    "border-white/10 bg-white/5 text-slate-300";

  const dueDate = task?.dueDate
    ? new Date(task.dueDate)
    : null;

  const formattedDueDate =
    dueDate && !Number.isNaN(dueDate.getTime())
      ? dueDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      : "No due date";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1020] text-slate-200">
        <Header />
        <div className="flex min-h-[60vh] items-center justify-center gap-3">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-violet-400/30 border-t-violet-400" />
          Loading task...
        </div>
      </div>
    );
  }

  if (loadError || !task) {
    return (
      <div className="min-h-screen bg-[#0b1020] text-slate-100">
        <Header />
        <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-24 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-300">
            <FaListUl size={22} />
          </div>
          <h1 className="text-xl font-semibold">Unable to open task</h1>
          <p className="mt-2 text-sm text-slate-400">
            {loadError || "This task could not be found."}
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={fetchTask}
              className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold hover:bg-violet-500"
            >
              Try again
            </button>
            <button
              onClick={() => navigate(-1)}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm hover:bg-white/5"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0b1020] text-slate-100">
      <div className="fixed top-0 z-40 w-full">
        <Header
          collaborators={collaborators}
          setCollaborators={setCollaborators}
        />
      </div>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-24 sm:px-6 lg:px-8">
        {/* Back navigation */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#121a2b] px-4 py-2.5 text-sm text-slate-300 transition hover:border-white/15 hover:bg-white/[0.05] hover:text-white"
        >
          <FaArrowLeft />
          Back to board
        </button>

        {/* Task details */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#121a2b] p-5 sm:p-7">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <div className="min-w-0 flex-1">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold ${priorityStyle}`}
                >
                  <FaFlag size={10} />
                  {task.priority || "No priority"}
                </span>

                {task.status && (
                  <span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300">
                    {task.status}
                  </span>
                )}
              </div>

              <h1 className="break-words text-2xl font-bold tracking-tight sm:text-3xl">
                {task.title || "Untitled task"}
              </h1>

              <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-slate-400">
                {task.description || "No description provided."}
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm text-slate-400">
                <FaCalendarAlt className="text-violet-300" />
                <span>Due {formattedDueDate}</span>
              </div>
            </div>

            <button
              onClick={() => setIsEditOpen(true)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-200"
            >
              <MdEdit size={18} />
              Edit task
            </button>
          </div>
        </section>

        {/* Progress overview */}
        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Total subtasks"
            value={total}
            icon={<FaListUl />}
          />
          <StatCard
            label="Completed"
            value={completed}
            icon={<FaCheck />}
          />
          <StatCard
            label="Remaining"
            value={total - completed}
            icon={<FaClock />}
          />
        </section>

        {/* Main content */}
        <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
          {/* Subtasks */}
          <section className="min-w-0 rounded-2xl border border-white/[0.08] bg-[#121a2b] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Subtasks</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Break this task into manageable steps.
                </p>
              </div>

              <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center text-white">
                <CircularProgress percentage={percentage} />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-b border-white/[0.07] pb-3 text-xs text-slate-500">
              <span>
                {completed} of {total} completed
              </span>
              <span>{percentage}%</span>
            </div>

            {subtasks.length > 0 ? (
              <div className="mt-2 divide-y divide-white/[0.05]">
                {subtasks.map((subtask) => (
                  <div
                    key={subtask._id || subtask.title}
                    className="group flex items-start gap-3 py-4"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(subtask.isCompleted)}
                      disabled={!subtask._id || savingSubtask !== null}
                      onChange={() => handleToggle(subtask._id)}
                      aria-label={`Mark ${subtask.title} as ${subtask.isCompleted ? "incomplete" : "complete"
                        }`}
                      className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-violet-500 disabled:cursor-not-allowed"
                    />

                    <span
                      className={`min-w-0 flex-1 break-words text-sm leading-6 ${subtask.isCompleted
                        ? "text-slate-500 line-through"
                        : "text-slate-200"
                        }`}
                    >
                      {subtask.title}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSubTask(subtask);
                        setIsDeleteOpen(true);
                      }}
                      aria-label={`Delete ${subtask.title}`}
                      className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-300"
                    >
                      <FaTrash size={13} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.04] text-slate-500">
                  <FaListUl size={17} />
                </div>
                <p className="text-sm font-medium text-slate-300">
                  No subtasks yet
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Add your first step below.
                </p>
              </div>
            )}

            {/* Add subtask */}
            {showInput ? (
              <form
                onSubmit={handleAddSubTask}
                className="mt-4 rounded-xl border border-violet-400/20 bg-violet-500/[0.04] p-3"
              >
                <label
                  htmlFor="new-subtask"
                  className="mb-2 block text-xs font-medium text-slate-300"
                >
                  Subtask title
                </label>

                <input
                  id="new-subtask"
                  type="text"
                  value={addSubTask}
                  onChange={(event) => setAddSubTask(event.target.value)}
                  placeholder="What needs to be done?"
                  autoFocus
                  maxLength={200}
                  className="w-full rounded-lg border border-white/10 bg-[#0b1020] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-500/60"
                />

                <div className="mt-3 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInput(false);
                      setAddSubTask("");
                    }}
                    disabled={addingSubtask}
                    className="rounded-lg px-3 py-2 text-xs text-slate-400 hover:bg-white/[0.05] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!addSubTask.trim() || addingSubtask}
                    className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FaPlus />
                    {addingSubtask ? "Adding..." : "Add subtask"}
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowInput(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-dashed border-white/10 px-4 py-3 text-sm text-slate-400 transition hover:border-violet-400/30 hover:bg-violet-500/[0.05] hover:text-violet-200"
              >
                <FaPlus size={12} />
                Add subtask
              </button>
            )}
          </section>

          {/* Members */}
          <section className="min-w-0 rounded-2xl border border-white/[0.08] bg-[#121a2b] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Members</h2>
                <p className="mt-1 text-sm text-slate-400">
                  People assigned to this task.
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                <FaUsers />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-b border-white/[0.07] pb-3 text-xs text-slate-500">
              <span>Assigned members</span>
              <span>{assignedUsers.length}</span>
            </div>

            {assignedUsers.length > 0 ? (
              <div className="mt-3 space-y-2">
                {assignedUsers.map((user) => {
                  const avatar = user.profilePic
                    ? user.profilePic.startsWith("http")
                      ? user.profilePic
                      : `${getBaseURL()}${user.profilePic}`
                    : null;

                  const username = user.username || "User";

                  return (
                    <div
                      key={user._id}
                      className="flex min-w-0 items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3"
                    >
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={username}
                          className="h-10 w-10 shrink-0 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-sm font-semibold text-violet-200">
                          {username[0]?.toUpperCase() || "U"}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-200">
                          {username}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Task member
                        </p>
                      </div>

                      <FaCircle size={7} className="shrink-0 text-emerald-400" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-center">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.04] text-slate-500">
                  <FaUsers size={17} />
                </div>
                <p className="text-sm font-medium text-slate-300">
                  No assigned members
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  No users are currently assigned to this task.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>


      {/* Floating Team Chat */}
      <button
        type="button"
        onClick={() => setTeamChatOpen(true)}
        aria-label="Open team chat"
        title="Team Chat"
        className="fixed bottom-24 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#1b263b] text-violet-200 shadow-xl transition hover:-translate-y-1 hover:bg-[#263550] sm:bottom-28 sm:right-8"
      >
        <FaUsers size={20} />
      </button>

      {/* Floating AI assistant */}
      <button
        type="button"
        onClick={() => setChatOpen(true)}
        aria-label="Open AI task assistant"
        title="Ask AI about this task"
        className="fixed bottom-6 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-600 text-white shadow-xl shadow-violet-950/40 transition hover:-translate-y-1 hover:bg-violet-500 sm:bottom-8 sm:right-8"
      >
        <FaRobot size={23} />
      </button>

      {/* Modals */}
      {isEditOpen && (
        <EditTaskModal
          onClose={() => setIsEditOpen(false)}
          onSave={handleSave}
          task={task}
        />
      )}

      {isDeleteOpen && selectedSubTask && (
        <DeleteSubTaskModal
          subtask={selectedSubTask}
          onClose={() => {
            setIsDeleteOpen(false);
            setSelectedSubTask(null);
          }}
          onConfirm={handleDeleteSubTask}
        />
      )}

      <TaskChatModel
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        taskId={task._id}
        currentTask={task}
      />

      {teamChatOpen && (
        <TaskChat
          taskId={task._id}
          onClose={() => setTeamChatOpen(false)}
        />
      )}
    </div>
  );
};

function StatCard({ label, value, icon }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-[#121a2b] p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

export default Homepage;