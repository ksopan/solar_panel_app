// src/app/api/quotations/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { getCurrentUser, getSessionToken } from '@/lib/auth';
import { notifyCustomerAboutNewQuotation } from '@/lib/quotation';
import { uploadQuotationPDF } from '@/lib/quotation-utils';
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
    
    // Verify user is a vendor
    if (user.user_type !== 'vendor') {
      return NextResponse.json(
        { message: 'Only vendors can submit quotations' },
        { status: 403 }
      );
    }
    
    // Parse form data
    const formData = await request.formData();
    const quotationRequestId = formData.get('quotation_request_id') as string;
    const price = parseFloat(formData.get('price') as string);
    const installationTimeframe = formData.get('installation_timeframe') as string;
    const warrantyPeriod = formData.get('warranty_period') as string;
    const additionalNotes = formData.get('additional_notes') as string;
    const quotationPdf = formData.get('quotation_pdf') as File | null;
    
    // Validate required fields
    if (!quotationRequestId || !price || !installationTimeframe || !warrantyPeriod) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Verify quotation request exists
    const requestExists = await db.prepare(
      'SELECT id FROM quotation_requests WHERE id = ?'
    ).bind(quotationRequestId).first();
    
    if (!requestExists) {
      return NextResponse.json(
        { message: 'Quotation request not found' },
        { status: 404 }
      );
    }
    
    // Check if vendor has already submitted a quotation for this request
    const existingQuotation = await db.prepare(
      'SELECT id FROM vendor_quotations WHERE quotation_request_id = ? AND vendor_id = ?'
    ).bind(quotationRequestId, user.id).first();
    
    if (existingQuotation) {
      return NextResponse.json(
        { message: 'You have already submitted a quotation for this request' },
        { status: 400 }
      );
    }
    
    // Handle PDF upload if provided
    let quotationPdfUrl = null;
    if (quotationPdf) {
      const uploadResult = await uploadQuotationPDF(quotationPdf);
      
      if (!uploadResult.success) {
        return NextResponse.json(
          { message: uploadResult.message || 'Failed to upload quotation PDF' },
          { status: 400 }
        );
      }
      
      quotationPdfUrl = uploadResult.url;
    }
    
    // Create quotation
    const quotationId = nanoid();
    const now = new Date().toISOString();
    
    await db.prepare(
      `INSERT INTO vendor_quotations 
       (id, quotation_request_id, vendor_id, price, installation_timeframe, warranty_period, 
        quotation_pdf_url, additional_notes, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      quotationId,
      quotationRequestId,
      user.id,
      price,
      installationTimeframe,
      warrantyPeriod,
      quotationPdfUrl,
      additionalNotes || null,
      'submitted',
      now,
      now
    ).run();
    
    // Update request status to in_progress if it was open
    await db.prepare(
      `UPDATE quotation_requests 
       SET status = ?, updated_at = ? 
       WHERE id = ? AND status = ?`
    ).bind('in_progress', now, quotationRequestId, 'open').run();
    
    // Notify customer about new quotation
    await notifyCustomerAboutNewQuotation(db, quotationId, user.id, quotationRequestId);
    
    return NextResponse.json({
      message: 'Quotation submitted successfully',
      quotationId,
      quotationUrl: quotationPdfUrl
    }, { status: 201 });
  } catch (error) {
    console.error('Error submitting quotation:', error);
    return NextResponse.json(
      { message: 'Failed to submit quotation' },
      { status: 500 }
    );
  }
}