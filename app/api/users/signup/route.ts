import { NextRequest, NextResponse } from "next/server";
import User from "@/models/Users"; 
import bcryptjs from "bcryptjs";
import { connect } from "@/app/db/dbConfig"; 
import crypto from "crypto";
import { sendEmail } from "@/lib/mailer";
export async function POST(request: NextRequest) {
    try {
        // 1. Ensure DB is connected before any DB operations
        await connect();

        const reqBody = await request.json();
        const { username, email, ID, password } = reqBody;

        // 2. Strict Validation
        if (!username || !email || !password || !ID) {
            return NextResponse.json(
                { message: "All fields are required" }, 
                { status: 400 }
            );
        }

        // 3. Check if user exists
        const user = await User.findOne({ email });
        if (user) {
            return NextResponse.json(
                { message: "User already exists" }, 
                { status: 400 }
            );
        }
        // const uqtoken=crypto.randomBytes(32).toString('hex');
        // 4. Hash Password
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        // 5. Create and Save User
        const newUser = new User({
            username,
            email,
            ID,
            password: hashedPassword,
        });

        const savedUser = await newUser.save();
        await sendEmail({ 
            email, 
            emailType: "VERIFY", 
            userId: savedUser._id 
        });
        return NextResponse.json({
            message: "User created successfully",
            success: true,
            user: { id: savedUser._id, username: savedUser.username }
        }, { status: 201 }); 

    } catch (error: any) {
        console.error("Signup Error:", error.message); // Log this to your VS Code terminal
        return NextResponse.json(
            { error: error.message }, 
            { status: 500 }
        );
    }
}