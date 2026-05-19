'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Baby,
  CalendarDays,
  Mail,
  ShieldAlert,
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
}

interface RecentActivity {
  id: number;
  type: 'vaccination' | 'rendez_vous' | 'alerte';
  titre: string;
  description: string;
  heure: string;
  statut: 'success' | 'warning' | 'info';
}

type AgentInfo = {
  email?: string;
  prenom?: string;
  nom?: string;
  centre?: string;
};

export default function AgentDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(null);

  useEffect(() => {
    const storedAgent = localStorage.getItem('agentInfo');
    if (storedAgent) {
      setAgentInfo(JSON.parse(storedAgent));
    }

    setTimeout(() => {
      setStats({
        total_enfants: 156,
        vaccinations_aujourd_hui: 12,
        rendez_vous_aujourd_hui: 8,
        relances_envoyees: 24,
        enfants_a_risque: 3,
        couverture_vaccinale: 87,
        enfants_en_retard: 5,
        vaccins_disponibles: 45,
      });
      setLoading(false);
    }, 800);
  }, []);

  const recentActivities: RecentActivity[] = useMemo(
    () => [
      {
        id: 1,
        type: 'vaccination',
        titre: 'Vaccination BCG',
        description: 'Traoré Aïssata - 2 mois',
        heure: '10:30',
        statut: 'success',
      },
      {
        id: 2,
        type: 'rendez_vous',
        titre: 'Rendez-vous manqué',
        description: 'Konaté Mohamed - VPO',
        heure: '09:15',
        statut: 'warning',
      },
      {
        id: 3,
        type: 'alerte',
        titre: 'Stock faible',
        description: 'Vaccin ROR - 10 doses restantes',
        heure: '08:45',
        statut: 'info',
      },
    ],
    []
  );

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

  const statusClasses: Record<RecentActivity['statut'], string> = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
    info: 'border-blue-200 bg-blue-50 text-blue-700',
  };

  const activityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'vaccination':
        return <Syringe className="h-5 w-5" />;
      case 'rendez_vous':
        return <CalendarDays className="h-5 w-5" />;
      case 'alerte':
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="mt-2 text-slate-600">
          Bienvenue {agentInfo?.prenom || 'Agent'} - Voici votre activité du jour
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
              <div className="text-sm font-semibold text-slate-600">Vaccinations aujourd'hui</div>
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
              <div className="text-sm font-semibold text-slate-600">Rendez-vous aujourd'hui</div>
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
              <div className="text-xs text-slate-500">SMS aujourd'hui</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-900">Activités récentes</h3>
          <div className="mt-6 space-y-3">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className={
                  'flex items-start gap-3 rounded-2xl border p-4 ' +
                  statusClasses[activity.statut]
                }
              >
                <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/60">
                  {activityIcon(activity.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-sm font-semibold">{activity.titre}</div>
                    <div className="shrink-0 text-xs text-slate-500">{activity.heure}</div>
                  </div>
                  <div className="mt-1 text-sm text-slate-600">{activity.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-lg font-bold text-slate-900">Actions rapides</h3>
          <div className="mt-6 space-y-3">
            <Link
              href="/agent/vaccinations"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Nouvelle vaccination
            </Link>
            <Link
              href="/agent/rendez-vous"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Planifier RDV
            </Link>
            <Link
              href="/agent/enfants"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Ajouter un enfant
            </Link>
            <Link
              href="/agent/rapports"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-700"
            >
              <ShieldAlert className="h-5 w-5" />
              Envoyer rappels
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-600">Enfants en retard</div>
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div className="mt-4 text-3xl font-extrabold text-rose-600">{stats?.enfants_en_retard || 0}</div>
          <div className="mt-2 text-sm text-slate-600">Nécessitent une attention</div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-600">Stock de vaccins</div>
            <Syringe className="h-5 w-5 text-blue-600" />
          </div>
          <div className="mt-4 text-3xl font-extrabold text-blue-600">{stats?.vaccins_disponibles || 0}</div>
          <div className="mt-2 text-sm text-slate-600">Doses disponibles</div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-600">Couverture vaccinale</div>
            <Mail className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="mt-4 text-3xl font-extrabold text-emerald-600">{stats?.couverture_vaccinale || 0}%</div>
          <div className="mt-2 text-sm text-slate-600">Taux actuel</div>
        </div>
      </div>
    </div>
  );
}
