
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { getBaseURL } from "../../utils/api";

export default function Signup() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  let strength = 0;

  if (password.length >= 6) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    "bg-red-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-emerald-500",
  ];

  const inputClass =
    "w-full bg-[#0B1020] text-white placeholder:text-slate-500 " +
    "border border-slate-700 rounded-xl px-4 py-3.5 outline-none " +
    "transition-all duration-200 focus:border-violet-500 " +
    "focus:ring-2 focus:ring-violet-500/20";

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setErrors({
      email: "",
      password: "",
      confirmPassword: "",
    });

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setErrors((prev) => ({
        ...prev,
        password: "Password must be at least 6 characters long.",
      }));
      return;
    }

    if (password !== confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match.",
      }));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${getBaseURL()}/signUp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Unable to create your account.");
        return;
      }

      navigate("/username", { state: { email: email.trim() } });
    } catch (err) {
      console.error("Signup error:", err);
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

      <div className="relative w-full max-w-5xl">
        <div className="grid md:grid-cols-2 bg-[#11182A]/95 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-black/30">
          {/* Left branding panel */}
          <div className="hidden md:flex flex-col justify-between p-10 lg:p-12 bg-gradient-to-br from-violet-600/20 via-[#11182A] to-indigo-600/20 border-r border-slate-800">
            <div>
              <Link to="/" className="inline-flex items-center gap-3 mb-12">
                <img
                  src="/logo.png"
                  alt="Task Manager logo"
                  className="w-11 h-11 rounded-xl object-contain"
                />
                <span className="text-2xl font-bold tracking-tight">
                  Task<span className="text-violet-400">Flow</span>
                </span>
              </Link>

              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-400 mb-4">
                Plan. Collaborate. Achieve.
              </p>

              <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                Turn your plans into
                <span className="text-violet-400"> progress.</span>
              </h2>

              <p className="text-slate-400 mt-6 leading-7">
                Organize your work, collaborate with your team, and keep every
                task moving forward in one place.
              </p>
            </div>

            <div className="mt-12 rounded-2xl border border-slate-700/70 bg-[#0B1020]/70 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-violet-500/15 flex items-center justify-center text-violet-300">
                  ✓
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    One workspace, less chaos
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Keep your team organized
                  </p>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" />
              </div>
            </div>
          </div>

          {/* Signup form */}
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="text-center mb-8">
              <div className="md:hidden flex items-center justify-center gap-3 mb-6">
                <img
                  src="/logo.png"
                  alt="Task Manager logo"
                  className="w-10 h-10 rounded-xl object-contain"
                />
                <span className="text-xl font-bold">
                  Task<span className="text-violet-400">Flow</span>
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight">
                Create your account
              </h1>
              <p className="text-slate-400 text-sm mt-3">
                Get started with your workspace today.
              </p>
            </div>

            {message && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-slate-200 mb-2"
                  >
                    First name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputClass}
                    placeholder="First name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-slate-200 mb-2"
                  >
                    Last name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={inputClass}
                    placeholder="Last name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="signup-email"
                  className="block text-sm font-medium text-slate-200 mb-2"
                >
                  Email address
                </label>
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, email: "" }));
                    setMessage("");
                  }}
                  className={`${inputClass} ${
                    errors.email ? "border-red-500/70" : ""
                  }`}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p role="alert" className="text-red-400 text-sm mt-2">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="signup-password"
                  className="block text-sm font-medium text-slate-200 mb-2"
                >
                  Password
                </label>

                <div
                  className={`flex items-center bg-[#0B1020] border rounded-xl pr-3 focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-500 ${
                    errors.password ? "border-red-500/70" : "border-slate-700"
                  }`}
                >
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((prev) => ({
                        ...prev,
                        password: "",
                      }));
                    }}
                    className="w-full min-w-0 bg-transparent text-white placeholder:text-slate-500 px-4 py-3.5 outline-none"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="p-2 text-slate-400 hover:text-violet-300"
                  >
                    {showPassword ? (
                      <AiOutlineEyeInvisible size={21} />
                    ) : (
                      <AiOutlineEye size={21} />
                    )}
                  </button>
                </div>

                {/* Password strength */}
                <div className="mt-3">
                  <div className="flex gap-2">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          i < strength
                            ? strengthColors[strength - 1]
                            : "bg-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                  {password && (
                    <p className="text-xs text-slate-400 mt-2">
                      Password strength:{" "}
                      <span className="text-slate-200">
                        {strengthLabels[strength - 1] || "Weak"}
                      </span>
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-2">
                    Use at least 6 characters with a mix of letters, numbers,
                    and symbols.
                  </p>
                </div>

                {errors.password && (
                  <p role="alert" className="text-red-400 text-sm mt-2">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-slate-200 mb-2"
                >
                  Confirm password
                </label>

                <div
                  className={`flex items-center bg-[#0B1020] border rounded-xl pr-3 focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-500 ${
                    errors.confirmPassword
                      ? "border-red-500/70"
                      : "border-slate-700"
                  }`}
                >
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrors((prev) => ({
                        ...prev,
                        confirmPassword: "",
                      }));
                    }}
                    className="w-full min-w-0 bg-transparent text-white placeholder:text-slate-500 px-4 py-3.5 outline-none"
                    placeholder="Re-enter your password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((prev) => !prev)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    className="p-2 text-slate-400 hover:text-violet-300"
                  >
                    {showConfirmPassword ? (
                      <AiOutlineEyeInvisible size={21} />
                    ) : (
                      <AiOutlineEye size={21} />
                    )}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <p role="alert" className="text-red-400 text-sm mt-2">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-violet-900/20 transition-all duration-200"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </button>
            </form>

            <div className="mt-7 pt-6 border-t border-slate-800 text-center">
              <p className="text-sm text-slate-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Your workspace, organized.
        </p>
      </div>
    </div>
  );
}
