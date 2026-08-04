import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Users as UsersIcon, ArrowLeft } from "lucide-react";

import { connect } from "@/app/db/dbConfig";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { hasRequiredRole, verifyAuthToken } from "@/lib/auth";
import User from "@/models/Users";

export const dynamic = "force-dynamic";

type UserRow = {
  _id: string;
  username?: string;
  ID?: string;
  email?: string;
  role: string;
  accountStatus: string;
  createdAt?: Date | string;
};

function formatShortDate(value?: Date | string) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getStatusClass(status: string) {
  switch (status) {
    case "active":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    case "blocked":
      return "border-red-500/30 bg-red-500/10 text-red-300";
    default:
      return "border-blue-500/30 bg-blue-500/10 text-blue-300";
  }
}

function getRoleClass(role: string) {
  switch (role) {
    case "admin":
      return "border-purple-500/30 bg-purple-500/10 text-purple-300";
    default:
      return "border-zinc-700 bg-zinc-800 text-zinc-300";
  }
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    const authUser = verifyAuthToken(token);
    if (!hasRequiredRole(authUser.role, ["admin"])) {
      redirect("/user");
    }
  } catch {
    redirect("/login");
  }

  const params = await searchParams;
  const q = (params.q || "").trim();
  const roleFilter = params.role || "all";
  const statusFilter = params.status || "all";
  const page = Math.max(1, Number(params.page) || 1);
  const limit = 10;

  await connect();

  const filter: Record<string, unknown> = {};

  if (q) {
    filter.$or = [
      { username: { $regex: q, $options: "i" } },
      { ID: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ];
  }

  if (roleFilter !== "all") {
    filter.role = roleFilter;
  }

  if (statusFilter !== "all") {
    filter.accountStatus = statusFilter;
  }

  const [users, totalCount] = await Promise.all([
    User.find(filter)
      .select("username ID email role accountStatus createdAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean<UserRow[]>(),
    User.countDocuments(filter),
  ]);

  const serializedUsers = users.map((u) => ({
    ...u,
    _id: String(u._id),
  }));

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  function buildPageHref(targetPage: number) {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (roleFilter !== "all") sp.set("role", roleFilter);
    if (statusFilter !== "all") sp.set("status", statusFilter);
    sp.set("page", String(targetPage));
    return `/admin/users?${sp.toString()}`;
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-900 p-6 shadow-2xl shadow-black/30 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge className="rounded-full border border-zinc-700 bg-zinc-950 px-4 py-1 text-blue-300">
                  <UsersIcon className="mr-2 size-3.5" />
                  Users
                </Badge>
                <Button
                  asChild
                  variant="ghost"
                  className="h-8 rounded-full border border-zinc-700 bg-zinc-950 px-3 text-sm text-blue-300 hover:bg-zinc-800 hover:text-white"
                >
                  <Link href="/admin/claims">Review Claims</Link>
                </Button>
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Manage  users
              </h1>
              <p className="mt-2 text-sm text-zinc-400">
                {totalCount} total user{totalCount === 1 ? "" : "s"} found.
              </p>
            </div>
          </div>
        </section>

        <Card className="border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/20">
        <CardContent className="pt-2">
            <form className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search by username, ID, or email"
                className="border-zinc-700 bg-zinc-950 text-white placeholder:text-zinc-500"
              />
              <select
                name="role"
                defaultValue={roleFilter}
                className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
              >
                <option value="all">All roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <select
                name="status"
                defaultValue={statusFilter}
                className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-1 text-sm text-white"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
              <Button
                type="submit"
                className="bg-blue-600 text-white hover:bg-blue-500"
              >
                Apply
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/20">
          <CardHeader className="border-b border-zinc-800 pb-5">
            <CardTitle className="text-xl font-bold text-white">
              User list
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-3">
            {serializedUsers.length ? (
              serializedUsers.map((u) => (
                <div
                  key={u._id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                    <Link
                        href={`/admin/users/${u._id}`}
                        className="font-semibold text-white underline-offset-4 hover:text-blue-300 hover:underline"
                    >
                        {u.username || "Unnamed user"}{" "}
                        {u.ID ? (
                        <span className="text-zinc-500">({u.ID})</span>
                        ) : null}
                    </Link>
                    <p className="mt-1 text-sm text-zinc-400">
                        {u.email || "No email on file"}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                        Joined: {formatShortDate(u.createdAt)}
                    </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={getRoleClass(u.role)}
                      >
                        {u.role}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={getStatusClass(u.accountStatus)}
                      >
                        {u.accountStatus}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex min-h-40 flex-col items-center justify-center px-6 py-10 text-center">
                <p className="text-base font-semibold text-white">
                  No users found
                </p>
                <p className="mt-2 max-w-md text-sm leading-6 text-zinc-400">
                  Try adjusting your search or filters.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {totalPages > 1 ? (
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                asChild
                variant={p === page ? "default" : "outline"}
                className={
                  p === page
                    ? "bg-blue-600 text-white hover:bg-blue-500"
                    : "border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-900"
                }
              >
                <Link href={buildPageHref(p)}>{p}</Link>
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}