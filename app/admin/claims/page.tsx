import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { hasRequiredRole, verifyAuthToken } from "@/lib/auth";
import AdminClaimsManager from "@/components/admin-claims-manager";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminClaimsPage() {
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

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-[2rem] border border-zinc-800 bg-zinc-900 p-6 shadow-2xl shadow-black/30 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-300">
              Admin claims review
            </p>
            <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
              Review submitted claims and update their status.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              View each claim with the claimant details, item information, verification questions, and the answers submitted for review.
            </p>
          </div>

          <Button  className="w-fit border-zinc-700 bg-zinc-950 text-zinc-200 hover:bg-zinc-900 hover:text-white">
            <Link href="/admin">Back to dashboard</Link>
          </Button>
        </div>

        <AdminClaimsManager />
      </div>
    </main>
  );
}