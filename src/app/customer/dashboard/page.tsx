import { Metadata } from 'next';
import Link from 'next/link';
import { getDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { getQuotationRequestsByCustomer } from '@/lib/quotation';
import LogoutButton from '@/components/LogoutButton'; // Import the LogoutButton component

export const metadata: Metadata = {
  title: 'Customer Dashboard - Solar Panel Vendor Selection',
  description: 'Manage your solar panel quotation requests',
};

export default async function CustomerDashboardPage() {
  console.log("Starting CustomerDashboardPage");

  const db = getDatabase();

  try {
    console.log("Requiring auth for customer");
    const user = await requireAuth(db, ['customer']);
    console.log("Auth successful for user:", user.email);

    let requests: any[] = [];
    const result = await getQuotationRequestsByCustomer(db, user.id);
    if (result?.success && Array.isArray(result.requests)) {
      requests = result.requests;
    }

    return (
      <div className="container p-6 mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Customer Dashboard</h1>
          <div className="flex items-center gap-4">
            <LogoutButton />
            <Link 
              href="/customer/request-quotation" 
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Request New Quotation
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="p-6 bg-white rounded-lg shadow">
              <h2 className="mb-4 text-xl font-semibold">Your Quotation Requests</h2>

              {!Array.isArray(requests) || requests.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="mb-4 text-gray-600">You haven't submitted any quotation requests yet.</p>
                  <Link 
                    href="/customer/request-quotation" 
                    className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Request a Quotation
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div key={request.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">{request.address}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <span className="text-sm text-gray-500">Devices:</span> {request.num_electronic_devices}
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Monthly Bill:</span> ${request.monthly_electricity_bill}
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          request.status === 'open' 
                            ? 'bg-green-100 text-green-800' 
                            : request.status === 'in_progress' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {request.status}
                        </span>
                        <Link
                          href={`/customer/quotations/${request.id}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="p-6 bg-white rounded-lg shadow">
              <h2 className="mb-4 text-xl font-semibold">Account Summary</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="text-black dark:text-black">{user.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Account Type</h3>
                  <p className="capitalize text-black dark:text-black">{user.user_type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Quick Links</h3>
                  <ul className="mt-2 space-y-2">
                    <li>
                      <Link href="/customer/quotations" className="text-blue-600 hover:underline">
                        View All Quotations
                      </Link>
                    </li>
                    <li>
                      <Link href="/customer/profile" className="text-blue-600 hover:underline">
                        Edit Profile
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in CustomerDashboardPage:", error);
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