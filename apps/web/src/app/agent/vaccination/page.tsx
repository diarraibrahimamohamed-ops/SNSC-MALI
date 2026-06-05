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

  // Form state
  const [enfantId, setEnfantId] = useState('');
  const [vaccinId, setVaccinId] = useState('');
  const [numeroLot, setNumeroLot] = useState('');
  const [administreLe, setAdministreLe] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('auth_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      try {
        const response = await fetch(`${API_URL}/enfants`, { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } });
        
        if (response.ok) {
          const result = await response.json();
          setEnfants(result.data || result);
        }
      } catch (err) {
        console.error('Erreur', err);
      }
    };
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('auth_token');
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    try {
      const payload = {
        enfant_id: enfantId,
        vaccin_id: vaccinId,
        agent_id: user?.id,
        centre_sante_id: user?.centre_sante_id,
        numero_lot: numeroLot,
        administre_le: administreLe,
        notes: notes
      };

      const response = await fetch(`${API_URL}/actes-vaccinaux`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/agent/dashboard'), 2000);
      } else {
        const errData = await response.json();
        alert(`Erreur d'enregistrement: ${errData.message || 'Vérifiez les champs'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Erreur réseau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in p-6 relative max-w-3xl mx-auto">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[120px]"></div>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-slate-50 transition-colors">
          ←
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Nouvelle Vaccination 💉</h1>
          <p className="text-slate-500 font-medium mt-1">Enregistrez un acte vaccinal dans le dossier du patient.</p>
        </div>
      </div>

      {success ? (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-8 rounded-3xl text-center shadow-lg animate-fade-in">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2">Vaccination enregistrée !</h2>
          <p>Le dossier de l'enfant a été mis à jour avec succès. Redirection...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-md p-8 rounded-3xl border border-white/50 shadow-xl shadow-slate-200/40 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Sélectionner l'Enfant *</label>
              <select 
                required
                value={enfantId}
                onChange={(e) => setEnfantId(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choisir un enfant --</option>
                {enfants.map(e => (
                  <option key={e.id} value={e.id}>{e.nom} {e.prenom} (ID: {e.identifiant_sanitaire})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Vaccin Administré *</label>
                <select 
                  required
                  value={vaccinId}
                  onChange={(e) => {
                    const selectedVaccinId = e.target.value;
                    setVaccinId(selectedVaccinId);
                    const selectedVaccin = VACCINS_MALI.find(v => v.id === selectedVaccinId);
                    if (selectedVaccin) setNumeroLot(selectedVaccin.lot || '');
                  }}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Choisir un vaccin --</option>
                  {VACCINS_MALI.map(v => (
                    <option key={v.id} value={v.id}>{v.nom} ({v.cible})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Numéro de Lot *</label>
                <input 
                  type="text" 
                  required
                  value={numeroLot}
                  onChange={(e) => setNumeroLot(e.target.value)}
                  placeholder="Ex: LOT-2026-X"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Date de l'acte *</label>
                <input 
                  type="date" 
                  required
                  value={administreLe}
                  onChange={(e) => setAdministreLe(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Observations (Optionnel)</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Réactions allergiques, remarques spécifiques..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
              ></textarea>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50"
          >
            {loading ? 'Enregistrement en cours...' : 'Valider la vaccination'}
          </button>
        </form>
      )}
    </div>
  );
}
