"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ResetPassword() {
    const router = useRouter();
    const [token, setToken] = useState("");
    const [password, setPassword] = useState("");
    const [buttonDisable, setButtonDisable] = useState(true);
    const [loading, setLoading] = useState(false);
    const [tokenChecked, setTokenChecked] = useState(false);
    const [tokenValid, setTokenValid] = useState(false);

    useEffect(() => {
        const urlToken = new URLSearchParams(window.location.search).get("token");
        setToken(urlToken || "");
    }, []);

    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setTokenValid(false);
                setTokenChecked(true);
                return;
            }

            try {
                setTokenChecked(false);
                await axios.get(`/api/users/resetpassword?token=${encodeURIComponent(token)}`);
                setTokenValid(true);
            } catch (error: any) {
                setTokenValid(false);
                toast.error(error.response?.data?.error || "Token invalid or expired");
            } finally {
                setTokenChecked(true);
            }
        };

        validateToken();
    }, [token]);

    useEffect(() => {
        setButtonDisable(!(password.length > 0 && token.length > 0 && tokenValid));
    }, [password, token, tokenValid]);

    const onResetPassword = async () => {
        try {
            setLoading(true);
            await axios.post("/api/users/resetpassword", { token, password });
            toast.success("Password updated!");
            router.push("/login");
        } catch (error: any) {
            setTokenValid(false);
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
                disabled={!token || !tokenValid || !tokenChecked}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your new password"
                className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg mb-4 focus:outline-none focus:border-zinc-600 text-white transition-all disabled:opacity-50"
            />

            {!tokenChecked && (
                <p className="text-zinc-400 text-sm mb-4">Checking reset link...</p>
            )}

            {tokenChecked && !tokenValid && (
                <p className="text-red-400 text-sm mb-4">
                    This reset link is invalid, expired, or already used.
                </p>
            )}

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
