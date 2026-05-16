'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/useAuth';

const card = (style: React.CSSProperties): React.CSSProperties => ({
  background: '#fff',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  ...style,
});

export default function AgentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [rendezVous, setRendezVous] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const [statsRes, rdvRes] = await Promise.all([
          fetch(`${API_URL}/dashboard/stats`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }),
          fetch(`${API_URL}/rendez-vous`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }),
        ]);
        if (statsRes.ok) { const d = await statsRes.json(); setStats(d.data); }
        if (rdvRes.ok) { const d = await rdvRes.json(); setRendezVous(d.data?.slice(0, 6) || []); }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchDashboardData();
  }, []);

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const statCards = [
    { label: 'Rendez-vous aujourd\'hui', value: stats?.rendez_vous_aujourd_hui ?? '—', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', icon: '📅' },
    { label: 'Vaccinations réalisées', value: stats?.vaccinations_aujourd_hui ?? '—', color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0', icon: '✅' },
    { label: 'SMS envoyés', value: stats?.relances_envoyees ?? '—', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', icon: '📱' },
    { label: 'Enfants à risque', value: stats?.enfants_a_risque ?? '—', color: '#ef4444', bg: '#fef2f2', border: '#fecaca', icon: '⚠️' },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }}></div>
          <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 600 }}>Synchronisation des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 600, marginBottom: '4px', textTransform: 'capitalize' }}>{today}</p>
        <h1 style={{ color: '#0f172a', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>
          Bonjour, {user?.nom_complet?.split(' ')[0] || 'Agent'} 👋
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Voici le résumé de votre activité sanitaire.</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {statCards.map(s => (
          <div key={s.label} style={card({ padding: '20px' })}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>{s.label}</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: s.bg, border: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>{s.icon}</div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: s.color, letterSpacing: '-1px', lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        
        {/* Rendez-vous list */}
        <div style={card({ padding: '24px' })}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Prochains rendez-vous</h2>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Planning du jour</p>
            </div>
            <a href="/agent/calendrier" style={{ fontSize: '12px', fontWeight: 700, color: '#3b82f6', textDecoration: 'none' }}>Voir tout →</a>
          </div>
          
          {rendezVous.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
              <p style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>Aucun rendez-vous aujourd'hui</p>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>Votre planning est vide pour le moment.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {rendezVous.map((rdv: any, i: number) => {
                const isUrgent = rdv.statut === 'en retard';
                return (
                  <div key={rdv.id || i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: isUrgent ? '#fef2f2' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                      {rdv.enfant?.prenom?.[0] || '?'}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {rdv.enfant ? `${rdv.enfant.prenom} ${rdv.enfant.nom}` : 'Enfant non spécifié'}
                      </p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', marginTop: '1px' }}>{rdv.motif || 'Vaccination standard'}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '3px' }}>{new Date(rdv.date_rendez_vous).toLocaleDateString('fr-FR')}</div>
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: isUrgent ? '#fef2f2' : '#eff6ff', color: isUrgent ? '#ef4444' : '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {isUrgent ? 'URGENT' : 'PRÉVU'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Stats Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Coverage */}
          <div style={card({ padding: '24px' })}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>Couverture vaccinale</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Total Enfants', value: stats?.total_enfants || 0, color: '#3b82f6' },
                { label: 'Couverture', value: `${stats?.couverture_vaccinale || 0}%`, color: '#10b981' },
              ].map(m => (
                <div key={m.label} style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #f1f5f9' }}>
                  <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{m.label}</p>
                  <p style={{ margin: 0, fontSize: '28px', fontWeight: 900, color: m.color, letterSpacing: '-1px' }}>{m.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Alert */}
          {(stats?.enfants_a_risque > 0) && (
            <div style={{ padding: '16px 20px', background: '#fef2f2', borderRadius: '14px', border: '1px solid #fecaca', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>🚨</div>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: '#b91c1c' }}>Alerte : {stats.enfants_a_risque} enfants à risque</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#ef4444', lineHeight: 1.5 }}>Ces enfants nécessitent une attention immédiate pour assurer leur suivi vaccinal.</p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div style={card({ padding: '20px' })}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions rapides</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { href: '/agent/vaccination', label: '💉 Enregistrer une vaccination', primary: true },
                { href: '/agent/enfants', label: '👶 Rechercher un dossier enfant', primary: false },
              ].map(a => (
                <a key={a.href} href={a.href} style={{
                  display: 'block', padding: '12px 16px', borderRadius: '10px', textDecoration: 'none', fontSize: '13px', fontWeight: 700,
                  background: a.primary ? '#eff6ff' : '#f8fafc',
                  color: a.primary ? '#3b82f6' : '#475569',
                  border: a.primary ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                  transition: 'all 0.15s',
                }}>
                  {a.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
