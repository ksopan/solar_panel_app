import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { registerCustomer, login } from '@/lib/auth';
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';

// Note: In a real implementation, this would use a proper OAuth flow with Google
// This is a simplified mock implementation for demonstration purposes

export async function POST(request: NextRequest) {
  try {
    // In a real implementation, this would validate the Google token
    // and extract user information from it
    
    // For demo purposes, we'll simulate a successful Google authentication
    // with mock user data
    const mockGoogleUser = {
      email: `google_user_${nanoid(6)}@gmail.com`,
      firstName: 'Google',
      lastName: 'User',
    };
    
    const db = getDatabase(request.env);
    
    // Check if user already exists
    const existingUser = await db.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(mockGoogleUser.email).first<{ id: string }>();
    
    let userId;
    
    if (existingUser) {
      // User exists, log them in
      userId = existingUser.id;
    } else {
      // User doesn't exist, register them
      // For Google auth, we generate a random secure password
      const randomPassword = nanoid(16);
      
      const result = await registerCustomer(
        db,
        mockGoogleUser.email,
        randomPassword,
        true, // isGmailRegistered = true
        {
          first_name: mockGoogleUser.firstName,
          last_name: mockGoogleUser.lastName,
        }
      );
      
      if (!result.success) {
        return NextResponse.json(
          { message: result.message },
          { status: 400 }
        );
      }
      
      userId = result.userId;
    }
    
    // Log the user in
    const loginResult = await login(db, mockGoogleUser.email, '');
    
    if (!loginResult.success) {
      return NextResponse.json(
        { message: 'Google authentication failed' },
        { status: 401 }
      );
    }
    
    // Set session cookie
    cookies().set({
      name: 'session_token',
      value: loginResult.sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    
    return NextResponse.json({
      message: 'Google authentication successful',
      user: loginResult.user,
    });
  } catch (error) {
    console.error('Google authentication error:', error);
    return NextResponse.json(
      { message: 'Google authentication failed' },
      { status: 500 }
    );
  }
}
