import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import { useParams } from 'react-router-dom';
import { FaArrowLeft } from "react-icons/fa";
import { getBaseURL } from '../../utils/api';


export default function TaskDetails() {
    const [collaborators, setCollaborators] = useState([]);
    const [selected, setSelected] = useState("My Tasks");

    const { id } = useParams();
    const [task, setTask] = useState(null);
    console.log('task id is', id);

    useEffect(() => {
        const fetchTask = async () => {
            const res = await fetch(`${getBaseURL()}/task/${id}`, {
                credentials: "include"
            })
            const data = await res.json()

            setTask(data);


        };
        fetchTask();
    }, [id]);

    useEffect(() => {
        console.log(task);
    }, [task])
    if (!task) return <div>Loading...</div>;

    return (
        <div>
            <div className="fixed w-full z-20">
                <Header
                    collaborators={collaborators}
                    setCollaborators={setCollaborators}
                />
            </div>
            <div className='fixed z-25'>
                <Sidebar />
            </div>
            <div className="flex">


                <div className="ml-64 flex-1 m-15 p-15 text-white">
                    <div>
                        <button className='flex items-center w-fit justify-center gap-3'>
                            <FaArrowLeft />
                            Back to board
                        </button>
                    </div>
                    <div className='mt-5 bg-white text-black p-3 rounded'>
                        <div>
                            <div className='flex items-center gap-3'>
                                <h1 className='font-switzer text-2xl font-semibold'>{task.title}</h1>
                                <div>{task.priority}</div>
                            </div>

                            <p>{task.description}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
