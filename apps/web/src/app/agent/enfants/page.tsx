'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/useAuth';

interface Enfant {
  id: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  sexe: string;
  statut_vaccinal_global: string;
  identifiant_sanitaire: string;
}

export default function EnfantsPage() {
  const [enfants, setEnfants] = useState<Enfant[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchEnfants = async () => {
      const token = localStorage.getItem('auth_token');
      try {
        const response = await fetch('http://localhost:8000/api/enfants', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const result = await response.json();
          setEnfants(result.data);
        }
      } catch (error) {
        console.error('Error fetching enfants:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchEnfants();
    }
  }, [isAuthenticated]);

  const filteredEnfants = enfants.filter(e => 
    `${e.nom} ${e.prenom}`.toLowerCase().includes(search.toLowerCase()) ||
    e.identifiant_sanitaire.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Gestion des Enfants</h2>
          <p className="text-sm text-slate-500 font-medium">Données réelles synchronisées avec la base de données</p>
        </div>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2">
          <span>➕</span> Enregistrer un enfant
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input 
            type="text" 
            placeholder="Rechercher par nom ou identifiant sanitaire..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-20 text-center text-slate-400 font-bold">Chargement des données...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Enfant</th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Né le</th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Sexe</th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Statut</th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEnfants.map((enfant) => (
                <tr key={enfant.id} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        {enfant.nom[0]}{enfant.prenom[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{enfant.nom} {enfant.prenom}</p>
                        <p className="text-[10px] font-bold text-slate-400">ID: {enfant.identifiant_sanitaire}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-sm font-bold text-slate-600">
                    {new Date(enfant.date_naissance).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="p-6 text-sm font-bold text-slate-600">{enfant.sexe}</td>
                  <td className="p-6">
                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg ${
                      enfant.statut_vaccinal_global === 'A_JOUR' ? 'bg-emerald-100 text-emerald-600' : 
                      enfant.statut_vaccinal_global === 'RETARD' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {enfant.statut_vaccinal_global.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors font-bold text-xl">
                      👁️
                    </button>
                  </td>
                </tr>
              ))}
              {filteredEnfants.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-slate-400 font-medium">
                    Aucun enfant trouvé dans la base de données.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
