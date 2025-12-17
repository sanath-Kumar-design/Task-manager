import React, { useEffect, useState, useRef } from 'react'
import TaskModal from './TaskModal'
import { useUser } from '../context/UserContext';
import Select from 'react-select';
import { parseISO, isToday, isTomorrow, isYesterday, format } from "date-fns";
import ProfilePic from './helperComponents/profilePic';
import { FaUserCircle } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { MdDeleteForever } from "react-icons/md";
import { getBaseURL } from '../../utils/api';

import { toast } from 'react-toastify';


export default function MainPage({ collaborators, selected }) {



    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taskCard, setTaskCard] = useState([])
    const [filterOptions, setFilterOptions] = useState("priority")
    const [status, setStatus] = useState("status")
    const [selectedTaskTypes, setSelectedTaskTypes] = useState("")
    const [displayedTasks, setDisplayedTasks] = useState([...taskCard]);
    const completedref = useRef(null)
    const overdueref = useRef(null)

    const priorityOptions = [
        { value: 'priority', label: 'Sort By Priority' },
        { value: 'dueDate', label: 'Sort By Due Date' },
    ]

    const statusOptions = [
        { value: 'allTasks', label: 'All Tasks' },
        { value: 'Completed', label: 'Completed' },
        { value: 'Overdue', label: 'Overdue' },
    ]


    const { user } = useUser()

    const handleFilterChange = (selectedOption) => {
        setStatus(selectedOption);

        if (selectedOption.value === "Completed" && completedref.current) {
            const top = completedref.current.getBoundingClientRect().top + window.scrollY;
            const offset = 80;
            window.scrollTo({
                top: top - offset,
                behavior: "smooth"
            });
        } else if (selectedOption.value === "Overdue" && overdueref.current) {
            const top = overdueref.current.getBoundingClientRect().top + window.scrollY;
            const offset = 80;
            window.scrollTo({
                top: top - offset,
                behavior: "smooth"
            });
        }
    }


    // GET TASKS

    useEffect(() => {
        if (!user || !user._id) return;

        const getTasks = async () => {
            try {
                const res = await fetch(`${getBaseURL()}/show-task?userId=${user._id}`, {
                    method: 'GET'
                });
                if (!res.ok) {
                    const text = await res.text();
                    console.error("Error fetching tasks:", text);
                    return;
                }
                const data = await res.json();

                setTaskCard(data);
            } catch (err) {
                console.error("Fetch failed:", err);
            }
        };

        getTasks();
    }, [user]);

    // DELETE TASK

    const deleteTask = async (taskId) => {
        const res = await fetch(`${getBaseURL()}/delete-task/${taskId}`, {
            method: 'DELETE'
        })

        const data = await res.json()
        toast.success(data.message)
        setTaskCard(prev => prev.filter(t => t._id !== taskId));
        setDisplayedTasks(prev => prev.filter(t => t._id !== taskId))
    }


    // COMPLETED TASKS

    const markCompleted = async (taskId) => {
        const res = await fetch(`${getBaseURL()}/completed-task/${taskId}`, {
            method: "PATCH"
        });

        const data = await res.json();
        console.log(data.message);
        toast.success(data.message)


        if (res.ok) {
            setDisplayedTasks(prev =>
                prev.map(t =>
                    t._id === taskId ? { ...t, isCompleted: data.task.isCompleted } : t
                )
            );
        }
    };

    const completedTasks = displayedTasks.filter(task => task.isCompleted);
    const taskOverDue = displayedTasks.filter(task => !task.isCompleted && new Date(task.dueDate) < new Date())


    const openTaskModal = () => setIsModalOpen(true);
    const closeTaskModal = () => setIsModalOpen(false);

    // FORMAT DATE

    function formatDate(dueDateString) {
        if (!dueDateString) {
            return;
        }
        const date = parseISO(dueDateString)
        if (isToday(date)) return "Today";
        if (isTomorrow(date)) return "Tomorrow";
        if (isYesterday(date)) return "Yesterday";

        return format(date, "dd MMM yyy")
    }

    // SORT TASKS

    function sortByPriority(tasks) {
        const priorityRank = { High: 3, Medium: 2, Low: 1 }

        return tasks.slice().sort((a, b) => {
            return priorityRank[b.priority] - priorityRank[a.priority]
        })
    }

    function sortByDueDate(tasks) {
        return tasks.slice().sort((a, b) => {
            return new Date(a.dueDate) - new Date(b.dueDate)
        })
    }

    // FILTER TASKS

    useEffect(() => {
        let filteredTasks = [...taskCard];

        if (filterOptions?.value === "priority") filteredTasks = sortByPriority(filteredTasks);
        else if (filterOptions?.value === "dueDate") filteredTasks = sortByDueDate(filteredTasks);

        filteredTasks = filteredTasks.filter(task => {
            if (!user) return false;
            const assignedIds = (task.assignedTo || []).map(u => u._id.toString());
            if (selected === "My Tasks") {
                return assignedIds.length === 1 && assignedIds.includes(user._id);
            } else {
                return assignedIds.length > 1 || (assignedIds.length === 1 && !assignedIds.includes(user._id));
            }
        });
        setDisplayedTasks(filteredTasks);

    }, [taskCard, filterOptions, selected, user]);




    return (
        <div>
            <TaskModal
                isOpen={isModalOpen}
                onClose={closeTaskModal}
                collaborators={collaborators}
            />
            <main className="flex-1 p-6 border-red-500 ml-0 md:ml-70">
                <div className="max-w-6xl mx-auto bg-[rgb(1,4,9)]">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-100">My Tasks</h1>
                            <p className="text-gray-100 hidden lg:inline-flex">Manage your tasks and collaborate with your team</p>
                        </div>
                        <button onClick={openTaskModal} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center whitespace-nowrap">
                            New Task
                        </button>
                    </div>

                    <div className="bg-[rgb(13,17,23)] border border-gray-500 rounded-lg p-4 mb-6 shadow-sm  w-fit lg:w-full">
                        <div className="flex flex-wrap gap-4">
                            <Select
                                options={priorityOptions}
                                value={filterOptions}
                                onChange={(selectedOption) => setFilterOptions(selectedOption)}
                                placeholder='Select Priority'
                                isSearchable={false}
                            />
                            <Select
                                options={statusOptions}
                                placeholder='Select Status'
                                isSearchable={false}
                                value={status}
                                onChange={handleFilterChange}
                            />
                        </div>
                    </div>

                    <div>
                        <div className='my-4'>
                            <h1 className="text-2xl font-bold text-gray-100">Tasks</h1>
                        </div>

                        {displayedTasks && displayedTasks.filter(task => {
                            if (task.isCompleted) return false;
                            const due = new Date(task.dueDate);
                            due.setHours(0, 0, 0, 0);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return due >= today;
                        }).length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {displayedTasks.filter(task => {
                                    if (task.isCompleted) return false;
                                    const due = new Date(task.dueDate);
                                    due.setHours(0, 0, 0, 0);
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    return due >= today;
                                }).map(task => (
                                    <div key={task._id} className="task-card bg-[rgb(13,17,23)] rounded-lg shadow-sm p-4 priority-high border-gray-500 border">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className={`text-xs px-2 py-1 rounded ${task.priority === "High" ? "bg-red-100 text-red-800" :
                                                task.priority === "Medium" ? "bg-blue-100 text-blue-800" :
                                                    "bg-green-100 text-green-800"
                                                }`}>{`${task.priority} Priority`}</span>

                                            <div className="flex space-x-2">
                                                <MdEdit className='cursor-pointer hover:text-gray-500' />
                                                <div className='cursor-pointer' onClick={() => deleteTask(task._id)}>
                                                    <MdDeleteForever className='text-red-600' />
                                                </div>
                                            </div>
                                        </div>

                                        <h3 className={`font-semibold text-gray-100 mb-2 ${task.isCompleted ? "line-through" : ""}`}>{task.title}</h3>
                                        <p className={`text-gray-600 text-sm mb-3 line-clamp-1 ${task.isCompleted ? "line-through" : ""}`}>{task.description}</p>

                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-sm text-red-600 font-medium">{formatDate(task.dueDate)}</span>
                                            <div className="flex -space-x-2">
                                                {task.assignedTo?.map(u => (
                                                    u.profilePic ? (
                                                        <img key={u._id} src={`${getBaseURL()}${u.profilePic}`} alt={u.username} className='w-8 h-8 rounded-full border-2 border-white' />
                                                    ) : (
                                                        <FaUserCircle key={u._id} className="w-8 h-8 text-gray-400" />
                                                    )
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center text-xs md:text-sm">
                                            <button
                                                onClick={() => markCompleted(task._id)}
                                                className={task.isCompleted ? "text-green-600" : "text-blue-600"}
                                            >
                                                {task.isCompleted ? "Completed" : "Mark as Complete"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className='text-xl text-red-500 font-bold text-center mt-4 border border-gray-200 rounded-2xl py-10'>No Pending Tasks</div>
                        )}
                    </div>



                    <div>
                        <div ref={completedref}>
                            <div className='my-4'>
                                <h1 className="text-2xl font-bold text-gray-100">Completed Tasks</h1>
                            </div>

                            {completedTasks && completedTasks.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {completedTasks.map(task => (
                                        <div key={task._id} className="task-card bg-[rgb(13,17,23)] rounded-lg shadow-sm p-4 priority-high border border-gray-400">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className={`text-xs px-2 py-1 rounded ${task.priority === "High" ? "bg-red-100 text-red-800" :
                                                    task.priority === "Medium" ? "bg-blue-100 text-blue-800" :
                                                        "bg-green-100 text-green-800"
                                                    }`}>{`${task.priority} Priority`}</span>
                                                <div className="flex space-x-2">
                                                    <div className='cursor-pointer' onClick={() => deleteTask(task._id)}>
                                                        <MdDeleteForever className='text-red-600' />
                                                    </div>
                                                </div>
                                            </div>

                                            <h3 className="font-semibold text-gray-100 mb-2 line-through">{task.title}</h3>
                                            <p className="text-gray-600 text-sm mb-3 line-through">{task.description}</p>

                                            <div className="flex justify-between items-center mb-3 ">
                                                <span className="text-sm text-red-600 font-medium">
                                                    {formatDate(task.dueDate)}
                                                </span>
                                                <div className="flex -space-x-2">
                                                    {task.assignedTo?.map(u => (
                                                        u.profilePic ? (
                                                            <img key={u._id} src={`${getBaseURL()}${u.profilePic}`} alt={u.username} className='w-8 h-8 rounded-full border-2 border-white' />
                                                        ) : (
                                                            <FaUserCircle key={u._id} className="w-8 h-8 text-gray-400" />
                                                        )
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <button
                                                    onClick={() => markCompleted(task._id)}
                                                    className={task.isCompleted ? "text-green-600 text-sm font-medium" : "text-blue-600 text-sm font-medium"}
                                                >
                                                    {task.isCompleted ? "Completed" : "Mark as Completed"}
                                                </button>

                                                <button
                                                    onClick={() => reopenTask(task._id)}
                                                    className='text-blue-900 text-sm font-medium hover:text-blue-900'
                                                >
                                                    Re-Open
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className='text-xl text-red-500 font-bold text-center mt-4 border border-gray-200 rounded-2xl py-10'>No Completed Tasks</div>
                            )}
                        </div>

                        <div ref={overdueref}>
                            <div className='my-4'>
                                <h1 className="text-2xl font-bold text-gray-100">OverDue</h1>
                            </div>

                            {taskOverDue && taskOverDue.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {taskOverDue.map(task => (
                                        <div key={task._id} className="task-card bg-[rgb(13,17,23)] rounded-lg shadow-sm p-4 priority-high border border-gray-500">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className={`text-xs px-2 py-1 rounded ${task.priority === "High" ? "bg-red-100 text-red-800" :
                                                    task.priority === "Medium" ? "bg-blue-100 text-blue-800" :
                                                        "bg-green-100 text-green-800"
                                                    }`}>{`${task.priority} Priority`}</span>
                                                <div className="flex space-x-2">
                                                    <div className='cursor-pointer' onClick={() => deleteTask(task._id)}>
                                                        <MdDeleteForever className='text-red-600' />
                                                    </div>
                                                </div>
                                            </div>

                                            <h3 className="font-semibold text-gray-100 mb-2 ">{task.title}</h3>
                                            <p className="text-gray-600 text-sm mb-3 ">{task.description}</p>

                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-sm text-red-600 font-medium">
                                                    {formatDate(task.dueDate)}
                                                </span>
                                                <div className="flex -space-x-2">
                                                    {task.assignedTo?.map(u => (
                                                        u.profilePic ? (
                                                            <img key={u._id} src={`${getBaseURL()}${u.profilePic}`} alt={u.username} className='w-8 h-8 rounded-full border-2 border-white' />
                                                        ) : (
                                                            <FaUserCircle key={u._id} className="w-8 h-8 text-gray-400" />
                                                        )
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <button
                                                    onClick={() => markCompleted(task._id)}
                                                    className={task.isCompleted ? "text-green-600 text-sm font-medium" : "text-blue-600 text-sm font-medium"}
                                                >
                                                    {task.isCompleted ? "Completed" : "Mark as Completed"}
                                                </button>

                                                <button
                                                    onClick={() => reopenTask(task._id)}
                                                    className='text-blue-900 text-sm font-medium hover:text-blue-900'
                                                >
                                                    Re-Open
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className='text-xl text-red-500 font-bold text-center mt-4 border border-gray-200 rounded-2xl py-10'>No Overdues</div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
