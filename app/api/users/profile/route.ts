import { connect } from "@/app/db/dbConfig";
import { apiAj, protect, writeAj } from "@/lib/arcjet";
import { verifyAuthToken } from "@/lib/auth";
import User from "@/models/Users";
import { NextRequest, NextResponse } from "next/server";
// lean return plain javascript objects 
function getToken(request: NextRequest) {
  return request.cookies.get("token")?.value;
}

function cleanedstring(value: unknown) {   //trimmed
  if (value === undefined || value === null) {
    return undefined;
  }

  const trimmed = String(value).trim();
  return trimmed || undefined;
}

function serializeUser(user: {    // serilization concept applied here 
  _id: unknown;
  username: string;
  ID: string;
  email: string;
  role: string;
  accountStatus: string;
  department?: string;
  yearOfStudy?: number;
  phoneNumber?: string;
  hostelOrBlock?: string;
  avatar?: string;
}) {
  return {
    _id: String(user._id),
    username: user.username,
    ID: user.ID,
    email: user.email,
    role: user.role,
    accountStatus: user.accountStatus,
    department: user.department || "",
    yearOfStudy: user.yearOfStudy || "",
    phoneNumber: user.phoneNumber || "",
    hostelOrBlock: user.hostelOrBlock || "",
    avatar: user.avatar || "",
  };
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
    const user = await User.findById(authUser.id)
      .select("-password -verifyToken -verifyTokenExpiry -forgotPasswordToken -forgotPasswordTokenExpiry")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, user: serializeUser(user) },  // so that json in response looks good bhai
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = "Failed to fetch profile";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {  // mainly patch is used to update partially parts
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
    const username = cleanedstring(reqBody.username);
    const department = cleanedstring(reqBody.department);
    const phoneNumber = cleanedstring(reqBody.phoneNumber);
    const hostelOrBlock = cleanedstring(reqBody.hostelOrBlock);
    const avatar = cleanedstring(reqBody.avatar);
    const yearOfStudy =
      reqBody.yearOfStudy === "" || reqBody.yearOfStudy === undefined
        ? undefined
        : Number(reqBody.yearOfStudy);

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    if (
      yearOfStudy !== undefined &&
      (!Number.isInteger(yearOfStudy) || yearOfStudy < 1 || yearOfStudy > 4)
    ) {
      return NextResponse.json(
        { error: "Year of study must be between 1 and 4" },
        { status: 400 }
      );   // validation concept used here
    }

    const updates = {
      username,
      department,
      yearOfStudy,
      phoneNumber,
      hostelOrBlock,
      avatar,
    };

    const user = await User.findByIdAndUpdate(authUser.id, updates, {
      new: true,
      runValidators: true, // check all types are correct
    })
      .select("-password -verifyToken -verifyTokenExpiry -forgotPasswordToken -forgotPasswordTokenExpiry")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully",
        user: serializeUser(user),
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = "Failed to update profile";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
