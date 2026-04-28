'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers le dashboard principal
    router.push('/admin/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirection vers le dashboard...</p>
      </div>
    </div>
  );
}
