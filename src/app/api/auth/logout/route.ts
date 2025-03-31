import { NextResponse } from 'next/server';

export async function GET() {
  // Create response with redirect
  const response = NextResponse.redirect(
    new URL('/admin/login', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000')
  );
  
  // Clear the admin token cookie
  response.cookies.set({
    name: 'admin_token',
    value: '',
    expires: new Date(0), // Set expiry to the past
    path: '/',
  });
  
  return response;
}