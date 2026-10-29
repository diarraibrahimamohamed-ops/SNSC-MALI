import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  ClipboardCheck,
  LockKeyhole,
  ShieldCheck,
  Stethoscope,
  Users,
  type LucideIcon,
} from "lucide-react";

type AuthVariant = "agent" | "admin";

interface AuthShellProps {
  variant: AuthVariant;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

type AuthFeature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const variantConfig: Record<
  AuthVariant,
  {
    badge: string;
    kicker: string;
    panelTitle: string;
    description: string;
    features: AuthFeature[];
    note: string;
    icon: LucideIcon;
  }
> = {
  agent: {
    badge: "Espace Agent",
    kicker: "SUIVI DE TERRAIN",
    panelTitle: "Le suivi vaccinal commence au plus près des familles.",
    description:
      "Un espace de travail pensé pour aider les équipes de santé à organiser les dossiers et documenter les actes vaccinaux.",
    icon: Stethoscope,
    features: [
      {
        icon: Users,
        title: "Dossiers enfants",
        description: "Des informations centralisées et faciles à retrouver.",
      },
      {
        icon: CalendarCheck2,
        title: "Parcours vaccinal",
        description: "Des repères pour suivre les rendez-vous et les actes.",
      },
      {
        icon: ClipboardCheck,
        title: "Saisie encadrée",
        description: "Un parcours de saisie clair pour les agents habilités.",
      },
    ],
    note: "Les accès et les données disponibles dépendent de votre profil et de votre structure.",
  },
  admin: {
    badge: "Administration",
    kicker: "PILOTAGE & GOUVERNANCE",
    panelTitle: "Une vision claire pour mieux piloter le système.",
    description:
      "Un espace réservé aux responsables autorisés pour superviser les structures, les utilisateurs et les activités du système.",
    icon: ShieldCheck,
    features: [
      {
        icon: ShieldCheck,
        title: "Accès maîtrisés",
        description: "Une gestion des autorisations selon les rôles.",
      },
      {
        icon: Activity,
        title: "Vue d’ensemble",
        description: "Des repères pour suivre l’activité des structures.",
      },
      {
        icon: ClipboardCheck,
        title: "Traçabilité",
        description: "Des outils d’administration et de contrôle.",
      },
    ],
    note: "L’administration est réservée aux comptes habilités. Toute action reste soumise aux droits du compte.",
  },
};

export function AuthShell({
  variant,
  title,
  subtitle,
  children,
  footer,
}: AuthShellProps) {
  const config = variantConfig[variant];
  const PanelIcon = config.icon;

  return (
    <div className={"auth-page auth-page--" + variant}>
      <div className="auth-background-grid" aria-hidden="true" />
      <div className="auth-background-orb auth-background-orb--one" aria-hidden="true" />
      <div className="auth-background-orb auth-background-orb--two" aria-hidden="true" />

      <header className="auth-header">
        <div className="auth-container auth-header-inner">
          <Link href="/" className="auth-brand" aria-label="SNSC-Mali, accueil">
            <span className="auth-brand-mark">
              <ShieldCheck size={24} strokeWidth={1.8} />
            </span>
            <span className="auth-brand-copy">
              <strong>SNSC<span>·</span>Mali</strong>
              <small>Système national de suivi vaccinal</small>
            </span>
          </Link>

          <Link href="/" className="auth-back-link">
            <ArrowLeft size={16} />
            <span>Retour à l’accueil</span>
          </Link>
        </div>
      </header>

      <main className="auth-container auth-main">
        <section className="auth-presentation">
          <div className="auth-presentation-kicker">
            <span className="auth-kicker-dot" />
            <span>{config.kicker}</span>
            <span className="auth-kicker-divider">/</span>
            <span>MALI</span>
          </div>

          <div className="auth-presentation-title-wrap">
            <span className="auth-presentation-icon">
              <PanelIcon size={23} strokeWidth={1.8} />
            </span>
            <span className="auth-presentation-badge">{config.badge}</span>
          </div>

          <h1>{config.panelTitle}</h1>
          <p className="auth-presentation-description">{config.description}</p>

          <div className="auth-feature-list">
            {config.features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  className="auth-feature-item"
                  key={feature.title}
                  style={{ animationDelay: index * 90 + "ms" }}
                >
                  <span className="auth-feature-icon">
                    <Icon size={19} strokeWidth={1.8} />
                  </span>
                  <span className="auth-feature-copy">
                    <strong>{feature.title}</strong>
                    <small>{feature.description}</small>
                  </span>
                  <CheckCircle2 className="auth-feature-check" size={17} />
                </div>
              );
            })}
          </div>

          <div className="auth-information-note">
            <span className="auth-information-icon">
              <LockKeyhole size={17} />
            </span>
            <p>{config.note}</p>
          </div>
        </section>

        <section className="auth-form-side" aria-label={config.badge}>
          <div className="auth-mobile-badge">
            <span className="auth-mobile-badge-dot" />
            {config.badge}
          </div>

          <div className="auth-card">
            <div className="auth-card-topline">
              <span className="auth-card-icon">
                <LockKeyhole size={21} />
              </span>
              <span className="auth-card-security">
                <span />
                Accès sécurisé
              </span>
            </div>

            <div className="auth-card-heading">
              <p className="auth-card-eyebrow">BON RETOUR</p>
              <h2>{title}</h2>
              <p>{subtitle}</p>
            </div>

            <div className="auth-card-form">{children}</div>

            {footer ? <div className="auth-card-footer">{footer}</div> : null}
          </div>

          <div className="auth-bottom-caption">
            <ShieldCheck size={15} />
            <span>Accès réservé aux utilisateurs autorisés</span>
          </div>
        </section>
      </main>

      <footer className="auth-footer">
        <div className="auth-container auth-footer-inner">
          <span>© 2026 SNSC-Mali</span>
          <span>Santé · Suivi · Continuité</span>
          <Link href="/">Accueil <ArrowRight size={13} /></Link>
        </div>
      </footer>
    </div>
  );
}
