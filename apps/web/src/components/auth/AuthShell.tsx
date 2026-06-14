import Link from 'next/link';
import type { ReactNode } from 'react';
import { Shield, Lock, CheckCircle2, Activity, Zap } from 'lucide-react';

type AuthVariant = 'agent' | 'admin';

interface AuthShellProps {
  variant: AuthVariant;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

const variantConfig = {
  agent: {
    badge: 'Espace Agent',
    accent: 'from-emerald-500 to-emerald-600',
    accentText: 'text-emerald-400',
    accentLight: 'bg-emerald-500/10',
    accentBorder: 'border-emerald-500/30',
    accentRing: 'ring-emerald-500/20',
    accentShadow: 'shadow-emerald-500/30',
    panel: 'Suivi vaccinal sur le terrain',
    description:
      'Accès réservé aux agents de santé pour l\'enregistrement des dossiers enfants et des actes vaccinaux.',
    features: [
      { icon: Lock, text: 'Connexion sécurisée par matricule' },
      { icon: Activity, text: 'Synchronisation temps réel' },
      { icon: CheckCircle2, text: 'Validation automatique PEV' }
    ]
  },
  admin: {
    badge: 'Administration',
    accent: 'from-slate-600 to-slate-700',
    accentText: 'text-slate-400',
    accentLight: 'bg-slate-500/10',
    accentBorder: 'border-slate-500/30',
    accentRing: 'ring-slate-500/20',
    accentShadow: 'shadow-slate-500/30',
    panel: 'Pilotage du système',
    description:
      'Accès réservé au personnel administrateur pour la gestion des centres, des agents et du suivi national.',
    features: [
      { icon: Shield, text: 'Gestion centralisée des accès' },
      { icon: Activity, text: 'Tableaux de bord analytiques' },
      { icon: Zap, text: 'Audit et rapports détaillés' }
    ]
  },
};

export function AuthShell({ variant, title, subtitle, children, footer }: AuthShellProps) {
  const config = variantConfig[variant];

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
        {[...Array(15)].map((_, i) => (
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

      {/* Header */}
      <header className="relative border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${config.accent} text-white shadow-2xl ${config.accentShadow} animate-glow`}>
                <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <p className="font-bold text-white leading-tight">Vaccin-Track Mali</p>
                <p className="text-xs text-emerald-300">Système National de Suivi Vaccinal</p>
              </div>
            </Link>
            <Link href="/" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative mx-auto max-w-7xl">
        <div className="grid min-h-[calc(100vh-5.5rem)] lg:grid-cols-2">
          {/* Left Panel - Desktop Only */}
          <div className="hidden lg:flex flex-col justify-center px-12 py-16 bg-gradient-to-br from-white/5 to-white/10 border-r border-white/10 backdrop-blur-sm">
            <div className={`inline-flex w-fit items-center gap-2 px-4 py-2 rounded-full ${config.accentLight} border ${config.accentBorder} mb-8 backdrop-blur-sm`}>
              <div className={`w-2 h-2 rounded-full ${config.accentText} animate-pulse`} />
              <span className={`text-xs font-semibold ${config.accentText}`}>{config.badge}</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-white mb-6 animate-slide-up">
              {config.panel}
            </h1>

            <p className="text-base leading-relaxed text-slate-300 mb-10 max-w-md animate-slide-up" style={{ animationDelay: '0.1s' }}>
              {config.description}
            </p>

            {/* Features List */}
            <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              {config.features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div key={i} className="flex items-start gap-3 group">
                    <div className={`flex-shrink-0 h-8 w-8 rounded-xl ${config.accentLight} border ${config.accentBorder} flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform`}>
                      <Icon className={`h-4 w-4 ${config.accentText}`} />
                    </div>
                    <span className="text-sm text-slate-300 font-medium group-hover:text-white transition-colors">{feature.text}</span>
                  </div>
                );
              })}
            </div>

            {/* Bottom Decoration */}
            <div className="mt-auto pt-12 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className={`p-5 rounded-2xl ${config.accentLight} border ${config.accentBorder} backdrop-blur-sm`}>
                <p className={`text-sm font-semibold ${config.accentText}`}>Plateforme Gouvernementale</p>
                <p className="text-xs text-slate-400 mt-2">Système National de Suivi de la Couverture Vaccinale (SNSC)</p>
              </div>
            </div>
          </div>

          {/* Right Panel - Form */}
          <main className="flex flex-col justify-center px-6 lg:px-12 py-12 lg:py-16">
            <div className="w-full max-w-md mx-auto">
              {/* Mobile Badge */}
              <div className="lg:hidden mb-8">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${config.accentLight} border ${config.accentBorder} backdrop-blur-sm`}>
                  <div className={`w-2 h-2 rounded-full ${config.accentText} animate-pulse`} />
                  <span className={`text-xs font-semibold ${config.accentText}`}>{config.badge}</span>
                </div>
              </div>

              {/* Form Container */}
              <div className={`rounded-2xl border ${config.accentBorder} bg-white/5 backdrop-blur-xl p-8 shadow-2xl ring-1 ${config.accentRing} animate-scale-in`}>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white leading-tight">{title}</h2>
                  <p className="text-sm text-slate-400 mt-2">{subtitle}</p>
                </div>

                {/* Form Children */}
                <div className="mb-6">{children}</div>

                {/* Footer */}
                {footer && (
                  <div className="border-t border-white/10 pt-6 text-center text-sm">
                    {footer}
                  </div>
                )}
              </div>

              {/* Security Badge */}
              <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500">
                <Lock className="w-4 h-4" />
                <span>Connexion sécurisée (HTTPS)</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
