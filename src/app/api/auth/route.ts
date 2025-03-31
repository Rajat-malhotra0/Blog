import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    // Get admin credentials from environment variables
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    // Validate credentials against environment variables
    if (username !== adminUsername || password !== adminPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Create JWT token with jose
    const secretKey = new TextEncoder().encode(
      process.env.JWT_SECRET || 'fallback_secret_key'
    );
    
    const token = await new SignJWT({ username, role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('8h')
      .sign(secretKey);
    
    // Create a response
    const response = NextResponse.json({ success: true });
    
    // Set cookie properly with the response object
    response.cookies.set({
      name: 'admin_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60, // 8 hours in seconds
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}