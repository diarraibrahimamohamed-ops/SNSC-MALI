'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { AuthShell } from '@/components/auth/AuthShell';

export default function LoginPage() {
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

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
      title="Connexion administration"
      subtitle="Accès réservé au personnel administrateur autorisé."
      footer={
        <>
          Vous êtes agent de santé ?{' '}
          <Link href="/agent-auth" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
            Accéder à l&apos;espace agent
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="matricule" className="mb-2 block text-sm font-semibold text-slate-700">
            Matricule administrateur
          </label>
          <input
            id="matricule"
            type="text"
            value={matricule}
            onChange={e => setMatricule(e.target.value)}
            placeholder="ADM-001"
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 outline-none focus:border-slate-600 focus:ring-2 focus:ring-slate-600/20 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
            Mot de passe
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 pr-11 text-sm text-slate-900 placeholder-slate-500 outline-none focus:border-slate-600 focus:ring-2 focus:ring-slate-600/20 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="font-semibold">Erreur de connexion</div>
            <div className="mt-1">{error}</div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !mounted}
          className="w-full rounded-lg bg-gradient-to-r from-slate-700 to-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:from-slate-800 hover:to-slate-900 disabled:cursor-not-allowed disabled:opacity-60 transition-all shadow-lg shadow-slate-700/20"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Connexion en cours...
            </span>
          ) : (
            'Se connecter'
          )}
        </button>
      </form>
    </AuthShell>
  );
}
