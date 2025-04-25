'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/useAuth';
import {  } from "../../../../public/boxicons-master/css/boxicons.min.css";
import { Baby } from 'lucide-react';

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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api';
      
      try {
        const response = await fetch(`${API_URL}/enfants`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
        });
        if (response.ok) {
          const result = await response.json();
          setEnfants(result.data || result);
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
    e.identifiant_sanitaire?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in p-6 relative">
      {/* Background decoration for Premium Feel */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[120px]"></div>
        <div className="absolute -bottom-[20%] right-[10%] w-[50%] h-[50%] rounded-full bg-emerald-400/10 blur-[100px]"></div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight"> Enfants  <i className='bx bxs-baby-carriage'></i> </h1>
          <p className="text-slate-500 font-medium mt-1">Gérez le suivi vaccinal de tous les enfants enregistrés.</p>
        </div>       
      </div>

      <div className="bg-white/60 backdrop-blur-xl p-4 rounded-3xl border border-white/40 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl"><i className='bx bx-search-alt-2'></i></span>
          <input 
            type="text" 
            placeholder="Rechercher par nom, prénom ou ID sanitaire..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-4 py-4 bg-white/80 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner"
          />
        </div>
         <Link href="/agent/ajout" className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200/50 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3">
          <span className="text-xl"> <i className="bx bxs-plus-square"></i></span> Nouvelle Enfant
        </Link>
      </div>

      <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/50 shadow-xl shadow-slate-200/40 overflow-hidden relative">
        {isLoading ? (
          <div className="p-24 flex flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-slate-500 font-bold">Synchronisation des dossiers...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                  <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Dossier Enfant</th>
                  <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Né(e) le</th>
                  <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Sexe</th>
                  <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Statut Vaccinal</th>
                  <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {filteredEnfants.map((enfant) => (
                  <tr key={enfant.id} className="hover:bg-white transition-all cursor-pointer group hover:shadow-md relative z-10">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center font-black text-lg shadow-inner group-hover:scale-110 transition-transform">
                          {enfant.nom[0]}{enfant.prenom[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{enfant.nom} {enfant.prenom}</p>
                          <p className="text-[11px] font-bold text-slate-400 mt-0.5 tracking-wider">{enfant.identifiant_sanitaire}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-sm font-bold text-slate-600">
                      {new Date(enfant.date_naissance).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-6">
                      <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                        {enfant.sexe}
                      </span>
                    </td>
                    <td className="p-6">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border ${
                        enfant.statut_vaccinal_global === 'A_JOUR' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        enfant.statut_vaccinal_global === 'RETARD' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {enfant.statut_vaccinal_global?.replace('_', ' ') || 'INCONNU'}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <Link
                        href={`/agent/enfants/${enfant.id}`}
                        className="inline-block px-4 py-2 bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all font-bold text-sm shadow-sm group-hover:shadow"
                      >
                        Voir Dossier
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredEnfants.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-20 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-3xl mb-4">📭</div>
                      <p className="text-slate-500 font-bold text-lg">Aucun enfant trouvé</p>
                      <p className="text-slate-400 text-sm mt-1">Essayez une autre recherche ou enregistrez un nouvel enfant.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
