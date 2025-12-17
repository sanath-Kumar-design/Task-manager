import React from 'react';
import { IoWarningOutline } from "react-icons/io5";
import { getBaseURL } from '../../utils/api';
import { useNavigate } from "react-router-dom";


export default function DeleteAccountModal({onConfirm, onClose}) {

    const navigate = useNavigate()
    const deleteAccount = async() =>{
        try{
            const res = await fetch (`${getBaseURL()}/delete-account`, {
                method: "DELETE",
                credentials:"include"
            })

            if(res.ok){
                navigate("/")
            }
        }catch(err){
            console.log(err);
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500/30 duration-300">
            <div className='flex border-2 border-gray-300 max-w-xl bg-white gap-5 p-5 rounded-lg transform transition duration-300 ease-out scale-0.3 animate-scaleUp m-4'>
                <div>
                    <div className='p-2 rounded-full text-lg bg-red-200 text-red-500 flex items-center justify-center'><IoWarningOutline /></div>
                </div>
                <div className='flex flex-col gap-2'>
                    <h1 className='font-bold text-md md:text-lg '>Deactivate account</h1>
                    <p className='font-normal text-gray-800 text-sm md:text-[17px]'>Are you sure you want to deactivate your account? All of your data will be permanently removed from our servers forever. This action cannot be undone.</p>
                    <div className='flex items-center justify-end gap-2 mt-2'>
                        <button className='px-3 border border-gray-400 font-medium py-2 rounded-lg cursor-pointer' onClick={onClose}>Cancel</button>
                        <button className='px-3 border font-medium py-2 rounded-lg text-white bg-red-500 cursor-pointer' onClick={deleteAccount}>Deactivate</button>
                    </div>
                </div>

            </div>
        </div>
    )
}
