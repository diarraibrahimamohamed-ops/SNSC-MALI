'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/useAuth';
import {
  AlertTriangle,
  Baby,
  BarChart3,
  Calendar,
  CheckCircle2,
  MessageSquare,
  Plus,
  Send,
  Syringe,
  Info,
} from 'lucide-react';

function AlertItem({ type, message, time }: { type: 'critical' | 'warning' | 'info'; message: string; time: string }) {
  const styles = {
    critical: 'border-red-200 bg-red-50 text-red-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800',
  };
  const icons = {
    critical: <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />,
    info: <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />,
  };

  return (
    <div className={`flex gap-3 rounded-xl border p-3 ${styles[type]}`}>
      {icons[type]}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{message}</p>
        <p className="text-xs opacity-70 mt-0.5">{time}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api';

        const statsRes = await fetch(`${API_URL}/dashboard-admin`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.data || statsData);
        } else {
          setStats({});
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données', error);
        setStats({});
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent shadow-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-100 p-8 shadow-sm">
        <h1 className="text-3xl font-extrabold tracking-tight text-emerald-800">
          Tableau de bord Administrateur
        </h1>
        <p className="mt-2 text-gray-700">
          Vue d&apos;ensemble du système de vaccination
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          {new Date().toLocaleDateString('fr-ML', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-blue-700" />
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow">
              <Baby className="h-8 w-8" />
            </div>
            <div>
              <div className="text-3xl font-extrabold leading-none text-gray-900">
                {stats?.total_enfants || 0}
              </div>
              <div className="mt-1 text-sm font-semibold text-gray-700">Total Enfants</div>
              <div className="mt-0.5 text-sm text-gray-500">Enregistrés dans le système</div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-700" />
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow">
              <Syringe className="h-8 w-8" />
            </div>
            <div>
              <div className="text-3xl font-extrabold leading-none text-gray-900">
                {stats?.vaccinations_aujourd_hui || 0}
              </div>
              <div className="mt-1 text-sm font-semibold text-gray-700">Vaccinations Aujourd&apos;hui</div>
              <div className="mt-0.5 text-sm text-gray-500">Séances complétées</div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 to-amber-700" />
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow">
              <Calendar className="h-8 w-8" />
            </div>
            <div>
              <div className="text-3xl font-extrabold leading-none text-gray-900">
                {stats?.rendez_vous_aujourd_hui || 0}
              </div>
              <div className="mt-1 text-sm font-semibold text-gray-700">Rendez-vous Aujourd&apos;hui</div>
              <div className="mt-0.5 text-sm text-gray-500">Planifiés</div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 to-violet-700" />
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow">
              <MessageSquare className="h-8 w-8" />
            </div>
            <div>
              <div className="text-3xl font-extrabold leading-none text-gray-900">
                {stats?.relances_envoyees || 0}
              </div>
              <div className="mt-1 text-sm font-semibold text-gray-700">Relances Envoyées</div>
              <div className="mt-0.5 text-sm text-gray-500">SMS envoyés aujourd&apos;hui</div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 to-red-700" />
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-700 text-white shadow">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div>
              <div className="text-3xl font-extrabold leading-none text-gray-900">
                {stats?.enfants_a_risque || 0}
              </div>
              <div className="mt-1 text-sm font-semibold text-gray-700">Enfants à Risque</div>
              <div className="mt-0.5 text-sm text-gray-500">Nécessitent une attention</div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500 to-teal-700" />
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow">
              <BarChart3 className="h-8 w-8" />
            </div>
            <div>
              <div className="text-3xl font-extrabold leading-none text-gray-900">
                {stats?.couverture_vaccinale || 0}%
              </div>
              <div className="mt-1 text-sm font-semibold text-gray-700">Couverture Vaccinale</div>
              <div className="mt-0.5 text-sm text-gray-500">Taux national</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h4 className="text-lg font-bold text-gray-900">Dernières vaccinations</h4>
            <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
              Base de données
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {(stats?.activite_recente?.vaccinations?.length ?? 0) > 0 ? (
              stats.activite_recente.vaccinations.map((v: any) => (
                <div key={v.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{v.enfant_nom || 'Enfant'}</p>
                    <p className="text-xs text-gray-500">{v.vaccin || 'Vaccin'} · {v.agent_nom || 'Agent'}</p>
                  </div>
                  <span className="text-xs font-semibold text-gray-500">
                    {v.administre_le ? new Date(v.administre_le).toLocaleDateString('fr-FR') : '—'}
                  </span>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                Aucune vaccination enregistrée dans le système.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h4 className="text-lg font-bold text-gray-900">Derniers enfants enregistrés</h4>
            <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
              {stats?.total_enfants || 0} au total
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {(stats?.activite_recente?.enfants?.length ?? 0) > 0 ? (
              stats.activite_recente.enfants.map((e: any) => (
                <div key={e.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{e.nom} {e.prenom}</p>
                    <p className="text-xs text-gray-500">{e.identifiant_sanitaire}</p>
                  </div>
                  <span className="text-xs font-semibold text-gray-500">
                    {e.date_naissance ? new Date(e.date_naissance).toLocaleDateString('fr-FR') : '—'}
                  </span>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                Aucun enfant enregistré pour le moment.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h4 className="text-lg font-bold text-gray-900">Synthèse système</h4>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <div className="text-2xl font-extrabold text-blue-800">{stats?.total_agents || 0}</div>
              <div className="text-sm font-semibold text-blue-700">Agents</div>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              <div className="text-2xl font-extrabold text-emerald-800">{stats?.total_centres || 0}</div>
              <div className="text-sm font-semibold text-emerald-700">Centres</div>
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <div className="text-2xl font-extrabold text-amber-800">{stats?.enfants_en_retard || 0}</div>
              <div className="text-sm font-semibold text-amber-700">Enfants en retard</div>
            </div>
            <div className="rounded-xl border border-red-100 bg-red-50 p-4">
              <div className="text-2xl font-extrabold text-red-800">{stats?.enfants_a_risque || 0}</div>
              <div className="text-sm font-semibold text-red-700">Enfants à risque</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h4 className="text-lg font-bold text-gray-900">Couverture Vaccinale</h4>
            <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
              National
            </span>
          </div>
          <div className="mt-6 flex min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <div className="mt-4 text-base font-semibold text-gray-800">Taux de couverture</div>
            <div className="mt-1 text-sm text-gray-600">Calculé depuis les actes vaccinaux en base</div>
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-xl font-extrabold text-gray-900">
              {stats?.couverture_vaccinale || 0}%
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h4 className="text-lg font-bold text-gray-900">Actions Rapides</h4>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link
              href="/admin/agents"
              className="group inline-flex flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 px-4 py-5 text-center text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <Plus className="h-5 w-5" />
              </div>
              <div className="text-sm font-semibold">Créer un agent</div>
            </Link>

            <Link
              href="/admin/centres"
              className="group inline-flex flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 px-4 py-5 text-center text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="text-sm font-semibold">Gérer les centres</div>
            </Link>

            <Link
              href="/admin/audit"
              className="group inline-flex flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 px-4 py-5 text-center text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <Send className="h-5 w-5" />
              </div>
              <div className="text-sm font-semibold">Voir l&apos;audit</div>
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h4 className="text-lg font-bold text-gray-900">Alertes Système</h4>
          <div className="mt-6 space-y-3">
            {(stats?.enfants_a_risque || 0) > 0 ? (
              <AlertItem type="critical" message={`${stats?.enfants_a_risque} enfants nécessitent une attention urgente`} time="Maintenant" />
            ) : (
              <AlertItem type="info" message="Aucune alerte critique signalée" time="À l'instant" />
            )}
            {(stats?.relances_envoyees || 0) > 0 && (
              <AlertItem type="warning" message={`${stats?.relances_envoyees} relances SMS envoyées aujourd'hui`} time="Aujourd'hui" />
            )}
            {(stats?.enfants_en_retard || 0) > 0 && (
              <AlertItem type="warning" message={`${stats?.enfants_en_retard} enfants en retard de vaccination`} time="Données en base" />
            )}
            {(stats?.total_enfants || 0) === 0 && (
              <AlertItem type="info" message="Aucun enfant enregistré — commencez par créer des dossiers via un agent" time="État actuel" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
