import { connect } from "@/app/db/dbConfig";
import { hasRequiredRole, verifyAuthToken } from "@/lib/auth";
import { LOST_ITEM_STATUSES } from "@/lib/campus-config";
import LostItem from "@/models/LostItem";
import { NextRequest, NextResponse } from "next/server";

function getToken(request: NextRequest) {
  return request.cookies.get("token")?.value;
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connect();

    const token = getToken(request);
    if (!token) {
      return NextResponse.json({ error: "Please login first" }, { status: 401 });
    }

    const authUser = verifyAuthToken(token);
    if (!hasRequiredRole(authUser.role, ["admin"])) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await context.params;
    const reqBody = await request.json();
    const status = String(reqBody.status || "").trim();

    if (!LOST_ITEM_STATUSES.includes(status as (typeof LOST_ITEM_STATUSES)[number])) {
      return NextResponse.json({ error: "Invalid lost item status" }, { status: 400 });
    }

    const updatedLostItem = await LostItem.findByIdAndUpdate(
      id,
      {
        status,
        handledBy: authUser.id,
        resolvedAt: status === "returned" || status === "closed" ? new Date() : undefined,
      },
      { new: true }
    );

    if (!updatedLostItem) {
      return NextResponse.json({ error: "Lost item not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Lost item status updated successfully",
        lostItem: updatedLostItem,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to update lost item status";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
