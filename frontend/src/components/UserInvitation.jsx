import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  FaSearch,
  FaUserPlus,
  FaTimes,
  FaPaperPlane,
  FaUsers,
} from "react-icons/fa";
import { getBaseURL } from "../../utils/api";
import ProfilePic from "./helperComponents/profilePic";

export default function UserInvitation({
  isOpen,
  onClose,
  loggedInUser,
}) {
  const [username, setUsername] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [sendingTo, setSendingTo] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setUsername("");
      setSuggestions([]);
      setSearching(false);
      setSendingTo(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const query = username.trim();

    if (!query) {
      setSuggestions([]);
      setSearching(false);
      return;
    }

    const controller = new AbortController();

    const timeoutId = setTimeout(async () => {
      setSearching(true);

      try {
        const response = await fetch(
          `${getBaseURL()}/search-username?q=${encodeURIComponent(query)}`,
          {
            signal: controller.signal,
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Unable to search users.");
        }

        const data = await response.json();

        setSuggestions(
          Array.isArray(data)
            ? data.filter(
                (person) =>
                  person._id !== loggedInUser?._id &&
                  person.username?.toLowerCase() !==
                    loggedInUser?.username?.toLowerCase()
              )
            : []
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("User search failed:", error);
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setSearching(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [username, isOpen, loggedInUser?._id, loggedInUser?.username]);

  const sendInvite = async (toUsername) => {
    if (!loggedInUser?._id) {
      toast.error("Please sign in to invite someone.");
      return;
    }

    if (
      toUsername?.toLowerCase() ===
      loggedInUser.username?.toLowerCase()
    ) {
      toast.error("You cannot invite yourself.");
      return;
    }

    if (sendingTo) return;

    setSendingTo(toUsername);

    try {
      const response = await fetch(`${getBaseURL()}/send-invite`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromUserId: loggedInUser._id,
          toUsername,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to send invitation.");
      }

      toast.success(`Invitation sent to @${toUsername}`);

      setSuggestions((previous) =>
        previous.filter((person) => person.username !== toUsername)
      );
      setUsername("");
    } catch (error) {
      console.error("Invitation failed:", error);
      toast.error(error.message || "Failed to send invitation.");
    } finally {
      setSendingTo(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-title"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.09] bg-[#121a2b] text-slate-100 shadow-2xl shadow-black/40"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/[0.07] px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
              <FaUsers size={18} />
            </div>

            <div>
              <h2
                id="invite-title"
                className="text-lg font-semibold tracking-tight"
              >
                Invite people
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Connect with people and collaborate.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close invitation dialog"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
          >
            <FaTimes size={15} />
          </button>
        </div>

        {/* Search */}
        <div className="p-5 sm:p-6">
          <label
            htmlFor="friend-username"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Search by username
          </label>

          <div className="relative">
            <FaSearch
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              size={14}
            />

            <input
              id="friend-username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter a username..."
              autoComplete="off"
              className="w-full rounded-xl border border-white/[0.09] bg-[#0b1020] py-3 pl-11 pr-10 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/15"
            />

            {username && (
              <button
                type="button"
                onClick={() => setUsername("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:text-white"
              >
                <FaTimes size={12} />
              </button>
            )}
          </div>

          {/* Results */}
          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {username.trim() ? "Search results" : "Find teammates"}
              </span>

              {suggestions.length > 0 && (
                <span className="text-xs text-slate-500">
                  {suggestions.length} found
                </span>
              )}
            </div>

            {searching ? (
              <div className="flex items-center justify-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] py-8 text-sm text-slate-400">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-400/30 border-t-violet-400" />
                Searching users...
              </div>
            ) : suggestions.length > 0 ? (
              <ul className="max-h-64 space-y-2 overflow-y-auto">
                {suggestions.map((person) => (
                  <li
                    key={person._id || person.username}
                    className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition hover:border-white/[0.12] hover:bg-white/[0.04]"
                  >
                    <ProfilePic
                      profilePic={person.profilePic}
                      size={42}
                      className="shrink-0 text-slate-400"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-200">
                        {person.firstName || person.lastName
                          ? `${person.firstName || ""} ${
                              person.lastName || ""
                            }`.trim()
                          : person.username}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        @{person.username}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => sendInvite(person.username)}
                      disabled={Boolean(sendingTo)}
                      className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {sendingTo === person.username ? (
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : (
                        <FaPaperPlane size={11} />
                      )}
                      {sendingTo === person.username
                        ? "Sending"
                        : "Invite"}
                    </button>
                  </li>
                ))}
              </ul>
            ) : username.trim() ? (
              <div className="rounded-xl border border-dashed border-white/[0.09] px-4 py-8 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] text-slate-500">
                  <FaUserPlus size={16} />
                </div>
                <p className="text-sm font-medium text-slate-300">
                  No users found
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Try another username.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/[0.09] px-4 py-8 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                  <FaSearch size={15} />
                </div>
                <p className="text-sm font-medium text-slate-300">
                  Find your people
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Start typing a username to find someone.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end border-t border-white/[0.07] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}