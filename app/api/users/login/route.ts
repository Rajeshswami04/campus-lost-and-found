import { connect } from "@/app/db/dbConfig";
import User from "@/models/Users";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
    try {
        
        await connect();

        const reqBody = await request.json();
        const { email, password,isAdmin } = reqBody;

        if (!email || !password) {
            return NextResponse.json({ error: "Please provide email and password" }, { status: 400 });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: "User does not exist" }, { status: 400 });
        }

        const validPassword = await bcryptjs.compare(password, user.password);
        if (!validPassword) {
            return NextResponse.json({ error: "Invalid password" }, { status: 400 });
        }

        const tokenData = {
            id: user._id,
            username: user.username,
            email: user.email,
            isAdmin:user.isAdmin,
        };

        
        const token = jwt.sign(tokenData, process.env.TOKEN_SECRET!, { expiresIn: "1d" });

        
        const response = NextResponse.json({
            message: "Login successful",
            success: true,
        });

        response.cookies.set("token", token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === "production", 
            path: "/", 
        });

        return response;

    } catch (error: any) {
        console.error("Login Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}