import { Metadata } from 'next';
import Link from 'next/link';
import { getDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Manage Vendors - Solar Panel Vendor Selection',
  description: 'Admin panel for managing vendor accounts',
};

export default async function AdminVendorsPage() {
  // Server-side authentication check
  const db = getDatabase();
  const user = await requireAuth(db, ['admin']);
  
  // Get all vendors with their user data
  const vendorsResult = await db.prepare(`
    SELECT u.id, u.email, u.is_active, u.created_at,
           v.company_name, v.owner_name, v.contact_phone, v.verification_status, v.profile_complete
    FROM users u
    JOIN vendors v ON u.id = v.id
    WHERE u.user_type = 'vendor'
    ORDER BY u.created_at DESC
  `).all<any>();
  
  const vendors = vendorsResult.results || [];
  
  return (
    <div className="container p-6 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Manage Vendors</h1>
        <div className="flex space-x-4">
          <Link 
            href="/admin/dashboard" 
            className="px-4 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Back to Dashboard
          </Link>
          <Link 
            href="/admin/users/create?type=vendor" 
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create Vendor
          </Link>
        </div>
      </div>
      
      <div className="overflow-hidden bg-white rounded-lg shadow">
        <div className="p-6">
          {vendors.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Company
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Owner
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Phone
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Verification
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
                  {vendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10">
                            <div className="flex items-center justify-center w-10 h-10 text-white bg-green-500 rounded-full">
                              {vendor.company_name ? vendor.company_name.charAt(0).toUpperCase() : 'V'}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {vendor.company_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {vendor.profile_complete ? 'Complete Profile' : 'Incomplete Profile'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{vendor.owner_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{vendor.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{vendor.contact_phone || 'Not provided'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          vendor.verification_status === 'verified' 
                            ? 'bg-green-100 text-green-800' 
                            : vendor.verification_status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {vendor.verification_status.charAt(0).toUpperCase() + vendor.verification_status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          vendor.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {vendor.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{new Date(vendor.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                        <Link 
                          href={`/admin/users/vendors/${vendor.id}`}
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
            <p className="text-center text-gray-500">No vendors found</p>
          )}
        </div>
      </div>
    </div>
  );
}
