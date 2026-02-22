"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ResetPassword() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [token, setToken] = useState("");
    const [password, setPassword] = useState("");
    const [buttonDisable, setButtonDisable] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const urlToken = searchParams.get("token");
        setToken(urlToken || "");
    }, [searchParams]);

    useEffect(() => {
        if (password.length > 0 && token.length > 0) {
            setButtonDisable(false);
        } else {
            setButtonDisable(true);
        }
    }, [password, token]);

    const onResetPassword = async () => {
        try {
            setLoading(true);
            await axios.post("/api/users/resetpassword", { token, password });
            toast.success("Password updated!");
            router.push("/login");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Token invalid or expired");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950">
            
                <h1 className="text-white text-2xl font-bold text-center mb-4">Reset Password</h1>
                <hr className="border-zinc-800 mb-6" />

                <label htmlFor="password" className="text-zinc-400 text-sm mb-2">
                New Password
                </label>
                <input
                    type="password"
                    id="password"
                    disabled={!token}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg mb-4 focus:outline-none focus:border-zinc-600 text-white transition-all disabled:opacity-50"
                />
                <button
                    onClick={onResetPassword}
                    disabled={buttonDisable || loading}
                    className={`p-2 rounded-lg font-semibold transition-all mb-4
                        ${buttonDisable || loading 
                            ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
                            : "bg-zinc-100 text-zinc-950 hover:bg-zinc-200"}`}
                >
                    {loading ? "Updating..." : "Update Password"}
                </button>

                <Link href="/login" className="text-zinc-400 text-sm text-center hover:text-white transition-colors">
                    Cancel
                </Link>
        </div>
    );
}