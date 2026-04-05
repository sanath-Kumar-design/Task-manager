import React from 'react'
import { RiDeleteBin6Line } from "react-icons/ri";

export default function DeleteSubTaskModal({ onClose, onConfirm }) {
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center flex-col justify-center">
            <div className='bg-white max-w-[500px] w-full flex items-center flex-col py-10 px-3 rounded-2xl'>
                <div>
                    <RiDeleteBin6Line className='text-red-500' />
                </div>
                <div className='text-center mt-5 '>
                    <h1 className='font-bold text-2xl'>Delete Subtask?</h1>
                    Are you sure you want to delete this subtask? This action cannot be undone.
                </div>
                <div className='flex justify-end w-full gap-3 mt-5'>
                    <button onClick={onClose} className='border px-3 py-1 rounded-lg border-gray-300 cursor-pointer'>Cancel</button>
                    <button onClick={onConfirm} className='border px-3 py-1 rounded-lg bg-red-500 text-white cursor-pointer'>Delete</button>
                </div>
            </div>
        </div>
    )
}