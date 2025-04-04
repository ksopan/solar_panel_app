'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function QuotationRequestForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form fields state
  const [address, setAddress] = useState('');
  const [numDevices, setNumDevices] = useState<number | ''>('');
  const [monthlyBill, setMonthlyBill] = useState<number | ''>('');
  const [additionalRequirements, setAdditionalRequirements] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Validation
      if (!address || numDevices === '' || monthlyBill === '') {
        throw new Error('Please fill in all required fields');
      }
      
      if (typeof numDevices === 'number' && numDevices <= 0) {
        throw new Error('Number of devices must be greater than 0');
      }
      
      if (typeof monthlyBill === 'number' && monthlyBill <= 0) {
        throw new Error('Monthly electricity bill must be greater than 0');
      }
      
      // Prepare form data
      const formData = {
        address,
        num_electronic_devices: Number(numDevices),
        monthly_electricity_bill: Number(monthlyBill),
        additional_requirements: additionalRequirements,
      };
      
      // Submit form
      const response = await fetch('/api/quotations/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to submit quotation request');
      }
      
      setSuccess(true);
      
      // Reset form
      setAddress('');
      setNumDevices('');
      setMonthlyBill('');
      setAdditionalRequirements('');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/customer/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Quotation request error:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit quotation request');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-center">Request for Quotation</h2>
      
      {error && (
        <div className="p-3 mb-4 text-sm text-red-800 bg-red-100 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-3 mb-4 text-sm text-green-800 bg-green-100 rounded-md">
          Your quotation request has been submitted successfully! Redirecting to dashboard...
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Installation Address <span className="text-red-500">*</span>
          </label>
          <textarea
            id="address"
            name="address"
            rows={3}
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading || success}
            placeholder="Enter the complete address where solar panels will be installed"
          />
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="numDevices" className="block text-sm font-medium text-gray-700">
              Number of Electronic Devices <span className="text-red-500">*</span>
            </label>
            <input
              id="numDevices"
              name="numDevices"
              type="number"
              min="1"
              required
              value={numDevices}
              onChange={(e) => setNumDevices(e.target.value ? parseInt(e.target.value) : '')}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading || success}
              placeholder="e.g., 15"
            />
            <p className="mt-1 text-xs text-gray-500">
              Include all major appliances, computers, TVs, etc.
            </p>
          </div>
          
          <div>
            <label htmlFor="monthlyBill" className="block text-sm font-medium text-gray-700">
              Monthly Electricity Bill ($) <span className="text-red-500">*</span>
            </label>
            <input
              id="monthlyBill"
              name="monthlyBill"
              type="number"
              min="1"
              step="0.01"
              required
              value={monthlyBill}
              onChange={(e) => setMonthlyBill(e.target.value ? parseFloat(e.target.value) : '')}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading || success}
              placeholder="e.g., 150.00"
            />
            <p className="mt-1 text-xs text-gray-500">
              Your average monthly electricity cost in dollars
            </p>
          </div>
        </div>
        
        <div>
          <label htmlFor="additionalRequirements" className="block text-sm font-medium text-gray-700">
            Additional Requirements
          </label>
          <textarea
            id="additionalRequirements"
            name="additionalRequirements"
            rows={4}
            value={additionalRequirements}
            onChange={(e) => setAdditionalRequirements(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading || success}
            placeholder="Any specific requirements or questions for vendors (optional)"
          />
        </div>
        
        <div className="pt-4 flex justify-between">
          <Link 
            href="/customer/dashboard"
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </Link>
          
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isLoading || success}
          >
            {isLoading ? 'Submitting...' : success ? 'Submitted!' : 'Submit Quotation Request'}
          </button>
        </div>
      </form>
    </div>
  );
}