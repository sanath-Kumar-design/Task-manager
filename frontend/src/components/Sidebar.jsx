import { useState } from "react";
import { getBaseURL } from "../../utils/api";
import {
  CheckSquare,
  Users,
  Share2,
  Settings,
  UserRound,
  LogOut,
  X,
  CheckCircle2,
} from "lucide-react";

export default function Sidebar({ selected, setSelected, setSidebarOpen }) {
  const [isOpen] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const menu = [
    { title: "My Tasks", icon: CheckSquare },
    { title: "Team Tasks", icon: Users },
    { title: "Shared Tasks", icon: Share2 },
  ];

  const bottomMenu = [
    { title: "Settings", icon: Settings },
    { title: "Profile", icon: UserRound },
    { title: "Logout", icon: LogOut },
  ];

  const logout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await fetch(`${getBaseURL()}/logout`, {
        method: "POST",
        credentials: "include",
      });

      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Unable to log out. Please try again.");
      setLoggingOut(false);
    }
  };

  const handleSelect = (title) => {
    if (title === "Logout") {
      logout()
      return;
    }

    if (title === "Profile" || title === "Settings") {
      // Connect your existing navigation here.
      return;
    }

    setSelected(title);
    setSidebarOpen(false);
  };



  const navItemClass = (active) =>
    `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
    transition-colors duration-150 ${active
      ? "border border-blue-500/20 bg-blue-500/10 text-blue-400"
      : "border border-transparent text-gray-400 hover:bg-white/[0.04] hover:text-gray-100"
    }`;

  return (
    <aside className="flex h-full w-full flex-col border-r border-white/[0.08] bg-[#0e1015] text-gray-100">
      <div className="flex items-center justify-between px-5 pb-4 pt-5">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
          Workspace
        </span>

        <button
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
          className="rounded-md p-1.5 text-gray-500 transition hover:bg-white/[0.06] hover:text-gray-200"
        >
          <X size={17} strokeWidth={1.8} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {menu.map(({ title, icon: Icon }) => {
          const active = selected === title;

          return (
            <button
              key={title}
              type="button"
              onClick={() => handleSelect(title)}
              aria-current={active ? "page" : undefined}
              className={navItemClass(active)}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{title}</span>
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="mx-4 mb-4 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3">
        <div className="mb-1.5 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-blue-400" />
          <span className="text-sm font-medium text-gray-200">
            Stay organized
          </span>
        </div>
        <p className="text-xs leading-5 text-gray-500">
          Keep your tasks organized and your priorities clear.
        </p>
      </div>

      <div className="border-t border-white/[0.08] px-3 py-4">
        {bottomMenu.map(({ title, icon: Icon }) => (
          <button
            key={title}
            type="button"
            onClick={() => handleSelect(title)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-400 transition hover:bg-white/[0.04] hover:text-gray-100"
          >
            <Icon size={18} strokeWidth={1.8} />
            <span>{title}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}