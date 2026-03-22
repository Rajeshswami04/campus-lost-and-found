import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import User from "@/models/Users"

import { connect } from "@/app/db/dbConfig"
import bcryptjs from "bcryptjs";

export async function GET(request: NextRequest) {
    await connect();

    try {
        const token = request.nextUrl.searchParams.get("token");

        if (!token) {
            return NextResponse.json(
                { error: "Token is required" },
                { status: 400 }
            );
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const user = await User.findOne({
            forgotPasswordToken: hashedToken,
            forgotPasswordTokenExpiry: { $gt: new Date() },
        }).select("_id");

        if (!user) {
            return NextResponse.json(
                { error: "Invalid or expired token" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "Token is valid" },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Error validating token" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    await connect();
    try {
        const reqBody = await request.json();
        const { token, password } = reqBody;

        if (!token || !password) {
            return NextResponse.json(
                { error: "Token and password are required" },
                { status: 400 }
            );
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        const updatedUser = await User.findOneAndUpdate(
            {
            forgotPasswordToken: hashedToken,
            forgotPasswordTokenExpiry: { $gt: new Date() },
        },
            {
                $set: { password: hashedPassword },
                $unset: {
                    forgotPasswordToken: 1,
                    forgotPasswordTokenExpiry: 1,
                },
            },
            { new: true }
        );
        
        if (!updatedUser) {
            return NextResponse.json(
                { error: "Invalid or expired token" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "Password reset successful" },
            { status: 200 }
        )
    } catch (error: any) {
        console.log("error in reset password", error);
        return NextResponse.json(
            { error: "Error resetting password" },
            { status: 500 }
        );

    }
}

