
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Package } from "lucide-react";

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
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  }).format(date);
}

function getStatusClass(status: string) {
  switch (status) {
    case "under_verification":
      return "border-amber-500/30 bg-amber-500/10 text-amber-300";
    case "matched":
      return "border-sky-500/30 bg-sky-500/10 text-sky-300";
    case "claimed":
    case "returned":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    case "archived":
      return "border-zinc-700 bg-zinc-800 text-zinc-300";
    default:
      return "border-blue-500/30 bg-blue-500/10 text-blue-300";
  }
}

export default function BrowseFoundPage() {
  const [items, setItems] = useState<FoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    async function fetchItems() {
      try {
        const response = await axios.get("/api/found"); // public route
        setItems(response.data.foundItems || []);
      } catch {
        // handle
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, []);

  const filtered = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.foundLocation.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter
      ? item.category === categoryFilter
      : true;

    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(items.map((i) => i.category))];

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">

        <div>
          <Link
            href="/user"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Back to dashboard
          </Link>

          <div className="mt-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
              Browse
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">
              All found items
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Browse items that have been found and reported. If you see yours,
              click it and submit a claim.
            </p>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Search by title, location, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            title="Filter by category"
            className="rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-sm text-white outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:w-56"
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>

        {/* Items grid */}
        {loading ? (
          <p className="text-sm text-zinc-400">Loading found items...</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
            <Package className="mx-auto size-8 text-zinc-600" />
            <p className="mt-4 text-base font-semibold text-white">No items found</p>
            <p className="mt-2 text-sm text-zinc-400">
              Try adjusting your search or check back later.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <div
                key={item._id}
                className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {item.category.replaceAll("_", " ")}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-widest ${getStatusClass(item.status)}`}
                  >
                    {item.status.replaceAll("_", " ")}
                  </span>
                </div>

                <div className="mt-4 space-y-1.5 text-sm text-zinc-400">
                  <p><span className="text-zinc-500">Found at:</span> {item.foundLocation}</p>
                  <p><span className="text-zinc-500">Date:</span> {formatDate(item.foundDate)}</p>
                  {item.storageLocation && (
                    <p><span className="text-zinc-500">Storage:</span> {item.storageLocation}</p>
                  )}
                </div>

                <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-400">
                  {item.description}
                </p>

                {/* Claim button — only if claimable */}
                <div className="mt-5 pt-4 border-t border-zinc-800">
                  {["available", "under_verification"].includes(item.status) ? (
                    <Link
                      href={`/browse/${item._id}`}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Claim this item
                      <ArrowRight className="size-4" />
                    </Link>
                  ) : (
                    <p className="text-xs text-zinc-500 italic">
                      This item is no longer available for claims.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
