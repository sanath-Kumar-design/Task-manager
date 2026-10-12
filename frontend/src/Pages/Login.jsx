
import React, { useState } from "react";
import { getBaseURL } from "../../utils/api";
import { Link, useNavigate } from "react-router-dom";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
} from "react-icons/ai";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setmessage] = useState("");
  const [error, setErrors] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setmessage("");
    setErrors({ email: "", password: "" });

    if (!email.trim() || !password) {
      setmessage("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${getBaseURL()}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();


      if (!res.ok) {
        setmessage(data.error || "Login failed. Please try again.");
        return;
      }


      setmessage(data.message || "Login successful.");
      navigate("/homepage");
    } catch (err) {
      console.error("Login error:", err);
      setmessage("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-[#0B1020] text-white placeholder:text-slate-500 " +
    "border rounded-xl px-4 py-3.5 outline-none " +
    "transition-all duration-200 focus:ring-2 focus:ring-violet-500/30 " +
    "focus:border-violet-500";

  return (
    <div className="min-h-screen bg-[#080D1A] text-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-900/30 mb-5">
            <img
              src="/logo.png"
              alt="TaskFlow logo"
              className="w-10 h-10 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Welcome back<span className="text-violet-400">.</span>
          </h1>

          <p className="text-slate-400 mt-3 text-sm sm:text-base">
            Sign in to manage your tasks and team.
          </p>
        </div>

        {/* Login card */}
        <div className="bg-[#11182A]/95 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* General message */}
            {message && (
              <div
                role="status"
                aria-live="polite"
                className="rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-3 text-sm text-violet-200"
              >
                {message}
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-slate-200 mb-2"
              >
                Email address
              </label>

              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                className={`${inputClass} ${error.email
                  ? "border-red-500/70"
                  : "border-slate-700"
                  }`}
                placeholder="Enter your email"
                value={email}
                aria-invalid={Boolean(error.email)}
                aria-describedby={error.email ? "email-error" : undefined}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email: "" }));
                  setmessage("");
                }}
              />

              {error.email && (
                <p
                  id="email-error"
                  role="alert"
                  className="text-red-400 text-sm mt-2"
                >
                  {error.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-slate-200 mb-2"
              >
                Password
              </label>

              <div
                className={`flex items-center bg-[#0B1020] border rounded-xl pr-3 transition-all duration-200 focus-within:ring-2 focus-within:ring-violet-500/30 focus-within:border-violet-500 ${error.password
                  ? "border-red-500/70"
                  : "border-slate-700"
                  }`}
              >
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="w-full min-w-0 bg-transparent text-white placeholder:text-slate-500 px-4 py-3.5 outline-none"
                  placeholder="Enter your password"
                  value={password}
                  aria-invalid={Boolean(error.password)}
                  aria-describedby={
                    error.password ? "password-error" : undefined
                  }
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      password: "",
                    }));
                    setmessage("");
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="flex-shrink-0 p-2 text-slate-400 hover:text-violet-300 transition-colors"
                >
                  {showPassword ? (
                    <AiOutlineEyeInvisible size={21} />
                  ) : (
                    <AiOutlineEye size={21} />
                  )}
                </button>
              </div>

              {error.password && (
                <p
                  id="password-error"
                  role="alert"
                  className="text-red-400 text-sm mt-2"
                >
                  {error.password}
                </p>
              )}
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  setmessage("Password recovery is not available yet.")
                }
                className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-violet-900/20 transition-all duration-200 hover:shadow-violet-700/20"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Signup */}
          <div className="mt-7 pt-6 border-t border-slate-800 text-center">
            <p className="text-sm text-slate-400">
              Don't have an account?{" "}
              <Link
                to="/"
                className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Your workspace, organized.
        </p>
      </div>
    </div>
  );
}
