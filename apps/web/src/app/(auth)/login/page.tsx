'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/useAuth';
import { AuthShell } from '@/components/auth/AuthShell';

export default function LoginPage() {
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const { login, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login({ matricule, password });
      if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
        router.push('/admin/dashboard');
      } else {
        setError("Accès réservé aux administrateurs. Utilisez l'espace Agent.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Identifiants invalides.');
    }
  };

  if (!mounted) return null;

  return (
    <AuthShell
      variant="admin"
      title="Connexion administrateur"
      subtitle="Accédez au tableau de bord de pilotage national."
      footer={
        <>
          Vous êtes agent de santé ?{' '}
          <a href="/agent-auth" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
            Accéder à l'espace Agent
          </a>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="matricule" className="mb-2 block text-sm font-semibold text-slate-300">
            Matricule administratif
          </label>
          <input
            id="matricule"
            type="text"
            value={matricule}
            onChange={(e) => setMatricule(e.target.value)}
            placeholder="ADM-001"
            required
            className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-300 backdrop-blur-sm"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-300">
            Mot de passe
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 pr-11 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-300 backdrop-blur-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 backdrop-blur-sm">
            <div className="font-semibold">Erreur de connexion</div>
            <div className="mt-1">{error}</div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:from-emerald-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-300 shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02]"
        >
          {isLoading ? 'Connexion en cours...' : 'Se connecter'}
        </button>
      </form>
    </AuthShell>
  );
}
