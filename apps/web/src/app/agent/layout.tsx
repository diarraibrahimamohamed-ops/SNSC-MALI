'use client';

import { useAuth } from '@/features/auth/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

const navItems = [
  { href: '/agent/dashboard', icon: '◈', label: 'Tableau de bord' },
  { href: '/agent/enfants', icon: '◉', label: 'Dossiers Enfants' },
  { href: '/agent/ajout', icon: '✦', label: 'Saisie médicale' },
  { href: '/agent/calendrier', icon: '◷', label: 'Planning' },
  { href: '/agent/notifications', icon: '◬', label: 'SMS / Relances' },
];

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/agent-auth');
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 600 }}>Chargement de l'espace médical...</p>
        </div>
      </div>
    );
  }

  const initials = user?.nom_complet?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'AG';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f1f5f9', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Sidebar */}
      <aside style={{ width: '240px', background: '#0f172a', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 50, boxShadow: '4px 0 24px rgba(0,0,0,0.15)' }}>
        
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>💉</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: '15px', letterSpacing: '-0.3px' }}>VaccinTrack</div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Agent</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', padding: '0 8px', marginBottom: '8px' }}>Navigation</div>
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  marginBottom: '4px',
                  textDecoration: 'none',
                  background: isActive ? 'rgba(59,130,246,0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(59,130,246,0.25)' : '1px solid transparent',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <span style={{ color: isActive ? '#60a5fa' : 'rgba(255,255,255,0.4)', fontSize: '18px', lineHeight: 1 }}>{item.icon}</span>
                <span style={{ color: isActive ? '#e0f2fe' : 'rgba(255,255,255,0.55)', fontSize: '13px', fontWeight: 600 }}>{item.label}</span>
                {isActive && <span style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }}></span>}
              </a>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', marginBottom: '8px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 800, flexShrink: 0 }}>{initials}</div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: '#f1f5f9', fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.nom_complet}</div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 600 }}>{user?.matricule}</div>
            </div>
          </div>
          <button
            onClick={logout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; (e.currentTarget as HTMLElement).style.color = '#fca5a5'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)'; }}
          >
            <span style={{ fontSize: '16px' }}>↩</span> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, marginLeft: '240px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top Header */}
        <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div>
            <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>
              {navItems.find(n => n.href === pathname)?.label || 'Tableau de bord'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '20px', padding: '4px 12px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
              <span style={{ color: '#16a34a', fontSize: '12px', fontWeight: 700 }}>API Connectée</span>
            </div>
            <a href="/agent/ajout" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff', borderRadius: '10px', fontWeight: 700, fontSize: '13px', textDecoration: 'none', boxShadow: '0 2px 8px rgba(59,130,246,0.35)' }}>
              + Saisie médicale
            </a>
          </div>
        </header>

        <main style={{ flex: 1, padding: '32px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
