import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { connect } from "@/app/db/dbConfig";
import { hasRequiredRole, verifyAuthToken } from "@/lib/auth";
import User from "@/models/Users";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("UNAUTHENTICATED");
  }

  const authUser = verifyAuthToken(token);

  if (!hasRequiredRole(authUser.role, ["admin"])) {   // check is it admin role or anyone else
    throw new Error("FORBIDDEN");
  }

  return authUser;
}

export async function PATCH(   // if any update done by admin
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch (err:any) {
    const message = err.message;
    const statusCode = message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ error: message }, { status: statusCode });
  }

  const { id } = await params;
  const body = await request.json();

  const allowedUpdates: Record<string, string> = {};

  if (body.accountStatus && ["active", "blocked"].includes(body.accountStatus)) {   // it we want acconut status change then we can also do that
    allowedUpdates.accountStatus = body.accountStatus;
  }

  if (body.role && ["user", "admin"].includes(body.role)) {  // if user wants to become admin , admin can make it
    allowedUpdates.role = body.role;
  }

  if (Object.keys(allowedUpdates).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  try {
    await connect();

    const updatedUser = await User.findByIdAndUpdate(id, allowedUpdates, {
      new: true,
    }).select("username ID email role accountStatus");  // these fields can be changed by admin

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}