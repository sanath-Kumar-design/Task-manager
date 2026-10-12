import React, { useState, useEffect } from 'react'
import { getBaseURL } from '../../utils/api'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import MainPage from '../components/MainPage'
import TaskChat from '../components/TaskChat'

export default function Homepage() {
    const [collaborators, setCollaborators] = useState([]);
    const [selected, setSelected] = useState("My Tasks");
    const [isSidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div>
            <div className="fixed w-full z-50">
                <Header
                    collaborators={collaborators}
                    setCollaborators={setCollaborators}
                    isSidebarOpen={isSidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />
            </div>

            <div className="flex relative pt-16">
                {/* Sidebar */}
                <div
                    className={`fixed left-0 top-16 z-40 h-[calc(100vh-4rem)]
                    w-64 transition-transform duration-200 ease-out
                    ${isSidebarOpen
                            ? "translate-x-0"
                            : "-translate-x-full"
                        }
                    md:translate-x-0`}
                >
                    <Sidebar
                        selected={selected}
                        setSelected={setSelected}
                        setSidebarOpen={setSidebarOpen}
                    />
                </div>


                <div className="min-w-0 flex-1 md:ml-64">
                    <MainPage collaborators={collaborators} selected={selected} />
                </div>
            </div>
        </div>
    );
}
