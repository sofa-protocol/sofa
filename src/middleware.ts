import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
    async function middleware(req) {

        if (req.nextauth.token == undefined && (req.nextUrl.pathname == '/' || req.nextUrl.pathname == '/admin')) {
            return NextResponse.redirect(new URL("/login", req.url))
        }
        if (req.nextauth.token?.role != "admin" && (req.nextUrl.pathname == '/admin' || req.nextUrl.pathname.startsWith('/login'))) {
            return NextResponse.redirect(
                new URL("/", req.url)
            )
        }
        if (req.nextauth.token?.role == "admin" && req.nextUrl.pathname == '/') {
            return NextResponse.redirect(
                new URL("/admin", req.url)
            )
        }
    }
)


export const config = {
    matcher: ["/((?!login).*)"],
};