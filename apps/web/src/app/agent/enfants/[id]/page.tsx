'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/features/auth/useAuth';
import { ArrowLeft, CalendarDays, Syringe, User } from 'lucide-react';

interface DossierDetail {
  dossier: {
    id: string;
    nom: string;
    prenom: string;
    identifiant_sanitaire: string;
    date_naissance: string;
    sexe: string;
    statut_vaccinal_global: string;
    centre_sante_id?: string;
  };
  calendrier: {
    code: string;
    nom: string;
    date_prevue: string;
    statut: string;
    eligible: boolean;
    administre_le?: string;
  }[];
  actes_vaccinaux: {
    id: string;
    administre_le: string;
    vaccin_id: string;
    numero_lot?: string;
  }[];
  rendez_vous: {
    rdvId: string;
    datePrevue: string;
    dateRelancePrevue?: string;
  }[];
  statut_vaccinal: string;
  prochaine_echeance?: {
    vaccin: string;
    date_prevue: string;
    statut: string;
  };
}

export default function DossierEnfantPage() {
  const params = useParams();
  const enfantId = params.id as string;
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<DossierDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api';

  useEffect(() => {
    if (!isAuthenticated || !enfantId) return;

    const token = localStorage.getItem('auth_token');
    setLoading(true);
    setError('');

    fetch(`${API_URL}/enfants/${enfantId}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    })
      .then(async (res) => {
        if (res.status === 404) {
          setError('Enfant introuvable. Vérifiez l\'identifiant et réessayez.');
          return null;
        }
        if (!res.ok) {
          setError('Erreur lors du chargement. Veuillez réessayer ultérieurement.');
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (json?.data) setData(json.data);
      })
      .catch(() => setError('Erreur réseau. Veuillez réessayer ultérieurement.'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, enfantId, API_URL]);

  const statutColor = (s: string) => {
    if (s === 'A_JOUR' || s === 'ADMINISTRE') return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (s === 'RETARD' || s === 'EN_RETARD') return 'text-red-600 bg-red-50 border-red-100';
    if (s === 'ELIGIBLE') return 'text-blue-600 bg-blue-50 border-blue-100';
    return 'text-amber-600 bg-amber-50 border-amber-100';
  };

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center p-6">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 max-w-lg mx-auto mt-12 text-center">
        <p className="text-red-600 font-bold mb-4">{error || 'Dossier introuvable'}</p>
        <Link href="/agent/enfants" className="text-blue-600 font-semibold hover:underline">
          ← Retour à la liste
        </Link>
      </div>
    );
  }

  const { dossier, calendrier, actes_vaccinaux, prochaine_echeance } = data;

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <Link
        href="/agent/enfants"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 font-semibold text-sm"
      >
        <ArrowLeft className="h-4 w-4" /> Retour à la liste
      </Link>

      <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-2xl font-black text-blue-600">
              {dossier.nom?.[0]}{dossier.prenom?.[0]}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">
                {dossier.nom} {dossier.prenom}
              </h1>
              <p className="text-slate-500 font-medium">{dossier.identifiant_sanitaire}</p>
              <p className="text-sm text-slate-400 mt-1">
                Né(e) le {new Date(dossier.date_naissance).toLocaleDateString('fr-FR')} · {dossier.sexe}
              </p>
            </div>
          </div>
          <span className={`text-xs font-black uppercase px-4 py-2 rounded-xl border ${statutColor(data.statut_vaccinal)}`}>
            {data.statut_vaccinal?.replace('_', ' ')}
          </span>
        </div>

        {prochaine_echeance && (
          <div className="mt-6 rounded-2xl bg-blue-50 border border-blue-100 p-5 flex items-center gap-4">
            <CalendarDays className="h-8 w-8 text-blue-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-blue-800">Prochaine échéance</p>
              <p className="text-blue-900 font-semibold">
                {prochaine_echeance.vaccin} — {new Date(prochaine_echeance.date_prevue).toLocaleDateString('fr-FR')}
              </p>
              <p className="text-xs text-blue-600 mt-1">{prochaine_echeance.statut?.replace('_', ' ')}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Syringe className="h-5 w-5" /> Historique vaccinal
          </h2>
          {actes_vaccinaux.length === 0 ? (
            <p className="text-slate-500 text-sm">Aucune vaccination enregistrée.</p>
          ) : (
            <ul className="space-y-3">
              {actes_vaccinaux.map((a) => (
                <li key={a.id} className="flex justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
                  <span className="font-medium text-slate-800">
                    {new Date(a.administre_le).toLocaleDateString('fr-FR')}
                  </span>
                  {a.numero_lot && <span className="text-slate-500">Lot: {a.numero_lot}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
            <User className="h-5 w-5" /> Actions
          </h2>
          <div className="space-y-3">
            <Link
              href={`/agent/vaccination?enfant=${dossier.id}`}
              className="block w-full text-center rounded-xl bg-blue-600 text-white py-3 font-semibold hover:bg-blue-700"
            >
              Enregistrer une vaccination
            </Link>
            <Link
              href={`/agent/calendrier?enfant=${dossier.id}`}
              className="block w-full text-center rounded-xl bg-indigo-600 text-white py-3 font-semibold hover:bg-indigo-700"
            >
              Voir le calendrier PEV
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Calendrier vaccinal</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-500">
                <th className="pb-3 font-bold">Vaccin</th>
                <th className="pb-3 font-bold">Date prévue</th>
                <th className="pb-3 font-bold">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {calendrier.map((d) => (
                <tr key={d.code}>
                  <td className="py-3 font-medium text-slate-800">{d.nom}</td>
                  <td className="py-3 text-slate-600">
                    {new Date(d.date_prevue).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-3">
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border ${statutColor(d.statut)}`}>
                      {d.statut?.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
