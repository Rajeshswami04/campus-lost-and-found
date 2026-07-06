import { connect } from "@/app/db/dbConfig";
import { protect, publicReadAj } from "@/lib/arcjet";
import FoundItem from "@/models/FoundItem";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const blocked = await protect(request, publicReadAj);
    if (blocked) return blocked;

    await connect();

    const foundItems = await FoundItem.find({
      status: { $in: ["available", "under_verification"] },
    })
      .sort({ createdAt: -1 })
      .select(
        "_id title category foundLocation foundDate status description currentHolder storageLocation"
      )
      .limit(200);

    return NextResponse.json({ success: true, foundItems }, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch found items";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
