import { Metadata } from 'next';
import Link from 'next/link';
import { getDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Solar Panel Vendor Selection',
  description: 'Administrator dashboard for managing users and quotations',
};

export default async function AdminDashboardPage() {
  // Server-side authentication check
  const db = getDatabase();
  const user = await requireAuth(db, ['admin']);
  
  // Get counts for dashboard stats
  const customersCount = await db.prepare(
    'SELECT COUNT(*) as count FROM users WHERE user_type = ?'
  ).bind('customer').first<{ count: number }>();
  
  const vendorsCount = await db.prepare(
    'SELECT COUNT(*) as count FROM users WHERE user_type = ?'
  ).bind('vendor').first<{ count: number }>();
  
  const quotationRequestsCount = await db.prepare(
    'SELECT COUNT(*) as count FROM quotation_requests'
  ).first<{ count: number }>();
  
  const quotationsCount = await db.prepare(
    'SELECT COUNT(*) as count FROM vendor_quotations'
  ).first<{ count: number }>();
  
  // Get recent quotation requests
  const recentRequests = await db.prepare(`
    SELECT qr.id, qr.created_at, qr.status, qr.monthly_electricity_bill,
           c.first_name, c.last_name
    FROM quotation_requests qr
    JOIN customers c ON qr.customer_id = c.id
    ORDER BY qr.created_at DESC
    LIMIT 5
  `).all<any>();
  
  // Get recent vendor quotations
  const recentQuotations = await db.prepare(`
    SELECT vq.id, vq.created_at, vq.price, vq.status,
           v.company_name
    FROM vendor_quotations vq
    JOIN vendors v ON vq.vendor_id = v.id
    ORDER BY vq.created_at DESC
    LIMIT 5
  `).all<any>();
  
  return (
    <div className="container p-6 mx-auto">
      <h1 className="mb-8 text-3xl font-bold">Admin Dashboard</h1>
      
      <div className="grid gap-6 mb-8 md:grid-cols-4">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-2 text-lg font-semibold">Customers</h2>
          <p className="text-3xl font-bold text-blue-600">{customersCount?.count || 0}</p>
          <p className="mt-2 text-sm text-gray-600">Registered customers</p>
          <Link 
            href="/admin/users/customers" 
            className="inline-block mt-4 text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View All →
          </Link>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-2 text-lg font-semibold">Vendors</h2>
          <p className="text-3xl font-bold text-green-600">{vendorsCount?.count || 0}</p>
          <p className="mt-2 text-sm text-gray-600">Registered vendors</p>
          <Link 
            href="/admin/users/vendors" 
            className="inline-block mt-4 text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View All →
          </Link>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-2 text-lg font-semibold">Quotation Requests</h2>
          <p className="text-3xl font-bold text-purple-600">{quotationRequestsCount?.count || 0}</p>
          <p className="mt-2 text-sm text-gray-600">Total requests submitted</p>
          <Link 
            href="/admin/quotations/requests" 
            className="inline-block mt-4 text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View All →
          </Link>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-2 text-lg font-semibold">Vendor Quotations</h2>
          <p className="text-3xl font-bold text-yellow-600">{quotationsCount?.count || 0}</p>
          <p className="mt-2 text-sm text-gray-600">Total quotations submitted</p>
          <Link 
            href="/admin/quotations/submissions" 
            className="inline-block mt-4 text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View All →
          </Link>
        </div>
      </div>
      
      <div className="grid gap-6 mb-8 md:grid-cols-2">
        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Recent Quotation Requests</h2>
          </div>
          <div className="p-6">
            {recentRequests.results?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">ID</th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Customer</th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentRequests.results.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">#{request.id.substring(0, 8)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{request.first_name} {request.last_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{new Date(request.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm">
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
                        <td className="px-4 py-3 text-sm">
                          <Link 
                            href={`/admin/quotations/requests/${request.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
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
            <div className="mt-4 text-right">
              <Link 
                href="/admin/quotations/requests" 
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View All Requests →
              </Link>
            </div>
          </div>
        </div>
        
        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Recent Vendor Quotations</h2>
          </div>
          <div className="p-6">
            {recentQuotations.results?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">ID</th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Vendor</th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentQuotations.results.map((quotation) => (
                      <tr key={quotation.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">#{quotation.id.substring(0, 8)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{quotation.company_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">${quotation.price}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            quotation.status === 'accepted' 
                              ? 'bg-green-100 text-green-800' 
                              : quotation.status === 'rejected' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Link 
                            href={`/admin/quotations/submissions/${quotation.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500">No quotations found</p>
            )}
            <div className="mt-4 text-right">
              <Link 
                href="/admin/quotations/submissions" 
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View All Quotations →
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
          <div className="space-y-2">
            <Link 
              href="/admin/users/create" 
              className="block w-full px-4 py-2 text-center text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Create New User
            </Link>
            <Link 
              href="/admin/users/vendors/verification" 
              className="block w-full px-4 py-2 text-center text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              Vendor Verification Queue
            </Link>
            <Link 
              href="/admin/system/settings" 
              className="block w-full px-4 py-2 text-center text-white bg-gray-600 rounded-md hover:bg-gray-700"
            >
              System Settings
            </Link>
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-lg font-semibold">System Status</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Database Status</span>
                <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                  Operational
                </span>
              </div>
              <div className="w-full h-2 mt-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-green-500 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">API Status</span>
                <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                  Operational
                </span>
              </div>
              <div className="w-full h-2 mt-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-green-500 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Storage Usage</span>
                <span className="text-xs font-semibold text-gray-700">
                  45% (4.5 GB / 10 GB)
                </span>
              </div>
              <div className="w-full h-2 mt-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-blue-500 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
