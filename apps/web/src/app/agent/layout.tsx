'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/useAuth';
import {
  Baby,
  CalendarDays,
  CalendarHeart,
  Bell,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Syringe,
  User,
  X,
  Home,
  ShieldCheck,
  ChevronDown,
  Settings,
  HelpCircle,
  Sparkles,
  Activity,
  HeartPulse,
  ArrowRightLeft,
} from 'lucide-react';

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/agent-auth');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  // Navigation principale
  const navItems = [
    {
      href: '/agent/dashboard',
      label: 'Tableau de bord♣',
      icon: LayoutDashboard,
      color: 'text-blue-500',
    },
    {
      href: '/agent/enfants',
      label: 'Enfants♣',
      icon: Baby,
      color: 'text-emerald-500',
    },
    {
      href: '/agent/meres',
      label: 'Dossiers mères',
      icon: HeartPulse,
      color: 'text-rose-400',
    },
    {
      href: '/agent/grossesses',
      label: 'Grossesses suivies',
      icon: CalendarDays,
      color: 'text-pink-400',
    },
    {
      href: '/agent/rendez-vous-prenataux',
      label: 'Rendez-vous prénataux',
      icon: CalendarHeart,
      color: 'text-orange-300',
    },
    {
      href: '/agent/references',
      label: 'Références de soins',
      icon: ArrowRightLeft,
      color: 'text-orange-400',
    },
    {
      href: '/agent/ajout',
      label: 'Saisie médicale♣',
      icon: PlusCircle,
      color: 'text-purple-500',
    },
    {
      href: '/agent/vaccination',
      label: 'Vaccination♣',
      icon: Syringe,
      color: 'text-rose-500',
    },
    {
      href: '/agent/calendrier',
      label: 'Calendrier♣',
      icon: CalendarDays,
      color: 'text-amber-500',
    },
    {
      href: '/agent/notifications',
      label: 'SMS & Relances♣',
      icon: Bell,
      color: 'text-indigo-500',
    },
  ];

  // Navigation secondaire (footer)
  const secondaryNav = [
    { href: '/agent/profil', label: 'Mon profil', icon: User },
    { href: '/agent/parametres', label: 'Paramètres', icon: Settings },
    { href: '/aide', label: 'Aide', icon: HelpCircle },
  ];

  const initials = user
    ? `${(user.nom_complet || user.matricule || 'AG')[0]}${(user.nom_complet || '').split(' ')[1]?.[0] || 'T'}`
    : 'AG';

  const fullName = user?.nom_complet || user?.matricule || 'Agent';
  const role = user?.role || 'Agent de santé';

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="relative mx-auto mb-6 h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
            <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 border-r-blue-500 border-b-purple-500 border-l-transparent animate-spin" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 animate-pulse" />
          </div>
          <p className="text-sm font-medium text-slate-500">Chargement de l'espace agent...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="flex min-h-screen">
        {/* ============================================
            SIDEBAR DESKTOP
            ============================================ */}
        <aside className="fixed inset-y-0 left-0 hidden w-[280px] flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl lg:flex">
          {/* Logo / Brand */}
          <div className="relative overflow-hidden border-b border-white/5 p-6">
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />
            <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl" />
            <div className="relative flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-blue-500 shadow-lg shadow-emerald-500/25">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">SNSC-MALI♣</h1>
                <p className="text-xs font-medium text-slate-400">Plateforme PEV Mali♣</p>
              </div>
            </div>
          </div>

          {/* Navigation principale */}
          <nav className="flex-1 space-y-1 p-4">
            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Menu principal
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white/10 text-white shadow-lg shadow-black/10'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div
                    className={`rounded-lg p-1.5 transition-colors ${
                      isActive ? 'bg-white/10' : 'group-hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-emerald-400' : ''}`} />
                  </div>
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute right-3 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Navigation secondaire */}
          <div className="border-t border-white/5 p-4">
            {secondaryNav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Profil utilisateur */}
          <div className="border-t border-white/5 p-4">
            <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 text-sm font-bold text-white shadow-lg shadow-emerald-500/25">
                    {initials.toUpperCase()}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-slate-900 bg-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{fullName}</p>
                  <p className="truncate text-xs text-slate-400">{role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:bg-red-500/20 hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </aside>

        {/* ============================================
            OVERLAY MOBILE
            ============================================ */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* ============================================
            SIDEBAR MOBILE
            ============================================ */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-[280px] transform bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Header mobile */}
          <div className="flex items-center justify-between border-b border-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 shadow-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold tracking-tight">SNSC</h1>
                <p className="text-xs text-slate-400">PEV Mali</p>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation mobile */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-emerald-400' : ''}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Profil mobile */}
          <div className="border-t border-white/5 p-4">
            <div className="rounded-2xl bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 text-sm font-bold">
                  {initials.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{fullName}</p>
                  <p className="truncate text-xs text-slate-400">{role}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:bg-red-500/20 hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>

        {/* ============================================
            CONTENU PRINCIPAL
            ============================================ */}
        <div className="flex min-h-screen flex-1 flex-col lg:pl-[280px]">
          {/* HEADER */}
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur-xl sm:px-6">
            <div className="flex items-center justify-between gap-4">
              {/* Gauche : menu mobile + titre */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileOpen(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-500">
                    {pathname === '/agent/dashboard' && 'Aperçu général'}
                    {pathname === '/agent/enfants' && 'Gestion des enfants'}
                    {pathname.startsWith('/agent/meres') && 'Dossier mère-enfant'}
                    {pathname.startsWith('/agent/grossesses') && 'Parcours prénatal'}
                    {pathname === '/agent/references' && 'Références de soins'}
                    {pathname === '/agent/ajout' && 'Saisie médicale'}
                    {pathname === '/agent/vaccination' && 'Gestion des vaccinations'}
                    {pathname === '/agent/calendrier' && 'Calendrier vaccinal'}
                    {pathname === '/agent/notifications' && 'SMS & Relances'}
                  </p>
                </div>
              </div>

              {/* Droite : actions utilisateur */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Indicateur de rôle */}
                <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/50 sm:flex">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {role}
                </div>

                {/* Notifications */}
                <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" />
                </button>

                {/* Menu utilisateur */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500 text-xs font-bold text-white shadow-sm">
                      {initials.toUpperCase()}
                    </div>
                    <div className="hidden text-left sm:block">
                      <p className="text-xs font-semibold text-slate-700">{fullName}</p>
                      <p className="text-[10px] text-slate-400">{role}</p>
                    </div>
                    <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
                  </button>

                  {/* Dropdown utilisateur */}
                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-slate-200 bg-white py-2 shadow-2xl shadow-slate-200/50">
                        <div className="border-b border-slate-100 px-4 py-3">
                          <p className="text-sm font-semibold text-slate-900">{fullName}</p>
                          <p className="text-xs text-slate-500">{role}</p>
                        </div>
                        <Link
                          href="/agent/profil"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                        >
                          <User className="h-4 w-4" />
                          Mon profil
                        </Link>
                        <Link
                          href="/agent/parametres"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                        >
                          <Settings className="h-4 w-4" />
                          Paramètres
                        </Link>
                        <div className="border-t border-slate-100" />
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" />
                          Déconnexion
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* CONTENU PRINCIPAL */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>

          {/* FOOTER */}
          <footer className="border-t border-slate-200/60 bg-white/50 px-6 py-4 backdrop-blur-sm">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-sm text-slate-500 sm:flex-row">
              <p>
                © {new Date().getFullYear()} SNSC-MALI · Plateforme PEV Mali
              </p>
              <div className="flex items-center gap-4 text-xs">
                <Link href="/mentions-legales" className="hover:text-slate-700 transition-colors">
                  Mentions légales
                </Link>
                <span className="h-3 w-px bg-slate-300" />
                <Link href="/confidentialite" className="hover:text-slate-700 transition-colors">
                  Confidentialité
                </Link>
                <span className="h-3 w-px bg-slate-300" />
                <span className="flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Système opérationnel
                </span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
