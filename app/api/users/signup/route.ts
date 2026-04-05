import { NextRequest, NextResponse } from "next/server";
import User from "@/models/Users"; 
import bcryptjs from "bcryptjs";
import { connect } from "@/app/db/dbConfig"; 
import { sendEmail } from "@/lib/mailer";
export async function POST(request: NextRequest) {
    try {
      
        await connect();

        const reqBody = await request.json();
        const {
            username,
            email,
            ID,
            password,
            department,
            yearOfStudy,
            phoneNumber,
            hostelOrBlock,
        } = reqBody;

    
        if (!username || !email || !password || !ID) {
            return NextResponse.json(
                { message: "All fields are required" }, 
                { status: 400 }
            );
        }

        const user = await User.findOne({
            $or: [{ email }, { ID: ID?.toUpperCase() }],
        });
        if (user) {
            return NextResponse.json(
                { message: "User already exists with this email or ID" }, 
                { status: 400 }
            );
        }
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);
        const newUser = new User({
            username,
            email,
            ID,
            password: hashedPassword,
            role: "student",
            department,
            yearOfStudy,
            phoneNumber,
            hostelOrBlock,
        });

        const savedUser = await newUser.save();

        let emailSent = true;
        let emailMessage = "Verification email sent successfully";

        try {
            await sendEmail({ 
                email, 
                emailType: "VERIFY", 
                userId: savedUser._id.toString(),
            });
        } catch (error: unknown) {
            emailSent = false;
            emailMessage =
                error instanceof Error
                    ? error.message
                    : "Account created, but verification email could not be sent";
        }

        return NextResponse.json({
            message: emailSent
                ? "User created successfully"
                : "User created successfully, but verification email could not be sent yet",
            success: true,
            emailSent,
            emailMessage,
            user: {
                id: savedUser._id,
                username: savedUser.username,
                role: savedUser.role,
                accountStatus: savedUser.accountStatus,
            }
        }, { status: 201 }); 

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Signup failed";
        console.error("Signup Error:", message); 
        return NextResponse.json(
            { error: message }, 
            { status: 500 }
        );
    }
}
