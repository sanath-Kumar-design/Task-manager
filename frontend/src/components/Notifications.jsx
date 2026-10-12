import React, { useState, useEffect, useMemo } from "react";
import {
  IoCheckmarkDoneOutline,
  IoNotificationsOutline,
  IoClose,
} from "react-icons/io5";
import { FaUserFriends, FaClock, FaBell } from "react-icons/fa";
import { toast } from "react-toastify";
import { getBaseURL } from "../../utils/api";

const notificationTypes = ["All", "Invites", "Reminders"];

export default function Notifications({
  className = "",
  inviteNotifications = [],
  onClose,
}) {
  const [selectedType, setSelectedType] = useState("All");
  const [localNotifications, setLocalNotifications] = useState([]);
  const [acceptingId, setAcceptingId] = useState(null);
  const [readIds, setReadIds] = useState(() => new Set());

  // Keep local state synchronized with incoming notifications.
  useEffect(() => {
    setLocalNotifications((previous) => {
      const previousById = new Map(
        previous.map((notification) => [
          String(notification.id ?? notification._id),
          notification,
        ])
      );

      return inviteNotifications.map((notification) => {
        const id = String(notification.id ?? notification._id);
        const existing = previousById.get(id);

        // Preserve local status updates when the parent refreshes its props.
        return existing
          ? { ...notification, ...existing }
          : notification;
      });
    });
  }, [inviteNotifications]);

  const filteredNotifications = useMemo(() => {
    if (selectedType === "Invites") {
      return localNotifications.filter(
        (notification) =>
          notification.type === "invite" ||
          notification.type === "invitation" ||
          notification.type === "friendRequest" ||
          notification.type === "friend-request" ||
          notification.status === "pending"
      );
    }

    if (selectedType === "Reminders") {
      return localNotifications.filter(
        (notification) =>
          notification.type === "reminder"
      );
    }

    return localNotifications;
  }, [localNotifications, selectedType]);

  const unreadCount = localNotifications.filter(
    (notification) =>
      !readIds.has(String(notification.id ?? notification._id)) &&
      notification.status !== "accepted"
  ).length;

  const markAllAsRead = () => {
    setReadIds(
      new Set(
        localNotifications.map((notification) =>
          String(notification.id ?? notification._id)
        )
      )
    );
    toast.success("Notifications marked as read");
  };

  const acceptRequest = async (notification) => {
    const id = notification.id ?? notification._id;

    if (!id || acceptingId !== null) {
      if (!id) toast.error("This invitation has no valid ID.");
      return;
    }

    setAcceptingId(id);

    try {
      const response = await fetch(`${getBaseURL()}/accept-request`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Unable to accept invitation."
        );
      }

      setLocalNotifications((previous) =>
        previous.map((item) => {
          const itemId = item.id ?? item._id;

          return String(itemId) === String(id)
            ? {
                ...item,
                status: "accepted",
                message: `You are now connected with ${
                  item.username || item.fromUsername || "this user"
                }.`,
              }
            : item;
        })
      );

      setReadIds((previous) => new Set([...previous, String(id)]));
      toast.success("Invitation accepted");
    } catch (error) {
      console.error("Accept invitation failed:", error);
      toast.error(error.message || "Failed to accept invitation.");
    } finally {
      setAcceptingId(null);
    }
  };

  const getNotificationIcon = (notification) => {
    if (notification.type === "reminder") {
      return <FaClock />;
    }

    if (
      notification.type === "invite" ||
      notification.type === "invitation" ||
      notification.type === "friendRequest" ||
      notification.type === "friend-request" ||
      notification.status === "pending"
    ) {
      return <FaUserFriends />;
    }

    return <FaBell />;
  };

  return (
    <aside
      className={`fixed right-0 top-16 z-50 flex h-[calc(100dvh-4rem)] w-full max-w-[380px] flex-col border-l border-white/[0.08] bg-[#0b1020] text-slate-100 shadow-2xl shadow-black/30 ${className}`}
      aria-label="Notifications panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
            <IoNotificationsOutline size={22} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold">Notifications</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Stay up to date
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={markAllAsRead}
            title="Mark all as read"
            aria-label="Mark all notifications as read"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/[0.06] hover:text-violet-300"
          >
            <IoCheckmarkDoneOutline size={20} />
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close notifications"
              className="rounded-lg p-2 text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
            >
              <IoClose size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-white/[0.06] px-5 py-4">
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-white/[0.04] p-1">
          {notificationTypes.map((type) => (
            <button
              type="button"
              key={type}
              onClick={() => setSelectedType(type)}
              className={`rounded-lg px-2 py-2 text-xs font-medium transition sm:text-sm ${
                selectedType === type
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Notification list */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map((notification, index) => {
              const id = notification.id ?? notification._id;
              const key = id ?? `${notification.type ?? "notification"}-${index}`;
              const isPending = notification.status === "pending";
              const isAccepted = notification.status === "accepted";
              const isAccepting =
                acceptingId !== null &&
                String(acceptingId) === String(id);
              const isRead = readIds.has(String(id));

              return (
                <article
                  key={key}
                  className={`rounded-xl border p-4 transition ${
                    isRead
                      ? "border-white/[0.05] bg-white/[0.015]"
                      : "border-white/[0.08] bg-[#121a2b]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                      {getNotificationIcon(notification)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm leading-6 text-slate-200">
                        {notification.message || "You have a new notification."}
                      </p>

                      {isPending && (
                        <span className="mt-2 inline-flex rounded-full border border-amber-400/15 bg-amber-400/10 px-2 py-1 text-[10px] font-medium text-amber-300">
                          Pending invitation
                        </span>
                      )}

                      {isAccepted && (
                        <span className="mt-2 inline-flex rounded-full border border-emerald-400/15 bg-emerald-400/10 px-2 py-1 text-[10px] font-medium text-emerald-300">
                          Accepted
                        </span>
                      )}

                      {isPending && (
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => acceptRequest(notification)}
                            disabled={acceptingId !== null}
                            className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isAccepting ? "Accepting..." : "Accept invitation"}
                          </button>
                        </div>
                      )}
                    </div>

                    {!isRead && !isAccepted && (
                      <span
                        className="mt-1 h-2 w-2 shrink-0 rounded-full bg-violet-400"
                        title="Unread"
                      />
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="flex h-full min-h-64 flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03] text-slate-500">
              <IoNotificationsOutline size={26} />
            </div>

            <h3 className="text-sm font-semibold text-slate-300">
              {selectedType === "All"
                ? "You're all caught up"
                : `No ${selectedType.toLowerCase()} yet`}
            </h3>

            <p className="mt-2 max-w-[240px] text-xs leading-5 text-slate-500">
              {selectedType === "Invites"
                ? "New collaboration invitations will appear here."
                : selectedType === "Reminders"
                  ? "Task reminders will appear here when available."
                  : "New invitations and updates will appear here."}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/[0.06] px-5 py-3">
        <p className="text-center text-[11px] text-slate-500">
          Notifications for your workspace
        </p>
      </div>
    </aside>
  );
}