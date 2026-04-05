import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Clock3,
  Package,
  SearchCheck,
  ShieldCheck,
  Users,
} from "lucide-react";

import { connect } from "@/app/db/dbConfig";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AdminFoundStatusSelect from "@/components/admin-found-status-select";
import AdminLostStatusSelect from "@/components/admin-lost-status-select";
import { hasRequiredRole, verifyAuthToken } from "@/lib/auth";
import FoundItem from "@/models/FoundItem";
import LostItem from "@/models/LostItem";
import User from "@/models/Users";

export const dynamic = "force-dynamic";

type PersonSummary = {
  _id: string;
  username?: string;
  ID?: string;
  email?: string;
};

type LostReport = {
  _id: string;
  title: string;
  category: string;
  lostLocation: string;
  lostDate: Date | string;
  status: string;
  reporter?: PersonSummary | null;
};

type FoundReport = {
  _id: string;
  title: string;
  category: string;
  foundLocation: string;
  foundDate: Date | string;
  status: string;
  finder?: PersonSummary | null;
  currentHolder?: string;
};

function formatShortDate(value: Date | string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
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

function personLabel(person?: PersonSummary | null) {
  if (!person) {
    return "Unknown user";
  }

  if (person.username && person.ID) {
    return `${person.username} (${person.ID})`;
  }

  return person.username || person.ID || person.email || "Unknown user";
}

function normalizePerson(person?: PersonSummary | null) {
  if (!person) {
    return null;
  }

  return {
    ...person,
    _id: String(person._id),
  };
}

function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center">
      <p className="text-base font-semibold text-white">{title}</p>
      <p className="mt-2 max-w-md text-sm leading-6 text-zinc-400">
        {description}
      </p>
      <Button
        asChild
        variant="outline"
        className="mt-5 border-zinc-700 bg-zinc-950 text-zinc-200 hover:bg-zinc-900 hover:text-white"
      >
        <Link href={actionHref}>{actionLabel}</Link>
      </Button>
    </div>
  );
}

function StatCard({
  title,
  value,
  helper,
  icon: Icon,
}: {
  title: string;
  value: number;
  helper: string;
  icon: typeof Users;
}) {
  return (
    <Card className="border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/20">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div>
          <CardDescription className="text-zinc-400">{title}</CardDescription>
          <CardTitle className="mt-2 text-3xl font-black text-white">
            {value}
          </CardTitle>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3 text-blue-300">
          <Icon className="size-5" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-zinc-500">{helper}</p>
      </CardContent>
    </Card>
  );
}

