import AuthForm from '@/components/auth/AuthForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Customer Registration - Solar Panel Vendor Selection',
  description: 'Create a new customer account',
};

export default function CustomerRegistrationPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <AuthForm type="register" userType="customer" />
    </div>
  );
}
