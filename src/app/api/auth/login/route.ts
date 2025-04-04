import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { login } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    const db = getDatabase(request.env);
    const result = await login(db, email, password);
    
    if (!result.success) {
      return NextResponse.json(
        { message: result.message },
        { status: 401 }
      );
    }
    
    // Set session cookie - fixing the async cookies issue
    // You can use this approach with the synchronous cookies() API
    const response = NextResponse.json({
      message: 'Login successful',
      user: result.user,
    });
    
    // Set cookie on the response object instead
    response.cookies.set({
      name: 'session_token',
      value: result.sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    
    return response;
  
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Login failed' },
      { status: 500 }
    );
  }
}