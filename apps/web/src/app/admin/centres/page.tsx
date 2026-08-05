'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/useAuth';

interface CentreSante {
  id?: string;
  centreId?: string;
  nom: string;
  region?: string;
  zoneSanitaire?: string;
  ville?: string;
  code_zone?: string;
  type_etablissement?: string;
  agents?: { id: string; nom_complet: string; role: string }[];
}

const getCentreId = (centre: CentreSante) => centre.id ?? centre.centreId ?? '';

export default function AdminCentresPage() {
  const [centres, setCentres] = useState<CentreSante[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCentre, setSelectedCentre] = useState<CentreSante | null>(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('auth_token');
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
    const h = { Authorization: `Bearer ${token}`, Accept: 'application/json' };

    Promise.all([
      fetch(`${API}/centres-sante`, { headers: h }).then(r => r.ok ? r.json() : null),
      fetch(`${API}/agents`, { headers: h }).then(r => r.ok ? r.json() : null),
    ])
      .then(([c, a]) => {
        if (c) setCentres(c.data || c);
        if (a) setAgents(a.data || a);
      })
      .catch((error) => {
        console.error('Failed to load admin centres data:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isAuthenticated]);

  const getAgentsForCentre = (centreId: string) =>
    agents.filter((a: any) =>
      a.centre_sante_id === centreId ||
      a.centreId === centreId ||
      a.centre_sante?.id === centreId ||
      a.centre_sante?.centreId === centreId
    );

  const myAffiliation = agents.find((a: any) => a.matricule === user?.matricule || a.id === user?.id);
  const myCentreId = myAffiliation?.centre_sante_id || myAffiliation?.centre_sante?.id;

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
      <div style={{ color: '#64748b', fontSize: '15px', fontWeight: 600 }}>⏳ Chargement des centres...</div>
    </div>
  );

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Centres de Santé</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Gérez les centres et consultez leurs affiliations.</p>
        </div>
        {myCentreId && (
          <div style={{ padding: '10px 16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', fontSize: '13px', color: '#1d4ed8', fontWeight: 700 }}>
            🏥 Votre centre : {centres.find(c => getCentreId(c) === myCentreId)?.nom || 'N/A'}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {centres.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #e2e8f0' }}>
            Aucun centre de santé enregistré.
          </div>
        )}
        {centres.map(centre => {
          const centreId = getCentreId(centre);
          const centreAgents = getAgentsForCentre(centreId);
          const isMyCentre = centreId === myCentreId;
          return (
            <div
              key={centreId}
              style={{
                background: '#fff',
                borderRadius: '16px',
                border: `2px solid ${isMyCentre ? '#3b82f6' : '#e2e8f0'}`,
                padding: '20px 24px',
                boxShadow: isMyCentre ? '0 4px 16px rgba(59,130,246,0.12)' : '0 1px 4px rgba(0,0,0,0.04)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onClick={() => setSelectedCentre(selectedCentre && getCentreId(selectedCentre) === centreId ? null : centre)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '18px' }}>🏥</span>
                    <span style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>{centre.nom}</span>
                    {isMyCentre && (
                      <span style={{ padding: '2px 10px', background: '#dbeafe', color: '#1d4ed8', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                        Votre affiliation
                      </span>
                    )}
                    {centre.type_etablissement && (
                      <span style={{ padding: '2px 10px', background: '#f1f5f9', color: '#475569', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                        {centre.type_etablissement}
                      </span>
                    )}
                  </div>
                  <div style={{ marginTop: '6px', color: '#64748b', fontSize: '13px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {(centre.region || centre.zoneSanitaire) && <span>📍 {centre.region || centre.zoneSanitaire}</span>}
                    {centre.ville && <span>🏙️ {centre.ville}</span>}
                    {centre.code_zone && <span>🔑 {centre.code_zone}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ padding: '6px 14px', background: centreAgents.length > 0 ? '#f0fdf4' : '#f8fafc', border: `1px solid ${centreAgents.length > 0 ? '#86efac' : '#e2e8f0'}`, borderRadius: '20px', fontSize: '12px', fontWeight: 800, color: centreAgents.length > 0 ? '#15803d' : '#94a3b8' }}>
                    👨‍⚕️ {centreAgents.length} agent{centreAgents.length > 1 ? 's' : ''}
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '16px', transition: 'transform 0.2s', transform: selectedCentre && getCentreId(selectedCentre) === centreId ? 'rotate(180deg)' : 'none' }}>▼</span>
                </div>
              </div>

              {selectedCentre && getCentreId(selectedCentre) === centreId && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                  {centreAgents.length === 0 ? (
                    <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Aucun agent affilié à ce centre.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                      {centreAgents.map((agent: any) => (
                        <div key={agent.id ?? agent.agentId ?? agent.matricule} style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: agent.role === 'ADMIN' ? '#dbeafe' : '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                            {agent.role === 'ADMIN' ? '🛡️' : '👨‍⚕️'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>{agent.nom_complet || agent.nom}</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>{agent.matricule} · {agent.role}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
