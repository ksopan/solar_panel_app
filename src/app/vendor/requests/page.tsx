// For src/app/vendor/requests/page.tsx
// Server component that shows all open quotation requests

import { Metadata } from 'next';
import Link from 'next/link';
import { getDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { getOpenQuotationRequests } from '@/lib/quotation';

export const metadata: Metadata = {
  title: 'Customer Requests - Solar Panel Vendor Selection',
  description: 'View customer quotation requests and submit your quotes',
};

export default async function VendorRequestsPage() {
  console.log("Starting VendorRequestsPage");
  
  // Server-side authentication check
  const db = getDatabase();
  
  try {
    console.log("Requiring auth for vendor");
    const user = await requireAuth(db, ['vendor']);
    console.log("Auth successful for vendor:", user.email);
    
    // Get open quotation requests
    const result = await getOpenQuotationRequests(db);
    const requests = result.success ? result.requests : [];
    
    // Get vendor's already submitted quotation request IDs
    const submittedRequestsResult = await db.prepare(
      'SELECT quotation_request_id FROM vendor_quotations WHERE vendor_id = ?'
    ).bind(user.id).all<{ quotation_request_id: string }>();
    
    const submittedRequestIds = new Set(
      submittedRequestsResult.results?.map(item => item.quotation_request_id) || []
    );
    
    return (
      <div className="container p-6 mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Customer Quotation Requests</h1>
          <Link 
            href="/vendor/dashboard" 
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </Link>
        </div>
        
        <div className="mb-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="text-lg font-medium text-blue-800 mb-2">About Quotation Requests</h2>
            <p className="text-blue-700">
              This page shows open customer requests for solar panel installation quotations.
              You can submit one quotation per request. Review the details carefully before submitting your quote.
            </p>
          </div>
        </div>
        
        {requests.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">No open requests available</h2>
            <p className="text-gray-600 mb-4">
              There are currently no open quotation requests from customers. 
              Please check back later or view your submitted quotations.
            </p>
            <Link 
              href="/vendor/quotations" 
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              View My Quotations
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">Open Requests</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monthly Bill
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Devices
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => {
                    const hasSubmitted = submittedRequestIds.has(request.id);
                    
                    return (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(request.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{request.address}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${request.monthly_electricity_bill}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{request.num_electronic_devices}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {hasSubmitted ? (
                            <span className="text-gray-400">Quote Submitted</span>
                          ) : (
                            <Link 
                              href={`/vendor/requests/${request.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Submit Quote
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error in VendorRequestsPage:", error);
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="p-6 max-w-sm mx-auto bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600">
            There was an error loading the requests. Please try again later.
          </p>
          <div className="mt-4">
            <Link 
              href="/vendor/dashboard" 
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }
}