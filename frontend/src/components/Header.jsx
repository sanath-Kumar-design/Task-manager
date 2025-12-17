import React, { useState, useEffect, useRef } from 'react'
import { useLocation } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { getBaseURL } from "../../utils/api";
import UserInvitation from './UserInvitation';
import { FiBell } from "react-icons/fi";
import Notifications from './Notifications';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { RiUserSearchFill } from "react-icons/ri";
import ProfilePage from '../Pages/ProfilePage';


export default function Header({ collaborators, setCollaborators }) {

    const { user, setUser } = useUser();
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [friendRequests, setFriendRequests] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null)
    const [isHovering, setIsHovering] = useState(false)
    const dropdownref = useRef(null)
    const location = useLocation()


    const isProfilePage = location.pathname == "/profilePage"
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownref.current && !dropdownref.current.contains(event.target)) {
                setOpenDropdown(null)
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, []);


    const openInvitation = () => setIsInviteOpen(true);
    const closeInvitation = () => setIsInviteOpen(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`${getBaseURL()}/userInfo`, {
                    method: "GET",
                    credentials: "include"
                });

                const data = await res.json();


                if (res.ok) {
                    setUser(data)
                }
            } catch (err) {
                console.log(err);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        if (!user || !user._id) return;

        const fetchFriendRequests = async () => {
            try {
                const res = await fetch(`${getBaseURL()}/friend-requests/${user._id}`);
                const data = await res.json();
                setFriendRequests(data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchFriendRequests();
    }, [user]);



    const inviteNotifications = (friendRequests || [])
        .filter(req => req && req.from)
        .map(req => ({
            id: req._id,
            username: req.from.username,
            message: req.status === "pending"
                ? `${req.from.username} wants to collaborate with you`
                : `You are now in collaboration with ${req.from.username}`,
            status: req.status
        }));


    useEffect(() => {
        if (!user || !user._id || !Array.isArray(friendRequests)) return;

        const acceptedRequests = friendRequests.filter(req =>
            req && req.status === "accepted" && req.from && req.to
        );

        const collabs = acceptedRequests.map(req =>
            req.from._id === user._id ? req.to : req.from
        );

        if (setCollaborators) {
            setCollaborators([...collabs, user]);
        }
    }, [friendRequests, user, setCollaborators]);



    return (
        <div>
            <UserInvitation
                isOpen={isInviteOpen}
                onClose={closeInvitation}
                loggedInUser={user}
            />


            <header className="bg-[rgb(1,4,9)] border-gray-500 border-b shadow-white ">
                <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/homepage">
                            <div className="flex items-center cursor-pointer">
                                <img src="logo.png" alt="PlanIt logo with modern blue gradient design and checkmark symbol" className="h-8 w-8 rounded" />
                                <span className="ml-2 text-xl font-bold text-gray-200">PlanIt</span>
                            </div>
                        </Link>
                        {!isProfilePage && (
                            <div className="hidden lg:flex max-w-2xl mx-4">
                                <div className="relative">
                                    <input type="text" placeholder="Search tasks..." className="text-gray-200  w-full pl-5 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                    <i className="fas fa-search absolute left-3 top-3 text-gray-200"></i>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center space-x-2 " ref={dropdownref}>
                            <div className='flex mr-5 items-center'>
                                <div className="w-5 h-5 relative mr-4"
                                    onMouseEnter={() => setIsHovering(true)}
                                    onMouseLeave={() => setIsHovering(false)}
                                >
                                    <FiBell
                                        className="w-5 h-5 cursor-pointer text-gray-200"
                                        onClick={() => setOpenDropdown(openDropdown === "full" ? null : "full")}
                                    />
                                    <div className="h-2 w-2 bg-red-600 rounded-full absolute top-0 right-0" ></div>
                                    {isHovering && openDropdown !== "full" && (
                                        <div className="absolute border-2 border-gray-300 w-80 top-11 bg-white shadow px-6 py-2 left-1/2 -translate-x-1/2 rounded-lg">
                                            {inviteNotifications.length > 0 ? (
                                                inviteNotifications.map(req => (

                                                    <div
                                                        key={req.id}
                                                        className='py-1 border-b border-gray-200 cursor-pointer hover:bg-gray-100 px-2 rounded-md'
                                                        onClick={() => setOpenDropdown("full")}
                                                    >
                                                        {req.message}
                                                    </div>
                                                ))
                                            ) : (
                                                <div>No Notifications</div>
                                            )}
                                        </div>
                                    )}
                                    <Notifications
                                        className={`border top-10 w-80 absolute transform transition-transform duration-300 ${openDropdown === "full" ? "translate-x-0" : "translate-x-full"
                                            }`}
                                        inviteNotifications={inviteNotifications}
                                    />
                                </div>

                                <div><button onClick={openInvitation} className='hidden  lg:inline-flex px-5 text-white py-1 bg-blue-600 rounded-md mr-10  cursor-pointer'>Invite</button></div>
                                <div className='inline-flex lg:hidden text-blue-500 text-xl font-extrabold' onClick={openInvitation}><RiUserSearchFill /></div>
                            </div>
                            <Link to="/profilePage">
                                <div className="flex items-center space-x-2 cursor-pointer">
                                    <div className='rounded-full h-8 w-8 flex items-center justify-center'>
                                        {user?.profilePic ? (
                                            <img
                                                src={`${getBaseURL()}${user.profilePic}`}
                                                alt="Profile"
                                                className="w-8 h-8 rounded-full"
                                            />
                                        ) : (
                                            <FaUserCircle className='w-8 h-8 text-gray-500' />
                                        )}
                                    </div>
                                    {user && <p className='text-sm md:text-md text-gray-200'>{user.username}</p>}
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>
        </div>
    )
}
