'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface QuotationFormProps {
  requestId: string;
}

export default function QuotationForm({ requestId }: QuotationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form fields state
  const [price, setPrice] = useState<number | ''>('');
  const [installationTimeframe, setInstallationTimeframe] = useState('');
  const [warrantyPeriod, setWarrantyPeriod] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Validation
      if (price === '' || !installationTimeframe || !warrantyPeriod) {
        throw new Error('Please fill in all required fields');
      }
      
      if (typeof price === 'number' && price <= 0) {
        throw new Error('Price must be greater than 0');
      }
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('quotation_request_id', requestId);
      formData.append('price', price.toString());
      formData.append('installation_timeframe', installationTimeframe);
      formData.append('warranty_period', warrantyPeriod);
      formData.append('additional_notes', additionalNotes);
      
      if (pdfFile) {
        formData.append('quotation_pdf', pdfFile);
      }
      
      // Submit form
      const response = await fetch('/api/quotations/submit', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to submit quotation');
      }
      
      setSuccess(true);
      
      // Redirect to quotations list after a short delay
      setTimeout(() => {
        router.push('/vendor/quotations');
      }, 2000);
    } catch (error) {
      console.error('Quotation submission error:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit quotation');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full">
      {error && (
        <div className="p-3 mb-4 text-sm text-red-800 bg-red-100 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-3 mb-4 text-sm text-green-800 bg-green-100 rounded-md">
          Your quotation has been submitted successfully! The customer will be notified.
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price ($) <span className="text-red-500">*</span>
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="1"
              step="0.01"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value ? parseFloat(e.target.value) : '')}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
              placeholder="e.g., 5000.00"
            />
            <p className="mt-1 text-xs text-gray-500">
              Total cost for the solar panel installation
            </p>
          </div>
          
          <div>
            <label htmlFor="installationTimeframe" className="block text-sm font-medium text-gray-700">
              Installation Timeframe <span className="text-red-500">*</span>
            </label>
            <input
              id="installationTimeframe"
              name="installationTimeframe"
              type="text"
              required
              value={installationTimeframe}
              onChange={(e) => setInstallationTimeframe(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
              placeholder="e.g., 2-3 weeks"
            />
            <p className="mt-1 text-xs text-gray-500">
              Estimated time to complete the installation
            </p>
          </div>
          
          <div>
            <label htmlFor="warrantyPeriod" className="block text-sm font-medium text-gray-700">
              Warranty Period <span className="text-red-500">*</span>
            </label>
            <input
              id="warrantyPeriod"
              name="warrantyPeriod"
              type="text"
              required
              value={warrantyPeriod}
              onChange={(e) => setWarrantyPeriod(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
              placeholder="e.g., 10 years"
            />
            <p className="mt-1 text-xs text-gray-500">
              Length of warranty coverage provided
            </p>
          </div>
        </div>
        
        <div>
          <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700">
            Additional Notes
          </label>
          <textarea
            id="additionalNotes"
            name="additionalNotes"
            rows={4}
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
            placeholder="Any additional information about your quotation (optional)"
          />
        </div>
        
        <div>
          <label htmlFor="pdfFile" className="block text-sm font-medium text-gray-700">
            Detailed Quotation PDF
          </label>
          <input
            id="pdfFile"
            name="pdfFile"
            type="file"
            accept=".pdf"
            onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <p className="mt-1 text-xs text-gray-500">
            Upload a detailed PDF with your complete quotation (optional)
          </p>
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            className="w-full px-4 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit Quotation'}
          </button>
        </div>
      </form>
    </div>
  );
}
