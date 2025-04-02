import { Metadata } from 'next';
import Link from 'next/link';
import { getDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'My Quotations - Solar Panel Vendor Selection',
  description: 'View your submitted quotations for customer requests',
};

export default async function VendorQuotationsPage() {
  // Server-side authentication check
  const db = getDatabase();
  const user = await requireAuth(db, ['vendor']);
  
  // Get vendor's submitted quotations
  const quotationsResult = await db.prepare(
    `SELECT vq.*, qr.address, qr.monthly_electricity_bill 
     FROM vendor_quotations vq
     JOIN quotation_requests qr ON vq.quotation_request_id = qr.id
     WHERE vq.vendor_id = ?
     ORDER BY vq.created_at DESC`
  ).bind(user.id).all<any>();
  
  const quotations = quotationsResult.results || [];
  
  return (
    <div className="container p-6 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Submitted Quotations</h1>
        <Link 
          href="/vendor/dashboard" 
          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Back to Dashboard
        </Link>
      </div>
      
      {quotations.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-lg shadow">
          <h2 className="mb-4 text-xl font-semibold">No quotations submitted yet</h2>
          <p className="mb-6 text-gray-600">
            You haven't submitted any quotations yet. View customer requests to submit quotations.
          </p>
          <Link 
            href="/vendor/requests" 
            className="inline-block px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            View Customer Requests
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Quotation ID
                </th>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Date Submitted
                </th>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Customer Address
                </th>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Price
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
              {quotations.map((quotation) => (
                <tr key={quotation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      #{quotation.id.substring(0, 8)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(quotation.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 truncate max-w-xs">
                      {quotation.address}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${quotation.price}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                      quotation.status === 'accepted' 
                        ? 'bg-green-100 text-green-800' 
                        : quotation.status === 'rejected' 
                        ? 'bg-red-100 text-red-800' 
                        : quotation.status === 'viewed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                    <Link 
                      href={`/vendor/requests/${quotation.quotation_request_id}`} 
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
