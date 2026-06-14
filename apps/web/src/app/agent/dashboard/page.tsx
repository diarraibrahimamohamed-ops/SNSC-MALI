'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/useAuth';
import {
  AlertTriangle,
  Baby,
  CalendarDays,
  Mail,
  Syringe,
} from 'lucide-react';

interface DashboardStats {
  total_enfants: number;
  vaccinations_aujourd_hui: number;
  rendez_vous_aujourd_hui: number;
  relances_envoyees: number;
  enfants_a_risque: number;
  couverture_vaccinale: number;
  enfants_en_retard: number;
  vaccins_disponibles: number;
  activite_recente?: {
    vaccinations: {
      id: string;
      administre_le: string;
      vaccin?: string;
      enfant_nom?: string;
      agent_nom?: string;
    }[];
    enfants: {
      id: string;
      nom: string;
      prenom: string;
      identifiant_sanitaire: string;
      date_naissance: string;
    }[];
  };
}

export default function AgentDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('auth_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api';

      try {
        const response = await fetch(`${API_URL}/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          setStats(result.data || result);
        } else {
          // Fallback: use zeros if API returns error
          setStats({
            total_enfants: 0,
            vaccinations_aujourd_hui: 0,
            rendez_vous_aujourd_hui: 0,
            relances_envoyees: 0,
            enfants_a_risque: 0,
            couverture_vaccinale: 0,
            enfants_en_retard: 0,
            vaccins_disponibles: 0,
          });
        }
      } catch (error) {
        console.error('Erreur chargement dashboard:', error);
        setStats({
          total_enfants: 0,
          vaccinations_aujourd_hui: 0,
          rendez_vous_aujourd_hui: 0,
          relances_envoyees: 0,
          enfants_a_risque: 0,
          couverture_vaccinale: 0,
          enfants_en_retard: 0,
          vaccins_disponibles: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="text-gray-600">Chargement de votre espace de travail...</p>
        </div>
      </div>
    );
  }

  const todayLabel = new Date().toLocaleDateString('fr-ML', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="mt-2 text-slate-600">
          Bienvenue {user?.nom_complet || user?.matricule || 'Agent'} - Voici votre activité du jour
        </p>
        <div className="mt-4 text-sm text-slate-500">{todayLabel}</div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white shadow-sm">
              <Baby className="h-7 w-7" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-600">Enfants suivis</div>
              <div className="text-2xl font-extrabold text-slate-900">{stats?.total_enfants || 0}</div>
              <div className="text-xs text-slate-500">Dans votre centre</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white shadow-sm">
              <Syringe className="h-7 w-7" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-600">Vaccinations aujourd&apos;hui</div>
              <div className="text-2xl font-extrabold text-slate-900">{stats?.vaccinations_aujourd_hui || 0}</div>
              <div className="text-xs text-slate-500">Séances complétées</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 p-4 text-white shadow-sm">
              <CalendarDays className="h-7 w-7" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-600">Rendez-vous aujourd&apos;hui</div>
              <div className="text-2xl font-extrabold text-slate-900">{stats?.rendez_vous_aujourd_hui || 0}</div>
              <div className="text-xs text-slate-500">Planifiés</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 p-4 text-white shadow-sm">
              <Mail className="h-7 w-7" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-600">Relances envoyées</div>
              <div className="text-2xl font-extrabold text-slate-900">{stats?.relances_envoyees || 0}</div>
              <div className="text-xs text-slate-500">SMS aujourd&apos;hui</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-900">Indicateurs clés</h3>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <span className="text-sm font-bold text-amber-700">Enfants en retard</span>
              </div>
              <div className="text-3xl font-extrabold text-amber-800">{stats?.enfants_en_retard || 0}</div>
              <div className="text-xs text-amber-600 mt-1">Nécessitent une attention</div>
            </div>

            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-sm font-bold text-red-700">Enfants à risque</span>
              </div>
              <div className="text-3xl font-extrabold text-red-800">{stats?.enfants_a_risque || 0}</div>
              <div className="text-xs text-red-600 mt-1">Score IA élevé</div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Syringe className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-bold text-emerald-700">Couverture vaccinale</span>
              </div>
              <div className="text-3xl font-extrabold text-emerald-800">{stats?.couverture_vaccinale || 0}%</div>
              <div className="text-xs text-emerald-600 mt-1">Taux actuel</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-lg font-bold text-slate-900">Actions rapides</h3>
          <div className="mt-6 space-y-3">
            <Link
              href="/agent/vaccination"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              💉 Nouvelle vaccination
            </Link>
            <Link
              href="/agent/ajout"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              👶 Nouvel enfant
            </Link>
            <Link
              href="/agent/enfants"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              📋 Consulter les dossiers
            </Link>
            <Link
              href="/agent/calendrier"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-700"
            >
              📅 Voir le calendrier
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-lg font-bold text-slate-900">Dernières vaccinations</h3>
          <div className="mt-4 space-y-3">
            {(stats?.activite_recente?.vaccinations?.length ?? 0) > 0 ? (
              stats!.activite_recente!.vaccinations.map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{v.enfant_nom || 'Enfant'}</p>
                    <p className="text-xs text-slate-500">{v.vaccin || 'Vaccin'} · {v.agent_nom || 'Agent'}</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    {v.administre_le ? new Date(v.administre_le).toLocaleDateString('fr-FR') : '—'}
                  </span>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                Aucune vaccination enregistrée pour le moment.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-lg font-bold text-slate-900">Derniers dossiers enregistrés</h3>
          <div className="mt-4 space-y-3">
            {(stats?.activite_recente?.enfants?.length ?? 0) > 0 ? (
              stats!.activite_recente!.enfants.map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{e.nom} {e.prenom}</p>
                    <p className="text-xs text-slate-500">{e.identifiant_sanitaire}</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    {e.date_naissance ? new Date(e.date_naissance).toLocaleDateString('fr-FR') : '—'}
                  </span>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                Aucun enfant enregistré dans votre centre.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
