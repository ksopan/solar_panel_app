import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { registerCustomer, registerVendor } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, userType, profile } = body;
    
    if (!email || !password || !userType) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const db = getDatabase(request.env);
    
    let result;
    
    if (userType === 'customer') {
      const isGmailRegistered = body.isGmailRegistered || false;
      result = await registerCustomer(db, email, password, isGmailRegistered, profile);
    } else if (userType === 'vendor') {
      result = await registerVendor(db, email, password, profile);
    } else {
      return NextResponse.json(
        { message: 'Invalid user type' },
        { status: 400 }
      );
    }
    
    if (!result.success) {
      return NextResponse.json(
        { message: result.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: 'Registration successful', userId: result.userId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Registration failed' },
      { status: 500 }
    );
  }
}
