import { hasRequiredRole, verifyAuthToken } from "@/lib/auth";
import { cookies } from "next/headers";
import Link from "next/link";
import { ShieldCheck, UserRound } from "lucide-react";
//copied content
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logoutbutton";
import { NavShell } from "@/components/navshell";
import { baseLinks } from "@/lib/links";
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