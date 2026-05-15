'use client';

import { useAuth } from '@/features/auth/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
    if (!isLoading && isAuthenticated && user?.role !== 'ADMIN') {
      router.push('/agent-auth');
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium">Chargement de l'espace admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col fixed h-full">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-xl">💉</div>
          <div>
            <h2 className="font-bold text-lg leading-tight">Vaccin-Track</h2>
            <p className="text-slate-400 text-xs font-medium">ADMINISTRATION</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <SidebarLink href="/admin/dashboard" icon="📊" label="Dashboard" active />
          <SidebarLink href="/admin/agents" icon="👤" label="Gestion Agents" />
          <SidebarLink href="/admin/centres" icon="🏥" label="Centres de Santé" />
          <SidebarLink href="/admin/utilisateurs" icon="👥" label="Utilisateurs" />
          <SidebarLink href="/admin/audit" icon="📜" label="Journal d'Audit" />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="p-4 bg-slate-800/50 rounded-2xl mb-4">
            <p className="text-xs text-slate-400 mb-1">Connecté en tant que</p>
            <p className="text-sm font-bold truncate">{user?.nom_complet}</p>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all"
          >
            <span>🚪</span>
            <span className="font-semibold">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ href, icon, label, active = false }: { href: string, icon: string, label: string, active?: boolean }) {
  return (
    <a 
      href={href}
      className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
        active 
          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-semibold">{label}</span>
    </a>
  );
}
