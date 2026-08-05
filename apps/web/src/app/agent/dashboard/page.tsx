'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/useAuth';
import {
  AlertTriangle,
  Baby,
  CalendarDays,
  Mail,
  ShieldCheck,
  Syringe,
  FileText,
  Users,
  CalendarCheck,
  Activity,
  Clock,
  ChevronRight,
  Sparkles,
  HeartPulse,
  UserCircle,
  Bell,
  Search,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
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

// Composant pour la carte de statistique
const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  sublabel, 
  gradient, 
  trend,
  trendValue,
}: { 
  icon: any; 
  label: string; 
  value: number | string; 
  sublabel?: string;
  gradient: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}) => {
  const trendColors = {
    up: 'text-emerald-600 bg-emerald-100',
    down: 'text-red-600 bg-red-100',
    neutral: 'text-slate-600 bg-slate-100',
  };

  const trendIcons = {
    up: <TrendingUp className="h-3 w-3" />,
    down: <TrendingDown className="h-3 w-3" />,
    neutral: <Minus className="h-3 w-3" />,
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ring-1 ring-slate-200/60">
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-5 transition-opacity group-hover:opacity-10" style={{ background: gradient }} />
      
      <div className="flex items-start gap-4">
        <div className={`rounded-2xl bg-gradient-to-br ${gradient} p-3.5 text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="h-6 w-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</p>
            </div>
            {trend && (
              <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${trendColors[trend]}`}>
                {trendIcons[trend]} {trendValue}
              </span>
            )}
          </div>
          {sublabel && (
            <p className="mt-1 text-xs text-slate-400">{sublabel}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Composant pour les actions rapides
const QuickAction = ({ href, icon: Icon, label, color }: { href: string; icon: any; label: string; color: string }) => (
  <Link
    href={href}
    className={`group relative inline-flex w-full items-center justify-between gap-3 rounded-2xl ${color} px-5 py-4 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl overflow-hidden`}
  >
    <span className="flex items-center gap-3">
      <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
      {label}
    </span>
    <ChevronRight className="h-4 w-4 opacity-60 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
    <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
  </Link>
);

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
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto mb-6 h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
            <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 border-r-blue-500 border-b-purple-500 border-l-transparent animate-spin" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 animate-pulse" />
          </div>
          <p className="text-sm font-medium text-slate-500">Chargement de votre espace de travail...</p>
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

  // Calculer des tendances fictives pour l'exemple
  const trends = {
    total_enfants: { trend: 'up', value: '+12%' },
    vaccinations_aujourd_hui: { trend: 'up', value: '+8%' },
    rendez_vous_aujourd_hui: { trend: 'neutral', value: '0%' },
    relances_envoyees: { trend: 'down', value: '-3%' },
  } as const;

  return (
    <div className="space-y-8">
      {/* En-tête avec salutation et profil */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-blue-500 shadow-lg">
                <UserCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Bonjour, {user?.nom_complet || user?.matricule || 'Agent'} 👋
                </h1>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {user?.role || 'Agent de santé'}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-slate-600" />
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {todayLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="rounded-xl bg-white/10 p-2.5 text-white/70 transition-colors hover:bg-white/20 hover:text-white">
              <Bell className="h-5 w-5" />
            </button>
            <button className="rounded-xl bg-white/10 p-2.5 text-white/70 transition-colors hover:bg-white/20 hover:text-white">
              <Search className="h-5 w-5" />
            </button>
            <Link
              href="/agent/profil"
              className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
            >
              <span>Mon profil</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Enfants suivis"
          value={stats?.total_enfants || 0}
          sublabel="Tous centres CSCOM"
          gradient="from-blue-600 to-indigo-600"
          trend={trends.total_enfants.trend as 'up' | 'down' | 'neutral'}
          trendValue={trends.total_enfants.value}
        />
        <StatCard
          icon={Syringe}
          label="Vaccinations aujourd'hui"
          value={stats?.vaccinations_aujourd_hui || 0}
          sublabel="Séances complétées"
          gradient="from-emerald-600 to-teal-600"
          trend={trends.vaccinations_aujourd_hui.trend as 'up' | 'down' | 'neutral'}
          trendValue={trends.vaccinations_aujourd_hui.value}
        />
        <StatCard
          icon={CalendarCheck}
          label="Rendez-vous aujourd'hui"
          value={stats?.rendez_vous_aujourd_hui || 0}
          sublabel="Planifiés"
          gradient="from-amber-500 to-orange-600"
          trend={trends.rendez_vous_aujourd_hui.trend as 'up' | 'down' | 'neutral'}
          trendValue={trends.rendez_vous_aujourd_hui.value}
        />
        <StatCard
          icon={Mail}
          label="Relances envoyées"
          value={stats?.relances_envoyees || 0}
          sublabel="SMS aujourd'hui"
          gradient="from-purple-600 to-fuchsia-600"
          trend={trends.relances_envoyees.trend as 'up' | 'down' | 'neutral'}
          trendValue={trends.relances_envoyees.value}
        />
      </div>

      {/* Indicateurs clés + Actions rapides */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Indicateurs clés */}
        <div className="lg:col-span-2 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-500" />
              Indicateurs clés
            </h3>
            <span className="text-xs font-medium text-slate-400">Mise à jour automatique</span>
          </div>
          
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="group relative overflow-hidden rounded-2xl border-2 border-amber-100 bg-gradient-to-br from-amber-50 to-amber-100/50 p-5 transition-all hover:border-amber-300 hover:shadow-lg">
              <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-amber-200/30" />
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-500/20 p-2.5">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Enfants en retard</p>
                  <p className="text-3xl font-extrabold text-amber-800">{stats?.enfants_en_retard || 0}</p>
                </div>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-amber-200">
                <div className="h-1.5 rounded-full bg-amber-500" style={{ width: `${Math.min((stats?.enfants_en_retard || 0) * 10, 100)}%` }} />
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border-2 border-red-100 bg-gradient-to-br from-red-50 to-red-100/50 p-5 transition-all hover:border-red-300 hover:shadow-lg">
              <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-red-200/30" />
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-500/20 p-2.5">
                  <HeartPulse className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-red-700">Enfants à risque</p>
                  <p className="text-3xl font-extrabold text-red-800">{stats?.enfants_a_risque || 0}</p>
                </div>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-red-200">
                <div className="h-1.5 rounded-full bg-red-500" style={{ width: `${Math.min((stats?.enfants_a_risque || 0) * 10, 100)}%` }} />
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border-2 border-emerald-100 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-5 transition-all hover:border-emerald-300 hover:shadow-lg">
              <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-emerald-200/30" />
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-500/20 p-2.5">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Couverture vaccinale</p>
                  <p className="text-3xl font-extrabold text-emerald-800">{stats?.couverture_vaccinale || 0}%</p>
                </div>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-emerald-200">
                <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${stats?.couverture_vaccinale || 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-500" />
            Actions rapides
          </h3>
          <div className="mt-6 space-y-3">
            <QuickAction
              href="/agent/vaccination"
              icon={Syringe}
              label="Nouvelle vaccination"
              color="bg-gradient-to-r from-blue-600 to-indigo-600"
            />
            <QuickAction
              href="/agent/ajout"
              icon={Baby}
              label="Nouvel enfant"
              color="bg-gradient-to-r from-emerald-600 to-teal-600"
            />
            <QuickAction
              href="/agent/enfants"
              icon={FileText}
              label="Consulter les dossiers"
              color="bg-gradient-to-r from-violet-600 to-purple-600"
            />
            <QuickAction
              href="/agent/calendrier"
              icon={CalendarDays}
              label="Voir le calendrier"
              color="bg-gradient-to-r from-amber-500 to-orange-600"
            />
          </div>
        </div>
      </div>

      {/* Activité récente */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Dernières vaccinations */}
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Syringe className="h-5 w-5 text-emerald-500" />
              Dernières vaccinations
            </h3>
            <Link href="/agent/vaccinations" className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">
              Voir tout →
            </Link>
          </div>
          
          <div className="mt-4 space-y-3">
            {(stats?.activite_recente?.vaccinations?.length ?? 0) > 0 ? (
              stats!.activite_recente!.vaccinations.slice(0, 5).map((v, index) => (
                <div
                  key={v.id}
                  className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 transition-all hover:border-emerald-200 hover:bg-emerald-50/50 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{v.enfant_nom || 'Enfant'}</p>
                      <p className="text-xs text-slate-500">
                        {v.vaccin || 'Vaccin'} · {v.agent_nom || 'Agent'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-xs font-medium text-slate-500">
                      {v.administre_le ? new Date(v.administre_le).toLocaleDateString('fr-FR') : '—'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 text-center">
                <Syringe className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm text-slate-500">Aucune vaccination enregistrée</p>
                <p className="text-xs text-slate-400">Commencez par enregistrer une nouvelle vaccination</p>
              </div>
            )}
          </div>
        </div>

        {/* Derniers dossiers */}
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Baby className="h-5 w-5 text-blue-500" />
              Derniers dossiers
            </h3>
            <Link href="/agent/enfants" className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">
              Voir tout →
            </Link>
          </div>
          
          <div className="mt-4 space-y-3">
            {(stats?.activite_recente?.enfants?.length ?? 0) > 0 ? (
              stats!.activite_recente!.enfants.slice(0, 5).map((e) => (
                <Link
                  key={e.id}
                  href={`/agent/enfants/${e.id}`}
                  className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 transition-all hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600">
                      {e.prenom?.charAt(0) || 'E'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {e.nom} {e.prenom}
                      </p>
                      <p className="text-xs text-slate-500">{e.identifiant_sanitaire}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-xs font-medium text-slate-500">
                      {e.date_naissance ? new Date(e.date_naissance).toLocaleDateString('fr-FR') : '—'}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 text-center">
                <Baby className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm text-slate-500">Aucun enfant enregistré</p>
                <p className="text-xs text-slate-400">Commencez par ajouter un nouvel enfant</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
