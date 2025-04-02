import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register - Solar Panel Vendor Selection',
  description: 'Choose your account type to register',
};

export default function RegisterSelectionPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create an Account</h1>
          <p className="mt-2 text-gray-600">
            Select the type of account you want to create
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/register/customer"
            className="flex items-center justify-between w-full p-4 text-left border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div>
              <h2 className="text-lg font-medium">Customer</h2>
              <p className="text-sm text-gray-500">
                For homeowners and businesses looking for solar panel installations
              </p>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </Link>

          <Link
            href="/register/vendor"
            className="flex items-center justify-between w-full p-4 text-left border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div>
              <h2 className="text-lg font-medium">Vendor</h2>
              <p className="text-sm text-gray-500">
                For solar panel installation companies to provide quotations
              </p>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>

        <div className="text-center text-sm">
          <p>
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
