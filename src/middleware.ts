import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  console.log("Middleware running for:", request.nextUrl.pathname);
  
  // Only apply to admin routes
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }
  
  // Skip the login page
  if (request.nextUrl.pathname === '/admin/login') {
    console.log("Allowing access to login page");
    return NextResponse.next();
  }
  
  // Check for admin token
  const token = request.cookies.get('admin_token')?.value;
  console.log("Token present:", !!token);
  
  if (!token) {
    console.log("No token, redirecting to login");
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  
  try {
    // Verify token with jose
    const secretKey = new TextEncoder().encode(
      process.env.JWT_SECRET || 'fallback_secret_key'
    );
    
    await jwtVerify(token, secretKey);
    console.log("Token verified, allowing access to admin");
    return NextResponse.next();
  } catch (error) {
    console.log("Token verification failed:", error);
    // Token invalid or expired
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};