"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarCheck2,
  Check,
  ClipboardCheck,
  HeartPulse,
  LockKeyhole,
  Menu,
  ShieldCheck,
  Syringe,
  Users,
  X,
} from "lucide-react";

const features = [
  {
    number: "01",
    icon: Users,
    title: "Un dossier, une histoire",
    description:
      "Retrouvez les informations essentielles de chaque enfant et gardez une vision claire de son parcours vaccinal.",
    tone: "mint",
  },
  {
    number: "02",
    icon: CalendarCheck2,
    title: "Le calendrier au bon endroit",
    description:
      "Organisez les actes vaccinaux en vous appuyant sur le calendrier PEV du Mali et les règles du suivi.",
    tone: "blue",
  },
  {
    number: "03",
    icon: BarChart3,
    title: "Une vision pour mieux agir",
    description:
      "Donnez aux équipes habilitées des repères pour suivre l’activité et piloter les actions de santé.",
    tone: "gold",
  },
];

const trustItems = [
  { icon: LockKeyhole, label: "Accès par profil" },
  { icon: ClipboardCheck, label: "Dossiers structurés" },
  { icon: Activity, label: "Suivi des activités" },
];

export default function Home() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="landing-page">
      <div className="landing-background-grid" aria-hidden="true" />
      <div className="landing-orb landing-orb--top" aria-hidden="true" />
      <div className="landing-orb landing-orb--bottom" aria-hidden="true" />

      <header className="landing-header">
        <div className="landing-container landing-nav">
          <Link
            href="/"
            className="landing-brand"
            aria-label="SNSC-Mali, accueil"
            onClick={() => setMobileNavOpen(false)}
          >
            <span className="landing-brand-mark">
              <ShieldCheck size={25} strokeWidth={1.8} />
            </span>
            <span className="landing-brand-copy">
              <span className="landing-brand-name">SNSC<span>·</span>Mali</span>
              <span className="landing-brand-subtitle">Système national de suivi vaccinal</span>
            </span>
          </Link>

          <nav className="landing-desktop-nav" aria-label="Navigation principale">
            <Link href="/agent-auth" className="landing-nav-link">
              Espace Agent
            </Link>
            <Link href="/login" className="landing-nav-button">
              Administration <ArrowUpRight size={16} />
            </Link>
          </nav>

          <button
            type="button"
            className="landing-menu-button"
            aria-label={mobileNavOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileNavOpen}
            aria-controls="landing-mobile-nav"
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            {mobileNavOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        {mobileNavOpen && (
          <nav id="landing-mobile-nav" className="landing-mobile-nav" aria-label="Navigation mobile">
            <Link href="/agent-auth" onClick={() => setMobileNavOpen(false)}>
              Espace Agent <ArrowRight size={17} />
            </Link>
            <Link href="/login" onClick={() => setMobileNavOpen(false)}>
              Administration <ArrowUpRight size={17} />
            </Link>
          </nav>
        )}
      </header>

      <main>
        <section className="landing-hero landing-container">
          <div className="landing-hero-copy landing-reveal">
            <div className="landing-eyebrow">
              <span className="landing-eyebrow-dot" />
              <span>SANTÉ PUBLIQUE <span className="landing-eyebrow-divider">/</span> MALI</span>
            </div>

            <h1>
              Chaque enfant mérite un suivi vaccinal{" "}
              <span className="landing-title-accent">sans rupture.</span>
            </h1>

            <p className="landing-hero-description">
              Une plateforme collaborative pour organiser les dossiers des enfants,
              suivre le calendrier PEV du Mali et accompagner le travail des équipes
              dans les centres de santé.
            </p>

            <div className="landing-hero-actions">
              <Link href="/agent-auth" className="landing-button landing-button--primary">
                Accéder à l’espace Agent <ArrowRight size={18} />
              </Link>
              <Link href="/login" className="landing-button landing-button--secondary">
                Administration <ArrowUpRight size={17} />
              </Link>
            </div>

            <div className="landing-trust-row" aria-label="Principes de la plateforme">
              {trustItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div className="landing-trust-item" key={item.label} style={{ animationDelay: (index * 100) + "ms" }}>
                    <span className="landing-trust-icon"><Icon size={15} /></span>
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="landing-visual-wrap landing-reveal landing-reveal--delayed">
            <div className="landing-photo-card">
              <Image
                src="/images/snsc-mali-home-hero.webp"
                alt="Illustration d’une professionnelle de santé accueillant une mère et son jeune enfant dans un centre de vaccination."
                fill
                priority
                sizes="(max-width: 820px) 100vw, 50vw"
                className="landing-photo-image"
              />
              <div className="landing-photo-shade" aria-hidden="true" />
              <div className="landing-photo-topline">
                <span className="landing-photo-pill">SANTÉ DE PROXIMITÉ</span>
                <span className="landing-photo-pill landing-photo-pill--light"><HeartPulse size={14} /> PEV · MALI</span>
              </div>
              <div className="landing-photo-copy">
                <span>AU CŒUR DU SUIVI</span>
                <h2>Chaque rendez-vous compte.</h2>
                <p>Un accompagnement plus clair pour les enfants, les familles et les équipes de santé.</p>
              </div>
              <div className="landing-photo-mali-ribbon" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            </div>

              <div className="landing-floating-note landing-floating-note--left">
                <span className="landing-floating-note-icon"><ClipboardCheck size={18} /></span>
                <span><strong>Parcours structuré</strong><small>Les informations au même endroit</small></span>
              </div>
  
              <div className="landing-floating-note landing-floating-note--right">
                <span className="landing-floating-pulse" />
                <span><strong>Un outil collaboratif</strong><small>Pour les équipes de santé</small></span>
              </div>
  
          </div>
        </section>

        <section className="landing-overview-section">
          <div className="landing-container landing-overview-layout">
            <div className="landing-overview-copy landing-reveal">
              <p className="landing-overline">VUE D’ENSEMBLE</p>
              <h2>Le suivi, en un regard.</h2>
              <p className="landing-overview-description">
                Une vue claire pour organiser les dossiers, repérer les prochaines étapes
                et accompagner le suivi vaccinal au sein des structures de santé.
              </p>
              <div className="landing-overview-items">
                <article className="landing-overview-item">
                  <span className="landing-overview-item-icon"><Users size={18} /></span>
                  <span><strong>Dossiers enfants</strong><small>Un suivi centralisé</small></span>
                </article>
                <article className="landing-overview-item landing-overview-item--blue">
                  <span className="landing-overview-item-icon"><CalendarCheck2 size={18} /></span>
                  <span><strong>Calendrier vaccinal</strong><small>Repères du parcours PEV</small></span>
                </article>
                <article className="landing-overview-item landing-overview-item--gold">
                  <span className="landing-overview-item-icon"><BarChart3 size={18} /></span>
                  <span><strong>Vue de la structure</strong><small>Activité et indicateurs</small></span>
                </article>
                <article className="landing-overview-item landing-overview-item--violet">
                  <span className="landing-overview-item-icon"><Syringe size={18} /></span>
                  <span><strong>Étapes du parcours</strong><small>Informations de suivi</small></span>
                </article>
              </div>
            </div>
            <div className="landing-overview-demo landing-reveal landing-reveal--delayed">
              <div className="landing-preview">
              <div className="landing-preview-topbar">
              <div className="landing-preview-brand">
              <span className="landing-preview-mark"><HeartPulse size={17} /></span>
              <span>
              <strong>Espace de suivi</strong>
              <small>Parcours vaccinal</small>
              </span>
              </div>
              <span className="landing-preview-status"><span /> Exemple</span>
              </div>
              
              <div className="landing-preview-heading">
              <div>
              <p className="landing-overline">APERÇU DE LA PLATEFORME</p>
              <h2>Les étapes du parcours.</h2>
              </div>
              <span className="landing-preview-calendar"><CalendarCheck2 size={20} /></span>
              </div>
              
              <div className="landing-preview-summary">
              <div className="landing-summary-icon"><Users size={19} /></div>
              <div className="landing-summary-copy">
              <span>Dossiers enfants</span>
              <strong>Un suivi centralisé</strong>
              </div>
              <span className="landing-summary-check"><Check size={16} /></span>
              </div>
              
              <div className="landing-preview-section-title">
              <span>Étapes du parcours</span>
              <span className="landing-preview-muted">Illustration</span>
              </div>
              
              <div className="landing-timeline">
              <div className="landing-timeline-item">
              <span className="landing-timeline-node landing-timeline-node--complete"><Check size={12} /></span>
              <div className="landing-timeline-copy">
              <strong>Dossier de l’enfant</strong>
              <small>Informations de suivi</small>
              </div>
              <span className="landing-timeline-label landing-timeline-label--complete">Organisé</span>
              </div>
              <div className="landing-timeline-item">
              <span className="landing-timeline-node landing-timeline-node--active"><Syringe size={12} /></span>
              <div className="landing-timeline-copy">
              <strong>Calendrier vaccinal</strong>
              <small>Repères du parcours PEV</small>
              </div>
              <span className="landing-timeline-label">À suivre</span>
              </div>
              <div className="landing-timeline-item">
              <span className="landing-timeline-node"><BarChart3 size={12} /></span>
              <div className="landing-timeline-copy">
              <strong>Vue de la structure</strong>
              <small>Activité et indicateurs</small>
              </div>
              <span className="landing-timeline-label">Pilotage</span>
              </div>
              </div>
              
              <div className="landing-preview-foot">
              <ShieldCheck size={15} />
              <span>Aperçu illustratif — aucune donnée réelle</span>
              </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-feature-section">
          <div className="landing-container">
            <div className="landing-section-heading landing-reveal">
              <div>
                <p className="landing-overline">UNE PLATEFORME, TROIS LEVIERS</p>
                <h2>Du terrain au pilotage.</h2>
              </div>
              <p>
                Moins de dispersion dans les informations. Plus de clarté pour
                accompagner le suivi vaccinal.
              </p>
            </div>

            <div className="landing-feature-grid">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <article
                    key={feature.number}
                    className={"landing-feature-card landing-feature-card--" + feature.tone + " landing-reveal"}
                    style={{ animationDelay: (index * 120) + "ms" }}
                  >
                    <div className="landing-feature-card-top">
                      <span className="landing-feature-number">{feature.number}</span>
                      <span className="landing-feature-icon"><Icon size={22} strokeWidth={1.8} /></span>
                    </div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                    <span className="landing-feature-rule" />
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="landing-access-section landing-container landing-reveal">
          <div className="landing-access-panel">
            <div className="landing-access-pattern" aria-hidden="true" />
            <div className="landing-access-copy">
              <span className="landing-access-kicker"><span /> SNSC-MALI</span>
              <h2>Un meilleur suivi commence par une information bien organisée.</h2>
              <p>Accédez à votre espace selon votre rôle et vos autorisations.</p>
            </div>
            <div className="landing-access-actions">
              <Link href="/agent-auth" className="landing-button landing-button--light">
                Espace Agent <ArrowRight size={17} />
              </Link>
              <Link href="/login" className="landing-access-admin">
                Administration <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-container landing-footer-inner">
          <Link href="/" className="landing-footer-brand">
            <span className="landing-footer-mark"><ShieldCheck size={18} /></span>
            <span><strong>SNSC-Mali</strong><small>Système national de suivi vaccinal</small></span>
          </Link>
          <p>© 2026 SNSC-Mali <span>·</span> Santé, suivi et continuité</p>
          <div className="landing-footer-links">
            <Link href="/agent-auth">Espace Agent</Link>
            <Link href="/login">Administration</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
