import { connect } from "@/app/db/dbConfig";
import { hasRequiredRole, verifyAuthToken } from "@/lib/auth";
import { FOUND_ITEM_STATUSES } from "@/lib/campus-config";
import FoundItem from "@/models/FoundItem";
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

    if (!FOUND_ITEM_STATUSES.includes(status as (typeof FOUND_ITEM_STATUSES)[number])) {
      return NextResponse.json({ error: "Invalid found item status" }, { status: 400 });
    }

    const updatedFoundItem = await FoundItem.findByIdAndUpdate(
      id,
      {
        status,
        receivedBy: authUser.id,
        returnedAt: status === "returned" ? new Date() : undefined,
      },
      { new: true }
    );

    if (!updatedFoundItem) {
      return NextResponse.json({ error: "Found item not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Found item status updated successfully",
        foundItem: updatedFoundItem,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to update found item status";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
