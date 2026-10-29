import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Baby,
  CalendarCheck2,
  HeartPulse,
  LockKeyhole,
  ShieldCheck,
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

type StoryFeature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type StoryConfig = {
  badge: string;
  storyTitle: string[];
  storyDescription: string;
  features: StoryFeature[];
  bottomNote: string;
  roleIcon: LucideIcon;
};

const storyConfig: Record<AuthVariant, StoryConfig> = {
  agent: {
    badge: "Espace agent de santé",
    storyTitle: ["Protéger aujourd’hui,", "assurer demain."],
    storyDescription:
      "Vaccin-Track accompagne les agents de santé dans le suivi vaccinal des enfants et des mères au Mali.",
    roleIcon: Users,
    features: [
      {
        icon: ShieldCheck,
        title: "Suivi vaccinal",
        description: "sécurisé",
      },
      {
        icon: Users,
        title: "Meilleure couverture",
        description: "vaccinale",
      },
      {
        icon: HeartPulse,
        title: "Des enfants",
        description: "en bonne santé",
      },
    ],
    bottomNote: "Un suivi plus clair, au plus près des familles.",
  },
  admin: {
    badge: "Espace d’administration",
    storyTitle: ["Espace d’administration"],
    storyDescription:
      "Un accès dédié au pilotage, à la supervision et à la continuité du suivi vaccinal.",
    roleIcon: ShieldCheck,
    features: [
      {
        icon: ShieldCheck,
        title: "Gestion des données",
        description: "et des utilisateurs",
      },
      {
        icon: Activity,
        title: "Suivi et supervision",
        description: "du système",
      },
      {
        icon: BarChart3,
        title: "Tableaux de bord",
        description: "et rapports",
      },
    ],
    bottomNote: "Une administration efficace au service de la santé publique.",
  },
};

function Brand() {
  return (
    <Link href="/" className="vt-auth-brand" aria-label="SNSC-MALI Vaccin-Track, accueil">
      <span className="vt-auth-brand-mark" aria-hidden="true">
        <HeartPulse size={31} strokeWidth={1.8} />
        <span className="vt-auth-brand-dot vt-auth-brand-dot--green" />
        <span className="vt-auth-brand-dot vt-auth-brand-dot--gold" />
      </span>
      <span className="vt-auth-brand-copy">
        <strong>SNSC-MALI</strong>
        <em>Vaccin-Track</em>
        <small>Système Centralisé de Suivi Vaccinal<br />avec IA Prédictive</small>
      </span>
    </Link>
  );
}

export function AuthShell({
  variant,
  title,
  subtitle,
  children,
  footer,
}: AuthShellProps) {
  const config = storyConfig[variant];
  const RoleIcon = config.roleIcon;

  return (
    <div className={"vt-auth-page vt-auth-page--" + variant}>
      <section className={"vt-auth-story vt-auth-story--" + variant} aria-label="Présentation de Vaccin-Track">
        <div className="vt-auth-story-image" aria-hidden="true" />
        <div className="vt-auth-story-shade" aria-hidden="true" />

        <div className="vt-auth-story-top">
          <Brand />
        </div>

        <div className="vt-auth-story-content">
          <div className="vt-auth-story-mobile-label">
            <span />
            SANTÉ PUBLIQUE · MALI
          </div>
          <h1 className="vt-auth-story-title">
            {config.storyTitle.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h1>
          <p className="vt-auth-story-description">{config.storyDescription}</p>

          <div className="vt-auth-story-features">
            {config.features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div className="vt-auth-story-feature" key={feature.title}>
                  <span className="vt-auth-story-feature-icon">
                    <Icon size={22} strokeWidth={1.8} />
                  </span>
                  <span className="vt-auth-story-feature-copy">
                    <strong>{feature.title}</strong>
                    <small>{feature.description}</small>
                  </span>
                </div>
              );
            })}
          </div>

          <p className="vt-auth-story-note">{config.bottomNote}</p>
          {variant === "admin" ? (
            <div className="vt-auth-mali-colors" aria-label="Couleurs du drapeau du Mali">
              <span />
              <span />
              <span />
            </div>
          ) : null}
        </div>

        <div className="vt-auth-story-watermark" aria-hidden="true">
          <Baby size={124} strokeWidth={0.8} />
        </div>
      </section>

      <section className="vt-auth-panel" aria-label={config.badge}>
        <div className="vt-auth-panel-inner">
          <div className="vt-auth-mobile-brand">
            <Brand />
          </div>

          <div className="vt-auth-card">
            <div className="vt-auth-role-badge">
              <span className="vt-auth-role-icon">
                <RoleIcon size={21} strokeWidth={2} />
              </span>
              <span>{config.badge}</span>
            </div>

            <div className="vt-auth-card-heading">
              <h2>{title}</h2>
              <p>{subtitle}</p>
            </div>

            <div className="vt-auth-card-form">{children}</div>

            <div className="vt-auth-help">
              <span className="vt-auth-help-icon" aria-hidden="true">
                <Activity size={18} />
              </span>
              <div>
                <strong>Besoin d’aide ?</strong>
                <p>Contactez votre superviseur ou le support technique de votre structure.</p>
              </div>
            </div>

            {footer ? <div className="vt-auth-card-footer">{footer}</div> : null}

            <div className="vt-auth-secure-caption">
              <LockKeyhole size={14} />
              <span>Connexion sécurisée</span>
            </div>
          </div>
        </div>

        <footer className="vt-auth-footer">
          <div className="vt-auth-footer-brand">
            <span className="vt-auth-footer-flag" aria-hidden="true">
              <i /><i /><i />
            </span>
            <strong>SNSC-MALI / Vaccin-Track</strong>
          </div>
          <span className="vt-auth-footer-message">
            Ensemble pour une vaccination efficace et un avenir en bonne santé
          </span>
          <span className="vt-auth-footer-tags">Mali · Santé · Enfants · Futur</span>
        </footer>
      </section>
    </div>
  );
}
