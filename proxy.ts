import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request:NextRequest){
    const path=request.nextUrl.pathname
    const isPublicPath=path==='/login'||path==='/'||path==='/signup'||path==='/verifyemail'||path==='/forgotpassword'||path==='/resetpassword';
    const token=request.cookies.get('token')?.value||'';
    const role = request.cookies.get('role')?.value || 'student';

    if (request.nextUrl.pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/user', request.nextUrl));
    }

    if(isPublicPath&&token){
        return NextResponse.redirect(new URL(role === 'admin' ? '/admin' : '/user',request.nextUrl));
    }
    if(!isPublicPath&&!token){
       return NextResponse.redirect(new URL('/login',request.nextUrl)); 
    }

    return NextResponse.next();
}

export const config={
    matcher:[
        '/','/user','/admin','/login','/signup','/verifyemail','/forgotpassword','/resetpassword'
    ]
}
