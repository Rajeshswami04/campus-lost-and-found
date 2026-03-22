import { NextResponse } from "next/server";
import User from "@/models/Users";
import { connect } from "@/app/db/dbConfig";
import crypto from "crypto";

export async function POST(request: Request) {
    await connect();
    try {
        const reqBody = await request.json();
        const { token } = reqBody;
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
            verifyToken: hashedToken,
            verifyTokenExpiry: { $gt: Date.now() } // Check if not expired
        });

        if (!user) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
        }

        user.isVerified = true;
        user.verifyToken = undefined;
        user.verifyTokenExpiry = undefined;
        await user.save();

        return NextResponse.json({ message: "Email verified successfully", success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
