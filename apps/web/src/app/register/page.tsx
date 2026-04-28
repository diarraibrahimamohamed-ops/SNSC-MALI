'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers la page login après 2 secondes
    const timer = setTimeout(() => {
      router.push('/login');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl text-white">🚫</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Accès Refusé</h2>
          <p className="mt-2 text-sm text-gray-600">
            L'auto-inscription n'est pas autorisée
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Veuillez contacter votre administrateur pour créer un compte.
          </p>
          <div className="mt-6">
            <p className="text-sm text-gray-600">
              Redirection vers la page de connexion...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
