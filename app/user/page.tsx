"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ArrowRight, LogOut, Package, SearchCheck } from "lucide-react";
import { toast } from "react-hot-toast";

type LostItem = {
  _id: string;
  title: string;
  category: string;
  lostLocation: string;
  lostDate: string;
  status: string;
  description: string;
};

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

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getLostStatusClass(status: string) {
  switch (status) {
    case "under_review":
      return "border-amber-500/30 bg-amber-500/10 text-amber-300";
    case "matched":
      return "border-sky-500/30 bg-sky-500/10 text-sky-300";
    case "returned":
    case "claimed":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    case "closed":
      return "border-zinc-700 bg-zinc-800 text-zinc-300";
    default:
      return "border-blue-500/30 bg-blue-500/10 text-blue-300";
  }
}

function getFoundStatusClass(status: string) {
  switch (status) {
    case "under_verification":
      return "border-amber-500/30 bg-amber-500/10 text-amber-300";
    case "matched":
      return "border-sky-500/30 bg-sky-500/10 text-sky-300";
    case "returned":
    case "claimed":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    case "archived":
      return "border-zinc-700 bg-zinc-800 text-zinc-300";
    default:
      return "border-blue-500/30 bg-blue-500/10 text-blue-300";
  }
}

export default function UserPage() {
  const router = useRouter();
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        const [lostResponse, foundResponse] = await Promise.all([
          axios.get("/api/users/lost"),
          axios.get("/api/users/found"),
        ]);

        setLostItems(lostResponse.data.lostItems || []);
        setFoundItems(foundResponse.data.foundItems || []);
      } catch (error: unknown) {
        const message =
          axios.isAxiosError(error)
            ? error.response?.data?.error || "Failed to load your reports"
            : "Failed to load your reports";

        toast.error(message);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get("/api/users/logout");
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error: unknown) {
      const message =
        axios.isAxiosError(error)
          ? error.response?.data?.error || "Error in logout"
          : "Error in logout";

      toast.error(message);
    }
  };

  const totalReports = lostItems.length + foundItems.length;
  const activeCases =
    lostItems.filter((item) => item.status !== "closed").length +
    foundItems.filter((item) => item.status !== "archived").length;

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-900 p-6 shadow-2xl shadow-black/30 lg:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_26%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
                User Dashboard
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
                Track your lost and found reports in one place.
              </h1>
              <p className="mt-4 text-sm leading-6 text-zinc-400 sm:text-base">
                This page shows the reports you have already submitted, along
                with their current status and important details.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/lost"
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Report lost item
              </Link>
              <Link
                href="/found"
                className="inline-flex items-center justify-center rounded-full border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                Report found item
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800 hover:text-white"
              >
                <LogOut className="size-4" />
                Logout
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 shadow-2xl shadow-black/20">
            <p className="text-sm text-zinc-400">Total reports</p>
            <p className="mt-3 text-3xl font-black text-white">{totalReports}</p>
          </div>
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 shadow-2xl shadow-black/20">
            <p className="text-sm text-zinc-400">Lost reports</p>
            <p className="mt-3 text-3xl font-black text-white">{lostItems.length}</p>
          </div>
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 shadow-2xl shadow-black/20">
            <p className="text-sm text-zinc-400">Active cases</p>
            <p className="mt-3 text-3xl font-black text-white">{activeCases}</p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[1.75rem] border border-zinc-800 bg-zinc-900 p-6 shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-blue-300">
                  <SearchCheck className="size-4" />
                  <p className="text-sm font-semibold uppercase tracking-[0.24em]">
                    Lost Reports
                  </p>
                </div>
                <h2 className="mt-3 text-2xl font-bold text-white">
                  Your lost items
                </h2>
              </div>
              <Link
                href="/lost"
                className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
              >
                Add new
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {loading ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-sm text-zinc-400">
                  Loading your lost reports...
                </div>
              ) : lostItems.length === 0 ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-center">
                  <p className="text-base font-semibold text-white">
                    No lost reports yet
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    If you lose something, you can submit your first report from
                    the lost item page.
                  </p>
                </div>
              ) : (
                lostItems.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-white">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm text-zinc-400">
                          {formatLabel(item.category)}
                        </p>
                      </div>
                      <span
                        className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getLostStatusClass(
                          item.status
                        )}`}
                      >
                        {formatLabel(item.status)}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-zinc-400">
                      <p>
                        <span className="text-zinc-500">Location:</span>{" "}
                        {item.lostLocation}
                      </p>
                      <p>
                        <span className="text-zinc-500">Date:</span>{" "}
                        {formatDate(item.lostDate)}
                      </p>
                      <p className="leading-6">{item.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-zinc-800 bg-zinc-900 p-6 shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-blue-300">
                  <Package className="size-4" />
                  <p className="text-sm font-semibold uppercase tracking-[0.24em]">
                    Found Reports
                  </p>
                </div>
                <h2 className="mt-3 text-2xl font-bold text-white">
                  Your found items
                </h2>
              </div>
              <Link
                href="/found"
                className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
              >
                Add new
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {loading ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-sm text-zinc-400">
                  Loading your found reports...
                </div>
              ) : foundItems.length === 0 ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-center">
                  <p className="text-base font-semibold text-white">
                    No found reports yet
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    If you find something, report it so the admin team can help
                    match it with the real owner.
                  </p>
                </div>
              ) : (
                foundItems.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-white">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm text-zinc-400">
                          {formatLabel(item.category)}
                        </p>
                      </div>
                      <span
                        className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getFoundStatusClass(
                          item.status
                        )}`}
                      >
                        {formatLabel(item.status)}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-zinc-400">
                      <p>
                        <span className="text-zinc-500">Location:</span>{" "}
                        {item.foundLocation}
                      </p>
                      <p>
                        <span className="text-zinc-500">Date:</span>{" "}
                        {formatDate(item.foundDate)}
                      </p>
                      <p>
                        <span className="text-zinc-500">Current holder:</span>{" "}
                        {item.currentHolder ? formatLabel(item.currentHolder) : "Not set"}
                      </p>
                      <p>
                        <span className="text-zinc-500">Storage location:</span>{" "}
                        {item.storageLocation || "Not set"}
                      </p>
                      <p className="leading-6">{item.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
