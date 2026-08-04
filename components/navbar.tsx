import { hasRequiredRole, verifyAuthToken } from "@/lib/auth";
import { cookies } from "next/headers";
import Link from "next/link";
import type { ReactNode } from "react";
import { PackageSearch, ShieldCheck, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logoutbutton";

const baseLinks = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/lost", label: "Report Lost" },
  { href: "/found", label: "Report Found" },
];

const navLinkClass =
  "rounded-md px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white";

function NavShell({
  children,
  links = baseLinks,
}: {
  children: ReactNode;
  links?: typeof baseLinks;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/95 text-white shadow-lg shadow-black/20 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-base font-black tracking-wide text-white"
          >
          
           <header className="flex items-center justify-between">
            <div>
              <p className="text-lg font-black tracking-[0.22em] uppercase text-blue-400">
                Lost & Found
              </p>
            </div>
          </header>
          </Link>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {children}
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-1">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={navLinkClass}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default async function NavBar() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return (
      <NavShell>
        <Button
          asChild
          variant="ghost"
          className="text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild className="bg-blue-600 text-white hover:bg-blue-700">
          <Link href="/signup">Sign Up</Link>
        </Button>
      </NavShell>
    );
  }

  const authUser = (() => {
    try {
      return verifyAuthToken(token);
    } catch {
      return null;
    }
  })();

  if (!authUser) {
    return (
      <NavShell>
        <Button
          asChild
          variant="ghost"
          className="text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild className="bg-blue-600 text-white hover:bg-blue-700">
          <Link href="/signup">Sign Up</Link>
        </Button>
      </NavShell>
    );
  }

  if (hasRequiredRole(authUser.role, ["student"])) {
    return (
      <NavShell>
        <Button
          asChild
          variant="outline"
          className="border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white"
        >
          <Link href="/user/profile">
            <UserRound className="size-4" />
            My Account
          </Link>
        </Button>
        <span className="hidden max-w-40 truncate text-sm text-zinc-400 sm:inline">
          Hi, {authUser.username}
        </span>
        <LogoutButton />
      </NavShell>
    );
  }

  if (hasRequiredRole(authUser.role, ["security"])) {
    return (
      <NavShell
        links={[
          ...baseLinks,
          { href: "/admin/claims", label: "Verify Claims" },
        ]}
      >
        <Button
          asChild
          variant="outline"
          className="border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white"
        >
          <Link href="/admin/claims">
            <ShieldCheck className="size-4" />
            Security
          </Link>
        </Button>
        <LogoutButton />
      </NavShell>
    );
  }

  if (hasRequiredRole(authUser.role, ["admin"])) {
    return (
      <NavShell
        links={[
          ...baseLinks,
          { href: "/admin/claims", label: "Verify Claims" },
          { href: "/admin/users", label: "Manage Users" },
        ]}
      >
        <Button
          asChild
          variant="outline"
          className="border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white"
        >
          <Link href="/admin">
            <ShieldCheck className="size-4" />
            Admin
          </Link>
        </Button>
        <LogoutButton />
      </NavShell>
    );
  }

  return null;
}
