import { connect } from "@/app/db/dbConfig";
import { apiAj, protect, writeAj } from "@/lib/arcjet";
import { verifyAuthToken } from "@/lib/auth";
import LostItem from "@/models/LostItem";
import { NextRequest, NextResponse } from "next/server";


//normalisation means to trim the space

function normalizeProofHints(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((hint) => String(hint).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((hint) => hint.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeImages(value: unknown) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((image) => String(image).trim())
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value.trim() ? [value.trim()] : [];
  }
  return [];
}
function getToken(request: NextRequest) {
  return request.cookies.get("token")?.value;
}

function getEndOfToday() {
  const today = new Date();
  today.setHours(23, 59, 59, 999);  // to prevent future dates
  return today;
}

export async function POST(request: NextRequest) {
  try {
    const blocked = await protect(request, writeAj);
    if (blocked) return blocked;

    await connect();
    const token = getToken(request);
    if (!token) {
      return NextResponse.json(
        { error: "Please login first" },
        { status: 401 }
      );
    }
    const authUser = verifyAuthToken(token);
    const reqBody = await request.json();

    const {
      title,
      description,
      category,
      color,
      brand,
      lostLocation,
      lostDate,
      proofHints,
      image,
      images,
    } = reqBody;

    if (!title || !description || !category || !lostLocation || !lostDate) {
      return NextResponse.json(
        { error: "Title, description, category, location, and date are required" },
        { status: 400 }
      );
    }
    
    const parsedLostDate = new Date(lostDate);
    if (Number.isNaN(parsedLostDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid lost date" },
        { status: 400 }
      );
    }

    if (parsedLostDate > getEndOfToday()) {
      return NextResponse.json(
        { error: "Lost date cannot be in the future" },
        { status: 400 }
      );
    }

    const normalizedImages = normalizeImages(images ?? image);
    const normalizedProofHints = normalizeProofHints(proofHints);

    const lostItem = await LostItem.create({
      reporter: authUser.id,
      title: String(title).trim(),
      description: String(description).trim(),
      category,
      color: color ? String(color).trim() : undefined,
      brand: brand ? String(brand).trim() : undefined,
      images: normalizedImages,
      lostLocation: String(lostLocation).trim(),
      lostDate: parsedLostDate,
      proofHints: normalizedProofHints,
      status: "under_review",
    });

    return NextResponse.json(
      {
        message: "Lost item report created successfully",
        success: true,
        lostItem,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to create lost item report";

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
      return NextResponse.json(
        { error: "Please login first" },
        { status: 401 }
      );
    }
    const authUser = verifyAuthToken(token);
    const lostItems = await LostItem.find({ reporter: authUser.id })
      .sort({ createdAt: -1 });
    return NextResponse.json(
      {
        success: true,
        lostItems,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch lost item reports";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
