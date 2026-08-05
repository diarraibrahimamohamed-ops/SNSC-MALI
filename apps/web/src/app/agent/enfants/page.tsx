'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/useAuth';
import {
  Search,
  Plus,
  User,
  Calendar,
  MapPin,
  Shield,
  ChevronRight,
  Sparkles,
  Users,
  Filter,
  ArrowUpDown,
  Eye,
  Clock,
  Baby,
  AlertCircle,
  CheckCircle,
  XCircle,
  UserCircle,
  UserCog,
  Heart,
  Activity,
  CalendarDays,
  FileText,
  Bell,
  ChevronDown,
  Loader2,
  Menu,
  Home,
  Settings,
  HelpCircle,
  LogOut,
  BarChart3,
  PieChart,
  TrendingUp,
  Target,
  Award,
  Star,
  BadgeCheck,
  PlusCircle,
  MinusCircle,
  AlertTriangle,
} from 'lucide-react';

interface Enfant {
  id: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  sexe: string;
  statut_vaccinal_global: string;
  identifiant_sanitaire: string;
}

// Composant pour le sexe avec icône
const SexeIcon = ({ sexe }: { sexe: string }) => {
  if (sexe === 'M') {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
        <User className="h-4 w-4" />
      </div>
    );
  }
  if (sexe === 'F') {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-pink-600">
        <Heart className="h-4 w-4" />
      </div>
    );
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
      <UserCircle className="h-4 w-4" />
    </div>
  );
};

