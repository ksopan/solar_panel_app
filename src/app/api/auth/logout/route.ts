import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { logout, getSessionToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const sessionToken = await getSessionToken();
    
    if (!sessionToken) {
      return NextResponse.json(
        { message: 'Not logged in' },
        { status: 400 }
      );
    }
    
    const db = getDatabase(request.env);
    await logout(db, sessionToken);
    
    // Clear session cookie
    cookies().delete('session_token');
    
    return NextResponse.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Logout failed' },
      { status: 500 }
    );
  }
}
