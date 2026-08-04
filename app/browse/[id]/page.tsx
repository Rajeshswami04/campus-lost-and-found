
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ClaimFoundItemForm from "@/components/claim-found-item-form";

type FoundItem = {
  _id: string;
  title: string;
  category: string;
  foundLocation: string;
  foundDate: string;
  status: string;
  description: string;
  currentHolder?: string;
  storageLocation?: string;
  verificationQuestions: string[];
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  }).format(date);
}

export default function FoundItemClaimPage() {
  const { id } = useParams();
  const [item, setItem] = useState<FoundItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItem() {
      try {
        const response = await axios.get(`/api/users/found/${id}`);
        setItem(response.data.foundItem);
      } catch {
        // handle
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchItem();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
        <p className="text-zinc-400">Loading...</p>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
        <p className="text-zinc-400">Item not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* item details */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{item.title}</h1>
              <p className="mt-1 text-sm text-zinc-400">
                {item.category.replaceAll("_", " ")}
              </p>
            </div>
            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-300">
              {item.status.replaceAll("_", " ")}
            </span>
          </div>

          <div className="space-y-2 text-sm text-zinc-400">
            <p><span className="text-zinc-500">Found at:</span> {item.foundLocation}</p>
            <p><span className="text-zinc-500">Date:</span> {formatDate(item.foundDate)}</p>
            {item.currentHolder && (
              <p>
                <span className="text-zinc-500">Held by:</span>{" "}
                {item.currentHolder.replaceAll("_", " ")}
              </p>
            )}
            {item.storageLocation && (
              <p>
                <span className="text-zinc-500">Storage:</span> {item.storageLocation}
              </p>
            )}
            <p className="leading-6">{item.description}</p>
          </div>
        </div>
        <ClaimFoundItemForm
          foundItemId={item._id}
          verificationQuestions={item.verificationQuestions}
          itemStatus={item.status}
        />

      </div>
    </main>
  );
}