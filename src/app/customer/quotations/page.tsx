import { Metadata } from 'next';
import Link from 'next/link';
import { getDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { getQuotationRequestsByCustomer } from '@/lib/quotation';

export const metadata: Metadata = {
  title: 'My Quotation Requests - Solar Panel Vendor Selection',
  description: 'View your submitted quotation requests and received quotations',
};

export default async function CustomerQuotationsPage() {
  // Server-side authentication check
  const db = getDatabase();
  const user = await requireAuth(db, ['customer']);
  
  // Get customer's quotation requests
  const result = await getQuotationRequestsByCustomer(db, user.id);
  const requests = result.success ? result.requests : [];
  
  return (
    <div className="container p-6 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Quotation Requests</h1>
        <Link 
          href="/customer/request-quotation" 
          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Request New Quotation
        </Link>
      </div>
      
      {requests.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-lg shadow">
          <h2 className="mb-4 text-xl font-semibold">No quotation requests yet</h2>
          <p className="mb-6 text-gray-600">
            You haven't submitted any quotation requests yet. Get started by requesting a quotation from solar panel vendors.
          </p>
          <Link 
            href="/customer/request-quotation" 
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Request a Quotation
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {requests.map((request) => (
            <div key={request.id} className="p-6 bg-white rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  request.status === 'open' 
                    ? 'bg-green-100 text-green-800' 
                    : request.status === 'in_progress' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(request.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <h3 className="mb-2 text-lg font-semibold">Request #{request.id.substring(0, 8)}</h3>
              
              <div className="mb-4 space-y-2">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Address:</span> {request.address}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Devices:</span> {request.num_electronic_devices}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Monthly Bill:</span> ${request.monthly_electricity_bill}
                </p>
              </div>
              
              <Link 
                href={`/customer/quotations/${request.id}`} 
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View Details →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
