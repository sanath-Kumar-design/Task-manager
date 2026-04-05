// import React, { useEffect, useState, useCallback } from 'react';
// import { useUser } from '../context/UserContext';
// import Header from "../components/Header";
// import { FaUserEdit } from "react-icons/fa";
// import { getBaseURL } from '../../utils/api';
// import getCroppedImg from '../components/helperComponents/cropImage';
// import Cropper from "react-easy-crop";
// import DeleteAccountModal from '../components/DeleteAccountModal';

// const baseURL = getBaseURL();

// const ProfilePage = () => {
//     const { user, setUser } = useUser();
//     const [profilePic, setProfilePic] = useState(user?.profilePic || "");
//     const [modalOpen, setModalOpen] = useState(false);
//     const [selectedImage, setSelectedImage] = useState(null);
//     const [crop, setCrop] = useState({ x: 0, y: 0 });
//     const [zoom, setZoom] = useState(1);
//     const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
//     const [showDeleteModal, setShowDeleteModal] = useState(false)

//     const onCropComplete = useCallback((_, croppedAreaPixels) => {
//         setCroppedAreaPixels(croppedAreaPixels);
//     }, []);




//     const handleDone = async () => {
//         try {
//             const croppedImage = await getCroppedImg(selectedImage, croppedAreaPixels);
//             const res = await fetch(croppedImage);
//             const blob = await res.blob();
//             const file = new File([blob], "profilePic.png", { type: blob.type });

//             const formData = new FormData();
//             formData.append("profilePic", file);
//             formData.append("userId", user._id);

//             const uploadRes = await fetch(`${getBaseURL()}/upload`, {
//                 method: "POST",
//                 credentials: "include",
//                 body: formData,
//             });

//             if (!uploadRes.ok) throw new Error("Upload failed");

//             const data = await uploadRes.json();
//             setUser((prev) => ({ ...prev, profilePic: data.fileUrl }));
//             setProfilePic(data.fileUrl);
//             setModalOpen(false);
//         } catch (err) {
//             console.error(err);
//         }
//     };

//     const logout = async () => {
//         try {
//             await fetch(`${getBaseURL()}/logout`,
//                 { method: 'POST', credentials: 'include' });
//             window.location.href = '/login';
//         } catch (err) {
//             console.log(err);
//         }
//     }

//     useEffect(() => {
//         if (user?.profilePic) {
//             setProfilePic(user.profilePic);
//         }
//     }, [user]);





//     if (!user) return <p>Loading...</p>;

//     return (
//         <div className='overflow-x-hidden'><Header />
//             <div className="min-h-screen flex items-start justify-center p-4 overflow-y-auto">
//                 <div className="w-full max-w-md  border-gray-400 rounded-2xl shadow-xl p-6  overflow-hidden  border">
//                     <div className="flex flex-col items-center mb-6">
//                         <div className="w-24 h-24 rounded-full border-4 border-indigo-200 shadow-md overflow-hidden mb-2">
//                             {profilePic ? (
//                                 <img
//                                     src={profilePic ? `${getBaseURL()}${profilePic}` : "fallback.png"}
//                                     alt="Profile"
//                                     className="w-full h-full object-cover"
//                                 />
//                             ) : (
//                                 <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
//                                     No Photo
//                                 </div>
//                             )}
//                         </div>
//                         <label className="text-indigo-500 hover:text-indigo-700 cursor-pointer">
//                             <FaUserEdit size={20} />
//                             <input
//                                 type="file"
//                                 accept="image/*"
//                                 className="hidden"
//                                 onChange={(e) => {
//                                     const file = e.target.files[0];
//                                     if (file) {
//                                         setSelectedImage(URL.createObjectURL(file));
//                                         setModalOpen(true);
//                                     }
//                                 }}
//                             />
//                         </label>

//                         <p className="text-indigo-600 font-semibold mt-1">{user.username}</p>
//                     </div>

