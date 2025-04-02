import { Metadata } from 'next';
import Link from 'next/link';
import { getDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Manage Vendor Quotations - Solar Panel Vendor Selection',
  description: 'Admin panel for managing vendor quotation submissions',
};

export default async function AdminQuotationSubmissionsPage() {
  // Server-side authentication check
  const db = getDatabase();
  const user = await requireAuth(db, ['admin']);
  
  // Get all vendor quotations with related data
  const quotationsResult = await db.prepare(`
    SELECT vq.id, vq.price, vq.installation_timeframe, vq.warranty_period, 
           vq.status, vq.created_at, vq.quotation_request_id, vq.vendor_id,
           v.company_name,
           c.first_name, c.last_name
    FROM vendor_quotations vq
    JOIN vendors v ON vq.vendor_id = v.id
    JOIN quotation_requests qr ON vq.quotation_request_id = qr.id
    JOIN customers c ON qr.customer_id = c.id
    ORDER BY vq.created_at DESC
  `).all<any>();
  
  const quotations = quotationsResult.results || [];
  
  return (
    <div className="container p-6 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Manage Vendor Quotations</h1>
        <Link 
          href="/admin/dashboard" 
          className="px-4 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Back to Dashboard
        </Link>
      </div>
      
      <div className="overflow-hidden bg-white rounded-lg shadow">
        <div className="p-6">
          {quotations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Vendor
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Warranty
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Date
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
                        <div className="text-sm text-gray-900">
                          {quotation.company_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          <Link 
                            href={`/admin/users/vendors/${quotation.vendor_id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Profile
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {quotation.first_name} {quotation.last_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          <Link 
                            href={`/admin/quotations/requests/${quotation.quotation_request_id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Request
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${quotation.price}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {quotation.warranty_period}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(quotation.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                        <Link 
                          href={`/admin/quotations/submissions/${quotation.id}`}
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
          ) : (
            <p className="text-center text-gray-500">No quotation submissions found</p>
          )}
        </div>
      </div>
    </div>
  );
}
