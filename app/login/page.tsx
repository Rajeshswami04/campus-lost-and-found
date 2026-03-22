"use client";
import Link from "next/link";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";


export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = React.useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = React.useState(false);
  const [buttonDisabled, setButtonDisable] = React.useState(false);

  const onLogin = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/users/login", user);
      toast.success("Logged in successfully");
      const role = response.data?.role;
      router.push(role === "admin" ? "/admin" : "/user");
    } catch (error: any) {
      console.log("Login Failed ", error.message);
      toast.error(error.response?.data?.message || error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.email.length > 0 && user.password.length > 0) {
      setButtonDisable(false);
    } else {
      setButtonDisable(true);
    }
  }, [user]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-zinc-950 text-white">
      <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl flex flex-col w-full max-w-md">
        <h1 className="text-3xl font-bold mb-4 text-center">
          {loading ? "Processing..." : "Login"}
        </h1>
        <p className="text-zinc-400 text-sm mb-6 text-center">Enter your credentials to access your account</p>
        
        <hr className="border-zinc-800 mb-6" />

        <label htmlFor="email" className="text-sm font-medium mb-1">Email</label>
        <input
          className="p-3 bg-zinc-800 border border-zinc-700 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          id="email"
          type="email"
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          placeholder="email@nitj.ac.in"
        />

        <label htmlFor="password"  className="text-sm font-medium mb-1">Password</label>
        <input
          className="p-3 bg-zinc-800 border border-zinc-700 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          id="password"
          type="password"
          value={user.password}
          onChange={(e) => setUser({ ...user, password: e.target.value })}
          placeholder="••••••••"
        />

        <button
          onClick={onLogin}
          disabled={buttonDisabled || loading}
          className={`p-3 rounded-lg font-semibold transition-all mb-4 ${
            buttonDisabled 
            ? "bg-zinc-700 text-zinc-500 cursor-not-allowed" 
            : "bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.98]"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="flex flex-col gap-2 items-center text-sm">
          <Link href="/signup" className="text-blue-400 hover:underline">
            Don't have an account? <span className="font-bold">Sign up</span>
          </Link>
          <Link href="/forgotpassword"  className="text-zinc-500 hover:text-zinc-300 transition-colors">
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
}
