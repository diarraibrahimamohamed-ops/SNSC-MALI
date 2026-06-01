'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/useAuth';

export default function LoginPage() {
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simuler authentification
    setTimeout(() => {
      localStorage.setItem(
        'adminInfo',
        JSON.stringify({
          email,
          role: 'admin',
        })
      );
      setIsLoading(false);
      window.location.href = '/admin/dashboard';
    }, 2000);
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
                <div className="mt-2 text-sm text-white/80">Accès réservé au personnel autorisé.</div>
              </div>

              <div className="mt-10">
                <div className="mt-4 text-center text-xs font-semibold tracking-widest text-white/70">"SAVOIR POUR SAUVER"</div>
              </div>
            </div>

            <div className="p-8 md:p-10">
              <h2 className="text-center text-2xl font-extrabold text-slate-900">Connectez-Vous !</h2>

              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                    Nom d'utilisateur
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="email-input"
                    className="mt-2 block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    placeholder="admin@vaccintrack.ml"
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
                  {isLoading ? 'Connexion...' : 'Connexion'}
                </button>

                <div className="text-center text-xs text-slate-500">
                  Utilise: <span className="font-semibold">admin@vaccintrack.ml</span> (mot de passe: libre)
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
