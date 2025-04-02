import { Metadata } from 'next';
import QuotationRequestForm from '@/components/quotation/QuotationRequestForm';
import { getDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Request Quotation - Solar Panel Vendor Selection',
  description: 'Submit a request for solar panel installation quotations',
};

export default async function RequestQuotationPage() {
  // Server-side authentication check
  const db = getDatabase();
  await requireAuth(db, ['customer']);
  
  return (
    <div className="container p-6 mx-auto">
      <h1 className="mb-8 text-3xl font-bold text-center">Request for Quotation</h1>
      <div className="flex justify-center">
        <QuotationRequestForm />
      </div>
    </div>
  );
}
