import React, { useState, useEffect } from 'react'
import { getBaseURL } from '../../utils/api'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import MainPage from '../components/MainPage'

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

            <div className="flex relative">
                <div className={`fixed top-0 left-0 h-full w-64 bg-gray-900 transform transition-transform duration-300 z-50
                        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>

                    <Sidebar selected={selected} setSelected={setSelected} setSidebarOpen={setSidebarOpen} />

                </div>


                <div className="mt-10 flex-1">
                    <MainPage collaborators={collaborators} selected={selected} />
                </div>
            </div>
        </div>
    );
}
