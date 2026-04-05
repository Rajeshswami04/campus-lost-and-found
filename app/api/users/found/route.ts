import { connect } from "@/app/db/dbConfig";
import { verifyAuthToken } from "@/lib/auth";
import FoundItem from "@/models/FoundItem";
import { NextRequest, NextResponse } from "next/server";
import {
  FOUND_ITEM_STATUSES,
  HOLDER_TYPES
} from "@/lib/campus-config";

//normalisation means to trim the space

function normalizeQuestions(value: unknown) {
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

export async function POST(request: NextRequest) {
  try {
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
      foundLocation,
      foundDate,
      verificationQuestion,
      currentHolder,
      storageLocation,
      image,
      images,
    } = reqBody;
    if (
      !title ||
      !description ||
      !category ||
      !foundLocation ||
      !foundDate ||
      !currentHolder ||
      !storageLocation ||
      !verificationQuestion
    ) {
      return NextResponse.json(
        {
          error:
            "Title, description, category, found location, found date, current holder, storage location, and verification question are required",
        },
        { status: 400 }
      );
    }

    if (!HOLDER_TYPES.includes(currentHolder)) {
      return NextResponse.json(
        { error: "Invalid current holder value" },
        { status: 400 }
      );
    }

    const parsedFoundDate = new Date(foundDate);
    if (Number.isNaN(parsedFoundDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid found date" },
        { status: 400 }
      );
    }

    const normalizedImages = normalizeImages(images ?? image);
    const normalizedVerificationQuestions = normalizeQuestions(verificationQuestion);

    const founditem = await FoundItem.create({
      finder: authUser.id,
      title: String(title).trim(),
      description: String(description).trim(),
      category,
      color: color ? String(color).trim() : undefined,
      brand: brand ? String(brand).trim() : undefined,
      images: normalizedImages,
      foundLocation: String(foundLocation).trim(),
      foundDate: parsedFoundDate,
      verificationQuestions: normalizedVerificationQuestions,
      status: FOUND_ITEM_STATUSES.includes("available") ? "available" : undefined,
      currentHolder,
      storageLocation: String(storageLocation).trim(),
    });

    return NextResponse.json(
      {
        message: "Found item report created successfully",
        success: true,
        founditem,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to create Found item report";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connect();

    const token = getToken(request);
    if (!token) {
      return NextResponse.json(
        { error: "Please login first" },
        { status: 401 }
      );
    }
    const authUser = verifyAuthToken(token);
    const foundItems = await FoundItem.find({ finder: authUser.id })
      .sort({ createdAt: -1 });
    return NextResponse.json(
      {
        success: true,
        foundItems,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch found item reports";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
