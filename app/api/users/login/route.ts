import {connect } from "@/app/db/dbConfig";
import User from "@/models/Users";
import { NextRequest,NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request:NextRequest) {
    try {
        await connect();
        const reqBody=await request.json();
        // we can not use get because get have no bodies so use post method
        // never use get for login and signup keep in mind
        // i can say get for reading for other works use post
        const {email,password}=reqBody;
        const user= await User.findOne({email});
        if(!user){
            return NextResponse.json({error:"User does not exits"},{status:400})
        }
        const validPassword=await bcryptjs.compare(password,user.password);
        if(!validPassword){
            return NextResponse.json({error:"Invalid password"},{status:400});}
            if (user.accountStatus !== "active") {
                return NextResponse.json({ error: "Your account is not active" }, { status: 403 });
            }
            const tokenData={
                id:user._id,
                username:user.username,
                email:user.email,
                role:user.role,
                accountStatus:user.accountStatus,
            }
            const token=await  jwt.sign(tokenData,process.env.TOKEN_SECRET!,{expiresIn:"1d"});
            const response=NextResponse.json({
                message:"login successful",
                role: user.role,
            },{status:200})
        response.cookies.set("token",token,{httpOnly:true, sameSite:"lax"})
        response.cookies.set("role", user.role, {httpOnly:true, sameSite:"lax"})
        return response;

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Login failed";
        console.log("error");
    return NextResponse.json({error:message},{status:500});
    }
    
}
