import { Metadata } from 'next';
import Link from 'next/link';
import { getDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { getOpenQuotationRequests } from '@/lib/quotation';

export const metadata: Metadata = {
  title: 'Vendor Dashboard - Solar Panel Vendor Selection',
  description: 'View customer quotation requests and manage your submissions',
};

export default async function VendorDashboardPage() {
  // Server-side authentication check
  const db = getDatabase();
  const user = await requireAuth(db, ['vendor']);
  
  // Get open quotation requests
  const result = await getOpenQuotationRequests(db);
  const requests = result.success ? result.requests : [];
  
  // Get vendor's submitted quotations count
  const quotationsResult = await db.prepare(
    'SELECT COUNT(*) as count FROM vendor_quotations WHERE vendor_id = ?'
  ).bind(user.id).first<{ count: number }>();
  
  const quotationsCount = quotationsResult?.count || 0;
  
  return (
    <div className="container p-6 mx-auto">
      <h1 className="mb-8 text-3xl font-bold">Vendor Dashboard</h1>
      
      <div className="grid gap-6 mb-8 md:grid-cols-3">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-2 text-lg font-semibold">Open Requests</h2>
          <p className="text-3xl font-bold text-blue-600">{requests.length}</p>
          <p className="mt-2 text-sm text-gray-600">Customer requests awaiting your quotation</p>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-2 text-lg font-semibold">My Quotations</h2>
          <p className="text-3xl font-bold text-green-600">{quotationsCount}</p>
          <p className="mt-2 text-sm text-gray-600">Quotations you've submitted to customers</p>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-2 text-lg font-semibold">Quick Actions</h2>
          <div className="space-y-2">
            <Link 
              href="/vendor/requests" 
              className="block w-full px-4 py-2 text-center text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              View All Requests
            </Link>
            <Link 
              href="/vendor/quotations" 
              className="block w-full px-4 py-2 text-center text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              View My Quotations
            </Link>
          </div>
        </div>
      </div>
      
      <h2 className="mb-4 text-2xl font-bold">Recent Quotation Requests</h2>
      
      {requests.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-lg shadow">
          <h3 className="mb-4 text-xl font-semibold">No open requests</h3>
          <p className="text-gray-600">
            There are currently no open quotation requests from customers. Check back later or view your submitted quotations.
          </p>
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
              {requests.slice(0, 5).map((request) => (
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
          {requests.length > 5 && (
            <div className="px-6 py-4 bg-gray-50">
              <Link 
                href="/vendor/requests" 
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View All Requests
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
