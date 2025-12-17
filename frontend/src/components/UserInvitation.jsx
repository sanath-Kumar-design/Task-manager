import React, { useState } from "react";
import { toast } from "react-toastify";
import ProfilePic from "./helperComponents/profilePic";
import { getBaseURL } from "../../utils/api";
export default function UserInvitation({ isOpen, onClose, loggedInUser }) {
  if (!isOpen) return null;

  const [username, setUsername] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const handleChange = async (e) => {

    const value = e.target.value;
    setUsername(value);

    if (!value) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(`${getBaseURL()}/search-username?q=${value}`);
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const sendInvite = async (toUsername) => {
    if (toUsername === loggedInUser.username) {
      alert("You cannot send an invite to yourself!");
      return;
    }

    try {
      console.log("Sending invite with:", {
        fromUserId: loggedInUser._id,
        toUsername: toUsername,

      });
      const res = await fetch(`${getBaseURL()}/send-invite`, {
        method: "POST",
        credentials: "include",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: loggedInUser._id,
          toUsername: toUsername,
        })
      })

      if (res.ok) {
        toast.success("Invitation sent")
      } else {
        console.error("Error sending invite: ", data.message);
        toast.error("Failed to send invite: " + data.message)
      }
    } catch (err) {
      toast.error("Failed to send invite");
    }
  }


  return (
    <div className="fixed top-0 inset-0 z-50 bg-white/30 backdrop-blur-md flex items-center justify-center ">
      <div className="rounded-xl shadow-lg w-full max-w-md p-6 bg-white">
        <h2 className="text-2xl font-bold mb-6 text-center ">
          Invite a Friend/Teammate
        </h2>

        <form className="space-y-5">
          <div>
            <label
              htmlFor="friend-username"
              className="block font-medium mb-2"
            >
              Search by username
            </label>
            <input
              id="friend-username"
              type="text"
              value={username}
              onChange={handleChange}
              placeholder="Type username..."
              className="w-full px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="off"
            />
          </div>

          {suggestions.length > 0 && (
            <ul className="max-h-48 overflow-y-auto bg-gray-50 rounded-md p-2 space-y-2 shadow-md">
              {suggestions.map((user) => (
                <li
                  key={user.username}
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-200 cursor-pointer"
                  onClick={() => {
                    setUsername(user.username);
                    setSuggestions([]);
                  }}
                >
                  <ProfilePic profilePic={user?.profilePic} size={40} className="text-gray-400"/>

                  <span className="flex-1 text-gray-800 font-medium">{user.username}</span>
                  <button
                    onClick={(e) => {
                      sendInvite(user.username);
                    }}
                    className="px-3 py-1 text-sm font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 transition"
                  >
                    Invite
                  </button>
                </li>
              ))}
            </ul>
          )}


          <div className="flex justify-end space-x-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-red-500 border border-gray-600 hover:bg-gray-700 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