// Statut vaccinal avec icône
const StatutVaccinal = ({ statut }: { statut: string }) => {
  const statusMap: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    'A_JOUR': {
      label: 'À jour',
      color: 'text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-200',
      icon: CheckCircle,
    },
    'RETARD': {
      label: 'En retard',
      color: 'text-red-700',
      bg: 'bg-red-50 border-red-200',
      icon: XCircle,
    },
    'PARTIEL': {
      label: 'Partiel',
      color: 'text-amber-700',
      bg: 'bg-amber-50 border-amber-200',
      icon: AlertTriangle,
    },
  };

  const info = statusMap[statut] || {
    label: 'Inconnu',
    color: 'text-slate-500',
    bg: 'bg-slate-50 border-slate-200',
    icon: AlertCircle,
  };

  const IconComponent = info.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold ${info.bg} ${info.color}`}
    >
      <IconComponent className="h-3.5 w-3.5" />
      {info.label}
    </span>
  );
};

export default function EnfantsPage() {
  const [enfants, setEnfants] = useState<Enfant[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatut, setFilterStatut] = useState<string>('tous');
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

  const filteredEnfants = enfants
    .filter(e => {
      const matchSearch = `${e.nom} ${e.prenom}`.toLowerCase().includes(search.toLowerCase()) ||
        e.identifiant_sanitaire?.toLowerCase().includes(search.toLowerCase());
      
      if (filterStatut === 'tous') return matchSearch;
      return matchSearch && e.statut_vaccinal_global?.toLowerCase() === filterStatut.toLowerCase();
    });

  const getInitials = (nom: string, prenom: string) => {
    return `${nom[0] || ''}${prenom[0] || ''}`.toUpperCase();
  };

  const getAge = (dateNaissance: string) => {
    const birth = new Date(dateNaissance);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const stats = {
    total: enfants.length,
    aJour: enfants.filter(e => e.statut_vaccinal_global === 'A_JOUR').length,
    enRetard: enfants.filter(e => e.statut_vaccinal_global === 'RETARD').length,
    partiel: enfants.filter(e => e.statut_vaccinal_global === 'PARTIEL').length,
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ==========================================
          HEADER AVEC STATISTIQUES
          ========================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-blue-500 shadow-lg shadow-emerald-500/25">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Enfants suivis</h1>
                <p className="text-sm text-slate-400">
                  Gestion des dossiers vaccinaux des enfants
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/agent/ajout"
            className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-white/20 hover:scale-[1.02] ring-1 ring-white/20"
          >
            <Plus className="h-4 w-4" />
            Nouvel enfant
          </Link>
        </div>

        {/* Statistiques avec icônes */}
        <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-400" />
              <p className="text-xs font-medium text-slate-400">Total</p>
            </div>
            <p className="text-2xl font-extrabold text-white">{stats.total}</p>
          </div>
          <div className="rounded-2xl bg-emerald-500/10 p-4 ring-1 ring-emerald-500/20">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <p className="text-xs font-medium text-emerald-400">À jour</p>
            </div>
            <p className="text-2xl font-extrabold text-emerald-400">{stats.aJour}</p>
          </div>
          <div className="rounded-2xl bg-red-500/10 p-4 ring-1 ring-red-500/20">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-400" />
              <p className="text-xs font-medium text-red-400">En retard</p>
            </div>
            <p className="text-2xl font-extrabold text-red-400">{stats.enRetard}</p>
          </div>
          <div className="rounded-2xl bg-amber-500/10 p-4 ring-1 ring-amber-500/20">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <p className="text-xs font-medium text-amber-400">Partiel</p>
            </div>
            <p className="text-2xl font-extrabold text-amber-400">{stats.partiel}</p>
          </div>
        </div>
      </div>

      {/* ==========================================
          BARRE DE RECHERCHE ET FILTRES
          ========================================== */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou ID sanitaire..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {[
            { value: 'tous', label: 'Tous', icon: Users },
            { value: 'A_JOUR', label: 'À jour', icon: CheckCircle },
            { value: 'RETARD', label: 'En retard', icon: XCircle },
            { value: 'PARTIEL', label: 'Partiel', icon: AlertTriangle },
          ].map((option) => {
            const Icon = option.icon;
            const isActive = filterStatut === option.value;
            return (
              <button
                key={option.value}
                onClick={() => setFilterStatut(option.value)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ==========================================
          TABLEAU DES ENFANTS
          ========================================== */}
      <div className="rounded-3xl bg-white/70 backdrop-blur-xl shadow-xl shadow-slate-200/50 ring-1 ring-white/50 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-24">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
              <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-emerald-500 border-b-purple-500 border-l-transparent animate-spin" />
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 animate-pulse" />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-500">Chargement des dossiers...</p>
          </div>
        ) : filteredEnfants.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-24">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
              <Baby className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-700">Aucun enfant trouvé</h3>
            <p className="text-sm text-slate-400">
              {search ? 'Aucun résultat pour cette recherche' : 'Commencez par enregistrer un nouvel enfant'}
            </p>
            {!search && (
              <Link
                href="/agent/ajout"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Ajouter un enfant
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200/60 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5" />
                      Enfant
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      Âge
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <div className="flex items-center gap-2">
                      <UserCircle className="h-3.5 w-3.5" />
                      Sexe
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <div className="flex items-center gap-2">
                      <Shield className="h-3.5 w-3.5" />
                      Statut vaccinal
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <div className="flex items-center justify-end gap-2">
                      <Activity className="h-3.5 w-3.5" />
                      Action
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEnfants.map((enfant) => {
                  const age = getAge(enfant.date_naissance);
                  const initials = getInitials(enfant.nom, enfant.prenom);

                  return (
                    <tr
                      key={enfant.id}
                      className="group transition-all hover:bg-slate-50/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 text-sm font-bold text-blue-600">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {enfant.nom} {enfant.prenom}
                            </p>
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {enfant.identifiant_sanitaire}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-sm font-medium text-slate-700">
                            {age} {age <= 1 ? 'an' : 'ans'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <SexeIcon sexe={enfant.sexe} />
                      </td>
                      <td className="px-6 py-4">
                        <StatutVaccinal statut={enfant.statut_vaccinal_global} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/agent/enfants/${enfant.id}`}
                          className="group inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition-all hover:bg-blue-600 hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                          Voir
                          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==========================================
          FOOTER DE LA PAGE
          ========================================== */}
      <div className="flex flex-col items-center justify-between gap-3 text-xs text-slate-400 sm:flex-row">
        <div className="flex items-center gap-4">
          <p>
            {filteredEnfants.length} enfant{filteredEnfants.length > 1 ? 's' : ''} affiché
          </p>
          {filterStatut !== 'tous' && (
            <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
              <Filter className="h-3 w-3" />
              {filterStatut.replace('_', ' ')}
            </span>
          )}
          {search && (
            <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
              <Search className="h-3 w-3" />
              {search}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Dernière mise à jour : {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}