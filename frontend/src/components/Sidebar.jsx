import React, { useState } from 'react';
import { MdDashboard } from "react-icons/md";

export default function Sidebar({ selected, setSelected }) {

    const tasks = ["My Tasks", "Team Tasks", "Shared Task"]

    return (
        <div>
            <aside className="hidden md:flex w-64 bg-black/20 backdrop-blur-xs border-r-1 h-[calc(100vh-1rem)] fixed top-16 z-10 border-gray-500">
                <nav className="p-4">
                    <div className="mb-8">
                        <h2 className="text-xs font-semibold text-gray-200 uppercase tracking-wider mb-3">Workspace</h2>
                        {tasks.map((task, i) => (
                            <button
                                key={i}
                                onClick={() => setSelected(task)}
                                className={` w-full  text-md cursor-pointer ${selected === task ? " text-blue-700 bg-blue-50" : "text-gray-200 bg-gray-700"} font-medium py-2 px-3 rounded-lg text-left mb-2`}>
                                {task}
                            </button>
                        ))}
                    </div>
                </nav>
            </aside>
        </div>
    )
}
