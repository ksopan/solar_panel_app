import { Metadata } from 'next';
import Link from 'next/link';
import { getDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { getQuotationRequestById } from '@/lib/quotation';
import { notFound } from 'next/navigation';
import QuotationComparison from '@/components/quotation/QuotationComparison';

export const metadata: Metadata = {
  title: 'Quotation Comparison - Solar Panel Vendor Selection',
  description: 'Compare and analyze quotations from different vendors',
};

export default async function QuotationComparisonPage({ params }: { params: { id: string } }) {
  const requestId = params.id;
  
  // Server-side authentication check
  const db = getDatabase();
  const user = await requireAuth(db, ['customer']);
  
  // Get quotation request details
  const result = await getQuotationRequestById(db, requestId);
  
  if (!result.success || !result.request) {
    notFound();
  }
  
  const request = result.request;
  
  // Verify that this request belongs to the current customer
  if (request.customer_id !== user.id) {
    notFound();
  }
  
  // Get vendor quotations for this request
  const quotationsResult = await db.prepare(
    `SELECT vq.*, v.company_name 
     FROM vendor_quotations vq
     JOIN vendors v ON vq.vendor_id = v.id
     WHERE vq.quotation_request_id = ?
     ORDER BY vq.created_at DESC`
  ).bind(requestId).all<any>();
  
  const quotations = quotationsResult.results || [];
  
  // Check if there are enough quotations to compare
  const hasEnoughQuotations = quotations.length >= 2;
  
  return (
    <div className="container p-6 mx-auto">
      <div className="mb-6">
        <Link 
          href={`/customer/quotations/${requestId}`} 
          className="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          ← Back to Quotation Details
        </Link>
      </div>
      
      <h1 className="mb-6 text-3xl font-bold">Quotation Comparison</h1>
      
      {!hasEnoughQuotations ? (
        <div className="p-8 text-center bg-white rounded-lg shadow">
          <h2 className="mb-4 text-xl font-semibold">Not Enough Quotations</h2>
          <p className="mb-6 text-gray-600">
            You need at least 2 quotations to perform a comparison. Currently, you have {quotations.length} quotation{quotations.length !== 1 ? 's' : ''}.
          </p>
          <Link 
            href={`/customer/quotations/${requestId}`} 
            className="inline-block px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Return to Quotation Details
          </Link>
        </div>
      ) : (
        <QuotationComparison quotations={quotations} />
      )}
    </div>
  );
}
