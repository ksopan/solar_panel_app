import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { getSessionToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Get the session token from cookies
    const sessionToken = getSessionToken();
    
    if (!sessionToken) {
      return NextResponse.json(
        { message: 'Not logged in' },
        { status: 400 }
      );
    }
    
    // Get database connection
    const db = getDatabase(request.env);
    
    // Special handling for development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode - simulating logout');
    } else {
      // In production, delete the session from the database
      try {
        await db.prepare(
          'DELETE FROM sessions WHERE token = ?'
        ).run(sessionToken);
      } catch (error) {
        console.error('Error deleting session:', error);
        // Continue anyway - we'll still clear the cookie
      }
    }
    
    // Create a response that clears the session cookie
    const response = NextResponse.json(
      { message: 'Logout successful' },
      { status: 200 }
    );
    
    // Clear the session cookie
    const cookieStore = cookies();
    cookieStore.delete('session_token');
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Logout failed', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}