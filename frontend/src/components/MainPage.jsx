
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { parseISO, isToday, isTomorrow, isYesterday, format } from "date-fns";
import {
    FaUserCircle,
    FaRegCalendarAlt,
    FaCheckCircle,
    FaClock,
    FaExclamationCircle,
} from "react-icons/fa";
import { MdDeleteForever, MdArrowOutward } from "react-icons/md";
import { IoAddOutline } from "react-icons/io5";
import { toast } from "react-toastify";

import TaskModal from "./TaskModal";
import { useUser } from "../context/UserContext";
import { getBaseURL } from "../../utils/api";

const priorityOptions = [
    { value: "priority", label: "Priority" },
    { value: "dueDate", label: "Due date" },
];

const statusOptions = ["In Progress", "Completed", "Overdue"];

const styles = {
    select: {
        control: (base, state) => ({
            ...base,
            backgroundColor: "#17191f",
            borderColor: state.isFocused ? "#647de8" : "#30333d",
            boxShadow: "none",
            borderRadius: "10px",
            minHeight: "40px",
            cursor: "pointer",
            "&:hover": { borderColor: "#647de8" },
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: "#20232b",
            border: "1px solid #30333d",
            zIndex: 30,
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? "#303746" : "#20232b",
            color: "#e5e7eb",
            cursor: "pointer",
        }),
        singleValue: (base) => ({ ...base, color: "#e5e7eb" }),
        input: (base) => ({ ...base, color: "#e5e7eb" }),
        placeholder: (base) => ({ ...base, color: "#858b98" }),
        indicatorSeparator: () => ({ display: "none" }),
        dropdownIndicator: (base) => ({ ...base, color: "#858b98" }),
    },
};

function formatTaskDate(value) {
    if (!value) return "No due date";

    const date = parseISO(value);
    if (Number.isNaN(date.getTime())) return "Invalid date";
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isYesterday(date)) return "Yesterday";

    return format(date, "dd MMM yyyy");
}

function getPriorityClasses(priority) {
    switch (priority) {
        case "High":
            return "border-red-500/30 bg-red-500/10 text-red-300";
        case "Medium":
            return "border-amber-500/30 bg-amber-500/10 text-amber-300";
        default:
            return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    }
}

