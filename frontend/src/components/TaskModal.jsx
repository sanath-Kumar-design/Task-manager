import React, { useState, useEffect } from 'react'
import Select from 'react-select'
import { toast } from 'react-toastify';
import { useUser } from '../context/UserContext';
import { getBaseURL } from '../../utils/api';

export default function TaskModal({ allowMultiple = true, isOpen, onClose}) {
    if (!isOpen) return null;
    const [selectedUsers, setSelectedUsers] = useState([])
    const [taskTitle, setTaskTitle] = useState("")
    const [taskDescription, setTaskDescription] = useState("")
    const [dueDate, setDueDate] = useState("")
    const [priority, setPriority] = useState("Low")
    const [assignedTo, setAssignedTo] = useState([])
    const [collaborators, setCollaborators] = useState([])

    const { user } = useUser();
    const options = (collaborators || [])
        .filter(n => n)
        .map(n => ({
            value: n._id,
            label: user && n._id === user._id ? `${n.username} (me)` : n.username
        }));

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {

            const res = await fetch(`${getBaseURL()}/create-task`, {
                method: 'POST',
                headers: { 'Content-Type': "application/json" },
                body: JSON.stringify({ taskTitle, dueDate, priority, createdBy: user._id, taskDescription, assignedTo })
            })

            const data = await res.json();
            console.log(data.message);

            console.log(data.username);


            if (!res.ok) {
                toast.error("Failed to save task")
            }

            console.log(selectedUsers);


            toast.success("Task Created Succesfull")
        } catch (error) {
            console.log(error);
        }

    }


    useEffect(() => {
        const fetchAssignableUsers = async () => {
            if (!user || !user._id) return;
            try {
                const res = await fetch(`${getBaseURL()}/assignable-users/${user._id}`, {
                    credentials: "include"
                });
                const data = await res.json();
                const dataWithMe = [...data, user];
                console.log(dataWithMe);
                setCollaborators(dataWithMe)

            } catch (err) {
                console.log(err);
            }
        };
        fetchAssignableUsers();
    }, [user]);



    return (
        <div id="taskModal" className="fixed inset-0 bg-white/30 backdrop-blur-md border border-white/30 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Create New Task</h2>
                    <button className="text-gray-400 hover:text-gray-600">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <form id="taskForm" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                            <input onChange={(e) => setTaskTitle(e.target.value)} type="text" required className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea onChange={(e) => setTaskDescription(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows="3"></textarea>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                <input value={dueDate} onChange={(e) => setDueDate(e.target.value)} type="date" className="w-full border border-gray-300 rounded px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2">
                                    <option>Low</option>
                                    <option defaultValue={"Medium"}>Medium</option>
                                    <option>High</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Assign to</label>
                            <Select
                                options={options}
                                isMulti
                                value={selectedUsers}
                                onChange={(selected) => {
                                    setSelectedUsers(selected);
                                    setAssignedTo(selected.map(s => s.value));
                                }}
                                placeholder="Select Team Members"
                            />

                        </div>

                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium">Create Task</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
