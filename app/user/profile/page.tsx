"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { ArrowLeft, Save, UserRound } from "lucide-react";

type basicprofile = {
  username: string;
  ID: string;
  email: string;
  role: string;
  accountStatus: string;
  department: string;
  yearOfStudy: string;
  phoneNumber: string;
  hostelOrBlock: string;
  avatar: string;
};

const emptyProfile: basicprofile = {
  username: "",
  ID: "",
  email: "",
  role: "",
  accountStatus: "",
  department: "",
  yearOfStudy: "",
  phoneNumber: "",
  hostelOrBlock: "",
  avatar: "",
};

function formatLabel(value: string) {
  return value ? value.replaceAll("_", " ") : "Not set";
}

export default function UserProfilePage() {
  const [profile, setProfile] = useState<basicprofile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await axios.get("/api/users/profile");
        setProfile({
          ...emptyProfile,
          ...response.data.user,
          yearOfStudy: response.data.user?.yearOfStudy
            ? String(response.data.user.yearOfStudy)
            : "",
        });
      } catch (error: unknown) {
        const message =  "Failed to load profile";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const updateField = (field: keyof basicprofile, value: string) => {
    setProfile((currentProfile) => ({
      ...currentProfile,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);
      const response = await axios.patch("/api/users/profile", {
        username: profile.username,
        department: profile.department,
        yearOfStudy: profile.yearOfStudy,
        phoneNumber: profile.phoneNumber,
        hostelOrBlock: profile.hostelOrBlock,
        avatar: profile.avatar,
      });

      setProfile({
        ...profile,
        ...response.data.user,
        yearOfStudy: response.data.user?.yearOfStudy
          ? String(response.data.user.yearOfStudy)
          : "",
      });
      toast.success("Profile updated successfully");
    } catch (error: unknown) {
      const message =  "Failed to update profile";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          href="/user"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>

        <section className="relative overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-900 p-6 shadow-2xl shadow-black/30 lg:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_26%)]" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
                Profile
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-white">
                Edit details.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                Keep your contact and campus information current so the admin
                team can reach you quickly when an item matches.
              </p>
            </div>
            <div className="flex size-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 text-blue-300">
              <UserRound className="size-8" />
            </div>
          </div>
        </section>

        <form
          onSubmit={handleSubmit}
          className="rounded-[1.75rem] border border-zinc-800 bg-zinc-900 p-6 shadow-2xl shadow-black/20"
        >
          {loading ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-sm text-zinc-400">
              Loading your profile...
            </div>
          ) : (
            <>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="username"
                    className="mb-2 block text-sm font-semibold text-zinc-200"
                  >
                    Name
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={profile.username}
                    onChange={(event) =>
                      updateField("username", event.target.value)
                    }
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="ID"
                    className="mb-2 block text-sm font-semibold text-zinc-200"
                  >
                    Identification number
                  </label>
                  <input
                    id="ID"
                    type="text"
                    value={profile.ID}
                    disabled
                    className="w-full cursor-not-allowed rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-zinc-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-zinc-200"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full cursor-not-allowed rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-zinc-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="department"
                    className="mb-2 block text-sm font-semibold text-zinc-200"
                  >
                    Department
                  </label>
                  <input
                    id="department"
                    type="text"
                    value={profile.department}
                    onChange={(event) =>
                      updateField("department", event.target.value)
                    }
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                    placeholder="Computer Science"
                  />
                </div>

                <div>
                  <label
                    htmlFor="yearOfStudy"
                    className="mb-2 block text-sm font-semibold text-zinc-200"
                  >
                    Year of study
                  </label>
                  <select
                    id="yearOfStudy"
                    value={profile.yearOfStudy}
                    onChange={(event) =>
                      updateField("yearOfStudy", event.target.value)
                    }
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                  >
                    <option value="">Not set</option>
                    <option value="1">1st year</option>
                    <option value="2">2nd year</option>
                    <option value="3">3rd year</option>
                    <option value="4">4th year</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="mb-2 block text-sm font-semibold text-zinc-200"
                  >
                    Phone number
                  </label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    value={profile.phoneNumber}
                    onChange={(event) =>
                      updateField("phoneNumber", event.target.value)
                    }
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                    placeholder="Mobile number"
                  />
                </div>

                <div>
                  <label
                    htmlFor="hostelOrBlock"
                    className="mb-2 block text-sm font-semibold text-zinc-200"
                  >
                    Hostel or block
                  </label>
                  <input
                    id="hostelOrBlock"
                    type="text"
                    value={profile.hostelOrBlock}
                    onChange={(event) =>
                      updateField("hostelOrBlock", event.target.value)
                    }
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                    placeholder="Hostel A / Block 2"
                  />
                </div>

                <div>
                  <label
                    htmlFor="avatar"
                    className="mb-2 block text-sm font-semibold text-zinc-200"
                  >
                    Avatar URL
                  </label>
                  <input
                    id="avatar"
                    type="url"
                    value={profile.avatar}
                    onChange={(event) =>
                      updateField("avatar", event.target.value)
                    }
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="mt-6 grid gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-sm sm:grid-cols-2">
                <p className="text-zinc-400">
                  Role:{" "}
                  <span className="font-semibold capitalize text-white">
                    {formatLabel(profile.role)}
                  </span>
                </p>
                <p className="text-zinc-400">
                  Account status:{" "}
                  <span className="font-semibold capitalize text-white">
                    {formatLabel(profile.accountStatus)}
                  </span>
                </p>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
                >
                  <Save className="size-4" />
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </main>
  );
}
