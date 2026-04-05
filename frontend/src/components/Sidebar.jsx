// import React, { useState } from 'react';
// import { MdDashboard } from "react-icons/md";

// export default function Sidebar({ selected, setSelected }) {
//     const MyTaskIcon = () => (
//     <svg width="33" height="24" viewBox="0 0 33 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//         <g id="My-task">
//         <g id="carbon:task">
//         <path id="Vector" d="M19 15.135L16.3075 12.4425L15.25 13.5L19 17.25L25.75 10.5L24.6925 9.435L19 15.135Z" fill="#6B7280"/>
//         <path id="Vector_2" d="M27.25 3.79821H25V3.03214C25 2.62579 24.842 2.23609 24.5607 1.94875C24.2794 1.66142 23.8978 1.5 23.5 1.5H17.5C17.1022 1.5 16.7206 1.66142 16.4393 1.94875C16.158 2.23609 16 2.62579 16 3.03214V3.79821H13.75C13.3522 3.79821 12.9706 3.95963 12.6893 4.24696C12.408 4.53429 12.25 4.924 12.25 5.33035V21.4178C12.25 21.8242 12.408 22.2139 12.6893 22.5012C12.9706 22.7885 13.3522 22.95 13.75 22.95H27.25C27.6478 22.95 28.0294 22.7885 28.3107 22.5012C28.592 22.2139 28.75 21.8242 28.75 21.4178V5.33035C28.75 4.924 28.592 4.53429 28.3107 4.24696C28.0294 3.95963 27.6478 3.79821 27.25 3.79821ZM17.5 3.03214H23.5V6.09642H17.5V3.03214ZM27.25 21.4178H13.75V5.33035H16V7.62856H25V5.33035H27.25V21.4178Z" fill="#6B7280"/>
//         </g>
//         <path id="Vector_3" d="M12 14C13.6101 13.999 15.1957 14.1879 16.7568 14.5674C18.3163 14.9465 19.8541 15.5131 21.3701 16.2686V16.2695C22.0122 16.6016 22.5273 17.0812 22.9189 17.7188C23.3076 18.3516 23.5009 19.0421 23.5 19.7998V23.5H0.5V19.7998C0.500034 19.0407 0.694363 18.3505 1.08301 17.7188C1.47341 17.0842 1.98563 16.6055 2.62402 16.2725C4.14181 15.5136 5.681 14.946 7.24219 14.5684C8.80361 14.1907 10.3895 14.001 12 14ZM12 0.5C13.5163 0.5 14.8018 1.03423 15.8838 2.11621C16.9658 3.19819 17.5 4.48366 17.5 6C17.5 7.51634 16.9658 8.80181 15.8838 9.88379C14.8018 10.9658 13.5163 11.5 12 11.5C10.4837 11.5 9.19819 10.9658 8.11621 9.88379C7.03423 8.80181 6.5 7.51634 6.5 6C6.5 4.48366 7.03423 3.19819 8.11621 2.11621C9.19819 1.03423 10.4837 0.5 12 0.5Z" fill="#1F2937" stroke="white"/>
//         </g>
//     </svg>
//     );

//     const TeamTaskIcon = () => (
//     <svg width="40" height="24" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//         <g id="Team-task">
//         <g id="My-task">
//         <g id="carbon:task">
//         <path id="Vector" d="M26.5 15.135L23.8075 12.4425L22.75 13.5L26.5 17.25L33.25 10.5L32.1925 9.435L26.5 15.135Z" fill="black"/>
//         <path id="Vector_2" d="M34.75 3.79821H32.5V3.03214C32.5 2.62579 32.342 2.23609 32.0607 1.94875C31.7794 1.66142 31.3978 1.5 31 1.5H25C24.6022 1.5 24.2206 1.66142 23.9393 1.94875C23.658 2.23609 23.5 2.62579 23.5 3.03214V3.79821H21.25C20.8522 3.79821 20.4706 3.95963 20.1893 4.24696C19.908 4.53429 19.75 4.924 19.75 5.33035V21.4178C19.75 21.8242 19.908 22.2139 20.1893 22.5012C20.4706 22.7885 20.8522 22.95 21.25 22.95H34.75C35.1478 22.95 35.5294 22.7885 35.8107 22.5012C36.092 22.2139 36.25 21.8242 36.25 21.4178V5.33035C36.25 4.924 36.092 4.53429 35.8107 4.24696C35.5294 3.95963 35.1478 3.79821 34.75 3.79821ZM25 3.03214H31V6.09642H25V3.03214ZM34.75 21.4178H21.25V5.33035H23.5V7.62856H32.5V5.33035H34.75V21.4178Z" fill="#1F2937"/>
//         </g>
//         <path id="Vector_3" d="M11.4082 14.248C12.9367 14.2471 14.4418 14.4271 15.9238 14.789C17.4043 15.1506 18.8642 15.6915 20.3037 16.4121H20.3047C20.9105 16.727 21.3964 17.1819 21.7666 17.7871C22.1341 18.388 22.3173 19.0436 22.3164 19.7636V23.2754H0.5V19.7636C0.500077 19.0426 0.683646 18.3877 1.05078 17.7881C1.41976 17.1855 1.90344 16.7308 2.50586 16.415C3.94736 15.691 5.40924 15.1492 6.8916 14.789C8.37396 14.4289 9.87927 14.249 11.4082 14.248ZM11.4082 1.35544C12.8424 1.35544 14.0578 1.86277 15.082 2.89157C16.1062 3.92039 16.6122 5.14232 16.6123 6.58493C16.6123 8.02772 16.1063 9.25036 15.082 10.2793C14.0579 11.308 12.8424 11.8154 11.4082 11.8154C9.97404 11.8154 8.75856 11.308 7.73438 10.2793C6.7101 9.25036 6.2041 8.02772 6.2041 6.58493C6.2042 5.14232 6.71019 3.92039 7.73438 2.89157C8.75857 1.86277 9.974 1.35544 11.4082 1.35544Z" fill="black" stroke="white"/>
//         </g>
//         <path id="Vector_4" d="M18.0596 14C19.6697 13.999 21.2553 14.1879 22.8164 14.5674C24.3759 14.9465 25.9137 15.5131 27.4297 16.2686V16.2695C28.0717 16.6016 28.5869 17.0812 28.9785 17.7188C29.3672 18.3516 29.5605 19.0421 29.5596 19.7998V23.5H6.55957V19.7998C6.5596 19.0407 6.75393 18.3505 7.14258 17.7188C7.53298 17.0842 8.0452 16.6055 8.68359 16.2725C10.2014 15.5136 11.7406 14.946 13.3018 14.5684C14.8632 14.1907 16.4491 14.001 18.0596 14ZM18.0596 0.5C19.5759 0.5 20.8614 1.03423 21.9434 2.11621C23.0253 3.19819 23.5596 4.48366 23.5596 6C23.5596 7.51634 23.0253 8.80181 21.9434 9.88379C20.8614 10.9658 19.5759 11.5 18.0596 11.5C16.5432 11.5 15.2578 10.9658 14.1758 9.88379C13.0938 8.80181 12.5596 7.51634 12.5596 6C12.5596 4.48366 13.0938 3.19819 14.1758 2.11621C15.2578 1.03423 16.5432 0.5 18.0596 0.5Z" fill="black" stroke="white"/>
//         </g>
//     </svg>
//     );

