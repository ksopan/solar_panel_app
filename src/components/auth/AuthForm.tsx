'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AuthFormProps {
  type: 'login' | 'register';
  userType?: 'customer' | 'vendor';
}

export default function AuthForm({ type, userType }: AuthFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLogin = type === 'login';
  const isCustomer = userType === 'customer';

  // Form fields state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Customer specific fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Vendor specific fields
  const [companyName, setCompanyName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [description, setDescription] = useState('');
  const [servicesOffered, setServicesOffered] = useState('');

  async function handleGoogleLogin() {
    if (!isCustomer) {
      setError('Google login is only available for customers');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // This would be replaced with actual Google OAuth implementation
      const response = await fetch('/api/auth/google', {
        method: 'POST',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Google login failed');
      }
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
      setError(error instanceof Error ? error.message : 'Google login failed');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Validation
      if (!isLogin && password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      if (!email || !password) {
        throw new Error('Please fill in all required fields');
      }
      
      if (!isLogin && userType === 'vendor') {
        if (!companyName || !ownerName || !companyAddress || !contactPhone) {
          throw new Error('Please fill in all required company information');
        }
      }
      
      // Prepare form data
      const formData: Record<string, any> = {
        email,
        password,
      };
      
      if (!isLogin) {
        formData.userType = userType;
        
        if (userType === 'customer') {
          formData.profile = {
            firstName,
            lastName,
            address,
            phoneNumber,
          };
        } else if (userType === 'vendor') {
          formData.profile = {
            companyName,
            ownerName,
            companyAddress,
            contactPhone,
            description,
            servicesOffered,
          };
        }
      }
      
      // Submit form
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Authentication failed');
      }
      
      // Redirect based on user type and action
      // Inside handleSubmit function in AuthForm.tsx
      if (isLogin) {
        const data = await response.json();
        if (data.user.user_type === 'customer') {
          router.push('/customer/dashboard');
        } else if (data.user.user_type === 'vendor') {
          router.push('/vendor/dashboard');
        } else if (data.user.user_type === 'admin') {
          router.push('/admin/dashboard');
        }
      } else {
        router.push('/login?registered=true');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <h1 className="text-2xl font-bold">
          {isLogin ? 'Login' : userType === 'customer' ? 'Customer Registration' : 'Vendor Registration'}
        </h1>
        <p className="mt-2 text-gray-600">
          {isLogin
            ? 'Sign in to your account'
            : userType === 'customer'
            ? 'Create a new customer account'
            : 'Create a new vendor account'}
        </p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-800 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>

        {!isLogin && (
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>
        )}

        {/* Customer registration fields */}
        {!isLogin && userType === 'customer' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                id="address"
                name="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
          </div>
        )}

        {/* Vendor registration fields */}
        {!isLogin && userType === 'vendor' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                Company Name
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700">
                Owner's Name
              </label>
              <input
                id="ownerName"
                name="ownerName"
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700">
                Company Address
              </label>
              <input
                id="companyAddress"
                name="companyAddress"
                type="text"
                required
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                Contact Phone
              </label>
              <input
                id="contactPhone"
                name="contactPhone"
                type="tel"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Company Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="servicesOffered" className="block text-sm font-medium text-gray-700">
                Services Offered
              </label>
              <textarea
                id="servicesOffered"
                name="servicesOffered"
                rows={3}
                value={servicesOffered}
                onChange={(e) => setServicesOffered(e.target.value)}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
          </div>
        )}

        <div>
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading
              ? 'Processing...'
              : isLogin
              ? 'Sign In'
              : 'Create Account'}
          </button>
        </div>
      </form>

      {isCustomer && (
        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-gray-500 bg-white">Or continue with</span>
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={isLoading}
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                    fill="currentColor"
                  />
                </svg>
                <span>Google</span>
              </div>
            </button>
          </div>
        </div>
      )}

      <div className="text-center text-sm">
        {isLogin ? (
          <p>
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Register
            </Link>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
