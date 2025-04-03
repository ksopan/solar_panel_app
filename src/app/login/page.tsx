'use client';

import { useState, useEffect } from 'react';
import AuthForm from '@/components/auth/AuthForm';

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Add a client-side only rendering approach
  if (!mounted) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    </div>;
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <AuthForm type="login" />
    </div>
  );
}