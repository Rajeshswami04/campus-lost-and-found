import { connect } from "@/app/db/dbConfig";
import { apiAj, protect, writeAj } from "@/lib/arcjet";
import { verifyAuthToken } from "@/lib/auth";
import Claim from "@/models/Claim";
import FoundItem from "@/models/FoundItem";
import { NextRequest, NextResponse } from "next/server";




function getToken(request: NextRequest) {
  return request.cookies.get("token")?.value;
}

export async function POST(request: NextRequest) {
  try {
    const blocked = await protect(request, writeAj);
    if (blocked) return blocked;

    await connect();

    const token = getToken(request);
    if (!token) {
      return NextResponse.json({ error: "Please login first" }, { status: 401 });
    }

    const authUser = verifyAuthToken(token);
    const reqBody = await request.json();
    const { foundItemId, answers, message } = reqBody;

    if (!foundItemId || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: "Found item and claim answers are required" },
        { status: 400 }
      );
    }

    const foundItem = await FoundItem.findById(foundItemId).select(
      "_id finder status verificationQuestions claimedBy"
    );
    if (!foundItem) {
      return NextResponse.json({ error: "Found item not found" }, { status: 404 });
    }

    if (String(foundItem.finder) === authUser.id) { // khud hi claim krna chahta h to ye to galt bat h na
      return NextResponse.json(
        { error: "You cannot claim your own found item" },
        { status: 400 }
      );
    }

    if (!["under_verification", "available"].includes(foundItem.status)) {
      return NextResponse.json(
        { error: "This item is not open for claims" },
        { status: 400 }
      );
    }

    const normalizedAnswers = answers
      .map((entry: { question?: string; answer?: string }) => ({
        question: String(entry.question || "").trim(),
        answer: String(entry.answer || "").trim(),
      }))
      .filter((entry: { question: string; answer: string }) => entry.question && entry.answer);

    if (normalizedAnswers.length === 0) {
      return NextResponse.json(
        { error: "At least one valid answer is required" },
        { status: 400 }
      );
    }

    const existingClaim = await Claim.findOne({  // check weather same claim exits or not 
      foundItem: foundItemId,
      claimant: authUser.id,
      status: "pending",
    }).select("_id");

    if (existingClaim) {
      return NextResponse.json(
        { error: "You already have a pending claim for this item" },
        { status: 400 }
      );
    }

    const claim = await Claim.create({
      foundItem: foundItemId,
      claimant: authUser.id,
      answers: normalizedAnswers,
      message: message ? String(message).trim() : undefined,
      status: "pending",
    });

    return NextResponse.json(
      { success: true, message: "Claim submitted successfully", claim },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to submit claim";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}




export async function GET(request: NextRequest) {
  try {
    const blocked = await protect(request, apiAj);
    if (blocked) return blocked;

    await connect();

    const token = getToken(request);
    if (!token) {
      return NextResponse.json({ error: "Please login first" }, { status: 401 });
    }

    const authUser = verifyAuthToken(token);
    const claims = await Claim.find({ claimant: authUser.id })
      .populate("foundItem", "title category foundDate foundLocation status images")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, claims }, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch claims";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
