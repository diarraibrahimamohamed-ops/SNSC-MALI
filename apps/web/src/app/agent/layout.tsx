'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/useAuth';
import {
  Baby,
  CalendarDays,
  Bell,
  LayoutDashboard,
  LogOut,
  Syringe,
  PlusCircle,
  User,
} from 'lucide-react';

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/agent-auth');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
  };

  // Navigation links matching actual existing pages
  const navItems = [
    {
      href: '/agent/dashboard',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
    },
    {
      href: '/agent/enfants',
      label: 'Enfants',
      icon: Baby,
    },
    {
      href: '/agent/ajout',
      label: 'Saisie médicale',
      icon: PlusCircle,
    },
    {
      href: '/agent/vaccination',
      label: 'Vaccination',
      icon: Syringe,
    },
    {
      href: '/agent/calendrier',
      label: 'Calendrier',
      icon: CalendarDays,
    },
    {
      href: '/agent/notifications',
      label: 'SMS & Relances',
      icon: Bell,
    },
  ];

  const initials = user
    ? `${(user.nom_complet || user.matricule || 'AG')[0]}${(user.nom_complet || '')[1] || 'T'}`
    : 'AG';

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <aside className="fixed inset-y-0 left-0 hidden w-72 flex-col bg-gradient-to-b from-blue-600 to-indigo-700 text-white shadow-lg lg:flex">
          <div className="flex items-center gap-4 border-b border-white/20 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold leading-tight">Vaccin-Track</h1>
              <p className="text-sm text-white/80">Espace Agent</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ' +
                    (isActive
                      ? 'bg-white/20 text-white shadow-sm'
                      : 'text-white/90 hover:bg-white/10 hover:text-white')
                  }
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/20 p-6">
          {/* 
           J'ai utiliser un lien Link ici pour qu'on puisse accéder au profil de l'agent connecté
          */}
          <Link 
              href={"/agent/profil"}
              >
            <div className="flex items-center gap-3">
              
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
                {initials.toUpperCase()}
              </div>
              
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">
                  {user?.nom_complet || user?.matricule || 'Agent'}
                </div>
                <div className="truncate text-xs text-white/80">
                  {user?.matricule || 'agent'}
                </div>
              </div>
            </div>
              </Link>
              {/* Ici prend fin la modification */}
            <button
              onClick={handleLogout}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/15 px-4 py-3 text-sm font-semibold text-white ring-1 ring-inset ring-white/25 transition hover:bg-white/20"
            >
              <LogOut className="h-5 w-5" />
              Déconnexion
            </button>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col lg:pl-72">
          <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 px-6 py-4 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Espace Agent</h2>
                <p className="text-sm text-gray-600">
                  Bienvenue {user?.nom_complet || user?.matricule || 'Agent'}
                </p>
              </div>
            </div>
          </header>

          <main className="p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
