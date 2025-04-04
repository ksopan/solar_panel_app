// For src/app/vendor/requests/[id]/page.tsx
// Server component for viewing request details and submitting a quote

import { Metadata } from 'next';
import Link from 'next/link';
import { getDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { getQuotationRequestById } from '@/lib/quotation';
import { notFound } from 'next/navigation';
import QuotationForm from '@/components/quotation/QuotationForm'; // You'll need to create this component

export const metadata: Metadata = {
  title: 'Submit Quotation - Solar Panel Vendor Selection',
  description: 'View request details and submit your quotation',
};

export default async function VendorRequestDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const requestId = params.id;
  console.log("Starting VendorRequestDetailPage for request:", requestId);
  
  // Server-side authentication check
  const db = getDatabase();
  
  try {
    console.log("Requiring auth for vendor");
    const user = await requireAuth(db, ['vendor']);
    console.log("Auth successful for vendor:", user.email);
    
    // Get quotation request details
    const result = await getQuotationRequestById(db, requestId);
    
    if (!result.success || !result.request) {
      console.log("Request not found:", requestId);
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
            className="text-blue-600 hover:underline flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Requests List
          </Link>
        </div>
        
        <div className="mb-8 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h1 className="text-2xl font-bold">Quotation Request Details</h1>
          </div>
          
          <div className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h2 className="text-sm font-medium text-gray-500">Request ID</h2>
                <p className="mt-1">{request.id}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500">Date Submitted</h2>
                <p className="mt-1">{new Date(request.created_at).toLocaleString()}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500">Installation Address</h2>
                <p className="mt-1">{request.address}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500">Monthly Electricity Bill</h2>
                <p className="mt-1">${request.monthly_electricity_bill}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500">Number of Electronic Devices</h2>
                <p className="mt-1">{request.num_electronic_devices}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500">Status</h2>
                <p className="mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  {request.status}
                </p>
              </div>
            </div>
            
            {request.additional_requirements && (
              <div className="mt-6">
                <h2 className="text-sm font-medium text-gray-500">Additional Requirements</h2>
                <div className="mt-1 p-4 bg-gray-50 rounded-md">
                  <p>{request.additional_requirements}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {hasSubmitted ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-bold">Your Submitted Quotation</h2>
            </div>
            
            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Price</h3>
                  <p className="mt-1 text-xl font-semibold">${existingQuotation.price}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Installation Timeframe</h3>
                  <p className="mt-1">{existingQuotation.installation_timeframe}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Warranty Period</h3>
                  <p className="mt-1">{existingQuotation.warranty_period}</p>
                </div>
              </div>
              
              {existingQuotation.additional_notes && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-500">Additional Notes</h3>
                  <div className="mt-1 p-4 bg-gray-50 rounded-md">
                    <p>{existingQuotation.additional_notes}</p>
                  </div>
                </div>
              )}
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {existingQuotation.status}
                </p>
              </div>
              
              {existingQuotation.quotation_pdf_url && (
                <div className="mt-6">
                  <a 
                    href={existingQuotation.quotation_pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View PDF Quotation
                  </a>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-bold">Submit Your Quotation</h2>
            </div>
            
            <div className="p-6">
              {/* Client-side form for submitting a quotation */}
              <SubmitQuotationForm requestId={requestId} />
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error in VendorRequestDetailPage:", error);
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="p-6 max-w-sm mx-auto bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600">
            There was an error loading the request details. Please try again later.
          </p>
          <div className="mt-4">
            <Link 
              href="/vendor/requests" 
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Back to Requests
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

// Client-side form component for submitting quotations
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function SubmitQuotationForm({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [price, setPrice] = useState<string>('');
  const [installationTimeframe, setInstallationTimeframe] = useState('');
  const [warrantyPeriod, setWarrantyPeriod] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [quotationPdf, setQuotationPdf] = useState<File | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setQuotationPdf(e.target.files[0]);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate required fields
      if (!price || !installationTimeframe || !warrantyPeriod) {
        throw new Error('Please fill in all required fields');
      }
      
      if (parseFloat(price) <= 0) {
        throw new Error('Price must be greater than zero');
      }
      
      // Create form data
      const formData = new FormData();
      formData.append('quotation_request_id', requestId);
      formData.append('price', price);
      formData.append('installation_timeframe', installationTimeframe);
      formData.append('warranty_period', warrantyPeriod);
      formData.append('additional_notes', additionalNotes);
      
      if (quotationPdf) {
        formData.append('quotation_pdf', quotationPdf);
      }
      
      // Submit quotation
      const response = await fetch('/api/quotations/submit', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to submit quotation');
      }
      
      // Redirect on success
      router.push('/vendor/quotations');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 text-sm text-red-800 bg-red-100 rounded-md">
          {error}
        </div>
      )}
      
      <div className="grid gap-6 md:grid-cols-3">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price ($) <span className="text-red-500">*</span>
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label htmlFor="installationTimeframe" className="block text-sm font-medium text-gray-700">
            Installation Timeframe <span className="text-red-500">*</span>
          </label>
          <input
            id="installationTimeframe"
            type="text"
            value={installationTimeframe}
            onChange={(e) => setInstallationTimeframe(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 2-3 weeks"
            required
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label htmlFor="warrantyPeriod" className="block text-sm font-medium text-gray-700">
            Warranty Period <span className="text-red-500">*</span>
          </label>
          <input
            id="warrantyPeriod"
            type="text"
            value={warrantyPeriod}
            onChange={(e) => setWarrantyPeriod(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 5 years"
            required
            disabled={isLoading}
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700">
          Additional Notes
        </label>
        <textarea
          id="additionalNotes"
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          rows={4}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Any additional information or terms for your quotation"
          disabled={isLoading}
        />
      </div>
      
      <div>
        <label htmlFor="quotationPdf" className="block text-sm font-medium text-gray-700">
          Quotation PDF (Optional)
        </label>
        <input
          id="quotationPdf"
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        />
        <p className="mt-1 text-xs text-gray-500">
          Upload a detailed PDF document with your full quotation (max 5MB)
        </p>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Submitting...' : 'Submit Quotation'}
        </button>
      </div>
    </form>
  );
}