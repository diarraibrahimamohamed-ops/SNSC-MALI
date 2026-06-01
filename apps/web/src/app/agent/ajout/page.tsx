'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/useAuth';

// ─── Vaccins contexte Mali (alignés avec le seeder API) ───────────────────────
const VACCINS_MALI = [
  { id: '11111111-1111-4111-8111-111111111101', nom: 'BCG', description: 'Tuberculose · Dose unique à la naissance', couleur: '#3b82f6' },
  { id: '11111111-1111-4111-8111-111111111102', nom: 'Pentavalent 1', description: 'DTC-HepB-Hib · 1ʳᵉ dose (6 semaines)', couleur: '#8b5cf6' },
  { id: '11111111-1111-4111-8111-111111111103', nom: 'Pentavalent 2', description: 'DTC-HepB-Hib · 2ᵉ dose (10 semaines)', couleur: '#06b6d4' },
  { id: '11111111-1111-4111-8111-111111111104', nom: 'Rougeole', description: 'RR · 9 mois et 15-18 mois', couleur: '#f59e0b' },
  { id: '11111111-1111-4111-8111-111111111105', nom: 'Fièvre jaune', description: 'VAA · 9 mois (obligatoire Mali)', couleur: '#10b981' },
];

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
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'enfant' | 'vaccination'>('enfant');
  const [enfants, setEnfants] = useState<any[]>([]);
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

  // ── Vaccination form ───────────────────────────────────────────────────────
  const [enfantId, setEnfantId] = useState('');
  const [vaccinId, setVaccinId] = useState('');
  const [administreLe, setAdministreLe] = useState(new Date().toISOString().split('T')[0]);
  const [numeroLot, setNumeroLot] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('auth_token');
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const h = { Authorization: `Bearer ${token}`, Accept: 'application/json' };

    Promise.all([
      fetch(`${API}/enfants`, { headers: h }).then(r => r.ok ? r.json() : null),
    ]).then(([e]) => {
      if (e) setEnfants(e.data || e);
    });
  }, [isAuthenticated]);

  // ── Soumettre enfant ───────────────────────────────────────────────────────
  const handleEnfantSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    const token = localStorage.getItem('auth_token');
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, Accept: 'application/json' };

    try {
      // 1. Générer l'ID du tuteur côté client (Tuteur n'a pas d'auto-increment)
      let tuteurId: string | null = null;
      if (nomTuteur && telephoneTuteur) {
        const newTuteurId = crypto.randomUUID();
        const tuteurRes = await fetch(`${API}/tuteurs`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            id: newTuteurId,
            nom_complet: `${nomTuteur} ${prenomTuteur}`.trim(), // Le modèle utilise nom_complet
            telephone: telephoneTuteur,
            consentement_donne: true,
            cree_le: new Date().toISOString(),
          }),
        });
        if (tuteurRes.ok) {
          const tuteurData = await tuteurRes.json();
          // Récupérer l'ID depuis la réponse ou utiliser celui qu'on a généré
          tuteurId = tuteurData.data?.id || tuteurData.id || newTuteurId;
        } else {
          const err = await tuteurRes.json();
          console.error('Erreur tuteur:', err);
          // On continue quand même sans tuteur
        }
      }

      // 2. Créer l'enfant avec le bon payload
      const payload: any = {
        nom, prenom,
        date_naissance: dateNaissance,
        sexe,
        identifiant_sanitaire: identifiantSanitaire || `ENF-${Date.now()}`,
        centre_sante_id: user?.centre_sante_id,
        statut_vaccinal_global: 'INCONNU',
      };

      // 3. Lier le tuteur si créé avec succès
      if (tuteurId) {
        payload.tuteur_principal_id = tuteurId;
        payload.tuteurs = [{
          tuteur_id: tuteurId,
          type_relation: relationTuteur,
          est_principal: true,
        }];
      }

      const res = await fetch(`${API}/enfants`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        const msg = tuteurId
          ? 'Dossier enfant créé avec succès ! Tuteur enregistré et calendrier vaccinal généré.'
          : 'Dossier enfant créé. Note : le tuteur n\'a pas pu être enregistré (vérifiez les champs).';
        setSuccess(msg);
        // Reset formulaire
        setNom(''); setPrenom(''); setDateNaissance(''); setIdentifiantSanitaire(''); setSexe('M');
        setNomTuteur(''); setPrenomTuteur(''); setTelephoneTuteur(''); setRelationTuteur('MERE');
        // Rafraîchir liste enfants
        const fresh = await fetch(`${API}/enfants`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
        if (fresh.ok) { const d = await fresh.json(); setEnfants(d.data || d); }
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

  // ── Soumettre vaccination ─────────────────────────────────────────────────
  const handleVaccinationSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    const token = localStorage.getItem('auth_token');
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    try {
      const res = await fetch(`${API}/actes-vaccinaux`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, Accept: 'application/json' },
        body: JSON.stringify({
          enfant_id: enfantId,
          vaccin_id: vaccinId,
          agent_id: user?.id,
          centre_sante_id: user?.centre_sante_id,
          administre_le: administreLe,
          numero_lot: numeroLot || null,
          notes: notes || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Vaccination enregistrée ! Le dossier de l\'enfant a été mis à jour.');
        setEnfantId(''); setVaccinId(''); setNumeroLot(''); setNotes('');
        setAdministreLe(new Date().toISOString().split('T')[0]);
      } else {
        setError(data.message || JSON.stringify(data.errors));
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
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Enregistrez un nouveau dossier enfant ou un acte vaccinal.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '14px', marginBottom: '24px', width: 'fit-content' }}>
        {(['enfant', 'vaccination'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSuccess(''); setError(''); }}
            style={{
              padding: '10px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 700, transition: 'all 0.15s',
              background: activeTab === tab ? '#fff' : 'transparent',
              color: activeTab === tab ? '#0f172a' : '#64748b',
              boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {tab === 'enfant' ? '👶 Nouvel Enfant' : '💉 Acte Vaccinal'}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {success && (
        <div style={{ padding: '14px 18px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', color: '#15803d', fontWeight: 600, fontSize: '14px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '18px' }}>✅</span> {success}
        </div>
      )}
      {error && (
        <div style={{ padding: '14px 18px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '12px', color: '#b91c1c', fontWeight: 600, fontSize: '14px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <span>⚠️</span> {error}
        </div>
      )}

      {/* ─── FORMULAIRE ENFANT ─────────────────────────────────────────────── */}
      {activeTab === 'enfant' && (
        <form onSubmit={handleEnfantSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Section Identité */}
            <div style={S.card}>
              <div style={S.sectionTitle}><span>🪪</span> Identité de l'enfant</div>
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
              <div style={S.sectionTitle}><span>👨‍👩‍👦</span> Tuteur / Parent</div>
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


            <button type="submit" disabled={loading} style={{ padding: '16px', background: loading ? '#93c5fd' : 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '15px', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 16px rgba(59,130,246,0.35)', letterSpacing: '0.3px' }}>
              {loading ? 'Enregistrement...' : '✅ Créer le dossier enfant'}
            </button>
          </div>
        </form>
      )}

      {/* ─── FORMULAIRE VACCINATION ──────────────────────────────────────────── */}
      {activeTab === 'vaccination' && (
        <form onSubmit={handleVaccinationSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Sélection enfant */}
            <div style={S.card}>
              <div style={S.sectionTitle}><span>👶</span> Enfant vacciné</div>
              <select style={S.select} value={enfantId} onChange={e => setEnfantId(e.target.value)} required>
                <option value="">— Sélectionner un enfant —</option>
                {enfants.map((e: any) => (
                  <option key={e.id} value={e.id}>{e.nom} {e.prenom} · {e.identifiant_sanitaire}</option>
                ))}
              </select>
            </div>

            {/* Sélection vaccin — cartes */}
            <div style={S.card}>
              <div style={S.sectionTitle}><span>💉</span> Vaccin administré</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {VACCINS_MALI.map(v => (
                  <button key={v.id} type="button" onClick={() => setVaccinId(v.id)}
                    style={{
                      padding: '14px 16px', border: `2px solid ${vaccinId === v.id ? v.couleur : '#e2e8f0'}`, borderRadius: '12px', background: vaccinId === v.id ? `${v.couleur}12` : '#f8fafc', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      {vaccinId === v.id && <span style={{ fontSize: '14px' }}>✓</span>}
                      <span style={{ fontWeight: 800, fontSize: '14px', color: vaccinId === v.id ? v.couleur : '#0f172a' }}>{v.nom}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>{v.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Détails acte */}
            <div style={S.card}>
              <div style={S.sectionTitle}><span>📋</span> Détails de l'acte</div>
              <div style={S.row2}>
                <div>
                  <label style={S.label}>Date d'administration *</label>
                  <input type="date" style={S.input} value={administreLe} onChange={e => setAdministreLe(e.target.value)} max={new Date().toISOString().split('T')[0]} required />
                </div>
                <div>
                  <label style={S.label}>Numéro de lot</label>
                  <input style={S.input} value={numeroLot} onChange={e => setNumeroLot(e.target.value)} placeholder="ex: ML-2026-BCG-001" />
                </div>
              </div>
              <div style={{ marginTop: '14px' }}>
                <label style={S.label}>Observations / Notes</label>
                <textarea style={{ ...S.input, height: '90px', resize: 'none' } as React.CSSProperties} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Réaction post-vaccinale, remarques..." />
              </div>
            </div>

            {/* Info banner */}
            <div style={{ padding: '14px 18px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '16px' }}>ℹ️</span>
              <p style={{ margin: 0, fontSize: '13px', color: '#92400e', fontWeight: 500 }}>
                L'acte vaccinal sera automatiquement lié au calendrier de l'enfant et son statut vaccinal sera recalculé.
              </p>
            </div>

            <button type="submit" disabled={loading || !vaccinId || !enfantId} style={{ padding: '16px', background: loading || !vaccinId || !enfantId ? '#6ee7b7' : 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '15px', fontWeight: 800, cursor: (loading || !vaccinId || !enfantId) ? 'not-allowed' : 'pointer', boxShadow: '0 4px 16px rgba(16,185,129,0.35)', letterSpacing: '0.3px' }}>
              {loading ? 'Enregistrement...' : '✅ Valider la vaccination'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
