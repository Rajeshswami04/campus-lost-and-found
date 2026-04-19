import { connect } from "@/app/db/dbConfig";
import { hasRequiredRole, verifyAuthToken } from "@/lib/auth";
import Claim from "@/models/Claim";
import { NextRequest, NextResponse } from "next/server";

function getToken(request: NextRequest) {
  return request.cookies.get("token")?.value;
}

export async function GET(request: NextRequest) {
  try {
    await connect();

    const token = getToken(request);
    if (!token) {
      return NextResponse.json({ error: "Please login first" }, { status: 401 });
    }

    const authUser = verifyAuthToken(token);
    if (!hasRequiredRole(authUser.role, ["admin", "security"])) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const claims = await Claim.find()
      .populate("claimant", "username email ID")
      .populate("foundItem", "title category foundDate foundLocation status verificationQuestions")
      .populate("reviewedBy", "username email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, claims }, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch claims";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
