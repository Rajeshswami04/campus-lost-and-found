import { protect } from "@/lib/arcjet";
import { NextRequest, NextResponse} from "next/server";

export async function GET(request: NextRequest){
    try{
        const blocked = await protect(request);
        if (blocked) return blocked;

        const response=NextResponse.json({
            message:"Logout successfully",
            success:true,
        })
        response.cookies.set("token","",{httpOnly:true,expires:new Date(0)});
        response.cookies.set("role","",{httpOnly:true,expires:new Date(0)});
        return response;
    }
    catch(error: unknown){
        const message = error instanceof Error ? error.message : "Logout failed";
        return NextResponse.json({error:message},{status:500})
    }
}
