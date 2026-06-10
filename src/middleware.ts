// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // 1. Check if the user is visiting an admin route
    if (request.nextUrl.pathname.startsWith('/admin')) {

        // 2. Check for our custom session cookie
        const session = request.cookies.get('admin_session');

        // 3. If no session and NOT on the login page, redirect to login
        if (!session && request.nextUrl.pathname !== '/admin/login') {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

// Ensure it only runs on admin routes for performance
export const config = {
    matcher: ['/admin/:path*'],
};