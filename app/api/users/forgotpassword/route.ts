import { connect } from "@/app/db/dbConfig"; 
import User from "@/models/Users";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
await connect();

export async function POST(request:NextRequest){
    try{
        const reqBody=await request.json();
        const {email}=reqBody;
        const user=await User.findOne({email});
        if(!user){
            return NextResponse.json({error:"User does Not Exist."},{status:400});
        }
        const resetToken=crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        user.forgotPasswordToken=hashedToken;
        user.forgotPasswordTokenExpiry=Date.now()+10*60*1000;
        await user.save();
        const transport = nodemailer.createTransport({
            host: process.env.SMTP_HOST, 
            port: 2525,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        const resetUrl = `${process.env.DOMAIN}/resetpassword?token=${resetToken}`;
        const mailOptions = {
            from: 'support@lostfound.com',
            to: email,
            subject: "Reset your password",
            html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`
        };
        await transport.sendMail(mailOptions);
        return NextResponse.json({
            message: "Reset email sent successfully",
            success: true
        });
    }
    catch(error:any){
        return NextResponse.json({ error: error.message }, { status: 500 });
    
    }
}