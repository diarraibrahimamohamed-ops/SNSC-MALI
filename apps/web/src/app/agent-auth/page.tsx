'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/useAuth';

export default function AgentLoginPage() {
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
      if (user.role === 'AGENT' || user.role === 'INFIRMIER' || user.role === 'MEDECIN') {
        router.push('/agent/dashboard');
      } else {
        setError('Accès réservé aux agents de santé');
      }
    } catch (err: any) {
      setError(err.message || 'Identifiants invalides');
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white text-3xl shadow-lg shadow-blue-200 mb-4">
            👨‍⚕️
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Espace Agent de Santé</h1>
          <p className="text-slate-500 mt-2">Accès sécurisé au suivi vaccinal</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Matricule Professionnel</label>
              <input 
                type="text" 
                value={matricule}
                onChange={(e) => setMatricule(e.target.value)}
                placeholder="AGT-XXXXX"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Mot de passe</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm">
            <p className="text-slate-500">
              Difficulté de connexion ? Contactez votre superviseur local.
            </p>
            <a href="/login" className="inline-block mt-4 text-blue-600 font-semibold hover:underline">
              Espace Administrateur
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
