import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { getCurrentUser, getSessionToken } from '@/lib/auth';
import { createQuotationRequest } from '@/lib/quotation';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const sessionToken = getSessionToken();
    if (!sessionToken) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const db = getDatabase(request.env);
    const user = await getCurrentUser(db, sessionToken);
    
    if (!user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Verify user is a customer
    if (user.user_type !== 'customer') {
      return NextResponse.json(
        { message: 'Only customers can create quotation requests' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { address, num_electronic_devices, monthly_electricity_bill, additional_requirements } = body;
    
    // Validate required fields
    if (!address || !num_electronic_devices || !monthly_electricity_bill) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Special handling for development mode with dev-user-id
    if (process.env.NODE_ENV === 'development' && user.id === 'dev-user-id') {
      // In development mode, let's just insert the customer if needed
      
      try {
        console.log('Creating development customer account for:', user.id);
        
        // Insert into users table if not exists
        try {
          // Try to create the user - if it fails, user likely already exists
          await db.prepare(
            'INSERT INTO users (id, email, password_hash, user_type, created_at, updated_at, is_active) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)'
          ).run(user.id, user.email, 'dev-password-hash', 'customer');
          console.log('Created user record for dev-user-id');
        } catch (error) {
          console.log('User may already exist, continuing...');
        }
        
        // Try to insert into customers table if not exists
        try {
          await db.prepare(
            'INSERT INTO customers (id, first_name, last_name, address, phone_number, is_gmail_registered, profile_complete) VALUES (?, ?, ?, ?, ?, ?, ?)'
          ).run(
            user.id,
            'Development',
            'User',
            'Development Address',
            '555-123-4567',
            0,  // SQLite uses 0/1 for booleans
            1   // profile_complete = true
          );
          console.log('Created customer record for dev-user-id');
        } catch (error) {
          console.log('Customer may already exist, continuing...');
        }
      } catch (error) {
        console.error('Error ensuring development user exists:', error);
        // Continue anyway - if record exists, we're good to go
      }
    }
    
    // Create quotation request with user ID from auth
    const result = await createQuotationRequest(db, user.id, {
      address,
      num_electronic_devices: Number(num_electronic_devices),
      monthly_electricity_bill: Number(monthly_electricity_bill),
      additional_requirements
    });
    
    if (!result.success) {
      return NextResponse.json(
        { message: result.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Quotation request created successfully',
      requestId: result.requestId
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating quotation request:', error);
    return NextResponse.json(
      { message: 'Failed to create quotation request', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}