export default function MainPage({ collaborators, selected }) {
    const navigate = useNavigate();
    const { user } = useUser();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taskCard, setTaskCard] = useState([]);
    const [filterOptions, setFilterOptions] = useState(priorityOptions[0]);
    const [statusList, setStatusList] = useState("In Progress");

    useEffect(() => {
        if (!user?._id) return;

        const controller = new AbortController();

        async function getTasks() {
            try {
                const response = await fetch(
                    `${getBaseURL()}/show-task?userId=${user._id}`,
                    {
                        method: "GET",
                        credentials: "include",
                        signal: controller.signal,
                    }
                );

                if (!response.ok) {
                    throw new Error("Could not fetch tasks");
                }

                const data = await response.json();
                setTaskCard(Array.isArray(data) ? data : []);
            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error("Fetch tasks failed:", error);
                    toast.error("Unable to load tasks");
                }
            }
        }

        getTasks();

        return () => controller.abort();
    }, [user?._id]);

    async function deleteTask(taskId) {
        try {
            const response = await fetch(
                `${getBaseURL()}/delete-task/${taskId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to delete task");
            }

            setTaskCard((previous) =>
                previous.filter((task) => task._id !== taskId)
            );

            toast.success(data.message || "Task deleted");
        } catch (error) {
            toast.error(error.message || "Unable to delete task");
        }
    }

    async function markCompleted(taskId) {
        try {
            const response = await fetch(
                `${getBaseURL()}/completed-task/${taskId}`,
                {
                    method: "PATCH",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to update task");
            }

            setTaskCard((previous) =>
                previous.map((task) =>
                    task._id === taskId
                        ? {
                            ...task,
                            isCompleted:
                                data.task?.isCompleted ?? true,
                        }
                        : task
                )
            );

            toast.success(data.message || "Task completed");
        } catch (error) {
            toast.error(error.message || "Unable to complete task");
        }
    }

    // Preserve the existing reopen API contract when you connect it.
    // The backend endpoint was not included in the supplied code.
    async function reopenTask(taskId) {
        toast.info(
            "Connect this action to your existing reopen-task API endpoint."
        );
    }

    const filteredTasks = taskCard
        .filter((task) => {
            if (!user?._id) return false;

            const assignedIds = (task.assignedTo || []).map((person) =>
                String(person._id)
            );

            if (selected === "My Tasks") {
                return (
                    assignedIds.length === 1 &&
                    assignedIds.includes(String(user._id))
                );
            }

            return assignedIds.some(
                (id) => id !== String(user._id)
            );
        })
        .sort((a, b) => {
            if (filterOptions.value === "dueDate") {
                return new Date(a.dueDate) - new Date(b.dueDate);
            }

            const rank = { High: 3, Medium: 2, Low: 1 };
            return (rank[b.priority] || 0) - (rank[a.priority] || 0);
        });

    const completedTasks = filteredTasks.filter(
        (task) => task.isCompleted
    );

    const overdueTasks = filteredTasks.filter(
        (task) =>
            !task.isCompleted &&
            task.dueDate &&
            new Date(task.dueDate).setHours(0, 0, 0, 0) <
            new Date().setHours(0, 0, 0, 0)
    );

    const inProgressTasks = filteredTasks.filter(
        (task) =>
            !task.isCompleted &&
            (!task.dueDate ||
                new Date(task.dueDate).setHours(0, 0, 0, 0) >=
                new Date().setHours(0, 0, 0, 0))
    );

    const visibleTasks =
        statusList === "Completed"
            ? completedTasks
            : statusList === "Overdue"
                ? overdueTasks
                : inProgressTasks;


    // Dashboard chart data
    const priorityCounts = {
        High: filteredTasks.filter(
            (task) => task.priority === "High"
        ).length,
        Medium: filteredTasks.filter(
            (task) => task.priority === "Medium"
        ).length,
        Low: filteredTasks.filter(
            (task) => task.priority === "Low"
        ).length,
    };

    const completedCount = completedTasks.length;
    const inProgressCount = inProgressTasks.length;
    const overdueCount = overdueTasks.length;

    const totalStatusTasks =
        completedCount + inProgressCount + overdueCount;

    const completionRate = filteredTasks.length
        ? Math.round(
            (completedCount / filteredTasks.length) * 100
        )
        : 0;

    const upcomingTasks = filteredTasks
        .filter((task) => {
            if (task.isCompleted || !task.dueDate) return false;

            const due = new Date(task.dueDate);
            const today = new Date();

            due.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);

            return due >= today;
        })
        .sort(
            (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
        )
        .slice(0, 5);
    const openTaskModal = () => setIsModalOpen(true);
    const closeTaskModal = () => setIsModalOpen(false);

    const stats = [
        {
            label: "Total tasks",
            value: filteredTasks.length,
            icon: FaRegCalendarAlt,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
        },
        {
            label: "In progress",
            value: inProgressTasks.length,
            icon: FaClock,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
        },
        {
            label: "Completed",
            value: completedTasks.length,
            icon: FaCheckCircle,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
        },
        {
            label: "Overdue",
            value: overdueTasks.length,
            icon: FaExclamationCircle,
            color: "text-red-400",
            bg: "bg-red-500/10",
        },
    ];

    return (
        <main className="min-h-screen bg-[#0e1015] px-4 py-6 text-gray-100 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1440px]">
                <TaskModal
                    isOpen={isModalOpen}
                    onClose={closeTaskModal}
                    collaborators={collaborators}
                />

                <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_270px]">
                    <section className="min-w-0">
                        {/* Page heading */}
                        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="mb-2 mt-4 text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
                                    Workspace / Tasks
                                </p>
                                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                    {selected || "My Tasks"}
                                </h1>
                                <p className="mt-2 text-sm text-gray-400">
                                    Keep track of your work and focus on what matters.
                                </p>
                            </div>

                            <button
                                onClick={openTaskModal}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
                            >
                                <IoAddOutline size={20} />
                                New task
                            </button>
                        </div>

                        {/* Statistics */}
                        <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
                            {stats.map((stat) => {
                                const Icon = stat.icon;

                                return (
                                    <div
                                        key={stat.label}
                                        className="rounded-2xl border border-[#292c35] bg-[#15171d] p-4 transition hover:border-[#3b3f4b]"
                                    >
                                        <div className="mb-4 flex items-center justify-between">
                                            <span className="text-xs text-gray-400 sm:text-sm">
                                                {stat.label}
                                            </span>
                                            <span
                                                className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}
                                            >
                                                <Icon size={16} />
                                            </span>
                                        </div>
                                        <p className="text-2xl font-semibold tracking-tight">
                                            {stat.value}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>




                        {/* Task controls */}
                        <div className="mb-5 rounded-2xl border border-[#292c35] bg-[#15171d] p-3 sm:p-4">
                            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                                <div className="flex flex-wrap gap-1 rounded-xl bg-[#0e1015] p-1">
                                    {statusOptions.map((status) => {
                                        const active = statusList === status;
                                        const count =
                                            status === "Completed"
                                                ? completedTasks.length
                                                : status === "Overdue"
                                                    ? overdueTasks.length
                                                    : inProgressTasks.length;

                                        return (
                                            <button
                                                key={status}
                                                onClick={() => setStatusList(status)}
                                                className={`rounded-lg px-3 py-2 text-xs font-medium transition sm:text-sm ${active
                                                    ? "bg-[#292d38] text-white shadow-sm"
                                                    : "text-gray-400 hover:text-gray-200"
                                                    }`}
                                            >
                                                {status}
                                                <span
                                                    className={`ml-2 ${active ? "text-blue-300" : "text-gray-500"
                                                        }`}
                                                >
                                                    {count}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="w-full md:w-44">
                                    <Select
                                        options={priorityOptions}
                                        value={filterOptions}
                                        onChange={(option) =>
                                            option && setFilterOptions(option)
                                        }
                                        isSearchable={false}
                                        styles={styles.select}
                                        aria-label="Sort tasks"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Task list */}
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-semibold">
                                    {statusList === "In Progress"
                                        ? "Active tasks"
                                        : statusList === "Completed"
                                            ? "Completed tasks"
                                            : "Overdue tasks"}
                                </h2>
                                <p className="mt-1 text-xs text-gray-500">
                                    {visibleTasks.length}{" "}
                                    {visibleTasks.length === 1 ? "task" : "tasks"}
                                </p>
                            </div>
                        </div>



                        {visibleTasks.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                                {visibleTasks.map((task) => (
                                    <article
                                        key={task._id}
                                        className="group flex min-w-0 flex-col rounded-2xl border border-[#292c35] bg-[#15171d] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[#424755] hover:bg-[#191c23]"
                                    >
                                        <div className="mb-4 flex items-start justify-between gap-3">
                                            <span
                                                className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[11px] font-medium ${getPriorityClasses(
                                                    task.priority
                                                )}`}
                                            >
                                                {task.priority || "Low"} priority
                                            </span>

                                            <button
                                                onClick={() => deleteTask(task._id)}
                                                aria-label={`Delete ${task.title}`}
                                                title="Delete task"
                                                className="rounded-lg p-2 text-gray-500 transition hover:bg-red-500/10 hover:text-red-400"
                                            >
                                                <MdDeleteForever size={18} />
                                            </button>
                                        </div>

                                        <h3
                                            className={`mb-2 break-words text-base font-semibold ${task.isCompleted
                                                ? "text-gray-500 line-through"
                                                : "text-gray-100"
                                                }`}
                                        >
                                            {task.title}
                                        </h3>

                                        <p className="mb-5 min-h-[40px] whitespace-pre-line break-words text-sm leading-5 text-gray-400">
                                            {task.description || "No description provided."}
                                        </p>

                                        <div className="mb-5 flex items-center justify-between gap-3 border-t border-[#292c35] pt-4">
                                            <div className="flex min-w-0 items-center gap-2 text-xs text-gray-400">
                                                <FaRegCalendarAlt
                                                    className={
                                                        statusList === "Overdue"
                                                            ? "shrink-0 text-red-400"
                                                            : "shrink-0 text-gray-500"
                                                    }
                                                />
                                                <span>{formatTaskDate(task.dueDate)}</span>
                                            </div>

                                            <div className="flex shrink-0 -space-x-2">
                                                {task.assignedTo?.slice(0, 4).map((person) =>
                                                    person.profilePic ? (
                                                        <img
                                                            key={person._id}
                                                            src={`${getBaseURL()}${person.profilePic}`}
                                                            alt={person.username || "Assignee"}
                                                            title={person.username}
                                                            className="h-7 w-7 rounded-full border-2 border-[#15171d] bg-[#242833] object-cover"
                                                        />
                                                    ) : (
                                                        <FaUserCircle
                                                            key={person._id}
                                                            title={person.username || "Assignee"}
                                                            className="h-7 w-7 rounded-full border-2 border-[#15171d] bg-[#242833] text-gray-500"
                                                        />
                                                    )
                                                )}
                                                {(task.assignedTo?.length || 0) > 4 && (
                                                    <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#15171d] bg-[#292d38] text-[10px] text-gray-300">
                                                        +{task.assignedTo.length - 4}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-auto flex items-center justify-between gap-3">
                                            {task.isCompleted ? (
                                                <button
                                                    onClick={() => reopenTask(task._id)}
                                                    className="text-xs font-medium text-gray-400 transition hover:text-white"
                                                >
                                                    Re-open
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => markCompleted(task._id)}
                                                    className="text-xs font-medium text-emerald-400 transition hover:text-emerald-300"
                                                >
                                                    Mark complete
                                                </button>
                                            )}

                                            <button
                                                onClick={() => navigate(`/task/${task._id}`)}
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-[#343844] px-3 py-2 text-xs font-medium text-gray-300 transition hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-300"
                                            >
                                                View task
                                                <MdArrowOutward size={14} />
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#343844] bg-[#12141a] px-5 py-12 text-center">
                                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#343844] bg-[#1b1e26] text-gray-400">
                                    {statusList === "Completed" ? (
                                        <FaCheckCircle size={23} />
                                    ) : statusList === "Overdue" ? (
                                        <FaExclamationCircle size={23} />
                                    ) : (
                                        <FaRegCalendarAlt size={23} />
                                    )}
                                </div>

                                <h3 className="text-base font-semibold text-gray-200">
                                    {statusList === "Completed"
                                        ? "No completed tasks yet"
                                        : statusList === "Overdue"
                                            ? "You're all caught up"
                                            : "Nothing on your plate"}
                                </h3>

                                <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                                    {statusList === "Completed"
                                        ? "Tasks you finish will appear here."
                                        : statusList === "Overdue"
                                            ? "There are no overdue tasks in this view."
                                            : "Create a task to organize your next steps and keep your work moving."}
                                </p>

                                {statusList === "In Progress" && (
                                    <button
                                        onClick={openTaskModal}
                                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
                                    >
                                        <IoAddOutline size={19} />
                                        Create your first task
                                    </button>
                                )}
                            </div>
                        )}


                        {/* Dashboard analytics */}
                        <div className="mb-7 grid grid-cols-1 gap-5 xl:grid-cols-2 mt-5">

                            {/* Task status chart */}
                            <section className="rounded-2xl border border-[#292c35] bg-[#15171d] p-5">
                                <div className="mb-6">
                                    <h2 className="text-base font-semibold text-gray-100">
                                        Task status
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Distribution of your current workload
                                    </p>
                                </div>

                                <div className="flex flex-col items-center gap-6 sm:flex-row">
                                    <div
                                        className="relative flex h-40 w-40 shrink-0 items-center justify-center rounded-full"
                                        style={{
                                            background: totalStatusTasks
                                                ? `conic-gradient(
                #34d399 0% ${(completedCount / totalStatusTasks) * 100
                                                }%,
                #fbbf24 ${(completedCount / totalStatusTasks) * 100
                                                }% ${((completedCount + inProgressCount) /
                                                    totalStatusTasks) *
                                                100
                                                }%,
                #f87171 ${((completedCount + inProgressCount) /
                                                    totalStatusTasks) *
                                                100
                                                }% 100%
              )`
                                                : "#292c35",
                                        }}
                                    >
                                        <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-[#15171d]">
                                            <span className="text-2xl font-semibold text-white">
                                                {totalStatusTasks}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                Total tasks
                                            </span>
                                        </div>
                                    </div>

                                    <div className="w-full space-y-4">
                                        {[
                                            {
                                                label: "Completed",
                                                count: completedCount,
                                                color: "bg-emerald-400",
                                            },
                                            {
                                                label: "In progress",
                                                count: inProgressCount,
                                                color: "bg-amber-400",
                                            },
                                            {
                                                label: "Overdue",
                                                count: overdueCount,
                                                color: "bg-red-400",
                                            },
                                        ].map((item) => (
                                            <div
                                                key={item.label}
                                                className="flex items-center justify-between gap-3"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`h-2.5 w-2.5 rounded-full ${item.color}`}
                                                    />
                                                    <span className="text-sm text-gray-400">
                                                        {item.label}
                                                    </span>
                                                </div>

                                                <span className="text-sm font-semibold text-gray-200">
                                                    {item.count}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* Priority chart */}
                            <section className="rounded-2xl border border-[#292c35] bg-[#15171d] p-5">
                                <div className="mb-6">
                                    <h2 className="text-base font-semibold text-gray-100">
                                        Priority breakdown
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Tasks grouped by priority level
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {[
                                        {
                                            label: "High",
                                            count: priorityCounts.High,
                                            color: "bg-red-400",
                                        },
                                        {
                                            label: "Medium",
                                            count: priorityCounts.Medium,
                                            color: "bg-amber-400",
                                        },
                                        {
                                            label: "Low",
                                            count: priorityCounts.Low,
                                            color: "bg-emerald-400",
                                        },
                                    ].map((item) => (
                                        <div key={item.label}>
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-sm text-gray-400">
                                                    {item.label}
                                                </span>
                                                <span className="text-sm font-medium text-gray-200">
                                                    {item.count}
                                                </span>
                                            </div>

                                            <div className="h-2.5 overflow-hidden rounded-full bg-[#292c35]">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                                                    style={{
                                                        width: `${filteredTasks.length
                                                            ? (item.count / filteredTasks.length) * 100
                                                            : 0
                                                            }%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 border-t border-[#292c35] pt-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-400">
                                            Overall completion
                                        </span>
                                        <span className="text-sm font-semibold text-blue-400">
                                            {completionRate}%
                                        </span>
                                    </div>

                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#292c35]">
                                        <div
                                            className="h-full rounded-full bg-blue-500 transition-all duration-500"
                                            style={{ width: `${completionRate}%` }}
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Upcoming deadlines */}
                        <section className="mb-7 rounded-2xl border border-[#292c35] bg-[#15171d] p-5">
                            <div className="mb-5 flex items-center justify-between">
                                <div>
                                    <h2 className="text-base font-semibold text-gray-100">
                                        Upcoming deadlines
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Your next five unfinished tasks with due dates
                                    </p>
                                </div>

                                <FaRegCalendarAlt className="text-gray-500" size={20} />
                            </div>

                            {upcomingTasks.length ? (
                                <div className="divide-y divide-[#292c35]">
                                    {upcomingTasks.map((task) => (
                                        <button
                                            key={task._id}
                                            type="button"
                                            onClick={() => navigate(`/task/${task._id}`)}
                                            className="flex w-full items-center justify-between gap-4 py-4 text-left transition hover:bg-white/[0.02]"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-gray-200">
                                                    {task.title}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {formatTaskDate(task.dueDate)}
                                                </p>
                                            </div>

                                            <span
                                                className={`shrink-0 rounded-lg border px-2.5 py-1 text-xs ${getPriorityClasses(
                                                    task.priority
                                                )}`}
                                            >
                                                {task.priority || "Low"}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="py-8 text-center text-sm text-gray-500">
                                    No upcoming deadlines. Create a task with a due date to see it here.
                                </p>
                            )}
                        </section>
                    </section>

                    {/* Profile panel */}
                    <aside className="hidden xl:block">
                        <div className="sticky top-6 space-y-4">
                            <div className="rounded-2xl border border-[#292c35] bg-[#15171d] p-5">
                                <p className="mb-5 text-xs font-medium uppercase tracking-[0.15em] text-gray-500">
                                    Your profile
                                </p>

                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#393e4b] bg-[#222631]">
                                        {user?.profilePic ? (
                                            <img
                                                src={`${getBaseURL()}${user.profilePic}`}
                                                alt="Profile"
                                                className="h-full w-full object-cover"
                                                onError={(event) => {
                                                    event.currentTarget.style.display = "none";
                                                }}
                                            />
                                        ) : (
                                            <FaUserCircle className="h-9 w-9 text-gray-500" />
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-gray-100">
                                            {[user?.firstName, user?.lastName]
                                                .filter(Boolean)
                                                .join(" ") || user?.username || "Your account"}
                                        </p>
                                        <p className="mt-1 break-all text-xs text-gray-500">
                                            {user?.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 border-t border-[#292c35] pt-4">
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-sm text-gray-400">
                                            Total tasks
                                        </span>
                                        <span className="text-sm font-semibold">
                                            {taskCard.length}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-sm text-gray-400">
                                            Completed
                                        </span>
                                        <span className="text-sm font-semibold text-emerald-400">
                                            {taskCard.filter((task) => task.isCompleted).length}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-sm text-gray-400">
                                            Completion rate
                                        </span>
                                        <span className="text-sm font-semibold text-blue-400">
                                            {taskCard.length
                                                ? Math.round(
                                                    (taskCard.filter((task) => task.isCompleted)
                                                        .length /
                                                        taskCard.length) *
                                                    100
                                                )
                                                : 0}
                                            %
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-[#292c35] bg-[#15171d] p-5">
                                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                                    <FaCheckCircle size={16} />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-200">
                                    Stay organized
                                </h3>
                                <p className="mt-2 text-xs leading-5 text-gray-500">
                                    Break your work into manageable tasks and prioritize what
                                    needs your attention first.
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}
