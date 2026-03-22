"use client";
import Link from "next/link";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();
  const [user, setUser] = React.useState({
    email: "",
    password: "",
    ID: "",
    username: "",
  });
  const [buttonDisabled, setButtonDisable] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (
      user.email.length > 0 &&
      user.password.length > 0 &&
      user.username.length > 0 &&
      user.ID.length > 0
    ) {
      setButtonDisable(false);
    } else {
      setButtonDisable(true);
    }
  }, [user]);

  const onSignup = async () => {
    try {
      setLoading(true);
      await axios.post("/api/users/signup", user);
      toast.success("Signup successful!");
      toast.success("please verify also from emailbox ")
      router.push("/login");
    } catch (error: any) {
    toast.error(error.response?.data?.message || error.response?.data?.error || error.message);
      console.log("Signup error: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-zinc-950 text-white">
      <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl flex flex-col w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-center">
          {loading ? "Processing..." : "Create Account"}
        </h1>
        <p className="text-zinc-400 text-sm mb-6 text-center">Join us by filling out the details below</p>
        
        <hr className="border-zinc-800 mb-6" />

        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="username" className="text-sm font-medium block mb-1">Username</label>
            <input
              className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white placeholder-zinc-500"
              id="username"
              type="text"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              placeholder="johndoe"
            />
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium block mb-1">Email</label>
            <input
              className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white placeholder-zinc-500"
              id="email"
              type="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              placeholder="email@nitj.ac.in"
            />
          </div>

          <div>
            <label htmlFor="ID" className="text-sm font-medium block mb-1">Identification Number</label>
            <input
              className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white placeholder-zinc-500"
              id="ID"
              type="text"
              value={user.ID}
              onChange={(e) => setUser({ ...user, ID: e.target.value })}
              placeholder="24109082"
            />
          </div>

          <div>
            <label htmlFor="password"  className="text-sm font-medium block mb-1">Password</label>
            <input
              className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white placeholder-zinc-500"
              id="password"
              type="password"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          onClick={onSignup}
          disabled={buttonDisabled || loading}
          className={`mt-8 p-3 rounded-lg font-semibold transition-all ${
            buttonDisabled || loading
            ? "bg-zinc-700 text-zinc-500 cursor-not-allowed" 
            : "bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.98]"
          }`}
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        <div className="mt-6 text-center text-sm">
          <span className="text-zinc-400">Already have an account? </span>
          <Link href="/login" className="text-blue-400 hover:underline font-bold">
            Login here
          </Link>
        </div>
        <div className="mt-6 text-center text-sm">
          <span className="text-zinc-400">Forgot Password ? </span>
          <Link href="/forgotpassword" className="text-blue-400 hover:underline font-bold">
            change here
          </Link>
        </div>
      </div>
    </div>
  );
}