//                     <div className="space-y-4 mb-6">
//                         <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
//                             <span className="text-gray-600 font-medium">Email:</span>
//                             <span className="text-gray-800">{user.email}</span>
//                         </div>
//                         <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
//                             <span className="text-gray-600 font-medium">First Name:</span>
//                             <span className="text-gray-800">{user.firstName}</span>
//                         </div>
//                         <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
//                             <span className="text-gray-600 font-medium">Last Name:</span>
//                             <span className="text-gray-800">{user.lastName}</span>
//                         </div>
//                     </div>

//                     <div className="space-y-3">
//                         <button onClick={logout} className="w-full py-3 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg ">
//                             Logout
//                         </button>
//                         <button onClick={() => setShowDeleteModal(true)} className="w-full py-3 px-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
//                             Delete Account
//                         </button>

//                         {showDeleteModal && (
//                             <DeleteAccountModal
//                              onClose={() => setShowDeleteModal(false)}
//                             />
//                         )}

//                     </div>
//                 </div>

//                 {modalOpen && (
//                     <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-auto p-4">
//                         <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-[350px] overflow-auto">
//                             <h3 className="text-lg font-semibold mb-2">Edit Profile Photo</h3>

//                             <div className="relative w-[300px] h-[300px] bg-gray-200">
//                                 <Cropper
//                                     image={selectedImage}
//                                     crop={crop}
//                                     zoom={zoom}
//                                     aspect={1}
//                                     onCropChange={setCrop}
//                                     onZoomChange={setZoom}
//                                     onCropComplete={onCropComplete}
//                                 />
//                             </div>

//                             <div className="flex justify-end space-x-2 mt-3">
//                                 <button
//                                     onClick={() => setModalOpen(false)}
//                                     className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     onClick={handleDone}
//                                     className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
//                                 >
//                                     Done
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//             </div>
//         </div>
//     );
// };

