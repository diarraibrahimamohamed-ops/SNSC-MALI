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
      if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
        router.push('/admin/dashboard');
      } else {
        setError('Accès réservé aux administrateurs. Utilisez l\'espace Agent.');
      }
    } catch (err: any) {
      setError(err.message || 'Identifiants invalides.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto w-full max-w-4xl">
        <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
          <div className="absolute right-4 top-4">
            <a
              href="/"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-slate-600 ring-1 ring-slate-200 backdrop-blur transition hover:bg-white"
              aria-label="Fermer"
            >
              ✕
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="flex flex-col justify-between bg-gradient-to-b from-blue-700 to-blue-900 p-8 text-white md:p-10">
              <div>
                <div className="inline-flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                    <span className="text-xl">💉</span>
                  </div>
                  <div className="leading-tight">
                    <div className="text-sm font-semibold tracking-wide text-white/90">SYSTÈME DE SUIVI DE VACCINATION</div>
                    <div className="text-2xl font-extrabold">Vaccin-Track</div>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <div className="text-sm font-semibold uppercase tracking-widest text-white/80">Mali</div>
                <div className="mt-2 text-sm text-white/80">Accès réservé au personnel administrateur autorisé.</div>
              </div>

              <div className="mt-10">
                <div className="mt-4 text-center text-xs font-semibold tracking-widest text-white/70">&quot;SAVOIR POUR SAUVER&quot;</div>
              </div>
            </div>

            <div className="p-8 md:p-10">
              <h2 className="text-center text-2xl font-extrabold text-slate-900">Administration</h2>
              <p className="text-center text-sm text-slate-500 mt-2">Connectez-vous avec votre matricule administrateur</p>

              {error && (
                <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700 font-semibold flex items-center gap-2">
                  ⚠️ {error}
                </div>
              )}

              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="matricule" className="block text-sm font-semibold text-slate-700">
                    Matricule Administrateur
                  </label>
                  <input
                    id="matricule"
                    name="matricule"
                    type="text"
                    autoComplete="username"
                    required
                    value={matricule}
                    onChange={(e) => setMatricule(e.target.value)}
                    data-testid="matricule-input"
                    className="mt-2 block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    placeholder="ADM-00001"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                    Mot de passe
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    data-testid="password-input"
                    className="mt-2 block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  data-testid="login-button"
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? 'Connexion...' : 'Connexion Administration'}
                </button>

                <div className="text-center">
                  <a href="/agent-auth" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition">
                    ← Retour à l&apos;espace Agent
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
