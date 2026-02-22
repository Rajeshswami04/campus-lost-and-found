"use client"
import Link from "next/link"
import React , {useEffect,useState} from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import toast from "react-hot-toast"

export default function Forgotpassword(){
    const [email,setEmail]=useState("");
    const [buttondisable,setbuttonDisable]=useState(true);
    const router=useRouter();
    const forgotpassword=async()=>{
        try {
           await axios.post("/api/users/forgotpassword",{email});
             toast.success("email sent");
            router.push("/login");
        } catch (error:any) {
            toast.error(error.message);
        }
    }
    useEffect(()=>{
        if(email.length>0)setbuttonDisable(false);
    },[email]);
    return(
        <div className="flex flex-col items-center justify-center  min-h-screen py-2 bg-black">
            <h1 className="text-white" >Forgot password</h1> <hr />
            <label htmlFor="email" className="text-white">email</label>
            <input type="text" id="email" value={email} className="p-2 border  border-gray-300 rounded-lg mb-4 focus:outline-none, focus:border-gray-600 text-white"
            onChange={(e)=>setEmail(e.target.value)} />
            <button onClick={forgotpassword} disabled={buttondisable}
            className="p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600 text-white"
            >send email</button>
        </div>
    )
}