// const tasks = [{label:"My Tasks", icon: MyTaskIcon}, {label:"Team Tasks", icon:TeamTaskIcon}, {label:"Shared Task", icon:null}]



//     return (
//         <div>
//             <aside className="hidden md:flex w-64 bg-black/20 backdrop-blur-xs h-[calc(100vh-1rem)] fixed top-16 z-10 ">
//                 <nav className="p-4 border border-gray-500 w-full">
//                     <div className="mb-8">
//                         <h2 className="text-xs font-semibold text-gray-200 uppercase tracking-wider mb-3">Workspace</h2>
//                         {tasks.map(({ label, icon: Icon }) => (
//                             <button
//                                 key={label}
//                                 onClick={() => setSelected(label)}
//                                 className={`flex items-center gap-2 w-full text-md cursor-pointer
//                                 ${selected === label ? "text-blue-700 bg-blue-50" : "text-gray-700 bg-white"}
//                                 font-medium py-2 px-3 rounded-lg text-left mb-2`}
//                             >
//                                 <span className='w-[50px]'>{Icon && <Icon />}</span>

//                                 {label}
//                             </button>
//                             ))}

//                     </div>
//                 </nav>
//             </aside>
//         </div>
//     )
// }

import { useState } from "react";
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Share2,
  CheckCircle,
  Clock,
  Star,
  Calendar,
  Settings,
  User,
  LogOut,
  ChevronLeft
} from "lucide-react";
import { IoMdClose } from "react-icons/io";

export default function Sidebar({ selected, setSelected, setSidebarOpen }) {
  const [isOpen, setIsOpen] = useState(true);

  const menu = [
    { title: "My Tasks", icon: CheckSquare },
    { title: "Team Tasks", icon: Users },
    { title: "Shared Tasks", icon: Share2 },
  ];

  // const tasks = [{label:"My Tasks", icon: MyTaskIcon}, {label:"Team Tasks", icon:TeamTaskIcon}, {label:"Shared Task", icon:null}]
  const filters = [
    { title: "Completed", icon: CheckCircle, count: 24 },
    { title: "Today", icon: Clock, count: 5 },
    { title: "Priority", icon: Star, count: 2 },
    { title: "Calendar", icon: Calendar },
  ];

  return (
    <div className={`h-screen bg-[#0f172a] text-white flex flex-col transition-all duration-300 w-64  fixed`}>

      <div onClick={()=>setSidebarOpen(false)} className=" p-4 w-fit cursor-pointer">
        <IoMdClose />
      </div>

      {/* Workspace */}
      <div className="px-3 mt-4">

        {isOpen && <p className="text-xs text-gray-400 mb-2">WORKSPACE</p>}
        {menu.map((item, i) => (
          <div key={i} onClick={() => {setSelected(item.title)
            setSidebarOpen(false)
          }}
           className="flex items-center justify-between p-3 hover:bg-gray-800 rounded-lg cursor-pointer">
            <div className="flex items-center gap-3">
              <item.icon size={18} />
              {isOpen && <span>{item.title}</span>}
            </div>
          </div>
        ))}
      </div>



      {/* Bottom */}
      <div className="mt-auto px-3 mb-4">
        {[
          { title: "Settings", icon: Settings },
          { title: "Profile", icon: User },
          { title: "Logout", icon: LogOut },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg cursor-pointer">
            <item.icon size={18} />
            {isOpen && <span>{item.title}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}