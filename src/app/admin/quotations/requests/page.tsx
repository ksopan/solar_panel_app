import { Metadata } from 'next';
import Link from 'next/link';
import { getDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Manage Quotation Requests - Solar Panel Vendor Selection',
  description: 'Admin panel for managing customer quotation requests',
};

export default async function AdminQuotationRequestsPage() {
  // Server-side authentication check
  const db = getDatabase();
  const user = await requireAuth(db, ['admin']);
  
  // Get all quotation requests with customer data
  const requestsResult = await db.prepare(`
    SELECT qr.id, qr.address, qr.monthly_electricity_bill, qr.num_electronic_devices, 
           qr.status, qr.created_at, qr.customer_id,
           c.first_name, c.last_name,
           (SELECT COUNT(*) FROM vendor_quotations WHERE quotation_request_id = qr.id) as quotations_count
    FROM quotation_requests qr
    JOIN customers c ON qr.customer_id = c.id
    ORDER BY qr.created_at DESC
  `).all<any>();
  
  const requests = requestsResult.results || [];
  
  return (
    <div className="container p-6 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Manage Quotation Requests</h1>
        <Link 
          href="/admin/dashboard" 
          className="px-4 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Back to Dashboard
        </Link>
      </div>
      
      <div className="overflow-hidden bg-white rounded-lg shadow">
        <div className="p-6">
          {requests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Address
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Monthly Bill
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Quotations
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
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{request.id.substring(0, 8)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {request.first_name} {request.last_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          <Link 
                            href={`/admin/users/customers/${request.customer_id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Profile
                          </Link>
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
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          request.status === 'open' 
                            ? 'bg-green-100 text-green-800' 
                            : request.status === 'in_progress' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {request.quotations_count}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(request.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                        <Link 
                          href={`/admin/quotations/requests/${request.id}`}
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
            <p className="text-center text-gray-500">No quotation requests found</p>
          )}
        </div>
      </div>
    </div>
  );
}
