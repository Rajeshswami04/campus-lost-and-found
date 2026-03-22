import { connect } from "@/app/db/dbConfig";
import User from "@/models/Users";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/mailer";

export async function POST(request: NextRequest) {
  await connect();

  try {
    const reqBody = await request.json();
    const { email } = reqBody;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    await sendEmail({
      email,
      emailType: "RESET",
      userId: user._id.toString(),
    });

    return NextResponse.json(
      { message: "Reset password email sent successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error sending reset email" },
      { status: 500 }
    );
  }
}
