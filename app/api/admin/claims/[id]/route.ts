import { connect } from "@/app/db/dbConfig";
import { hasRequiredRole, verifyAuthToken } from "@/lib/auth";
import Claim from "@/models/Claim";
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
    if (!hasRequiredRole(authUser.role, ["admin", "security"])) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { id } = await context.params;
    const reqBody = await request.json();
    const status = String(reqBody.status || "").trim();
    const reviewNote = reqBody.reviewNote;

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid claim status" }, { status: 400 });
    }

    const claim = await Claim.findById(id);
    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    if (claim.status !== "pending") {
      return NextResponse.json(
        { error: "Only pending claims can be reviewed" },
        { status: 400 }
      );
    }

    claim.status = status;
    claim.reviewedBy = authUser.id;
    claim.reviewNote = reviewNote ? String(reviewNote).trim() : "";

    if (status === "approved") {
      claim.approvedAt = new Date();

      await FoundItem.findByIdAndUpdate(claim.foundItem, {
        $set: {
          status: "claimed",
          claimedBy: claim.claimant,
        },
      });

      await Claim.updateMany(
        {
          foundItem: claim.foundItem,
          _id: { $ne: claim._id },
          status: "pending",
        },
        {
          $set: {
            status: "rejected",
            reviewNote: "Another claim was approved for this item",
            rejectedAt: new Date(),
            reviewedBy: authUser.id,
          },
        }
      );
    }

    if (status === "rejected") {
      claim.rejectedAt = new Date();
    }

    await claim.save();

    return NextResponse.json(
      { success: true, message: `Claim ${status} successfully`, claim },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to update claim";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

