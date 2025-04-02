import AuthForm from '@/components/auth/AuthForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vendor Registration - Solar Panel Vendor Selection',
  description: 'Create a new vendor account',
};

export default function VendorRegistrationPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <AuthForm type="register" userType="vendor" />
    </div>
  );
}
