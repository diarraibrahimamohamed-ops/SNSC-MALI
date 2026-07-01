'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/useAuth';
import {
  Baby,
  CalendarDays,
  Bell,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Slash,
  Syringe,
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

  const [mobileOpen, setMobileOpen] = useState(false);

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
            <button
              onClick={handleLogout}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/15 px-4 py-3 text-sm font-semibold text-white ring-1 ring-inset ring-white/25 transition hover:bg-white/20"
            >
              <LogOut className="h-5 w-5" />
              Déconnexion
            </button>
          </div>
        </aside>

        <div className={
          `fixed inset-y-0 left-0 z-20 w-72 transform bg-gradient-to-b from-blue-600 to-indigo-700 text-white shadow-xl transition duration-300 lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`
        }>
          <div className="flex items-center justify-between gap-4 border-b border-white/20 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold leading-tight">Vaccin-Track</h1>
                <p className="text-sm text-white/80">Espace Agent</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
            >
              <Slash className="h-5 w-5" />
            </button>
          </div>

          <nav className="space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
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
            <button
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/15 px-4 py-3 text-sm font-semibold text-white ring-1 ring-inset ring-white/25 transition hover:bg-white/20"
            >
              <LogOut className="h-5 w-5" />
              Déconnexion
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div
            className="fixed inset-0 z-10 bg-black/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <div className="flex min-h-screen flex-1 flex-col lg:pl-72">
          <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 px-4 py-4 backdrop-blur sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50 lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Espace Agent</h2>
                  <p className="text-sm text-gray-600">Bienvenue {user?.nom_complet || user?.matricule || 'Agent'}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="hidden sm:inline-flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 shadow-sm">
                  <span className="font-semibold">Menu</span>
                </div>
                <div className="inline-flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-blue-700 font-bold">
                    {initials.toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {user?.nom_complet || user?.matricule || 'Agent'}
                    </p>
                    <p className="truncate text-xs text-gray-500">Dr. Oumar KonatÚ</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </header>

          <main className="p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
