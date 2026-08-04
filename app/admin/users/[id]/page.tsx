import Link from "next/link";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, IdCard, CalendarDays, ShieldCheck } from "lucide-react";
import { connect } from "@/app/db/dbConfig";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { hasRequiredRole, verifyAuthToken } from "@/lib/auth";
import User from "@/models/Users";
import AdminUserStatusSelect from "@/components/admin-user-status-select";

export const dynamic = "force-dynamic";

type UserDetail = {
  _id: string;
  username?: string;
  ID?: string;
  email?: string;
  phone?: string;
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

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
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

  const { id } = await params;

  await connect();

  const user = await User.findById(id)
    .select("username ID email phone role accountStatus createdAt")
    .lean();

  if (!user) {
    notFound();
  }

  const serializedUser = { ...user, _id: String(user._id) };

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            className="h-8 rounded-full border border-zinc-700 bg-zinc-950 px-3 text-sm text-blue-300 hover:bg-zinc-800 hover:text-white"
          >
            <Link href="/admin/claims">Review Claims</Link>
          </Button>
        </div>

        <Card className="border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/20">
          <CardHeader className="border-b border-zinc-800 pb-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-2xl font-bold text-white">
                {serializedUser.username || "Unnamed user"}
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline" className={getRoleClass(serializedUser.role)}>
                  {serializedUser.role}
                </Badge>
                <Badge
                  variant="outline"
                  className={getStatusClass(serializedUser.accountStatus)}
                >
                  {serializedUser.accountStatus}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <IdCard className="mt-0.5 size-4 text-blue-300" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    User ID
                  </p>
                  <p className="mt-1 text-sm text-white">
                    {serializedUser.ID || "Not set"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <Mail className="mt-0.5 size-4 text-blue-300" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Email
                  </p>
                  <p className="mt-1 text-sm text-white">
                    {serializedUser.email || "No email on file"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <Phone className="mt-0.5 size-4 text-blue-300" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Phone
                  </p>
                  <p className="mt-1 text-sm text-white">
                    {serializedUser.phone || "No phone"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <CalendarDays className="mt-0.5 size-4 text-blue-300" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Joined
                  </p>
                  <p className="mt-1 text-sm text-white">
                    {formatShortDate(serializedUser.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <div className="flex items-center gap-2 pb-3">
                <ShieldCheck className="size-4 text-blue-300" />
                <p className="text-sm font-semibold text-white">
                  Account status
                </p>
              </div>
              <AdminUserStatusSelect
                userId={serializedUser._id}
                currentStatus={serializedUser.accountStatus}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}