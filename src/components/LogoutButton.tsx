'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      
      // Call the logout API endpoint
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('Logout successful');
        
        // Redirect to login page
        router.push('/login');
      } else {
        console.error('Logout failed');
        
        // If logout fails on the server, still redirect to login
        // as a fallback to ensure users can exit their session
        setTimeout(() => {
          router.push('/login');
        }, 1000);
      }
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Even if there's an error, redirect to login
      // to ensure users aren't stuck
      setTimeout(() => {
        router.push('/login');
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleLogout}
      disabled={isLoading}
      className="text-red-500 hover:text-red-700 hover:bg-red-50"
    >
      {isLoading ? (
        <span>Logging out...</span>
      ) : (
        <>
          <LogOut className="w-4 h-4 mr-2" />
          <span>Logout</span>
        </>
      )}
    </Button>
  );
}