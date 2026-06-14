'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { Table } from '@/components/ui/Table';

interface Agent {
  id: string;
  nom_complet: string;
  matricule: string;
  email?: string;
  telephone: string;
  role: string;
  centre_sante?: {
    nom: string;
  };
}

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [centres, setCentres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { isAuthenticated } = useAuth();

  // Form State
  const [nomComplet, setNomComplet] = useState('');
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [telephone, setTelephone] = useState('');
  const [centreId, setCentreId] = useState('');

  const fetchData = async () => {
    const token = localStorage.getItem('auth_token');
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api';
    
    try {
      const [agentsRes, centresRes] = await Promise.all([
        fetch(`${API_URL}/agents`, { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } }),
        fetch(`${API_URL}/centres-sante`, { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } })
      ]);
      
      if (agentsRes.ok) {
        const result = await agentsRes.json();
        setAgents(result.data || result);
      }
      if (centresRes.ok) {
        const result = await centresRes.json();
        setCentres(result.data || result);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const token = localStorage.getItem('auth_token');
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api';

    try {
      const response = await fetch(`${API_URL}/agents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          nom_complet: nomComplet,
          matricule,
          password,
          telephone,
          role: 'AGENT',
          centre_sante_id: centreId,
          est_actif: true
        })
      });

      if (response.ok) {
        setSuccess('Agent créé avec succès !');
        setNomComplet(''); setMatricule(''); setPassword(''); setTelephone(''); setCentreId('');
        setTimeout(() => setIsModalOpen(false), 1500);
        fetchData(); // refresh list
      } else {
        const errData = await response.json();
        const details = errData.errors
          ? Object.values(errData.errors).flat().join(' | ')
          : errData.error || errData.message || 'Vérifiez les informations';
        setError(`Erreur : ${details}`);
      }
    } catch (err) {
      setError('Erreur de connexion au serveur.');
    }
  };

  const columns = [
    { key: 'nom_complet', label: 'Nom Complet', render: (row: any) => row.nom_complet || row.nom },
    { key: 'matricule', label: 'Matricule' },
    { key: 'telephone', label: 'Téléphone' },
    { key: 'role', label: 'Rôle' },
    { key: 'centre_sante.nom', label: 'Centre' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agents de Santé</h1>
          <p className="text-sm text-gray-600 mt-1">Gestion des agents du système</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 800, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 16px rgba(16,185,129,0.4)', letterSpacing: '0.3px', transition: 'all 0.2s' }}
        >
          ＋ Ajouter un agent
        </button>
      </div>

      <div className="bg-white shadow rounded-xl overflow-hidden border border-gray-200">
        <Table data={agents} columns={columns} loading={loading} />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Créer un nouvel agent</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>
            
            <form onSubmit={handleCreateAgent} className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">{error}</div>}
              {success && <div className="p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-100">{success}</div>}
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nom Complet *</label>
                <input required type="text" value={nomComplet} onChange={e => setNomComplet(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Matricule *</label>
                  <input required type="text" value={matricule} onChange={e => setMatricule(e.target.value)} placeholder="AGT-XXX" className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Téléphone *</label>
                  <input required type="tel" value={telephone} onChange={e => setTelephone(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Mot de passe *</label>
                <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Centre de santé rattaché *</label>
                <select required value={centreId} onChange={e => setCentreId(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50">
                  <option value="">-- Sélectionner --</option>
                  {centres.map(c => (
                    <option key={c.id} value={c.id}>{c.nom}</option>
                  ))}
                </select>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition">Annuler</button>
                <button type="submit" className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition shadow-md shadow-emerald-200">Enregistrer l'agent</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
