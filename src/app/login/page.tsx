import AuthForm from '@/components/auth/AuthForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Solar Panel Vendor Selection',
  description: 'Login to your account',
};

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <AuthForm type="login" />
    </div>
  );
}
