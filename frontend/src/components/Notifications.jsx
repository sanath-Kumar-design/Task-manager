import React, { useState, useEffect } from 'react'
import { IoCheckmarkDoneOutline } from "react-icons/io5";
import { getBaseURL } from '../../utils/api';


export default function Notifications({ className = "", inviteNotifications = [] }) {

  const notificationTypes = ["All", "Invites", "Reminders"]
  const [selectedNotificationType, setSelectedNotificationType] = useState(notificationTypes[0])
  const [localNotification, setLocalNotification] = useState([]);

  useEffect(() => {
    if (inviteNotifications.length && localNotification.length === 0) {
      setLocalNotification(inviteNotifications);
    }
  }, [inviteNotifications, localNotification]);


  const acceptRequest = async (id) => {
    try {
      const res = await fetch(`${getBaseURL()}/accept-request`, {
        method: 'POST',
        credentials: "include",
        headers: { "Content-Type": 'application/json' },
        body: JSON.stringify({ id })
      });

      const data = await res.json();
      

      if (!res.ok) {
        alert(data.error);
        return;
      }

      setLocalNotification(prev =>
        prev.map(n =>
          n.id === id
            ? { ...n, message: `You are now in collaboration with ${n.username}`, status: "accepted" }
            : n
        )
      );

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={`border border-gray-300 px-7 max-w-[350px] py-5 bg-white z-50 h-screen fixed top-16 right-0 ${className}`}>
      <div className='flex items-center justify-between'>
        <h1 className='font-medium text-lg'>Your Notifications</h1>
        <IoCheckmarkDoneOutline className='text-blue-500 text-xl cursor-pointer' />
      </div>
      <div className='mt-2 rounded-lg w-full bg-gray-200 flex gap-3 px-4 py-1'>
        {notificationTypes.map((notifications, i) => (
          <div key={i}
            onClick={() => setSelectedNotificationType(notifications)}
            className={`duration-200 cursor-pointer px-3 py-1 rounded-lg ${selectedNotificationType == notifications ? "bg-white" : "bg-gray-200"} `}
          >
            {notifications}
          </div>
        ))}
      </div>
      {localNotification.length > 0 ? (
        localNotification.map(n => (
          <div key={n.id} className=' border-b py-2 border-gray-300'>
            <div className='my-2 border-gray-200 py-2 hover:bg-gray-100 px-2'>{n.message}</div>
            {n.status === "pending" && (
              <div className='flex gap-2'>
                <button className='px-2 py-1 rounded-sm bg-blue-500 text-white hover:bg-blue-600 cursor-pointer' onClick={() => acceptRequest(n.id)}>Accept</button>
                <button className='px-2 py-1 rounded-sm border-gray-300 border hover:bg-gray-100 cursor-pointer'>Decline</button>
              </div>
            )}
          </div >

        ))
      ) : <div className="flex mt-60 justify-center h-full text-gray-400">No Notification</div>}
    </div>
  )
}
