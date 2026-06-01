'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

        // Fetch Stats
        const statsRes = await fetch(`${API_URL}/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const statsData = await statsRes.json();

        setStats(statsData.data);
      } catch (error) {
        console.error('Erreur lors du chargement des données', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
          Vue d'ensemble du système de vaccination
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
              <div className="mt-1 text-sm font-semibold text-gray-700">
                Total Enfants
              </div>
              <div className="mt-0.5 text-sm text-gray-500">
                Enregistrés dans le système
              </div>
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
              <div className="mt-1 text-sm font-semibold text-gray-700">
                Vaccinations Aujourd'hui
              </div>
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
              <div className="mt-1 text-sm font-semibold text-gray-700">
                Rendez-vous Aujourd'hui
              </div>
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
              <div className="mt-1 text-sm font-semibold text-gray-700">
                Relances Envoyées
              </div>
              <div className="mt-0.5 text-sm text-gray-500">SMS envoyés aujourd'hui</div>
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
              <div className="mt-1 text-sm font-semibold text-gray-700">
                Enfants à Risque
              </div>
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
              <div className="mt-1 text-sm font-semibold text-gray-700">
                Couverture Vaccinale
              </div>
              <div className="mt-0.5 text-sm text-gray-500">Taux national</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h4 className="text-lg font-bold text-gray-900">Distribution des Risques</h4>
            <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
              Analyse IA
            </span>
          </div>

          <div className="mt-6 flex min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-red-200 bg-gradient-to-br from-red-50 to-red-100 p-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-red-700 shadow-sm">
              <AlertTriangle className="h-9 w-9" />
            </div>
            <div className="mt-4 text-base font-semibold text-gray-800">Graphique des risques</div>
            <div className="mt-1 text-sm text-gray-600">Analyse prédictive en cours</div>
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 font-semibold text-gray-900">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-600" />
              {stats?.enfants_a_risque || 0} enfants à risque élevé
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
            <div className="mt-1 text-sm text-gray-600">Objectif OMS: 95%</div>
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
              <div className="text-sm font-semibold">Voir l’audit</div>
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h4 className="text-lg font-bold text-gray-900">Alertes Critiques</h4>
          <div className="mt-6 space-y-4">
            <div className="flex gap-4 rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100 p-4 text-red-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold">Stock vaccins faible</div>
                <div className="mt-0.5 text-sm opacity-80">BCG - 15 doses restantes</div>
              </div>
            </div>

            <div className="flex gap-4 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-4 text-amber-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold">RDV manqués</div>
                <div className="mt-0.5 text-sm opacity-80">12 aujourd'hui</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-8">
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/40 shadow-xl shadow-slate-200/50">
            <h3 className="font-bold text-xl text-slate-800 mb-6 flex items-center gap-3">
              <span className="p-2 bg-red-100 rounded-xl text-red-600">🚨</span>
              Alertes Système
            </h3>
            <div className="space-y-5">
              {stats?.enfants_a_risque > 0 ? (
                <AlertItem type="critical" message={`${stats?.enfants_a_risque} enfants nécessitent une attention urgente`} time="Maintenant" />
              ) : (
                <AlertItem type="info" message="Aucune alerte critique signalée" time="À l'instant" />
              )}
              {stats?.relances_envoyees > 0 && (
                <AlertItem type="warning" message={`${stats?.relances_envoyees} relances SMS ont été envoyées aujourd'hui`} time="Aujourd'hui" />
              )}
              <AlertItem type="info" message="Synchronisation de la base de données réussie" time="Il y a 1h" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
