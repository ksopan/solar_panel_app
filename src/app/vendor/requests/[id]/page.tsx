import { Metadata } from 'next';
import Link from 'next/link';
import { getDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { getQuotationRequestById } from '@/lib/quotation';
import { notFound } from 'next/navigation';
import QuotationForm from '@/components/quotation/QuotationForm';

export const metadata: Metadata = {
  title: 'Request Details - Solar Panel Vendor Selection',
  description: 'View customer quotation request details and submit your quotation',
};

export default async function RequestDetailPage({ params }: { params: { id: string } }) {
  const requestId = params.id;
  
  // Server-side authentication check
  const db = getDatabase();
  const user = await requireAuth(db, ['vendor']);
  
  // Get quotation request details
  const result = await getQuotationRequestById(db, requestId);
  
  if (!result.success || !result.request) {
    notFound();
  }
  
  const request = result.request;
  
  // Check if vendor has already submitted a quotation for this request
  const existingQuotation = await db.prepare(
    'SELECT * FROM vendor_quotations WHERE quotation_request_id = ? AND vendor_id = ?'
  ).bind(requestId, user.id).first<any>();
  
  const hasSubmitted = !!existingQuotation;
  
  return (
    <div className="container p-6 mx-auto">
      <div className="mb-6">
        <Link 
          href="/vendor/requests" 
          className="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          ← Back to Requests
        </Link>
      </div>
      
      <div className="p-6 mb-8 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Quotation Request Details</h1>
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
      
      {hasSubmitted ? (
        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Your Submitted Quotation</h2>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
              existingQuotation.status === 'accepted' 
                ? 'bg-green-100 text-green-800' 
                : existingQuotation.status === 'rejected' 
                ? 'bg-red-100 text-red-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {existingQuotation.status.charAt(0).toUpperCase() + existingQuotation.status.slice(1)}
            </span>
          </div>
          
          <div className="grid gap-6 mb-6 md:grid-cols-3">
            <div>
              <h4 className="mb-1 text-sm font-medium text-gray-500">Price</h4>
              <p className="text-lg font-bold text-gray-900">${existingQuotation.price}</p>
            </div>
            <div>
              <h4 className="mb-1 text-sm font-medium text-gray-500">Installation Timeframe</h4>
              <p className="text-gray-900">{existingQuotation.installation_timeframe}</p>
            </div>
            <div>
              <h4 className="mb-1 text-sm font-medium text-gray-500">Warranty Period</h4>
              <p className="text-gray-900">{existingQuotation.warranty_period}</p>
            </div>
          </div>
          
          {existingQuotation.additional_notes && (
            <div className="mb-6">
              <h4 className="mb-1 text-sm font-medium text-gray-500">Additional Notes</h4>
              <p className="p-3 bg-gray-50 rounded-md text-gray-900">{existingQuotation.additional_notes}</p>
            </div>
          )}
          
          {existingQuotation.quotation_pdf_url && (
            <div>
              <h4 className="mb-1 text-sm font-medium text-gray-500">Detailed Quotation PDF</h4>
              <a 
                href={existingQuotation.quotation_pdf_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View Detailed Quotation (PDF)
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-6 text-xl font-bold">Submit Your Quotation</h2>
          <QuotationForm requestId={requestId} />
        </div>
      )}
    </div>
  );
}
