"use client";
import { NextResponse } from "next/server";
import React from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
export default function UserPage() {
  const router = useRouter();
  const logout = async () => {
    try {
      await axios.get("/api/users/logout");
      toast.success("logged out successfully");
      router.push("/login");
      return NextResponse.json({ success: true, message: "logged out" });
    } catch (error: any) {
      console.log(error);
      console.log(error.message);
      return NextResponse.json({ success: false, message: "error in logout" });
    }
  };
  return (
    <div className="flex flex-col items-center min-h-screen justify-center bg-black text-white">
      <h1 className=" flex flex-col justify-center bg-black text-white">
        {" "}
        I am user
      </h1>
      <button onClick={logout} className="bg-black text-white">
        logout
      </button>
    </div>
  );
}