export default async function AdminDashboard() {
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

  await connect();

  const [
    totalUsers,
    totalLostReports,
    totalFoundReports,
    reviewLostReports,
    verificationFoundReports,
    matchedLostReports,
    matchedFoundReports,
    activeUsers,
    blockedUsers,
    adminUsers,
    recentLostReports,
    recentFoundReports,
  ] = await Promise.all([
    User.countDocuments(),
    LostItem.countDocuments(),
    FoundItem.countDocuments(),
    LostItem.countDocuments({ status: "under_review" }),
    FoundItem.countDocuments({ status: "under_verification" }),
    LostItem.countDocuments({ status: "matched" }),
    FoundItem.countDocuments({ status: "matched" }),
    User.countDocuments({ accountStatus: "active" }),
    User.countDocuments({ accountStatus: "blocked" }),
    User.countDocuments({ role: "admin" }),
    LostItem.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("reporter", "username ID email")
      .lean<LostReport[]>(),
    FoundItem.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("finder", "username ID email")
      .lean<FoundReport[]>(),
  ]);

  const attentionCount = reviewLostReports + verificationFoundReports;
  const matchCount = matchedLostReports + matchedFoundReports;
  const serializedLostReports = recentLostReports.map((report) => ({
    ...report,
    _id: String(report._id),
    reporter: normalizePerson(report.reporter),
  }));
  const serializedFoundReports = recentFoundReports.map((report) => ({
    ...report,
    _id: String(report._id),
    finder: normalizePerson(report.finder),
  }));

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-900 p-6 shadow-2xl shadow-black/30 lg:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_26%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <Badge className="rounded-full border border-zinc-700 bg-zinc-950 px-4 py-1 text-blue-300">
                Admin workspace
              </Badge>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
                Review reports, spot matches, and keep the queue under control.
              </h1>
      
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
                  Needs attention
                </p>
                <p className="mt-3 text-3xl font-black text-white">
                  {attentionCount}
                </p>
                <p className="mt-2 text-sm text-zinc-400">
                  Under review and verification cases waiting for admin action.
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
                  Match progress
                </p>
                <p className="mt-3 text-3xl font-black text-white">
                  {matchCount}
                </p>
                <p className="mt-2 text-sm text-zinc-400">
                  Reports currently marked as matched across lost and found.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Registered users"
            value={totalUsers}
            helper={`${activeUsers} active accounts and ${adminUsers} admin users.`}
            icon={Users}
          />
          <StatCard
            title="Lost reports"
            value={totalLostReports}
            helper={`${reviewLostReports} currently under review.`}
            icon={SearchCheck}
          />
          <StatCard
            title="Found reports"
            value={totalFoundReports}
            helper={`${verificationFoundReports} waiting for verification.`}
            icon={Package}
          />
          <StatCard
            title="Blocked accounts"
            value={blockedUsers}
            helper="Keep an eye on blocked users before restoring access."
            icon={ShieldCheck}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/20">
            <CardHeader className="border-b border-zinc-800 pb-5">
              <CardTitle className="text-2xl font-bold text-white">
                Recent lost reports
              </CardTitle>
              <CardDescription className="text-zinc-400">
                These are the latest owner submissions waiting for triage,
                matching, or closure.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {serializedLostReports.length ? (
                serializedLostReports.map((report) => (
                  <div
                    key={report._id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-white">{report.title}</p>
                        <p className="mt-1 text-sm text-zinc-400">
                          {formatLabel(report.category)} at {report.lostLocation}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={getLostStatusClass(report.status)}
                      >
                        {formatLabel(report.status)}
                      </Badge>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                      <span>Reporter: {personLabel(report.reporter)}</span>
                      <span>Lost: {formatShortDate(report.lostDate)}</span>
                    </div>

                    <div className="mt-4 flex justify-start">
                      <AdminLostStatusSelect
                        itemId={report._id}
                        currentStatus={report.status}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No lost reports yet"
                  description="Once students start reporting missing items, the newest cases will appear here for admin review."
                  actionHref="/lost"
                  actionLabel="Open lost report form"
                />
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/20">
              <CardHeader className="border-b border-zinc-800 pb-5">
                <CardTitle className="text-2xl font-bold text-white">
                  Recent found reports
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Fresh submissions from finders and staff that could be matched
                  with open lost cases.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {serializedFoundReports.length ? (
                  serializedFoundReports.map((report) => (
                    <div
                      key={report._id}
                      className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-white">
                            {report.title}
                          </p>
                          <p className="mt-1 text-sm text-zinc-400">
                            {formatLabel(report.category)} at {report.foundLocation}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={getFoundStatusClass(report.status)}
                        >
                          {formatLabel(report.status)}
                        </Badge>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                        <span>Finder: {personLabel(report.finder)}</span>
                        <span>Found: {formatShortDate(report.foundDate)}</span>
                        <span>
                          Holder: {report.currentHolder ? formatLabel(report.currentHolder) : "Not set"}
                        </span>
                      </div>
                      <div className="mt-4 flex justify-start">
                        <AdminFoundStatusSelect
                          itemId={report._id}
                          currentStatus={report.status}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    title="No found reports yet"
                    description="Finder submissions will appear here so admins can verify storage and look for likely owners."
                    actionHref="/"
                    actionLabel="Back to home"
                  />
                )}
              </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/20">
              <CardHeader className="border-b border-zinc-800 pb-5">
                <CardTitle className="text-2xl font-bold text-white">
                  Admin checklist
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  A simple structure for what the admin team should do first.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <div className="flex items-center gap-3">
                    <Clock3 className="size-4 text-blue-300" />
                    <p className="text-sm font-semibold text-white">
                      Review queue first
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Prioritize reports marked under review or under verification
                    before handling old closed cases.
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <div className="flex items-center gap-3">
                    <SearchCheck className="size-4 text-blue-300" />
                    <p className="text-sm font-semibold text-white">
                      Compare location, date, and category
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Those three fields are usually the fastest way to narrow a
                    likely match before checking proof details.
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <div className="flex items-center gap-3">
                    <ArrowRight className="size-4 text-blue-300" />
                    <p className="text-sm font-semibold text-white">
                      Next good upgrade
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Add admin APIs for status updates, notes, and match actions
                    so this dashboard becomes operational instead of read-only.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
