import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Github,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { connect } from "@/app/db/dbConfig";
import FoundItem from "@/models/FoundItem";
import LostItem from "@/models/LostItem";

export const dynamic = "force-dynamic";

const highlights = [
  {
    title: "Post in under a minute",
    description:
      "Create a lost or found report quickly with essential details and location.",
    icon: BellRing,
  },
  {
    title: "Smart matching flow",
    description:
      "Make it easier for the right owner and finder to connect with confidence.",
    icon: Search,
  },
  {
    title: "Safer handoffs",
    description:
      "Encourage verified details and public meetup spots before returning valuables.",
    icon: ShieldCheck,
  },
];

const steps = [
  {
    label: "1",
    title: "Report the item",
    description:
      "Choose whether you lost something or found something and add the key details.",
  },
  {
    label: "2",
    title: "Track possible matches",
    description:
      "Browse recent posts and compare time, location, and identifying information.",
  },
  {
    label: "3",
    title: "Reconnect securely",
    description:
      "After Admin verification  arrange a safe return at a familiar public place.",
  },
];

const footerContacts = [
  {
    label: "Email",
    value: "rs75975424@gmail.com",
    href: "mailto:rs75975424@gmail.com",
    icon: Mail,
  },
  {
    label: "Phone",
    value: "+91 7597542465",
    href: "tel:+917597542465",
    icon: Phone,
  },
  {
    label: "Location",
    value: "Community help desk",
    href: "/",
    icon: MapPin,
  },
];

const footerLinks = [
  { label: "Browse things", href: "/browse" },
  { label: "Report lost", href: "/lost" },
  { label: "Report found", href: "/found" },
];

const socialLinks = [
  { label: "Instagram", href: "https://instagram.com", icon: Instagram },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/rajeshswami75/", icon: Linkedin },
  { label: "GitHub", href: "https://github.com/Rajeshswami04", icon: Github },
];

type RecentReport = {
  _id: string;
  type: "lost" | "found";
  title: string;
  description: string;
  location: string;
  reportDate: Date | string;
  status: string;
  createdAt: Date | string;
};

type LostReportDocument = {
  _id: unknown;
  title: string;
  description: string;
  lostLocation: string;
  lostDate: Date | string;
  status: string;
  createdAt: Date | string;
};

