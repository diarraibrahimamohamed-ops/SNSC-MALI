'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Calendar,
  Lock,
  Bell,
  Globe,
  ChevronRight,
} from 'lucide-react';

export default function AgentProfilePage() {
  const { user, isAuthenticated } = useAuth();

  const initials = user
    ? `${(user.nom_complet || user.matricule || 'AG')[0]}${(user.nom_complet || '').split(' ')[1]?.[0] || 'T'}`
    : 'AG';

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Mon Profil</h1>
        <p className="text-sm text-slate-500 mt-1">
          Consultez vos informations personnelles et vos préférences
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Carte profil principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations personnelles */}
          <div className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/60">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                Informations personnelles
              </h2>
              <span className="text-xs font-medium text-slate-400">Identité</span>
            </div>

            <div className="space-y-4">
              {/* Champs du formulaire */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">
                    Nom complet
                  </label>
                  <p className="text-sm font-semibold text-slate-900">{user?.nom_complet || 'Non renseigné'}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">
                    Matricule
                  </label>
                  <p className="text-sm font-semibold text-slate-900">{user?.matricule || 'Non renseigné'}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">
                    Email
                  </label>
                  <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400" />
                    {user?.email || 'Non renseigné'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">
                    Téléphone
                  </label>
                  <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400" />
                    {user?.telephone || 'Non renseigné'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Informations professionnelles */}
          <div className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/60">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                Informations professionnelles
              </h2>
              <span className="text-xs font-medium text-slate-400">Travail</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Rôle
                </label>
                <p className="text-sm font-semibold text-slate-900">{user?.role || 'Agent de santé'}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Centre de santé
                </label>
                <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {user?.centreSante?.nom || 'Non renseigné'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="h-4 w-4" />
                  <span>Membre depuis: {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Paramètres rapides */}
        <div className="space-y-6">
          {/* Sécurité */}
          <div className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/60">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Lock className="h-5 w-5 text-amber-500" />
              Sécurité
            </h2>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-slate-100 hover:border-slate-300">
                <span className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Changer le mot de passe
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
              <button className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-slate-100 hover:border-slate-300">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Authentification 2FA
                </span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Activé
                </span>
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/60">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-purple-500" />
              Notifications
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Rappels vaccination</span>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-500 transition-colors">
                  <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Alertes retard</span>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-500 transition-colors">
                  <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">SMS relances</span>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 transition-colors">
                  <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {/* Langue */}
          <div className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/60">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-blue-500" />
              Langue
            </h2>
            <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10">
              <option value="fr">Français</option>
              <option value="bm">Bambara</option>
              <option value="en">English</option>
            </select>
          </div>

        </div>
      </div>
    </div>
  );
}
