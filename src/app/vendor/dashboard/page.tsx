// For src/app/vendor/dashboard/page.tsx
// Server component that uses requireAuth for vendor access

import { Metadata } from 'next';
import Link from 'next/link';
import { getDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { getOpenQuotationRequests } from '@/lib/quotation';

export const metadata: Metadata = {
  title: 'Vendor Dashboard - Solar Panel Vendor Selection',
  description: 'Manage customer quotation requests and submit your quotes',
};

export default async function VendorDashboardPage() {
  console.log("Starting VendorDashboardPage");
  
  // Server-side authentication check
  const db = getDatabase();
  
  try {
    console.log("Requiring auth for vendor");
    const user = await requireAuth(db, ['vendor']);
    console.log("Auth successful for vendor:", user.email);
    
    // Get open quotation requests from customers
    const openRequestsResult = await getOpenQuotationRequests(db);
    const openRequests = openRequestsResult.success ? openRequestsResult.requests : [];
    
    // Get vendor's submitted quotations
    const vendorQuotationsResult = await db.prepare(`
      SELECT vq.*, qr.address, qr.monthly_electricity_bill, qr.num_electronic_devices 
      FROM vendor_quotations vq
      JOIN quotation_requests qr ON vq.quotation_request_id = qr.id
      WHERE vq.vendor_id = ?
      ORDER BY vq.created_at DESC
      LIMIT 5
    `).bind(user.id).all<any>();
    
    const vendorQuotations = vendorQuotationsResult.results || [];
    
    return (
      <div className="container p-6 mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
          <Link 
            href="/vendor/profile" 
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Edit Profile
          </Link>
        </div>
        
        <div className="grid gap-6 mb-8 lg:grid-cols-3">
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-xl font-semibold">Open Quotation Requests</h2>
            <p className="mb-2 text-gray-600">
              {openRequests.length} open request{openRequests.length !== 1 ? 's' : ''} waiting for your quotation
            </p>
            <Link 
              href="/vendor/requests" 
              className="inline-block px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              View All Requests
            </Link>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-xl font-semibold">My Quotations</h2>
            <p className="mb-2 text-gray-600">
              {vendorQuotations.length} quotation{vendorQuotations.length !== 1 ? 's' : ''} submitted
            </p>
            <Link 
              href="/vendor/quotations" 
              className="inline-block px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              View My Quotations
            </Link>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-xl font-semibold">Account Summary</h2>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="mb-2">{user.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Account Type</h3>
              <p className="capitalize mb-2">{user.user_type}</p>
            </div>
          </div>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-xl font-semibold">Latest Quotation Requests</h2>
            
            {openRequests.length === 0 ? (
              <p className="text-center py-4 text-gray-500">
                No open quotation requests at the moment.
              </p>
            ) : (
              <div className="divide-y">
                {openRequests.slice(0, 5).map((request) => (
                  <div key={request.id} className="py-4">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{request.address}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(request.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <span className="text-sm text-gray-500">Monthly Bill:</span> ${request.monthly_electricity_bill}
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Devices:</span> {request.num_electronic_devices}
                      </div>
                    </div>
                    <div className="flex justify-end mt-2">
                      <Link
                        href={`/vendor/requests/${request.id}`}
                        className="px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      >
                        Submit Quote
                      </Link>
                    </div>
                  </div>
                ))}
                
                {openRequests.length > 5 && (
                  <div className="pt-4 text-center">
                    <Link href="/vendor/requests" className="text-blue-600 hover:underline">
                      View All Requests →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-xl font-semibold">My Recent Quotations</h2>
            
            {vendorQuotations.length === 0 ? (
              <p className="text-center py-4 text-gray-500">
                You haven't submitted any quotations yet.
              </p>
            ) : (
              <div className="divide-y">
                {vendorQuotations.map((quotation) => (
                  <div key={quotation.id} className="py-4">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{quotation.address}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        quotation.status === 'accepted' 
                          ? 'bg-green-100 text-green-800' 
                          : quotation.status === 'rejected' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {quotation.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <span className="text-sm text-gray-500">Price:</span> ${quotation.price}
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Warranty:</span> {quotation.warranty_period}
                      </div>
                    </div>
                    <div className="flex justify-end mt-2">
                      <Link
                        href={`/vendor/quotations/${quotation.id}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 text-center">
                  <Link href="/vendor/quotations" className="text-blue-600 hover:underline">
                    View All Quotations →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in VendorDashboardPage:", error);
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="p-6 max-w-sm mx-auto bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600">
            There was an error loading your dashboard. Please try again later.
          </p>
          <div className="mt-4">
            <Link 
              href="/login" 
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }
}