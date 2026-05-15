'use client';

import { useAuth } from '@/features/auth/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/agent-auth');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium">Connexion à votre espace médical...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Mobile (Simplified for Agent) */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-blue-200">👨‍⚕️</div>
          <span className="font-bold text-slate-800 tracking-tight">Espace Agent</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <SidebarLink href="/agent/dashboard" icon="🏠" label="Accueil" active />
          <SidebarLink href="/agent/enfants" icon="👶" label="Mes Enfants" />
          <SidebarLink href="/agent/calendrier" icon="📅" label="Planning" />
          <SidebarLink href="/agent/notifications" icon="📱" label="SMS / Relances" />
        </nav>

        <div className="p-4 mt-auto border-t border-slate-100">
          <div className="p-4 bg-blue-50 rounded-2xl mb-4">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Session Active</p>
            <p className="text-sm font-bold text-slate-800 truncate">{user?.nom_complet}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">{user?.matricule}</p>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-semibold text-sm"
          >
            <span>🚪</span> Quitter
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <div className="flex-1 ml-64 min-h-screen flex flex-col">
        <main className="p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ href, icon, label, active = false }: { href: string, icon: string, label: string, active?: boolean }) {
  return (
    <a 
      href={href}
      className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
        active 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="font-bold text-sm">{label}</span>
    </a>
  );
}
