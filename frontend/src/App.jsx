import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { UserContext } from "./context/UserContext";
import Signup from "./Pages/Signup";
import Login from './Pages/Login'
import UserName from "./Pages/userName";
import Homepage from "./Pages/Homepage";
import ProfilePage from "./Pages/ProfilePage";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getBaseURL } from "../utils/api";


export default function App() {

  const [user, setUser] = useState(null);


useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await fetch(`${getBaseURL()}/userInfo`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!res.ok) {
        // user not logged in or logged out
        setUser(null);  // clear user state
        return;          // stop here, no console error
      }

      const data = await res.json();
      setUser(data);     // set user if logged in
    } catch (err) {
      console.log(err);  // only unexpected errors
    }
  };

  fetchUser();
}, []);




  return (
    <div>
      <ToastContainer />
      <UserContext.Provider value={{ user, setUser }}>
        <Routes>
          <Route path="/profilePage" element={<ProfilePage />} />
          <Route path="/username" element={<UserName />} />
          <Route path='/' element={<Signup />} />
          <Route path='/login' element={<Login />} />
          <Route path="/homepage" element={<Homepage setUser={setUser} />} />
        </Routes>
      </UserContext.Provider>
    </div>
  )
}
