import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request:NextRequest){
    const path=request.nextUrl.pathname
    const isPublicPath=path==='/login'||path==='/'||path==='/signup'||path==='/verifyemail';
    const token=request.cookies.get('token')?.value||'';
    // Get the value, default to empty string if missing
const isAdmin = request.cookies.get('isAdmin')?.value === 'true';
    if (request.nextUrl.pathname.startsWith('/admin') && !isAdmin) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Access Denied: You do not have admin privileges.' 
      },
      { status: 403 }
    );
  }
    if(isPublicPath&&token){
        return NextResponse.redirect(new URL('/',request.nextUrl));
    }
    if(!isPublicPath&&!token){
       return NextResponse.redirect(new URL('/login',request.nextUrl)); 
    }
}

export const config={
    matcher:[
        '/','/user','/admin','/login','/signup','/verifyemail'
    ]
}