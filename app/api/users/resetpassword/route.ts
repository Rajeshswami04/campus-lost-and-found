import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import User from "@/models/Users"

import { connect } from "@/app/db/dbConfig"
import bcryptjs from "bcryptjs";

export async function POST(request: NextRequest) {
    await connect();
    try {
        const reqBody = await request.json();
        const { token,password } = reqBody;
        const hashedToken=crypto.createHash("sha256").update(token).digest("hex");
        const user = await User.findOne({
            forgotPasswordToken: hashedToken,
            forgotPasswordTokenExpiry: { $gt: Date.now() },
        })
        
        if (!user) return NextResponse.json({
            error: "invaild or expired token"
        })
        const salt =await bcryptjs.genSalt(10);
        const hashedPassword=await bcryptjs.hash(password,salt);
        user.password=hashedPassword;
        user.forgotPasswordToken=undefined;
        user.forgotPasswordTokenExpiry=undefined;
        await user.save();
        return NextResponse.json({status:200,message:"successful reset password"})
    } catch (error: any) {
        console.log("error in reset password");
        return NextResponse.json({ status: 500, message: "error in reset poassword" });

    }
}

