
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBaseURL } from "../../utils/api";
import { Link } from "react-router-dom";

export default function UserName() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!username.trim()) {
      setMessage("Please choose a username.");
      return;
    }

    if (username.length > 20) {
      setMessage("Username cannot exceed 20 characters.");
      return;
    }

    if (/\s/.test(username)) {
      setMessage("Username cannot contain spaces.");
      return;
    }

    if (!/^[A-Za-z0-9._]+$/.test(username)) {
      setMessage("Use only letters, numbers, periods, and underscores.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${getBaseURL()}/username`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Unable to save username.");
        return;
      }

      navigate("/homepage");
    } catch (err) {
      console.error("Username error:", err);
      setMessage("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080D1A] text-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-900/30 mb-5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="w-8 h-8"
              aria-hidden="true"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
            </svg>
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-400 mb-3">
            One last step
          </p>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Make it <span className="text-violet-400">yours.</span>
          </h1>

          <p className="text-slate-400 mt-3 leading-6">
            Choose a username your teammates can recognize.
          </p>
        </div>

        {/* Main card */}
        <div className="bg-[#11182A]/95 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="mb-7">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400">
                ACCOUNT SETUP
              </span>
              <span className="text-xs font-semibold text-violet-300">
                STEP 2 OF 2
              </span>
            </div>

            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full w-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-slate-200 mb-2"
            >
              Choose your username
            </label>

            <div
              className={`flex items-center bg-[#0B1020] border rounded-xl transition-all duration-200 focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-500 ${
                message ? "border-red-500/70" : "border-slate-700"
              }`}
            >
              <span className="pl-4 text-violet-400 font-semibold">@</span>

              <input
                id="username"
                type="text"
                autoComplete="username"
                maxLength={20}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setMessage("");
                }}
                placeholder="your_username"
                aria-invalid={Boolean(message)}
                aria-describedby={message ? "username-error" : "username-help"}
                className="w-full min-w-0 bg-transparent text-white placeholder:text-slate-600 px-3 py-4 outline-none"
              />
            </div>

            {message ? (
              <p
                id="username-error"
                role="alert"
                className="text-red-400 text-sm mt-2"
              >
                {message}
              </p>
            ) : (
              <p id="username-help" className="text-xs text-slate-500 mt-2">
                Up to 20 characters. Letters, numbers, periods, and underscores
                only.
              </p>
            )}

            {/* Live preview */}
            <div className="mt-6 rounded-xl border border-slate-800 bg-[#0B1020]/80 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-3">
                Profile preview
              </p>

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-white text-lg">
                  {username.trim().charAt(0).toUpperCase() || "U"}
                </div>

                <div className="min-w-0">
                  <p className="font-semibold text-slate-100 truncate">
                    {username.trim() || "Your username"}
                  </p>
                  <p className="text-sm text-slate-500">
                    TaskFlow member
                  </p>
                </div>

                <div className="ml-auto text-xs text-slate-500 shrink-0">
                  {username.length}/20
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-violet-900/20 transition-all duration-200"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Saving username...
                </>
              ) : (
                <>
                  Continue to workspace
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-5 h-5"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have a username?{" "}
          <Link
            to="/login"
            className="text-violet-400 hover:text-violet-300 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
