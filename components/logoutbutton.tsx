
"use client";

import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axios.get("/api/users/logout");
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error || "Error in logout"
        : "Error in logout";
      toast.error(message);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800 hover:text-white"
    >
      <LogOut className="size-4" />
      Logout
    </button>
  );
}