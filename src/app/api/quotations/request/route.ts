import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { getCurrentUser, getSessionToken } from '@/lib/auth';
import { createQuotationRequest } from '@/lib/quotation';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const sessionToken = await getSessionToken();
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
    
    // Create quotation request
    const result = await createQuotationRequest(db, user.id, {
      address,
      num_electronic_devices,
      monthly_electricity_bill,
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
      { message: 'Failed to create quotation request' },
      { status: 500 }
    );
  }
}
