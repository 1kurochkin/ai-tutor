// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_ROUTES = ['/chat']
const AUTH_ROUTES = ['/login', '/signup', '/home']

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    const token = request.cookies.get('token')?.value
    const isAuthenticated = !!token
    console.log(pathname, 'PATHNAME', isAuthenticated, 'isAuthenticated')

    // Check protected routes
    const isProtectedRoute = PROTECTED_ROUTES.some(route =>
        pathname.startsWith(route)
    )

    if (isProtectedRoute && !isAuthenticated) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('from', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Check auth routes
    const isAuthRoute = AUTH_ROUTES.some(route =>
        pathname === route || pathname === route + '/'
    ) || pathname === '/'

    if (isAuthRoute && isAuthenticated) {
        return NextResponse.redirect(new URL('/chat', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
