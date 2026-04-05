import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeftLong } from "react-icons/fa6";
import { getBaseURL } from '../../utils/api';
import { MdEdit } from "react-icons/md";
import CircularProgress from '../components/CircularProgress';
console.log("BASE URL:", getBaseURL());
import EditTaskModal from '../components/editTaskModal';
import { Navigate } from 'react-router-dom';
import { CiCircleMinus } from "react-icons/ci";
import DeleteSubTaskModal from '../components/DeleteSubTaskModal';


export default function Homepage() {
    const navigate = useNavigate();
    const [collaborators, setCollaborators] = useState([]);
    const [selected, setSelected] = useState("My Tasks");
    const { id } = useParams()
    const [task, setTask] = useState([]);
    const [assignedUsers, setAssignedUsers] = useState([]);
    const [showInput, setShowInput] = useState(false);
    const [addSubTask, setAddSubTask] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    const [selectedTask, setSelectedTask] = useState(null)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [selectedSubTask, setSelectedSubTask] = useState(null)

    useEffect(() => {
        if (!task?.assignedTo?.length) return;

        const fetchUsers = async () => {
            try {
                const res = await fetch(`${getBaseURL()}/api/users/bulk`, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ ids: task.assignedTo }),
                });

                const data = await res.json();
                setAssignedUsers(data);
                console.log("Assigned users are: ", data);

            } catch (err) {
                console.error(err);
            }
        };

        fetchUsers();
    }, [task]);

    useEffect(() => {
        const fetchTask = async () => {
            const res = await fetch(`${getBaseURL()}/task/${id}`, {
                credentials: "include"
            })
            const data = await res.json()
            console.log(data);

            setTask(data);
        };
        fetchTask();
    }, [id]);

    useEffect(() => {
        console.log(task);
    }, [task])
    if (!task) return <div>Loading...</div>;

    const handleToggle = async (subtaskId) => {
        try {
            setTask((prev) => ({
                ...prev,
                subtasks: prev.subtasks.map((sub) =>
                    sub._id === subtaskId
                        ? { ...sub, isCompleted: !sub.isCompleted }
                        : sub
                ),
            }));

            await fetch(`${getBaseURL()}/tasks/${task._id}/subtasks/${subtaskId}`, {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });

        } catch (err) {
            console.error(err);
        }
    };




    const handleAddSubTask = async () => {
        if (!addSubTask.trim()) return;

        const res = await fetch(`${getBaseURL()}/add-subTasks/${task._id}`, {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ title: addSubTask }),
        });

        if (!res.ok) return;

        const data = await res.json();
        setTask(data);
        setAddSubTask("");
        setShowInput(false);
    };


    const handleSave = async (updatedData) => {
        try {
            const res = await fetch(`${getBaseURL()}/edit-task/${task._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", },
                body: JSON.stringify(updatedData)
            })

            const updatedTask = await res.json();

            setTask(updatedTask)

            setIsOpen(false)

        } catch (error) {
            console.log(error);

        }
    }

    const handleDeleteSubTask = async () => {
        try {
            const res = await fetch(`${getBaseURL()}/deleteSubTask/${selectedSubTask._id}`, {
                method: "DELETE",
                credentials: "include"
            });

            // remove from UI
            const data = await res.json();

            setTask(prev => ({
                ...prev,
                subtasks: prev.subtasks.filter(
                    sub => sub._id !== selectedSubTask._id
                )
            }));

            setIsDeleteOpen(false);
        } catch (error) {
            console.log(error);
        }
    };
    const total = task.subtasks?.length || 0;
    const completed = task.subtasks?.filter(s => s.isCompleted).length || 0;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100)
    return (
        <div>
            <div className="fixed w-full z-99 top-0">
                <Header
                    collaborators={collaborators}
                    setCollaborators={setCollaborators}
                />
            </div>
            {/* <div className='fixed top-0 z-100'>
                <Sidebar selected={selected} setSelected={setSelected} />
            </div> */}
            <div className=" top-10 relative z-10 ">
                <div className="mt-10 flex p-3 task-section w-full justify-center">
                    <div className='max-w-5xl w-full '>
                        <div>
                            <button onClick={() => navigate(-1)} className='flex items-center gap-2 bg-white p-3 rounded-lg text-gray-500 cursor-pointer'>
                                <FaArrowLeftLong />
                                Back to Board
                            </button>

                            {/* Task Header */}

                            <div className='border border-gray-300 rounded-xl p-4'>
                                <div>
                                    <div className='flex items-center justify-between gap-2'>
                                        <div className='flex gap-3 items-center'>
                                            <h1 className='text-xl md:text-2xl'>{task.title}</h1>
                                            <span className={`flex items-center rounded-lg px-2 py-1 text-sm
                                            ${task.priority === "Medium" ? "bg-blue-300 text-blue-700" : ""}
                                            ${task.priority === "High" ? "bg-red-300 text-red-700" : ""}
                                            ${task.priority === "Low" ? "bg-green-300 text-green-700" : ""}
                                            `}>{task.priority}</span>
                                        </div>
                                        <div onClick={() => {
                                            setSelectedTask(task)
                                            setIsOpen(true)
                                        }} className='border border-gray-300 flex gap-2 p-1 items-center rounded px-2 bg-gray-100 text-sm cursor-pointer'>
                                            <MdEdit />
                                            Edit
                                        </div>
                                        {isOpen && <EditTaskModal onClose={() => setIsOpen(false)} onSave={handleSave} task={selectedTask} />}
                                    </div>

                                    <div className='max-w-4xl mt-3 flex flex-col gap-2'>
                                        {task.description}
                                        <span>
                                            {new Date(task.dueDate).toLocaleDateString("en-IN", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className=' mt-10 flex flex-col md:flex-row justify-between gap-10'>
                                <div className='border border-gray-300 max-w-50% w-full p-4 rounded-xl'>
                                    <div className=' flex items-center justify-between mb-5'>
                                        <h2 className='text-gray-500'>SUBTASKS </h2>
                                        <div>
                                            <CircularProgress percentage={percentage} />
                                        </div>
                                    </div>
                                    <div>
                                        {(task?.subtasks || []).map((subtask) => (
                                            <div
                                                key={subtask._id || subtask.title}
                                                className={`flex items-center justify-between gap-2 text-sm leading-10
                                                ${subtask.isCompleted ? "line-through text-gray-400" : ""}`}
                                            >
                                                <div className='flex items-center gap-3'>
                                                    <input
                                                        type="checkbox"
                                                        onChange={() => handleToggle(subtask._id)}
                                                        checked={subtask.isCompleted || false}
                                                        className="w-4 h-4 rounded-full accent-blue-500"
                                                    />
                                                    {subtask.title}
                                                </div>
                                                <CiCircleMinus
                                                    onClick={() => {
                                                        setIsDeleteOpen(true);
                                                        setSelectedSubTask(subtask)
                                                    }}
                                                    className='text-red-500 cursor-pointer hover:text-red-300' />
                                            </div>
                                        ))}
                                        {isDeleteOpen && (
                                            <DeleteSubTaskModal
                                                subtask={selectedSubTask}
                                                onClose={() => setIsDeleteOpen(false)}
                                                onConfirm={handleDeleteSubTask}
                                            />
                                        )}

                                        {showInput ? (
                                            <div className="flex items-center gap-2 m-2">

                                                <input
                                                    type="text"
                                                    placeholder="Enter subtask title"
                                                    onChange={(e) => setAddSubTask(e.target.value)}
                                                    className="border border-gray-400 rounded px-2 py-2 text-sm w-full max-w-[260px] outline-none"
                                                />

                                                <button onClick={handleAddSubTask} className="px-3 py-1 rounded bg-blue-500 text-white cursor-pointer">
                                                    Add
                                                </button>

                                                <button onClick={() => setShowInput(false)} className="px-3 py-1 rounded bg-red-500 text-white cursor-pointer">
                                                    Close
                                                </button>

                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => setShowInput(true)}
                                                className='w-fit px-3 py-1 mt-4 m-2 cursor-pointer hover:bg-gray-200 rounded-lg'>
                                                + Add subtask
                                            </div>
                                        )}

                                    </div>
                                </div>

                                {/* MEMBERS */}

                                <div className='border border-gray-300 rounded-lg w-full p-4'>
                                    <div className='flex justify-between'>
                                        <h2 className='text-gray-500'>MEMBERS</h2>
                                        <span className='mr-5'>+ Add</span>
                                    </div>
                                    <div>
                                        <div className=" flex flex-wrap justify-items-start items-center gap-2 mt-5 ">
                                            {assignedUsers.map(user => (
                                                <div key={user._id} className="flex items-center  gap-1  p-2 px-3 bg-gray-200 rounded  max-w-[150px] w-full line-clamp-1 ">

                                                    {user.profilePic ? (
                                                        <img
                                                            src={`${getBaseURL()}${user.profilePic}`}
                                                            className="w-8 h-8 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full text-blue-600 bg-gray-300 flex items-center justify-center text-sm">
                                                            {user.username[0].toUpperCase()}
                                                        </div>
                                                    )}

                                                    <span className="text-sm">{user.username}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
