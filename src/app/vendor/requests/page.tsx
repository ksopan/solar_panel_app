import { Metadata } from 'next';
import Link from 'next/link';
import { getDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { getOpenQuotationRequests } from '@/lib/quotation';

export const metadata: Metadata = {
  title: 'Customer Requests - Solar Panel Vendor Selection',
  description: 'View all customer quotation requests and submit your quotations',
};

export default async function VendorRequestsPage() {
  // Server-side authentication check
  const db = getDatabase();
  const user = await requireAuth(db, ['vendor']);
  
  // Get open quotation requests
  const result = await getOpenQuotationRequests(db);
  const requests = result.success ? result.requests : [];
  
  return (
    <div className="container p-6 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Customer Quotation Requests</h1>
        <Link 
          href="/vendor/dashboard" 
          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Back to Dashboard
        </Link>
      </div>
      
      {requests.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-lg shadow">
          <h2 className="mb-4 text-xl font-semibold">No open requests</h2>
          <p className="text-gray-600">
            There are currently no open quotation requests from customers. Check back later or view your submitted quotations.
          </p>
          <Link 
            href="/vendor/quotations" 
            className="inline-block px-4 py-2 mt-6 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            View My Quotations
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Request ID
                </th>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Address
                </th>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Monthly Bill
                </th>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Devices
                </th>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      #{request.id.substring(0, 8)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 truncate max-w-xs">
                      {request.address}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${request.monthly_electricity_bill}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {request.num_electronic_devices}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 text-xs font-semibold leading-5 text-green-800 bg-green-100 rounded-full">
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                    <Link 
                      href={`/vendor/requests/${request.id}`} 
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
