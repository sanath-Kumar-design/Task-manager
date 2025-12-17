import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import MainPage from '../components/MainPage'


export default function Homepage() {
    const [collaborators, setCollaborators] = useState([]);
    const [selected, setSelected] = useState("My Tasks");

    return (
            <div>
                <div className="fixed w-full z-20">
                    <Header
                        collaborators={collaborators}
                        setCollaborators={setCollaborators}
                    />
                </div>
                <div className="flex top-10 relative z-10">
                    <Sidebar selected={selected} setSelected={setSelected} />
                    <div className="mt-10 flex-1">
                        <MainPage collaborators={collaborators} selected={selected} />
                    </div>
                </div>
            </div>
    );
}
