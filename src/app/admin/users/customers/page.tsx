import { Metadata } from 'next';
import Link from 'next/link';
import { getDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Manage Customers - Solar Panel Vendor Selection',
  description: 'Admin panel for managing customer accounts',
};

export default async function AdminCustomersPage() {
  // Server-side authentication check
  const db = getDatabase();
  const user = await requireAuth(db, ['admin']);
  
  // Get all customers with their user data
  const customersResult = await db.prepare(`
    SELECT u.id, u.email, u.is_active, u.created_at,
           c.first_name, c.last_name, c.phone_number, c.is_gmail_registered, c.profile_complete
    FROM users u
    JOIN customers c ON u.id = c.id
    WHERE u.user_type = 'customer'
    ORDER BY u.created_at DESC
  `).all<any>();
  
  const customers = customersResult.results || [];
  
  return (
    <div className="container p-6 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Manage Customers</h1>
        <div className="flex space-x-4">
          <Link 
            href="/admin/dashboard" 
            className="px-4 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Back to Dashboard
          </Link>
          <Link 
            href="/admin/users/create?type=customer" 
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create Customer
          </Link>
        </div>
      </div>
      
      <div className="overflow-hidden bg-white rounded-lg shadow">
        <div className="p-6">
          {customers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Phone
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Registration
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Joined
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10">
                            <div className="flex items-center justify-center w-10 h-10 text-white bg-blue-500 rounded-full">
                              {customer.first_name ? customer.first_name.charAt(0).toUpperCase() : 'C'}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.first_name} {customer.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {customer.profile_complete ? 'Complete Profile' : 'Incomplete Profile'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.phone_number || 'Not provided'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          customer.is_gmail_registered 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {customer.is_gmail_registered ? 'Gmail' : 'Manual'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          customer.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {customer.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{new Date(customer.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                        <Link 
                          href={`/admin/users/customers/${customer.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500">No customers found</p>
          )}
        </div>
      </div>
    </div>
  );
}
