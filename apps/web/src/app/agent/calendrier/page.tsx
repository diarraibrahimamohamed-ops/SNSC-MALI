'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { VACCINS_MALI } from '@/constants/vaccins';
import { STATUT_LABELS, type EntreeCalendrier } from '@/lib/vaccination-schedule';
import { CalendarDays, Info, ShieldAlert } from 'lucide-react';

export default function AgentCalendrierPage() {
  const { isAuthenticated } = useAuth();
  const [enfants, setEnfants] = useState<any[]>([]);
  const [enfantId, setEnfantId] = useState('');
  const [calendrier, setCalendrier] = useState<EntreeCalendrier[]>([]);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api';
  const selectedEnfant = enfants.find(e => e.id === enfantId);

  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('auth_token');
    fetch(`${API_URL}/enfants`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setEnfants(d.data || d); });
  }, [isAuthenticated, API_URL]);

  useEffect(() => {
    if (!enfantId || !isAuthenticated) {
      setCalendrier([]);
      return;
    }

    const token = localStorage.getItem('auth_token');
    setLoading(true);
    fetch(`${API_URL}/enfants/${enfantId}/calendrier-vaccinal`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setCalendrier(d.data || []); })
      .finally(() => setLoading(false));
  }, [enfantId, isAuthenticated, API_URL]);

  const vaccinsReference = VACCINS_MALI.filter(v => !v.id.endsWith('118'));
  const vaccinsFilles = VACCINS_MALI.filter(v => v.id.endsWith('118'));

  return (
    <div className="space-y-8 animate-fade-in p-6 relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[120px]"></div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Calendrier de Vaccination 📅</h1>
          <p className="text-slate-500 font-medium mt-1">Programme PEV Mali — dates calculées selon la naissance de l&apos;enfant</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <label className="block text-sm font-bold text-slate-700 mb-2">Sélectionner un enfant</label>
        <select
          value={enfantId}
          onChange={e => setEnfantId(e.target.value)}
          className="w-full md:max-w-md p-3 border border-slate-200 rounded-xl bg-slate-50 font-medium outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">— Choisir un dossier enfant —</option>
          {enfants.map(e => (
            <option key={e.id} value={e.id}>
              {e.nom} {e.prenom} · né(e) le {e.date_naissance ? new Date(e.date_naissance).toLocaleDateString('fr-FR') : '—'}
            </option>
          ))}
        </select>
      </div>

      {enfantId && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex gap-4 text-blue-900">
          <CalendarDays className="h-6 w-6 flex-shrink-0" />
          <div className="text-sm font-medium leading-relaxed">
            <strong>{selectedEnfant?.nom} {selectedEnfant?.prenom}</strong> — le système bloque toute vaccination
            dont la date est antérieure à l&apos;âge minimum requis (semaines/mois) ou à l&apos;intervalle entre doses.
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-12 text-slate-500 font-semibold">Calcul du calendrier personnalisé...</div>
      )}

      {enfantId && !loading && calendrier.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 overflow-x-auto">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="text-2xl"></span> Calendrier personnalisé
          </h2>
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-black uppercase tracking-wider text-slate-400">
                <th className="pb-3 pr-4">Vaccin</th>
                <th className="pb-3 pr-4">Âge minimum</th>
                <th className="pb-3 pr-4">Date prévue</th>
                <th className="pb-3 pr-4">Statut</th>
                <th className="pb-3">Vérification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {calendrier.map(entry => {
                const ref = VACCINS_MALI.find(v => v.id === entry.vaccin_id);
                const statut = STATUT_LABELS[entry.statut] || STATUT_LABELS.A_VENIR;

                return (
                  <tr key={entry.vaccin_id} className="hover:bg-slate-50/50">
                    <td className="py-4 pr-4">
                      <div className="font-bold text-slate-900" style={{ color: ref?.couleur }}>{entry.nom}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{entry.periode}</div>
                    </td>
                    <td className="py-4 pr-4 text-sm font-semibold text-slate-600">
                      {entry.age_minimum_semaines > 0
                        ? `${entry.age_minimum_semaines} sem.`
                        : entry.age_minimum_jours >= 365
                          ? `${Math.floor(entry.age_minimum_jours / 365)} an(s)`
                          : entry.age_minimum_jours >= 30
                            ? `${Math.floor(entry.age_minimum_jours / 30)} mois`
                            : 'Naissance'}
                    </td>
                    <td className="py-4 pr-4 text-sm font-bold text-slate-700">
                      {new Date(entry.date_prevue).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${statut.className}`}>
                        {statut.label}
                      </span>
                    </td>
                    <td className="py-4 text-xs text-slate-500 max-w-xs">
                      {entry.statut === 'TROP_TOT' && (
                        <span className="flex items-start gap-1 text-amber-700 font-semibold">
                          <ShieldAlert className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          Éligible dès le {new Date(entry.date_eligible).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                      {entry.statut === 'ADMINISTRE' && entry.administre_le && (
                        <span className="text-emerald-700 font-semibold">
                          Fait le {new Date(entry.administre_le).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                      {entry.statut === 'ELIGIBLE' && (
                        <span className="text-blue-700 font-semibold">Peut être administré maintenant</span>
                      )}
                      {entry.statut === 'EN_RETARD' && (
                        <span className="text-red-700 font-semibold">Rattrapage recommandé</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="text-2xl"></span> Référence PEV — 0 à 11 mois
          </h2>
          <div className="space-y-4">
            {vaccinsReference.map(v => (
              <div key={v.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 gap-4">
                <div>
                  <div className="font-bold text-slate-900" style={{ color: v.couleur }}>{v.nom}</div>
                  <div className="text-sm text-slate-500 mt-1">{v.cible}</div>
                </div>
                <div className="text-sm font-semibold bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100 text-center sm:text-right min-w-[200px]">
                  {v.periode}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="text-2xl"></span> Jeunes Filles
            </h2>
            <div className="space-y-4">
              {vaccinsFilles.map(v => (
                <div key={v.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-purple-50 border border-purple-100 gap-4">
                  <div>
                    <div className="font-bold text-purple-700">{v.nom}</div>
                    <div className="text-sm text-purple-600 mt-1">{v.cible}</div>
                  </div>
                  <div className="text-sm font-semibold bg-white px-4 py-2 rounded-lg shadow-sm border border-purple-100 text-center sm:text-right min-w-[200px] text-purple-800">
                    {v.periode}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 flex gap-4 text-blue-800">
            <Info className="h-6 w-6 flex-shrink-0" />
            <p className="text-sm font-medium leading-relaxed">
              Les vaccinations non conformes au calendrier sont <strong>refusées par le serveur</strong>, même si l&apos;agent se trompe.
              Exemple : un enfant né hier ne peut pas recevoir Penta1 (6 semaines minimum).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
