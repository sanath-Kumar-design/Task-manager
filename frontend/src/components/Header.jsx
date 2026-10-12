import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiBell,
  FiMenu,
  FiHome,
  FiUserPlus,
  FiChevronDown,
} from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";

import { getBaseURL } from "../../utils/api";
import { useUser } from "../context/UserContext";
import UserInvitation from "./UserInvitation";
import Notifications from "./Notifications";

export default function Header({
  collaborators,
  setCollaborators,
  isSidebarOpen,
  setSidebarOpen,
}) {
  const { user, setUser } = useUser();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);

  const dropdownRef = useRef(null);
  const location = useLocation();

  const isHome = location.pathname === "/homepage";

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpenDropdown(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${getBaseURL()}/userInfo`, {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();

        if (res.ok) {
          setUser(data);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    fetchUser();
  }, [setUser]);

  // Fetch collaboration requests
  useEffect(() => {
    if (!user?._id) return;

    const fetchFriendRequests = async () => {
      try {
        const res = await fetch(
          `${getBaseURL()}/friend-requests/${user._id}`
        );

        const data = await res.json();

        if (res.ok && Array.isArray(data)) {
          setFriendRequests(data);
        }
      } catch (err) {
        console.error("Failed to fetch friend requests:", err);
      }
    };

    fetchFriendRequests();
  }, [user?._id]);

  // Prepare notifications
  const inviteNotifications = (friendRequests || [])
    .filter((req) => req?.from)
    .map((req) => ({
      id: req._id,
      username: req.from.username,
      message:
        req.status === "pending"
          ? `${req.from.username} wants to collaborate with you`
          : `You are now in collaboration with ${req.from.username}`,
      status: req.status,
    }));

  // Update collaborators from accepted requests
  useEffect(() => {
    if (
      !user?._id ||
      !Array.isArray(friendRequests) ||
      !setCollaborators
    ) {
      return;
    }

    const acceptedRequests = friendRequests.filter(
      (req) =>
        req &&
        req.status === "accepted" &&
        req.from &&
        req.to
    );

    const collabs = acceptedRequests.map((req) =>
      req.from._id === user._id ? req.to : req.from
    );

    setCollaborators([...collabs, user]);
  }, [friendRequests, user, setCollaborators]);

  const profileImage = user?.profilePic
    ? `${getBaseURL()}${user.profilePic}`
    : null;

  return (
    <>
      <UserInvitation
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        loggedInUser={user}
      />

      <header className="h-16 border-b border-white/[0.08] bg-[#0e1015]/95 text-gray-100 shadow-lg shadow-black/10 backdrop-blur-xl">
        <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Left: navigation and brand */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() =>
                isHome
                  ? setSidebarOpen((prev) => !prev)
                  : null
              }
              aria-label={
                isHome
                  ? isSidebarOpen
                    ? "Close sidebar"
                    : "Open sidebar"
                  : "Go to homepage"
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-gray-300 transition hover:border-white/[0.12] hover:bg-white/[0.07] hover:text-white md:hidden"
            >
              {isHome ? (
                <FiMenu size={20} />
              ) : (
                <Link
                  to="/homepage"
                  className="flex h-full w-full items-center justify-center"
                >
                  <FiHome size={19} />
                </Link>
              )}
            </button>

            <Link
              to="/homepage"
              className="flex items-center gap-2.5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400 ring-1 ring-blue-400/20">
                <span className="text-sm font-bold">T</span>
              </div>

              <div className="hidden sm:block">
                <p className="text-sm font-semibold tracking-tight text-gray-100">
                  TaskFlow
                </p>
                <p className="text-[11px] text-gray-500">
                  Your workspace
                </p>
              </div>
            </Link>
          </div>

          {/* Right: invitations, notifications, profile */}
          <div
            ref={dropdownRef}
            className="flex items-center gap-2 sm:gap-3"
          >
            {/* Invite button */}
            <button
              type="button"
              onClick={() => setIsInviteOpen(true)}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 text-sm font-medium text-white shadow-sm shadow-blue-950/30 transition hover:bg-blue-500 sm:px-4"
            >
              <FiUserPlus size={16} />
              <span className="hidden sm:inline">Invite</span>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenDropdown((prev) =>
                    prev === "full" ? null : "full"
                  )
                }
                aria-label="Notifications"
                aria-expanded={openDropdown === "full"}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition hover:bg-white/[0.06] hover:text-white"
              >
                <FiBell size={20} />

                {inviteNotifications.some(
                  (notification) =>
                    notification.status === "pending"
                ) && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-[#0e1015] bg-blue-400" />
                )}
              </button>

              <Notifications
                className={`absolute right-0 top-12 z-[60] w-[min(20rem,calc(100vw-2rem))] origin-top-right border border-white/10 bg-[#151922] shadow-2xl shadow-black/30 transition duration-200 ${
                  openDropdown === "full"
                    ? "visible translate-y-0 opacity-100"
                    : "invisible -translate-y-2 opacity-0"
                }`}
                inviteNotifications={inviteNotifications}
              />
            </div>

            {/* Profile */}
            <Link
              to="/profilePage"
              className="group flex items-center gap-2 rounded-xl border border-transparent py-1.5 pl-1.5 pr-2 transition hover:border-white/[0.08] hover:bg-white/[0.04] sm:gap-3 sm:pl-2 sm:pr-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/[0.06] ring-1 ring-white/10">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <FaUserCircle
                    size={32}
                    className="text-gray-500"
                  />
                )}
              </div>

              <div className="hidden min-w-0 text-left sm:block">
                <p className="max-w-28 truncate text-sm font-medium text-gray-200 transition group-hover:text-white">
                  {user?.username || "My Account"}
                </p>
                <p className="text-[11px] text-gray-500">
                  View profile
                </p>
              </div>

              <FiChevronDown
                size={14}
                className="hidden text-gray-500 transition group-hover:text-gray-300 sm:block"
              />
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}