// export default ProfilePage;
import React, { useEffect, useState, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import Header from "../components/Header";
import { FaUserEdit } from "react-icons/fa";
import { getBaseURL } from '../../utils/api';
import getCroppedImg from '../components/helperComponents/cropImage';
import Cropper from "react-easy-crop";
import DeleteAccountModal from '../components/DeleteAccountModal';

const baseURL = getBaseURL();

const ProfilePage = () => {
    const { user, setUser } = useUser();
    const [profilePic, setProfilePic] = useState(user?.profilePic || "");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    const onCropComplete = useCallback((_, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);




    const handleDone = async () => {
        try {
            const croppedImage = await getCroppedImg(selectedImage, croppedAreaPixels);
            const res = await fetch(croppedImage);
            const blob = await res.blob();
            const file = new File([blob], "profilePic.png", { type: blob.type });

            const formData = new FormData();
            formData.append("profilePic", file);
            formData.append("userId", user._id);

            const uploadRes = await fetch(`${getBaseURL()}/upload`, {
                method: "POST",
                credentials: "include",
                body: formData,
            });

            if (!uploadRes.ok) throw new Error("Upload failed");

            const data = await uploadRes.json();
            setUser((prev) => ({ ...prev, profilePic: data.fileUrl }));
            setProfilePic(data.fileUrl);
            setModalOpen(false);
        } catch (err) {
            console.error(err);
        }
    };

    const logout = async () => {
        try {
            await fetch(`${getBaseURL()}/logout`,
                { method: 'POST', credentials: 'include' });
            window.location.href = '/login';
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        if (user?.profilePic) {
            setProfilePic(user.profilePic);
        }
    }, [user]);





    if (!user) return <p>Loading...</p>;

    return (
        <div className='overflow-x-hidden'><Header />
            <div className="min-h-screen bg-gray-100 p-6 flex flex-col md:flex-row gap-6 max-w-7xl mx-auto ">

                {/* LEFT PANEL */}
                <div className="flex flex-col gap-6  max-w-[400px] w-full">
                    {/* Profile Card */}
                    <div className="bg-white rounded-xl shadow p-6 text-center  w-full">
                        <div className="relative w-24 h-24 mx-auto flex items-center justify-center flex-col gap-2">
                            {profilePic ? (
                                <img
                                    src={profilePic ? `${getBaseURL()}${profilePic}` : "fallback.png"}
                                    alt="Profile"
                                    className="w-full h-full rounded-full object-cover "
                                />
                            ) : (
                                <div></div>
                            )}
                            <label className="text-indigo-500 hover:text-indigo-700 cursor-pointer">
                                <FaUserEdit size={20} />
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setSelectedImage(URL.createObjectURL(file));
                                            setModalOpen(true);
                                        }
                                    }}
                                />
                            </label>
                        </div>


                        <h2 className="mt-4 text-xl font-semibold">{user.firstName} {user.lastName}</h2>
                        <p className="text-gray-500 text-sm">@{user.username}</p>
                        <p className="text-gray-400 text-sm mt-1">
                            {user.email}
                        </p>

                        <span className="inline-block mt-3 px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            Admin
                        </span>

                    </div>

                    {/* Task Overview */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <h3 className="font-semibold mb-4">Task Overview</h3>

                        {[
                            { label: "Created", count: 47 },
                            { label: "Completed", count: 32 },
                            { label: "Pending", count: 15 },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="bg-gray-50 p-4 rounded-lg mb-3 flex justify-between"
                            >
                                <span className="text-gray-500">{item.label}</span>
                                <span className="font-semibold">{item.count}</span>
                            </div>
                        ))}
                    </div>

                    {/* Recent Tasks */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <h3 className="font-semibold mb-4">Recent Tasks</h3>

                        <ul className="space-y-2 text-sm text-gray-600">
                            <li>• Review Q1 Marketing Strategy</li>
                            <li>• Update Product Roadmap</li>
                            <li>• Team Performance Review</li>
                        </ul>
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="flex-1 flex flex-col gap-6">

                    {/* Basic Info */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold">Basic Information</h3>
                            <button className="text-sm bg-gray-100 px-3 py-1 rounded-lg">
                                Edit Profile
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <input
                                className="p-3 bg-gray-50 rounded-lg outline-none"
                                placeholder="First Name"
                                defaultValue={user.firstName}
                            />
                            <input
                                className="p-3 bg-gray-50 rounded-lg outline-none"
                                placeholder="Last Name"
                                defaultValue={user.lastName}
                            />
                            <input
                                className="p-3 bg-gray-50 rounded-lg outline-none col-span-2"
                                placeholder="Email"
                                defaultValue={user.email}
                            />
                        </div>

                        <textarea
                            className="mt-4 w-full p-3 bg-gray-50 rounded-lg outline-none"
                            rows="3"
                            defaultValue="Product Manager passionate about building efficient workflows and empowering teams."
                        />
                    </div>

                    {/* Preferences */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <h3 className="font-semibold mb-4">Preferences</h3>

                        {[
                            { label: "Dark Mode", desc: "Enable dark theme" },
                            { label: "Email Notifications", desc: "Receive updates via mail" },
                            { label: "Task Updates", desc: "Get notified about changes" },
                            { label: "Mentions", desc: "Notify when mentioned" },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="flex justify-between items-center py-3 border-b last:border-none"
                            >
                                <div>
                                    <p className="text-sm font-medium">{item.label}</p>
                                    <p className="text-xs text-gray-400">{item.desc}</p>
                                </div>

                                {/* Toggle */}
                                <div className="w-10 h-5 bg-gray-300 rounded-full relative cursor-pointer">
                                    <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 left-0.5"></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Logout */}
                    <button className="self-start bg-red-400 text-white px-5 py-2 rounded-lg">
                        Logout
                    </button>
                </div>
                {modalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-auto p-4">
                        <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-[350px] overflow-auto">
                            <h3 className="text-lg font-semibold mb-2">Edit Profile Photo</h3>

                            <div className="relative w-[300px] h-[300px] bg-gray-200">
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

                            <div className="flex justify-end space-x-2 mt-3">
                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDone}
                                    className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;