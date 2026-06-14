'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/useAuth';
import { VACCINS_MALI } from '@/constants/vaccins';

export default function NouvelleVaccinationPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [enfants, setEnfants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [enfantId, setEnfantId] = useState('');
  const [vaccinId, setVaccinId] = useState('');
  const [numeroLot, setNumeroLot] = useState('');
  const [administreLe, setAdministreLe] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('auth_token');
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api';
    fetch(`${API_URL}/enfants`, { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setEnfants(d.data || d); });
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErrorMsg('');

    if (!user?.id || !user?.centre_sante_id) {
      setErrorMsg('Session agent invalide ou centre non rattaché.');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('auth_token');
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api';
    try {
      const res = await fetch(`${API_URL}/actes-vaccinaux`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ enfant_id: enfantId, vaccin_id: vaccinId, agent_id: user?.id, centre_sante_id: user?.centre_sante_id, numero_lot: numeroLot, administre_le: administreLe, notes: notes || null }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/agent/dashboard'), 2500);
      } else {
        const d = await res.json();
        setErrorMsg(d.errors ? Object.values(d.errors).flat().join(' | ') : d.message || 'Erreur inconnue.');
      }
    } catch { setErrorMsg('Erreur réseau.'); }
    finally { setLoading(false); }
  };

  const cardStyle: React.CSSProperties = { background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' };
  const titleStyle: React.CSSProperties = { fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '12px', paddingBottom: '8px', borderBottom: '2px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#0f172a', outline: 'none', boxSizing: 'border-box', background: '#f8fafc' };

  if (success) return (
    <div style={{ padding: '48px 32px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '24px', color: '#15803d', textAlign: 'center', maxWidth: '760px', margin: '0 auto' }}>
      <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
      <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 8px 0' }}>Vaccination enregistrée !</h2>
      <p style={{ margin: 0 }}>Le dossier a été mis à jour. Redirection...</p>
    </div>
  );

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 700, cursor: 'pointer', fontSize: '14px', marginBottom: '12px', padding: 0 }}>← Retour</button>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Nouvelle Vaccination 💉</h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Enregistrez un acte vaccinal dans le dossier du patient.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {errorMsg && <div style={{ padding: '14px 18px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '12px', color: '#b91c1c', fontWeight: 600, fontSize: '14px' }}>⚠️ {errorMsg}</div>}

          <div style={cardStyle}>
            <div style={titleStyle}><span>👶</span> Enfant à vacciner *</div>
            <select required value={enfantId} onChange={e => setEnfantId(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">— Sélectionner un enfant —</option>
              {enfants.map(e => <option key={e.id} value={e.id}>{e.nom} {e.prenom} · {e.identifiant_sanitaire}</option>)}
            </select>
          </div>

          <div style={cardStyle}>
            <div style={titleStyle}><span>💉</span> Vaccin administré *</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {VACCINS_MALI.map(v => (
                <button key={v.id} type="button" onClick={() => { setVaccinId(v.id); setNumeroLot(v.lot || ''); }}
                  style={{ padding: '14px 16px', border: `2px solid ${vaccinId === v.id ? v.couleur : '#e2e8f0'}`, borderRadius: '12px', background: vaccinId === v.id ? `${v.couleur}18` : '#f8fafc', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: vaccinId === v.id ? v.couleur : '#0f172a' }}>
                    {vaccinId === v.id ? '✓ ' : ''}{v.nom}
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#94a3b8' }}>{v.periode}</p>
                </button>
              ))}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={titleStyle}><span>📋</span> Détails de l'acte</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Date *</label>
                <input type="date" required value={administreLe} onChange={e => setAdministreLe(e.target.value)} max={new Date().toISOString().split('T')[0]} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Numéro de lot</label>
                <input value={numeroLot} onChange={e => setNumeroLot(e.target.value)} placeholder="Auto-rempli" style={inputStyle} />
              </div>
            </div>
            <div style={{ marginTop: '14px' }}>
              <label style={labelStyle}>Observations</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Remarques post-vaccinales..."
                style={{ ...inputStyle, height: '80px', resize: 'none' } as React.CSSProperties} />
            </div>
          </div>

          <button type="submit" disabled={loading || !vaccinId || !enfantId}
            style={{
              padding: '18px', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 800, letterSpacing: '0.3px', transition: 'all 0.2s',
              background: (loading || !vaccinId || !enfantId) ? '#d1fae5' : 'linear-gradient(135deg, #10b981, #059669)',
              color: (loading || !vaccinId || !enfantId) ? '#6b7280' : '#fff',
              cursor: (loading || !vaccinId || !enfantId) ? 'not-allowed' : 'pointer',
              boxShadow: (loading || !vaccinId || !enfantId) ? 'none' : '0 6px 20px rgba(16,185,129,0.4)',
            }}>
            {loading ? '⏳ Enregistrement...' : '✅ Valider la vaccination'}
          </button>
        </div>
      </form>
    </div>
  );
}
