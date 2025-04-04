// src/app/customer/quotations/[id]/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { getDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { getQuotationRequestById } from '@/lib/quotation';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Quotation Details - Solar Panel Vendor Selection',
  description: 'View details of your quotation request and received vendor quotations',
};

export default async function QuotationDetailPage({ params }: { params: { id: string } }) {
  const requestId = params.id;
  
  // Server-side authentication check
  const db = getDatabase();
  const user = await requireAuth(db, ['customer']);
  
  // Get quotation request details
  const result = await getQuotationRequestById(db, requestId);
  
  if (!result.success || !result.request) {
    notFound();
  }
  
  const request = result.request;
  
  // Verify that this request belongs to the current customer
  if (request.customer_id !== user.id) {
    notFound();
  }
  
  // Get vendor quotations for this request
  const quotationsResult = await db.prepare(`
    SELECT vq.*, v.company_name, v.contact_phone, v.services_offered
    FROM vendor_quotations vq
    JOIN vendors v ON vq.vendor_id = v.id
    WHERE vq.quotation_request_id = ?
    ORDER BY vq.created_at DESC
  `).bind(requestId).all<any>();
  
  const quotations = quotationsResult.results || [];
  
  // Check if there are enough quotations to compare
  const hasEnoughQuotations = quotations.length >= 2;
  
  return (
    <div className="container p-6 mx-auto">
      <div className="mb-6">
        <Link 
          href="/customer/quotations" 
          className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Quotation Requests
        </Link>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quotation Request Details</h1>
        {hasEnoughQuotations && (
          <Link 
            href={`/customer/quotations/${requestId}/comparison`}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Compare Quotations
          </Link>
        )}
      </div>
      
      <div className="p-6 mb-8 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Request Information</h2>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
            request.status === 'open' 
              ? 'bg-green-100 text-green-800' 
              : request.status === 'in_progress' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </span>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-500">Request ID</h3>
            <p className="text-gray-900">{request.id}</p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-500">Date Submitted</h3>
            <p className="text-gray-900">{new Date(request.created_at).toLocaleString()}</p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-500">Installation Address</h3>
            <p className="text-gray-900">{request.address}</p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-500">Monthly Electricity Bill</h3>
            <p className="text-gray-900">${request.monthly_electricity_bill}</p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-500">Number of Electronic Devices</h3>
            <p className="text-gray-900">{request.num_electronic_devices}</p>
          </div>
        </div>
        
        {request.additional_requirements && (
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-medium text-gray-500">Additional Requirements</h3>
            <p className="p-3 bg-gray-50 rounded-md text-gray-900">{request.additional_requirements}</p>
          </div>
        )}
      </div>
      
      <h2 className="mb-4 text-2xl font-bold">Received Quotations ({quotations.length})</h2>
      
      {quotations.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-lg shadow">
          <h3 className="mb-4 text-xl font-semibold">No quotations yet</h3>
          <p className="text-gray-600">
            Vendors have been notified of your request. You will receive notifications when vendors submit their quotations.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {quotations.map((quotation) => (
            <div key={quotation.id} className="p-6 bg-white rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">{quotation.company_name}</h3>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  quotation.status === 'accepted' 
                    ? 'bg-green-100 text-green-800' 
                    : quotation.status === 'rejected' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                </span>
              </div>
              
              <div className="grid gap-6 mb-6 md:grid-cols-3">
                <div>
                  <h4 className="mb-1 text-sm font-medium text-gray-500">Price</h4>
                  <p className="text-lg font-bold text-gray-900">${quotation.price}</p>
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-medium text-gray-500">Installation Timeframe</h4>
                  <p className="text-gray-900">{quotation.installation_timeframe}</p>
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-medium text-gray-500">Warranty Period</h4>
                  <p className="text-gray-900">{quotation.warranty_period}</p>
                </div>
              </div>
              
              {quotation.additional_notes && (
                <div className="mb-6">
                  <h4 className="mb-1 text-sm font-medium text-gray-500">Additional Notes</h4>
                  <p className="p-3 bg-gray-50 rounded-md text-gray-900">{quotation.additional_notes}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="mb-1 text-sm font-medium text-gray-500">Contact Phone</h4>
                  <p className="text-gray-900">{quotation.contact_phone || "Not provided"}</p>
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-medium text-gray-500">Services Offered</h4>
                  <p className="text-gray-900">{quotation.services_offered || "Not specified"}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                {quotation.quotation_pdf_url && (
                  <a 
                    href={quotation.quotation_pdf_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View Detailed Quotation (PDF)
                  </a>
                )}
                
                {quotation.status === 'submitted' && (
                  <>
                    <button
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Accept Quotation
                    </button>
                    <button
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Reject Quotation
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {hasEnoughQuotations && (
        <div className="mt-8 text-center">
          <Link 
            href={`/customer/quotations/${requestId}/comparison`}
            className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Compare All Quotations
          </Link>
        </div>
      )}
    </div>
  );
}