import {NextRequest,NextResponse} from "next/server";
export function proxy(request:NextRequest){const headers=new Headers(request.headers);headers.set("x-town-guide-path",request.nextUrl.pathname);return NextResponse.next({request:{headers}})}
export const config={matcher:["/admin/:path*"]};
