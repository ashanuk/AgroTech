import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware to protect routes and handle authentication
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/public") ||
    pathname === "/login" ||
    pathname === "/signup"
  ) {
    return NextResponse.next();
  }

  // Check for NextAuth session token in cookies
//   const sessionToken = request.cookies.get('next-auth.session-token') || 
//                       request.cookies.get('__Secure-next-auth.session-token');
                    // Check for NextAuth session token in cookies
    const sessionToken = request.cookies.get('authjs.session-token') || 
                                                            request.cookies.get('__Secure-authjs.session-token');

// Redirect to login if not authenticated
    if (!sessionToken && pathname !== "/login" && pathname !== "/signup") {
        return NextResponse.redirect(new URL("/login", request.url));
  }

  // Continue to the requested page
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - login and signup pages
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public|login|signup).*)",
  ],
};
