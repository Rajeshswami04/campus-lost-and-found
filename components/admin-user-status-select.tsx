"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

const STATUS_OPTIONS = ["active", "blocked"];

export default function AdminUserStatusSelect({
  userId,
  currentStatus,
}: {
  userId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    const previous = status;
    setStatus(newStatus);
    setLoading(true);

    try {
      await axios.patch(`/api/admin/users/${userId}`, {
        accountStatus: newStatus,
      });
      toast.success("Account status updated");
      router.refresh();
    } catch (err) {
      setStatus(previous);
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={loading}
      className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-white disabled:opacity-50"
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}