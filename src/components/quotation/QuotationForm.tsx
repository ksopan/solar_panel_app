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
  const [uploadProgress, setUploadProgress] = useState(0); // For simulating upload progress

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setUploadProgress(0);
    
    try {
      // Validation
      if (price === '' || !installationTimeframe || !warrantyPeriod) {
        throw new Error('Please fill in all required fields');
      }
      
      if (typeof price === 'number' && price <= 0) {
        throw new Error('Price must be greater than 0');
      }
      
      // Validate PDF file if selected
      if (pdfFile) {
        // Check file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (pdfFile.size > maxSize) {
          throw new Error('PDF file size must be under 5MB');
        }
        
        // Check file type
        if (pdfFile.type !== 'application/pdf') {
          throw new Error('Only PDF files are accepted');
        }
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
      
      // Simulate upload progress (in real app, you'd use XMLHttpRequest with progress event)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);
      
      // Submit form
      const response = await fetch('/api/quotations/submit', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
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
      setUploadProgress(0);
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
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg 
                className="mx-auto h-12 w-12 text-gray-400" 
                stroke="currentColor" 
                fill="none" 
                viewBox="0 0 48 48" 
                aria-hidden="true"
              >
                <path 
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
                  strokeWidth={2} 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <span>Upload a file</span>
                  <input 
                    id="file-upload" 
                    name="file-upload" 
                    type="file" 
                    className="sr-only"
                    accept=".pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setPdfFile(e.target.files[0]);
                      }
                    }}
                    disabled={isLoading}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PDF up to 5MB
              </p>
              {pdfFile && (
                <p className="text-sm text-gray-900 font-medium">
                  Selected: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Upload progress bar (shown only during upload) */}
        {isLoading && uploadProgress > 0 && (
          <div className="mt-4">
            <label htmlFor="progress" className="block text-sm font-medium text-gray-700">
              Uploading: {uploadProgress}%
            </label>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
        
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