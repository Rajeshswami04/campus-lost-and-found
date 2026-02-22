"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function VerifyEmailPage() {
    const [token, setToken] = useState("");
    const [verified, setVerified] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const urlToken = window.location.search.split("=")[1];
        setToken(urlToken || "");
    }, []);

    const verifyUserEmail = async () => {
        try {
            setLoading(true);
            await axios.post('/api/users/verify', { token });
            setVerified(true);
            toast.success("Email verified successfully!");
            setTimeout(() => router.push("/login"), 3000);
        } catch (error: any) {
            console.log(error.response?.data);
            toast.error("Verification failed. Token may be invalid or expired.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-4">
            <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl flex flex-col w-full max-w-md items-center text-center">
                <h1 className="text-3xl font-bold mb-4">Verify Email</h1>
                
                <p className="text-zinc-400 mb-8">
                    {!verified 
                        ? "Please click the button below to finalize your registration." 
                        : "Your account has been activated."}
                </p>

                {token ? (
                    <button 
                        onClick={verifyUserEmail}
                        disabled={loading || verified}
                        className={`w-full p-3 rounded-lg font-semibold transition-all ${
                            verified 
                            ? "bg-green-600/20 text-green-400 border border-green-600/50 cursor-default"
                            : loading 
                                ? "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.98]"
                        }`}
                    >
                        {loading ? "Verifying..." : verified ? "✓ Verified" : "Confirm Verification"}
                    </button>
                ) : (
                    <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 w-full">
                        No verification token found in the URL.
                    </div>
                )}
                
                {verified && (
                    <div className="mt-6 flex flex-col items-center animate-pulse">
                        <div className="text-green-400 font-medium">
                            Redirecting to login in 3 seconds...
                        </div>
                    </div>
                )}

                {!verified && !loading && (
                   <button 
                     onClick={() => router.push("/login")}
                     className="mt-6 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                   >
                     Back to Login
                   </button>
                )}
            </div>
        </div>
    );
}