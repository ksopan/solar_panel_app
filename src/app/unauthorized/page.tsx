import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unauthorized - Solar Panel Vendor Selection',
  description: 'You do not have permission to access this page',
};

export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2 text-gray-600">
            You do not have permission to access this page.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            This could be because:
          </p>
          <ul className="pl-5 text-sm text-gray-500 list-disc">
            <li>You are trying to access a page that requires different permissions</li>
            <li>Your session has expired</li>
            <li>You need to log in with a different account type</li>
          </ul>
        </div>

        <div className="flex justify-center pt-4">
          <Link
            href="/login"
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}