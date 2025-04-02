import { Metadata } from 'next';
import Link from 'next/link';
import { getDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { getQuotationRequestsByCustomer, getUnreadNotificationsCount } from '@/lib/quotation';

export const metadata: Metadata = {
  title: 'Customer Dashboard - Solar Panel Vendor Selection',
  description: 'View your quotation requests and analyze vendor quotations',
};

export default async function CustomerDashboardPage() {
  // Server-side authentication check
  const db = getDatabase();
  const user = await requireAuth(db, ['customer']);
  
  // Get customer's quotation requests
  const requestsResult = await getQuotationRequestsByCustomer(db, user.id);
  const requests = requestsResult.success ? requestsResult.requests : [];
  
  // Get unread notifications count
  const notificationsResult = await getUnreadNotificationsCount(db, user.id);
  const unreadNotifications = notificationsResult.success ? notificationsResult.count : 0;
  
  // Get count of received quotations
  const quotationsResult = await db.prepare(`
    SELECT COUNT(*) as count FROM vendor_quotations vq
    JOIN quotation_requests qr ON vq.quotation_request_id = qr.id
    WHERE qr.customer_id = ?
  `).bind(user.id).first<{ count: number }>();
  
  const quotationsCount = quotationsResult?.count || 0;
  
  // Get customer profile
  const profile = await db.prepare(
    'SELECT * FROM customers WHERE id = ?'
  ).bind(user.id).first<any>();
  
  return (
    <div className="container p-6 mx-auto">
      <h1 className="mb-8 text-3xl font-bold">Customer Dashboard</h1>
      
      <div className="grid gap-6 mb-8 md:grid-cols-3">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-2 text-lg font-semibold">My Requests</h2>
          <p className="text-3xl font-bold text-blue-600">{requests.length}</p>
          <p className="mt-2 text-sm text-gray-600">Quotation requests you've submitted</p>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-2 text-lg font-semibold">Received Quotations</h2>
          <p className="text-3xl font-bold text-green-600">{quotationsCount}</p>
          <p className="mt-2 text-sm text-gray-600">Quotations from vendors</p>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-2 text-lg font-semibold">Quick Actions</h2>
          <div className="space-y-2">
            <Link 
              href="/customer/request-quotation" 
              className="block w-full px-4 py-2 text-center text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Request New Quotation
            </Link>
            <Link 
              href="/customer/quotations" 
              className="block w-full px-4 py-2 text-center text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              View My Quotations
            </Link>
            {unreadNotifications > 0 && (
              <Link 
                href="/customer/notifications" 
                className="block w-full px-4 py-2 text-center text-white bg-yellow-600 rounded-md hover:bg-yellow-700"
              >
                View Notifications ({unreadNotifications})
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {profile && !profile.profile_complete && (
        <div className="p-4 mb-8 text-yellow-800 bg-yellow-100 rounded-md">
          <h3 className="text-lg font-medium">Complete Your Profile</h3>
          <p className="mt-1">
            Please complete your profile information to help vendors provide more accurate quotations.
          </p>
          <Link 
            href="/customer/profile" 
            className="inline-block px-4 py-2 mt-2 text-sm text-white bg-yellow-600 rounded-md hover:bg-yellow-700"
          >
            Complete Profile
          </Link>
        </div>
      )}
      
      <h2 className="mb-4 text-2xl font-bold">Recent Quotation Requests</h2>
      
      {requests.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-lg shadow">
          <h3 className="mb-4 text-xl font-semibold">No quotation requests yet</h3>
          <p className="mb-6 text-gray-600">
            You haven't submitted any quotation requests yet. Get started by requesting a quotation from solar panel vendors.
          </p>
          <Link 
            href="/customer/request-quotation" 
            className="inline-block px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Request a Quotation
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {requests.slice(0, 4).map((request) => (
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
      
      {requests.length > 4 && (
        <div className="mt-4 text-center">
          <Link 
            href="/customer/quotations" 
            className="text-blue-600 hover:text-blue-500"
          >
            View All Requests →
          </Link>
        </div>
      )}
    </div>
  );
}
