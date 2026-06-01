'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  UserCog,
  Users,
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
    if (!isLoading && isAuthenticated && user?.role !== 'ADMIN') router.push('/agent-auth');
  }, [isAuthenticated, isLoading, user, router]);

  const handleLogout = () => {
    localStorage.removeItem('adminInfo');
    window.location.href = '/login';
  };

  const navItems = [
    {
      href: '/admin/dashboard',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
    },
    {
      href: '/admin/agents',
      label: 'Agents',
      icon: Users,
    },
    {
      href: '/admin/centres',
      label: 'Centres de santé',
      icon: Building2,
    },
    {
      href: '/admin/utilisateurs',
      label: 'Utilisateurs',
      icon: UserCog,
    },
    {
      href: '/admin/audit',
      label: 'Audit',
      icon: ClipboardList,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 hidden w-72 flex-col bg-gradient-to-b from-emerald-600 to-teal-600 text-white shadow-lg lg:flex">
          {/* Logo */}
          <div className="flex items-center gap-4 border-b border-white/20 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold leading-tight">Vaccin-Track</h1>
              <p className="text-sm text-white/80">Espace Admin</p>
            </div>
          </div>

          {/* Navigation */}
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

          {/* User Profile */}
          <div className="border-t border-white/20 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
                AD
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">Admin</div>
                <div className="truncate text-xs text-white/80">
                  {adminInfo?.email || 'admin@vaccintrack.ml'}
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

        {/* Main Content */}
        <div className="flex min-h-screen flex-1 flex-col lg:pl-72">
          {/* Top Bar */}
          <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 px-6 py-4 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Espace Administrateur</h2>
                <p className="text-sm text-gray-600">Panneau de contrôle</p>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
