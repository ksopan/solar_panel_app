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
    
    // Set session cookie
    const cookieStore = cookies();
    cookieStore.set({
      name: 'session_token',
      value: result.sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    
    return NextResponse.json({
      message: 'Login successful',
      user: result.user,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Login failed' },
      { status: 500 }
    );
  }
}
