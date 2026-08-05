'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/useAuth';

// ─── Helpers styles ────────────────────────────────────────────────────────────
const S = {
  card: { background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' } as React.CSSProperties,
  label: { display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' } as React.CSSProperties,
  input: { width: '100%', padding: '11px 14px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#0f172a', outline: 'none', boxSizing: 'border-box', background: '#f8fafc' } as React.CSSProperties,
  select: { width: '100%', padding: '11px 14px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#0f172a', outline: 'none', boxSizing: 'border-box', background: '#f8fafc', cursor: 'pointer' } as React.CSSProperties,
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' } as React.CSSProperties,
  sectionTitle: { fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '12px', paddingBottom: '8px', borderBottom: '2px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' } as React.CSSProperties,
};

export default function AjoutPage() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // ── Enfant form ────────────────────────────────────────────────────────────
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');
  const [sexe, setSexe] = useState<'M' | 'F'>('M');
  const [identifiantSanitaire, setIdentifiantSanitaire] = useState('');
  // Tuteur
  const [nomTuteur, setNomTuteur] = useState('');
  const [prenomTuteur, setPrenomTuteur] = useState('');
  const [telephoneTuteur, setTelephoneTuteur] = useState('');
  const [relationTuteur, setRelationTuteur] = useState('MERE');

  // ── Soumettre enfant ───────────────────────────────────────────────────────
  const handleEnfantSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError(''); setSuccess(''); setLoading(true);

    if (!user?.centre_sante_id) {
      setError('Votre compte agent n\'est pas rattaché à un centre de santé. Contactez l\'administrateur.');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('auth_token');
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api';
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, Accept: 'application/json' };

    try {
      let tuteurId: string | null = null;
      if (nomTuteur && telephoneTuteur) {
        const newTuteurId = crypto.randomUUID();
        const tuteurRes = await fetch(`${API}/tuteurs`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            id: newTuteurId,
            nom_complet: `${nomTuteur} ${prenomTuteur}`.trim(),
            telephone: telephoneTuteur,
            consentement_donne: true,
            cree_le: new Date().toISOString(),
          }),
        });
        if (tuteurRes.ok) {
          const tuteurData = await tuteurRes.json();
          tuteurId = tuteurData.data?.id || tuteurData.data?.tuteurId || tuteurData.id || tuteurData.tuteurId || newTuteurId;
        } else {
          const err = await tuteurRes.json();
          const errMsg = err.errors ? Object.values(err.errors).flat().join(' | ') : err.message || 'Erreur tuteur';
          setError(`Erreur tuteur : ${errMsg}`);
          setLoading(false);
          return;
        }
      }

      const payload: any = {
        nom, prenom,
        date_naissance: dateNaissance,
        sexe,
        identifiant_sanitaire: identifiantSanitaire || `ENF-${Date.now()}`,
        centre_sante_id: user?.centre_sante_id,
        statut_vaccinal_global: 'INCONNU',
      };

      if (!tuteurId) {
        setError('Le tuteur est obligatoire pour créer un dossier enfant.');
        setLoading(false);
        return;
      }

      payload.tuteur_principal_id = tuteurId;
      payload.tuteurs = [{ tuteur_id: tuteurId, type_relation: relationTuteur, est_principal: true }];

      const res = await fetch(`${API}/enfants`, { method: 'POST', headers, body: JSON.stringify(payload) });
      const data = await res.json();

      if (res.ok) {
        setSuccess('Dossier enfant créé avec succès ! Tuteur enregistré et calendrier vaccinal généré.');
        setNom(''); setPrenom(''); setDateNaissance(''); setIdentifiantSanitaire(''); setSexe('M');
        setNomTuteur(''); setPrenomTuteur(''); setTelephoneTuteur(''); setRelationTuteur('MERE');
      } else {
        const errMessages = data.errors
          ? Object.values(data.errors).flat().join(' | ')
          : data.message || 'Erreur inconnue';
        setError(`Erreur : ${errMessages}`);
      }
    } catch (e: any) {
      setError('Erreur réseau : ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>Saisie médicale</h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Enregistrez un nouveau dossier enfant.</p>
      </div>

      {/* Feedback */}
      {success && (
        <div style={{ padding: '14px 18px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', color: '#15803d', fontWeight: 600, fontSize: '14px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '18px' }}></span> {success}
        </div>
      )}
      {error && (
        <div style={{ padding: '14px 18px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '12px', color: '#b91c1c', fontWeight: 600, fontSize: '14px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <span></span> {error}
        </div>
      )}

      <form onSubmit={handleEnfantSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Section Identité */}
          <div style={S.card}>
            <div style={S.sectionTitle}><span></span> Identité de l'enfant</div>
            <div style={S.row2}>
              <div>
                <label style={S.label}>Nom *</label>
                <input style={S.input} value={nom} onChange={e => setNom(e.target.value)} placeholder="Diallo" required />
              </div>
              <div>
                <label style={S.label}>Prénom *</label>
                <input style={S.input} value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Aminata" required />
              </div>
            </div>
            <div style={{ ...S.row2, marginTop: '14px' }}>
              <div>
                <label style={S.label}>Date de naissance *</label>
                <input type="date" style={S.input} value={dateNaissance} onChange={e => setDateNaissance(e.target.value)} max={new Date().toISOString().split('T')[0]} required />
              </div>
              <div>
                <label style={S.label}>Identifiant sanitaire</label>
                <input style={S.input} value={identifiantSanitaire} onChange={e => setIdentifiantSanitaire(e.target.value)} placeholder="Auto-généré si vide" />
              </div>
            </div>

            {/* Sexe selector */}
            <div style={{ marginTop: '14px' }}>
              <label style={S.label}>Sexe *</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {[{ val: 'M', label: '♂ Garçon' }, { val: 'F', label: '♀ Fille' }].map(s => (
                  <button key={s.val} type="button" onClick={() => setSexe(s.val as 'M' | 'F')}
                    style={{ flex: 1, padding: '12px', border: `2px solid ${sexe === s.val ? '#3b82f6' : '#e2e8f0'}`, borderRadius: '10px', background: sexe === s.val ? '#eff6ff' : '#f8fafc', color: sexe === s.val ? '#1d4ed8' : '#64748b', fontWeight: 700, cursor: 'pointer', fontSize: '14px', transition: 'all 0.15s' }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section Tuteur */}
          <div style={S.card}>
            <div style={S.sectionTitle}><span></span> Tuteur / Parent</div>
            <div style={S.row2}>
              <div>
                <label style={S.label}>Nom du tuteur *</label>
                <input style={S.input} value={nomTuteur} onChange={e => setNomTuteur(e.target.value)} placeholder="Diallo" required />
              </div>
              <div>
                <label style={S.label}>Prénom</label>
                <input style={S.input} value={prenomTuteur} onChange={e => setPrenomTuteur(e.target.value)} placeholder="Mariam" />
              </div>
            </div>
            <div style={{ ...S.row2, marginTop: '14px' }}>
              <div>
                <label style={S.label}>Téléphone *</label>
                <input type="tel" style={S.input} value={telephoneTuteur} onChange={e => setTelephoneTuteur(e.target.value)} placeholder="7X XX XX XX" required />
              </div>
              <div>
                <label style={S.label}>Relation</label>
                <select style={S.select} value={relationTuteur} onChange={e => setRelationTuteur(e.target.value)}>
                  <option value="MERE">Mère</option>
                  <option value="PERE">Père</option>
                  <option value="GRAND_MERE">Grand-mère</option>
                  <option value="GRAND_PERE">Grand-père</option>
                  <option value="TUTEUR">Tuteur légal</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '16px',
              background: loading ? '#93c5fd' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(59,130,246,0.4)',
              letterSpacing: '0.3px',
            }}>
            {loading ? 'Enregistrement...' : '✅ Créer le dossier enfant'}
          </button>
        </div>
      </form>
    </div>
  );
}
