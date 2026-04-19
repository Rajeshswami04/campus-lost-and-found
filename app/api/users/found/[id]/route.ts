
import { NextRequest, NextResponse } from "next/server";
import FoundItem from "@/models/FoundItem";
import { connect } from "@/app/db/dbConfig";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await connect();
  const { id } = await context.params;
  const foundItem = await FoundItem.findById(id);

  if (!foundItem) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ foundItem });
}
