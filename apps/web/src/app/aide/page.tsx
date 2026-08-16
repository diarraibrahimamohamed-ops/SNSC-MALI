'use client';

import {
  HelpCircle,
  BookOpen,
  Video,
  MessageSquare,
  Phone,
  Mail,
  Search,
  ChevronRight,
  ExternalLink,
  FileText,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

const faqItems = [
  {
    question: "Comment ajouter un nouvel enfant ?",
    answer: "Allez dans la section 'Saisie médicale' dans le menu, puis remplissez le formulaire avec les informations de l'enfant (nom, prénom, date de naissance, identifiant sanitaire, etc.).",
    category: "Gestion des enfants"
  },
  {
    question: "Comment enregistrer une vaccination ?",
    answer: "Naviguez vers la section 'Vaccination', sélectionnez l'enfant concerné, choisissez le vaccin administré et la date, puis validez l'enregistrement.",
    category: "Vaccination"
  },
  {
    question: "Que signifie le statut 'RETARD' ?",
    answer: "Le statut 'RETARD' indique que l'enfant a dépassé la date recommandée pour un vaccin. Il est prioritaire pour les rappels et les relances.",
    category: "Statuts"
  },
  {
    question: "Comment fonctionnent les relances SMS ?",
    answer: "Le système envoie automatiquement des SMS aux parents pour rappeler les rendez-vous de vaccination. Vous pouvez consulter l'historique dans la section 'SMS & Relances'.",
    category: "Notifications"
  },
  {
    question: "Comment consulter le calendrier PEV ?",
    answer: "Dans la fiche d'un enfant, cliquez sur le bouton 'Voir PEV' pour afficher le calendrier de vaccination personnalisé avec toutes les dates recommandées.",
    category: "Calendrier"
  },
  {
    question: "Que faire en cas d'erreur de données ?",
    answer: "Contactez immédiatement l'administrateur système via le bouton 'Signaler un problème' ci-dessous. Ne modifiez pas les données directement sans autorisation.",
    category: "Support"
  }
];

const guides = [
  {
    title: "Guide de démarrage rapide",
    description: "Apprenez les bases de la plateforme en 5 minutes",
    icon: BookOpen,
    duration: "5 min"
  },
  {
    title: "Formation complète",
    description: "Tutoriels détaillés pour toutes les fonctionnalités",
    icon: Video,
    duration: "30 min"
  },
  {
    title: "Documentation technique",
    description: "Guide d'utilisation avancée pour les agents",
    icon: FileText,
    duration: "15 min"
  }
];

export default function AidePage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* En-tête */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 shadow-2xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
        
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <HelpCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white">Centre d'aide</h1>
              <p className="text-blue-100">Trouvez rapidement les réponses à vos questions</p>
            </div>
          </div>
          
          {/* Barre de recherche */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher dans l'aide..."
              className="w-full rounded-2xl border-0 bg-white/95 px-12 py-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none shadow-xl backdrop-blur-sm transition-all focus:ring-4 focus:ring-white/30"
            />
          </div>
        </div>
      </div>

      {/* Guides rapides */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-500" />
          Guides de formation
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {guides.map((guide, index) => {
            const Icon = guide.icon;
            return (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
              >
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-100/50 opacity-0 transition-opacity group-hover:opacity-100" />
                
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-slate-900">{guide.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{guide.description}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs font-medium text-blue-600">
                    <span>{guide.duration}</span>
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-emerald-500" />
          Questions fréquentes
        </h2>
        <div className="space-y-3">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-slate-300"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600 mb-2">
                        {item.category}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{item.question}</h3>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{item.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact support */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 p-6 border border-emerald-100">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 mb-4">
            <Phone className="h-5 w-5 text-emerald-600" />
            Support téléphonique
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Notre équipe est disponible du lundi au vendredi, de 8h à 18h.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-900">
              <Phone className="h-4 w-4 text-emerald-600" />
              +223 20 00 00 00
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Support prioritaire pour les urgences
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6 border border-blue-100">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 mb-4">
            <Mail className="h-5 w-5 text-blue-600" />
            Support par email
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Pour les questions non urgentes, envoyez-nous un email.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-900">
              <Mail className="h-4 w-4 text-blue-600" />
              support@snsc-mali.ml
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              Réponse sous 24h ouvrées
            </div>
          </div>
        </div>
      </div>

      {/* Signaler un problème */}
      <div className="rounded-3xl border-2 border-amber-200 bg-amber-50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-extrabold text-amber-900 mb-2">
              Signaler un problème technique
            </h2>
            <p className="text-sm text-amber-800 mb-4">
              En cas de bug, d'erreur de données ou de problème de sécurité, signalez-le immédiatement à l'équipe technique.
            </p>
            <button className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-600/30 transition-all hover:scale-[1.02] hover:shadow-xl" style={{ background: 'linear-gradient(to right, #d97706, #b45309)' }}>
              <ExternalLink className="h-4 w-4" />
              Signaler un problème
            </button>
          </div>
        </div>
      </div>

      {/* Liens utiles */}
      <div className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/60">
        <h2 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
          <ExternalLink className="h-5 w-5 text-purple-500" />
          Liens utiles
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <a
            href="/mentions-legales"
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-slate-100 hover:border-slate-300"
          >
            <span>Mentions légales</span>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </a>
          <a
            href="/confidentialite"
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-slate-100 hover:border-slate-300"
          >
            <span>Politique de confidentialité</span>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </a>
          <a
            href="/cgu"
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-slate-100 hover:border-slate-300"
          >
            <span>Conditions générales d'utilisation</span>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </a>
          <a
            href="/documentation"
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-slate-100 hover:border-slate-300"
          >
            <span>Documentation technique</span>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </a>
        </div>
      </div>
    </div>
  );
}
