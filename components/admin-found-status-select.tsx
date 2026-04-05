"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const foundStatuses = [
  "available",
  "under_verification",
  "matched",
  "claimed",
  "returned",
  "archived",
];

export default function AdminFoundStatusSelect({
  itemId,
  currentStatus,
}: {
  itemId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleChange = async (nextStatus: string) => {
    setStatus(nextStatus);
    setLoading(true);

    try {
      const response = await axios.patch(`/api/admin/found/${itemId}`, {
        status: nextStatus,
      });

      toast.success(response.data.message || "Found item status updated");
      router.refresh();
    } catch (error: unknown) {
      setStatus(currentStatus);

      const message = axios.isAxiosError(error)
        ? error.response?.data?.error || "Failed to update found item status"
        : "Failed to update found item status";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      value={status}
      onChange={(event) => handleChange(event.target.value)}
      disabled={loading}
      className="w-full min-w-0 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 sm:w-[170px] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {foundStatuses.map((itemStatus) => (
        <option key={itemStatus} value={itemStatus}>
          {itemStatus.replaceAll("_", " ")}
        </option>
      ))}
    </select>
  );
}