type FoundReportDocument = {
  _id: unknown;
  title: string;
  description: string;
  foundLocation: string;
  foundDate: Date | string;
  status: string;
  createdAt: Date | string;
};

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function formatRelativeDate(value: Date | string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function getReportBadge(report: RecentReport) {
  if (report.type === "lost") {
    return report.status === "under_review" ? "Lost" : formatLabel(report.status);
  }

  return "Found";
}

async function getRecentReports() {
  await connect();

  const [lostReports, foundReports] = await Promise.all([
    LostItem.find({ status: { $in: ["open", "under_review", "matched"] } })
      .sort({ createdAt: -1 })
      .select("_id title description lostLocation lostDate status createdAt")
      .limit(3)
      .lean<LostReportDocument[]>(),
    FoundItem.find({ status: { $in: ["available", "under_verification", "matched"] } })
      .sort({ createdAt: -1 })
      .select("_id title description foundLocation foundDate status createdAt")
      .limit(3)
      .lean<FoundReportDocument[]>(),
  ]);

  return [
    ...lostReports.map((report) => ({
      _id: String(report._id),
      type: "lost" as const,
      title: report.title,
      description: report.description,
      location: report.lostLocation,
      reportDate: report.lostDate,
      status: report.status,
      createdAt: report.createdAt,
    })),
    ...foundReports.map((report) => ({
      _id: String(report._id),
      type: "found" as const,
      title: report.title,
      description: report.description,
      location: report.foundLocation,
      reportDate: report.foundDate,
      status: report.status,
      createdAt: report.createdAt,
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 3);
}

export default async function Home() {
  const recentReports = await getRecentReports();

  return (
    <main className="min-h-screen overflow-hidden bg-zinc-950 text-white">
      <section className="relative isolate">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.24),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_24%)]" />
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 lg:px-10">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-lg font-black tracking-[0.22em] uppercase text-blue-400">
                Lost & Found
              </p>
              <p className="text-sm text-zinc-400">
                Reuniting people with what matters.
              </p>
            </div>
            <nav className="hidden items-center gap-3 md:flex">
              <Link
                href="/login"
                className="text-sm font-medium text-zinc-400 transition hover:text-white"
              >
                Login
              </Link>
              <Button
                asChild
                className="rounded-full bg-blue-600 px-5 text-white hover:bg-blue-700"
              >
                <Link href="/signup">Get Started</Link>
              </Button>
            </nav>
          </header>

          <div className="grid flex-1 items-center gap-14 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
            <div className="max-w-2xl">
              <Badge className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-1 text-blue-300 shadow-sm">
                <Sparkles className="size-3.5" />
                Community-powered recovery
              </Badge>
              <h1 className="mt-6 text-5xl font-black tracking-tight text-balance text-white sm:text-6xl">
                Help lost items find their way home faster.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-400 sm:text-xl">
                A calm, trustworthy place to report missing belongings, post found
                items, and reconnect owners with finders.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-blue-600 px-7 text-base font-semibold text-white shadow-lg shadow-blue-950/40 hover:bg-blue-700"
                >
                  <Link href="/signup">
                    Report a lost item
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-zinc-700 bg-zinc-900 px-7 text-base font-semibold text-white hover:bg-zinc-800"
                >
                  <Link href="/login">I found something..</Link>
                </Button>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 shadow-2xl shadow-black/20">
                  <p className="text-3xl font-black text-white">24/7</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    Reporting access anytime
                  </p>
                </div>
                <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 shadow-2xl shadow-black/20">
                  <p className="text-3xl font-black text-white">Safe</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    Identity-first return flow
                  </p>
                </div>
                <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 shadow-2xl shadow-black/20">
                  <p className="text-3xl font-black text-white">Simple</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    Clean search and posting experience
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-8 top-10 hidden h-28 w-28 rounded-full bg-blue-500/20 blur-3xl lg:block" />
              <div className="absolute -right-8 bottom-10 hidden h-32 w-32 rounded-full bg-sky-500/20 blur-3xl lg:block" />
              <Card className="relative overflow-hidden rounded-[2rem] border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/30">
                <div className="absolute inset-x-0 top-0 h-32 bg-[linear-gradient(135deg,rgba(37,99,235,0.26),rgba(14,165,233,0.08),transparent)]" />
                <CardHeader className="relative pb-4">
                  <Badge
                    variant="secondary"
                    className="w-fit rounded-full bg-zinc-800 text-zinc-300"
                  >
                    Featured recovery board
                  </Badge>
                  <CardTitle className="text-2xl font-black text-white">
                    Nearby item activity
                  </CardTitle>
                  {/* {how to make it dynmaic most recent three items} */}
                  <CardDescription className="max-w-md text-sm leading-6 text-zinc-400">
                    the most relevant lost and found reports by location,
                    category, and time.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  {recentReports.length ? (
                    recentReports.map((report) => (
                      <div
                        key={`${report.type}-${report._id}`}
                        className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-white">
                              {report.title}
                            </p>
                            <p className="mt-1 line-clamp-2 text-sm text-zinc-400">
                              {report.description}
                            </p>
                          </div>
                          <Badge className="rounded-full bg-blue-600 text-white">
                            {getReportBadge(report)}
                          </Badge>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-zinc-500">
                          <span className="inline-flex items-center gap-2">
                            <MapPin className="size-4" />
                            {report.location}
                          </span>
                          <span>{formatRelativeDate(report.reportDate)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                      <p className="font-semibold text-white">
                        No recent reports yet
                      </p>
                    </div>
                  )}

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                    <p className="text-sm font-medium uppercase tracking-[0.24em] text-zinc-500">
                      Why this works
                    </p>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      Clear categories, visible locations, and fast posting make
                      it easier for the right people to recognize a match.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-10 lg:px-10">
        <div className="grid gap-6 md:grid-cols-3">
          {highlights.map(({ title, description, icon: Icon }) => (
            <Card
              key={title}
              className="rounded-[1.75rem] border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/20"
            >
              <CardHeader className="pb-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
                  <Icon className="size-5" />
                </div>
                <CardTitle className="text-xl font-bold text-white">
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-zinc-400">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-10">
        <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900 px-6 py-10 text-white shadow-2xl shadow-black/30 lg:px-10">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
                How it works
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                flow that reduces confusion when someone is stressed.
              </h2>
            </div>
            <Button
              asChild
              size="lg"
              className="rounded-full bg-blue-600 px-7 text-white hover:bg-blue-700"
            >
              <Link href="/signup">Create your first report</Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.label}
                className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-5"
              >
                <p className="text-sm font-semibold tracking-[0.22em] text-blue-400">
                  {step.label}
                </p>
                <h3 className="mt-3 text-xl font-bold">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-6 pb-8 lg:px-10">
        <div className="border-t border-zinc-800 py-10 text-white">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_0.8fr_0.8fr]">
            <div>
              <p className="text-lg font-black tracking-[0.22em] uppercase text-blue-400">
                Lost & Found
              </p>
              <p className="mt-3 max-w-md text-sm leading-6 text-zinc-400">
                A simple community space for reporting items, checking recent
                posts, and helping belongings return to the right hands.
              </p>
              <div className="mt-5 flex items-center gap-3">
                {socialLinks.map(({ label, href, icon: Icon }) => (
                  <Button
                    key={label}
                    asChild
                    size="icon"
                    variant="outline"
                    className="rounded-full border-zinc-700 bg-transparent text-zinc-300 hover:border-blue-600 hover:bg-zinc-900 hover:text-white"
                    aria-label={label}
                  >
                    <Link href={href} target="_blank" rel="noreferrer">
                      <Icon className="size-4" />
                    </Link>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">
                Contact
              </h2>
              <div className="mt-4 space-y-3">
                {footerContacts.map(({ label, value, href, icon: Icon }) => (
                  <Link
                    key={label}
                    href={href}
                    className="group flex items-start gap-3 text-zinc-400 transition hover:text-white"
                  >
                    <span className="mt-0.5 text-blue-400 transition group-hover:text-blue-300">
                      <Icon className="size-4" />
                    </span>
                    <span>
                      <span className="block text-xs uppercase tracking-[0.18em] text-zinc-500 transition group-hover:text-zinc-400">
                        {label}
                      </span>
                      <span className="mt-1 block text-sm font-medium">
                        {value}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">
                Quick links
              </h2>
              <div className="mt-4 grid gap-2">
                {footerLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-full px-1 py-2 text-sm font-medium text-zinc-400 transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-zinc-800 pt-5 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; {new Date().getFullYear()} Lost & Found. All rights reserved.</p>
            <p>Made for safer, faster community returns.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
