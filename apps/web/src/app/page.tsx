'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Lock, Zap, Users, BarChart3, Shield, ArrowRight, Activity, Database, Globe, Menu, X } from 'lucide-react';

export default function Home() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 overflow-hidden relative">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSI+PHBhdGggZD0iTTAgNjBWMG02MCAwVjYwIi8+PC9nPjwvc3ZnPg==')] opacity-30" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-emerald-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Navigation Header */}
      <header className="relative border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-2xl shadow-emerald-500/30 animate-glow">
                <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <p className="font-bold text-white leading-tight">Vaccin-Track Mali</p>
                <p className="text-xs text-emerald-300">Système National de Suivi Vaccinal</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <nav className="hidden md:flex items-center gap-3">
                <Link
                  href="/agent-auth"
                  className="px-5 py-2.5 text-sm font-medium text-white rounded-xl border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 backdrop-blur-sm"
                >
                  Espace Agent
                </Link>
                <Link
                  href="/login"
                  className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50"
                >
                  Administration
                </Link>
              </nav>

              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white shadow-sm shadow-black/10 transition hover:bg-white/15 md:hidden"
                aria-label="Ouvrir le menu"
                onClick={() => setMobileNavOpen((open) => !open)}
              >
                {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileNavOpen ? (
          <div className="md:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-6 py-4 space-y-3">
              <Link
                href="/agent-auth"
                className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-medium text-white hover:bg-white/10 transition"
                onClick={() => setMobileNavOpen(false)}
              >
                Espace Agent
              </Link>
              <Link
                href="/login"
                className="block rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white hover:from-emerald-600 hover:to-emerald-700 transition"
                onClick={() => setMobileNavOpen(false)}
              >
                Administration
              </Link>
            </div>
          </div>
        ) : null}
      </header>

      {/* Hero Section */}
      <main className="relative mx-auto max-w-7xl px-6">
        <div className="py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 rounded-full border border-emerald-400/30 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-300">Plateforme Collaborative</span>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
                  Suivi vaccinal <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300">intelligent</span> pour chaque enfant
                </h1>
                <p className="text-lg text-slate-300 leading-relaxed max-w-lg">
                  Plateforme collaborative pour la gestion centralisée des dossiers vaccins, du calendrier PEV Mali et des actes vaccinaux dans les centres de santé.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/agent-auth"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-2xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105"
                >
                  <span>Connexion Agent</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white font-semibold rounded-2xl border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 backdrop-blur-sm hover:scale-105"
                >
                  Accès Administration
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
                {[
                  { label: 'Accès Sécurisé', value: '100%', icon: Lock },
                  { label: 'Synchronisation', value: 'Temps réel', icon: Activity },
                  { label: 'Conformité PEV', value: 'Vérifiée', icon: CheckCircle2 },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="flex flex-col items-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                      <Icon className="w-6 h-6 text-emerald-400 mb-2" />
                      <span className="text-sm text-slate-400">{stat.label}</span>
                      <span className="text-xl font-bold text-white">{stat.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Feature Cards */}
            <div className="grid grid-cols-1 gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              {[
                {
                  icon: Users,
                  title: 'Gestion des Dossiers',
                  desc: 'Création et suivi des dossiers enfants par centre de santé.',
                  color: 'emerald',
                },
                {
                  icon: CheckCircle2,
                  title: 'Vaccination Contrôlée',
                  desc: 'Saisie automatisée avec respect du calendrier PEV Mali.',
                  color: 'blue',
                },
                {
                  icon: BarChart3,
                  title: 'Tableaux de Bord',
                  desc: 'Suivi administratif et pilotage en temps réel.',
                  color: 'amber',
                },
                {
                  icon: Shield,
                  title: 'Sécurité Avancée',
                  desc: 'Authentification par matricule et controle d\'acces RBAC.',
                  color: 'red',
                },
              ].map((feature, i) => {
                const Icon = feature.icon;
                return (
                <div key={i} className="flex gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300 group cursor-default hover:scale-[1.02]">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white
                    ${feature.color === 'emerald' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30' :
                      feature.color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30' :
                      feature.color === 'amber' ? 'bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/30' :
                      'bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30'}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white group-hover:text-emerald-300 transition-colors">{feature.title}</p>
                    <p className="text-sm text-slate-400 mt-1">{feature.desc}</p>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
            <p>© 2026 Vaccin-Track Mali · Système National de Suivi de la Couverture Vaccinale</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
              <a href="#" className="hover:text-white transition-colors">Conditions</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
