'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/useAuth';

export default function LoginPage() {
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const user = await login({ matricule, password });
      if (user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        setError('Accès réservé aux administrateurs');
      }
    } catch (err: any) {
      setError(err.message || 'Identifiants invalides');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-200">
            <span className="text-2xl text-white">🛡️</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Vaccin-Track Admin</h2>
          <p className="mt-2 text-sm text-gray-600 font-medium">Espace Administration Centrale</p>
        </div>

        <div className="bg-white shadow-2xl rounded-3xl p-8 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="matricule" className="block text-sm font-semibold text-slate-700 mb-2">
                Matricule Administrateur
              </label>
              <input
                id="matricule"
                name="matricule"
                type="text"
                required
                value={matricule}
                onChange={(e) => setMatricule(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-slate-200 bg-slate-50 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all sm:text-sm"
                placeholder="ADM-XXXX"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-slate-200 bg-slate-50 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all sm:text-sm"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-xs font-bold text-red-600">
                ⚠️ {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
              >
                {isLoading ? 'Authentification...' : 'Se connecter'}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <p className="text-sm text-slate-500">
              Vous êtes un agent de santé ?{' '}
              <a href="/agent-auth" className="font-bold text-emerald-600 hover:underline">
                Accès Agent
              </a>
            </p>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400 font-medium">
          <p>&copy; 2024 Vaccin-Track Mali. Plateforme Sécurisée.</p>
        </div>
      </div>
    </div>
  );
}
