
"use client";

import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axios.get("/api/users/logout");
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error || "Error in logout"
        : "Error in logout";
      toast.error(message);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      className="border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white"
    >
      <LogOut className="size-4" />
      Logout
    </Button>
  );
}
