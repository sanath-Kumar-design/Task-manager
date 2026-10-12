
import React, { useEffect, useState, useCallback } from "react";
import { useUser } from "../context/UserContext";
import Header from "../components/Header";
import {
  FaUserEdit,
  FaCamera,
  FaEnvelope,
  FaUser,
  FaSignOutAlt,
  FaTrashAlt,
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaChevronRight,
  FaShieldAlt,
  FaSlidersH,
  FaTimes,
  FaCheck,
} from "react-icons/fa";
import { getBaseURL } from "../../utils/api";
import getCroppedImg from "../components/helperComponents/cropImage";
import Cropper from "react-easy-crop";
import DeleteAccountModal from "../components/DeleteAccountModal";

const ProfilePage = () => {
  const { user, setUser } = useUser();

  const [profilePic, setProfilePic] = useState(user?.profilePic || "");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  useEffect(() => {
    if (user?.profilePic) {
      setProfilePic(user.profilePic);
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (selectedImage?.startsWith("blob:")) {
        URL.revokeObjectURL(selectedImage);
      }
    };
  }, [selectedImage]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      event.target.value = "";
      return;
    }

    setSelectedImage(URL.createObjectURL(file));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setModalOpen(true);
    event.target.value = "";
  };

  const handleDone = async () => {
    if (!selectedImage || !croppedAreaPixels || !user?._id) return;

    setUploading(true);

    try {
      const croppedImage = await getCroppedImg(
        selectedImage,
        croppedAreaPixels
      );

      const response = await fetch(croppedImage);
      const blob = await response.blob();
      const file = new File([blob], "profilePic.png", {
        type: blob.type || "image/png",
      });

      const formData = new FormData();
      formData.append("profilePic", file);
      formData.append("userId", user._id);

      const uploadRes = await fetch(`${getBaseURL()}/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Unable to upload profile photo.");
      }

      const data = await uploadRes.json();

      setUser((prev) => ({ ...prev, profilePic: data.fileUrl }));
      setProfilePic(data.fileUrl);
      setModalOpen(false);
      setSelectedImage(null);
    } catch (error) {
      console.error("Profile photo upload failed:", error);
      alert(error.message || "Something went wrong while uploading.");
    } finally {
      setUploading(false);
    }
  };

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

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#0b1020] flex items-center justify-center text-slate-300">
          Loading profile...
        </div>
      </>
    );
  }

  const fullName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    user.username ||
    "User";

  const avatarUrl = profilePic
    ? profilePic.startsWith("http")
      ? profilePic
      : `${getBaseURL()}${profilePic}`
    : null;

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const stats = [
    {
      label: "Tasks created",
      value: "—",
      icon: FaTasks,
      color: "text-violet-300",
      bg: "bg-violet-500/10",
    },
    {
      label: "Completed",
      value: "—",
      icon: FaCheckCircle,
      color: "text-emerald-300",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Pending",
      value: "—",
      icon: FaClock,
      color: "text-amber-300",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0b1020] text-slate-100">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page heading */}
        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-violet-400">
            Account settings
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Your profile
          </h1>

          <p className="mt-2 text-sm text-slate-400 sm:text-base">
            Manage your account details and preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* Left column */}
          <aside className="space-y-6">
            {/* Profile card */}
            <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#121a2b]">
              <div className="h-24 bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500" />

              <div className="-mt-12 px-6 pb-6">
                <div className="relative inline-block">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="h-24 w-24 rounded-2xl border-4 border-[#121a2b] bg-[#1e293b] object-cover shadow-xl"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-[#121a2b] bg-gradient-to-br from-violet-500 to-indigo-600 text-3xl font-bold shadow-xl">
                      {initials || "U"}
                    </div>
                  )}

                  <label
                    title="Change profile photo"
                    className="absolute -bottom-2 -right-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-violet-600 text-white shadow-lg transition hover:bg-violet-500"
                  >
                    <FaCamera size={14} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>

                <h2 className="mt-4 text-xl font-bold">{fullName}</h2>
                <p className="mt-1 text-sm text-slate-400">
                  @{user.username || "username"}
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <span className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Account active
                  </span>
                </div>

                <div className="mt-6 space-y-3 border-t border-white/[0.08] pt-5">
                  <div className="flex items-center gap-3 text-sm">
                    <FaEnvelope className="shrink-0 text-slate-500" />
                    <span className="break-all text-slate-300">
                      {user.email || "No email available"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <FaUser className="shrink-0 text-slate-500" />
                    <span className="text-slate-300">
                      {user.username || "No username"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    document.getElementById("profile-photo-input")?.click();
                  }}
                  className="mt-6 hidden w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium transition hover:bg-white/[0.08]"
                >
                  <FaUserEdit />
                  Edit photo
                </button>
              </div>
            </section>

            {/* Task overview */}
            <section className="rounded-2xl border border-white/[0.08] bg-[#121a2b] p-5">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-semibold">Task overview</h3>
                <FaTasks className="text-slate-500" />
              </div>

              <div className="space-y-3">
                {stats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div
                      key={stat.label}
                      className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}
                        >
                          <Icon />
                        </div>
                        <span className="text-sm text-slate-400">
                          {stat.label}
                        </span>
                      </div>
                      <span className="text-lg font-semibold">
                        {stat.value}
                      </span>
                    </div>
                  );
                })}
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-500">
                Task statistics will appear here when connected to your task
                data.
              </p>
            </section>
          </aside>

          {/* Right column */}
          <div className="space-y-6">
            {/* Personal information */}
            <section className="rounded-2xl border border-white/[0.08] bg-[#121a2b] p-5 sm:p-7">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    Personal information
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Your registered account details.
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                  <FaUserEdit size={18} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <InfoField label="First name" value={user.firstName} />
                <InfoField label="Last name" value={user.lastName} />
                <div className="sm:col-span-2">
                  <InfoField label="Email address" value={user.email} />
                </div>
                <InfoField label="Username" value={user.username} />
                <InfoField label="Account ID" value={user._id} />
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-xl border border-violet-400/15 bg-violet-400/[0.05] p-4">
                <FaShieldAlt className="mt-0.5 shrink-0 text-violet-300" />
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    Your information
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    These details are displayed from your current user
                    context. Editing and saving profile details requires a
                    backend update endpoint.
                  </p>
                </div>
              </div>
            </section>

            {/* Preferences */}
            <section className="rounded-2xl border border-white/[0.08] bg-[#121a2b] p-5 sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
                  <FaSlidersH />
                </div>
                <div>
                  <h3 className="font-semibold">Preferences</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Personalize your workspace.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-white/[0.06] p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-500/10 text-slate-400">
                  <FaSlidersH />
                </div>
                <div>
                  <p className="text-sm font-medium">Workspace appearance</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Your current workspace uses a dark theme. Notification
                    settings are not connected to a preference API yet.
                  </p>
                </div>
              </div>
            </section>

            {/* Account actions */}
            <section className="rounded-2xl border border-red-400/15 bg-[#121a2b] p-5 sm:p-7">
              <h3 className="font-semibold">Account actions</h3>
              <p className="mt-1 text-sm text-slate-400">
                Manage your session or permanently remove your account.
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={logout}
                  disabled={loggingOut}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FaSignOutAlt />
                  {loggingOut ? "Logging out..." : "Log out"}
                </button>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-5 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
                >
                  <FaTrashAlt />
                  Delete account
                  <FaChevronRight className="ml-1 text-xs" />
                </button>
              </div>
            </section>
          </div>
        </div>

        {/* Image crop modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#121a2b] shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
                <div>
                  <h3 className="font-semibold">Update profile photo</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Position and zoom your image.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setModalOpen(false);
                    setSelectedImage(null);
                  }}
                  disabled={uploading}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                  aria-label="Close photo editor"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-5">
                <div className="relative h-72 w-full overflow-hidden rounded-xl bg-black sm:h-80">
                  <Cropper
                    image={selectedImage}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <label htmlFor="photo-zoom" className="text-slate-300">
                      Zoom
                    </label>
                    <span className="text-slate-400">
                      {zoom.toFixed(1)}x
                    </span>
                  </div>

                  <input
                    id="photo-zoom"
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(event) => setZoom(Number(event.target.value))}
                    className="w-full accent-violet-500"
                  />
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    onClick={() => {
                      setModalOpen(false);
                      setSelectedImage(null);
                    }}
                    disabled={uploading}
                    className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.05]"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleDone}
                    disabled={uploading || !croppedAreaPixels}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FaCheck />
                    {uploading ? "Uploading..." : "Save photo"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <DeleteAccountModal
            onClose={() => setShowDeleteModal(false)}
          />
        )}
      </main>
    </div>
  );
};

function InfoField({ label, value }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </label>
      <div className="min-h-12 break-all rounded-xl border border-white/[0.07] bg-[#0b1020] px-4 py-3 text-sm text-slate-200">
        {value || "Not provided"}
      </div>
    </div>
  );
}

export default ProfilePage;