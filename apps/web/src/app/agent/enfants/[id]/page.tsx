'use client';

import { useState, useEffect, type JSX } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/features/auth/useAuth';
import {
  ArrowLeft,
  CalendarDays,
  Syringe,
  User,
  BookOpen,
  X,
  Printer,
  Download,
  CheckCircle,
  AlertCircle,
  MapPin,
  Baby,
  Calendar,
  Heart,
  Clock,
  Activity,
  ChevronRight,
  Eye,
  FileText,
  Shield,
  Phone,
  Mail,
} from 'lucide-react';

interface DossierDetail {
  dossier: {
    id: string;
    nom: string;
    prenom: string;
    identifiant_sanitaire: string;
    date_naissance: string;
    sexe: string;
    statut_vaccinal_global: string;
    centre_sante_id?: string;
    centre_sante?: { nom: string };
    nom_pere?: string;
    nom_mere?: string;
    region?: string;
    district?: string;
    commune?: string;
    village?: string;
    telephone_parent?: string;
    email_parent?: string;
  };
  calendrier: {
    code: string;
    nom: string;
    date_prevue: string;
    statut: string;
    eligible: boolean;
    administre_le?: string;
  }[];
  actes_vaccinaux: {
    id: string;
    administre_le: string;
    vaccin_id: string;
    vaccin_nom?: string;
    numero_lot?: string;
  }[];
  rendez_vous: {
    rdvId: string;
    datePrevue: string;
    dateRelancePrevue?: string;
  }[];
  statut_vaccinal: string;
  prochaine_echeance?: {
    vaccin: string;
    date_prevue: string;
    statut: string;
  };
}

// ============================================
// COMPOSANT TABLEAU PEV MALI
// ============================================
const TableauPEV = ({
  actesVaccinaux,
  calendrier,
}: {
  actesVaccinaux: any[];
  calendrier: any[];
}) => {
  // Définition des vaccins PEV Mali avec leurs doses
  const vaccinsPEV = [
    { code: 'BCG', label: 'BCG', doses: ['0'] },
    { code: 'VPO', label: 'VPO', doses: ['0', '1', '2', '3'] },
    { code: 'VPI', label: 'VPI', doses: ['1'] },
    { code: 'PENTA', label: 'PENTA', doses: ['1', '2', '3'] },
    { code: 'PVC13', label: 'PVC 13', doses: ['1', '2', '3'] },
    { code: 'ROTA', label: 'ROTA', doses: ['1', '2', '3'] },
    { code: 'VAR', label: 'VAR', doses: ['1'] },
    { code: 'VAA', label: 'VAA', doses: ['1'] },
    { code: 'MENINGITE', label: 'Meningite', doses: ['1'] },
    { code: 'TD', label: 'Td', doses: ['1', '2', 'R'] },
    { code: 'VITAMINE_A', label: 'Vitamine A', doses: ['1'] },
    { code: 'VAR2', label: 'VAR', doses: ['1'] },
    { code: 'VAA2', label: 'VAA', doses: ['1'] },
    { code: 'MEN2', label: 'Men', doses: ['1'] },
  ];

  const isVaccinAdministered = (vaccinCode: string) => {
    return actesVaccinaux.some((acte) => {
      const nom = (acte.vaccin_nom || '').toLowerCase();
      return nom.includes(vaccinCode.toLowerCase());
    });
  };

  const isVaccinPlanned = (vaccinCode: string) => {
    return calendrier.some((c) => {
      const nom = c.nom.toLowerCase();
      return nom.includes(vaccinCode.toLowerCase()) && c.statut !== 'ADMINISTRE';
    });
  };

  const getDates = () => {
    const dates = new Set<string>();
    actesVaccinaux.forEach((acte) => {
      if (acte.administre_le) dates.add(acte.administre_le);
    });
    calendrier.forEach((c) => {
      if (c.date_prevue && c.statut !== 'ADMINISTRE') dates.add(c.date_prevue);
    });
    return Array.from(dates).sort();
  };

  const dates = getDates();

  const renderMainHeaders = () => {
    const headers: JSX.Element[] = [];
    headers.push(
      <th
        key="diagonale"
        rowSpan={2}
        className="border border-slate-800 p-0 text-center align-middle"
        style={{ minWidth: '80px', height: '60px' }}
      >
        <div className="relative w-[80px] h-[60px]">
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom right, transparent 49%, black 50%, transparent 51%)',
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[8px] font-bold uppercase">Date</span>
          </div>
          <div className="absolute inset-0 flex items-center justify-center" style={{ paddingLeft: '20px', paddingTop: '20px' }}>
            <span className="text-[8px] font-bold uppercase">Vaccin</span>
          </div>
        </div>
      </th>
    );

    vaccinsPEV.forEach((vaccin) => {
      const colSpan = vaccin.doses.length;
      headers.push(
        <th
          key={`header-${vaccin.code}`}
          colSpan={colSpan}
          className="border border-slate-800 p-1 text-[9px] font-bold uppercase bg-amber-100 text-center"
        >
          {vaccin.label}
        </th>
      );
    });

    return <tr className="bg-amber-50">{headers}</tr>;
  };

  const renderSubHeaders = () => {
    const subHeaders: JSX.Element[] = [];
    vaccinsPEV.forEach((vaccin) => {
      vaccin.doses.forEach((dose) => {
        subHeaders.push(
          <th
            key={`dose-${vaccin.code}-${dose}`}
            className="border border-slate-800 p-1 text-[8px] font-bold text-center bg-amber-50/50"
          >
            {dose}
          </th>
        );
      });
    });
    return <tr>{subHeaders}</tr>;
  };

  const renderRows = () => {
    if (dates.length === 0) {
      return (
        <tr>
          <td colSpan={50} className="border border-slate-800 p-6 text-center text-sm text-slate-500">
            Aucune vaccination enregistrée ni programmée
          </td>
        </tr>
      );
    }

    return dates.map((date) => {
      const administeredAtDate = actesVaccinaux
        .filter((a) => a.administre_le === date)
        .map((a) => (a.vaccin_nom || '').toLowerCase());

      return (
        <tr key={date} className="hover:bg-amber-50/50 transition-colors">
          <td className="border border-slate-800 p-2 text-[10px] font-semibold text-slate-700 whitespace-nowrap text-center">
            {new Date(date).toLocaleDateString('fr-FR')}
          </td>

          {vaccinsPEV.map((vaccin) => {
            return vaccin.doses.map((dose) => {
              const isAdministered = isVaccinAdministered(vaccin.code);
              const isPlanned = isVaccinPlanned(vaccin.code);
              const isAdministeredAtThisDate = administeredAtDate.some(
                (nom) => nom.includes(vaccin.code.toLowerCase())
              );

              let content = '';
              let className = 'border border-slate-800 p-1 text-center text-[10px]';

              if (isAdministered || isAdministeredAtThisDate) {
                content = '✓';
                className += ' text-emerald-600 font-bold text-base';
              } else if (isPlanned) {
                content = '○';
                className += ' text-amber-500';
              } else {
                content = '';
                className += ' text-slate-300';
              }

              return (
                <td key={`${vaccin.code}-${dose}`} className={className}>
                  {content}
                </td>
              );
            });
          })}
        </tr>
      );
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border-2 border-slate-800 text-sm">
        <thead>
          {renderMainHeaders()}
          {renderSubHeaders()}
        </thead>
        <tbody>{renderRows()}</tbody>
      </table>
    </div>
  );
};

// ============================================
// COMPOSANT MODAL PEV
// ============================================
const ModalPEV = ({
  isOpen,
  onClose,
  actesVaccinaux,
  calendrier,
  enfant,
}: {
  isOpen: boolean;
  onClose: () => void;
  actesVaccinaux: any[];
  calendrier: any[];
  enfant: any;
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-lg bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-50 p-6 shadow-2xl ring-1 ring-amber-200/50"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-white transition-colors hover:bg-slate-700 z-10"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="border-b-2 border-amber-200 pb-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
            République du Mali
          </p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
            Ministère de la Santé
          </p>
          <div className="mx-auto my-3 flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-emerald-500 bg-white">
            <span className="text-center text-[8px] font-bold text-emerald-600 leading-tight">
              PEV<br />MALI
            </span>
          </div>
          <h2 className="border-2 border-slate-800 py-1 text-lg font-bold uppercase tracking-wider text-slate-800">
            Programme Élargi de Vaccination
          </h2>
          <p className="mt-2 text-sm font-bold text-slate-600">
            {enfant?.nom} {enfant?.prenom} · {enfant?.identifiant_sanitaire}
          </p>
          <p className="text-xs text-slate-500">
            Né(e) le {enfant?.date_naissance ? new Date(enfant.date_naissance).toLocaleDateString('fr-FR') : '---'}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded bg-emerald-500"></span>
            Vaccin reçu (✓)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded border-2 border-amber-500"></span>
            Vaccin programmé (○)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded border border-slate-300"></span>
            Non administré
          </span>
        </div>

        <div className="mt-4">
          <TableauPEV actesVaccinaux={actesVaccinaux} calendrier={calendrier} />
        </div>

        <div className="mt-4 border-t-2 border-amber-200 pt-3 text-center">
          <p className="text-[8px] uppercase tracking-wider text-amber-400">
            Document officiel - PEV Mali
          </p>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-amber-300 bg-white px-4 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-50"
          >
            <Printer className="h-3.5 w-3.5" />
            Imprimer
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-xs font-semibold text-white transition hover:shadow-lg">
            <Download className="h-3.5 w-3.5" />
            Télécharger
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPOSANT CARNET MODAL
// ============================================
const CarnetModal = ({
  isOpen,
  onClose,
  enfant,
  vaccinations,
}: {
  isOpen: boolean;
  onClose: () => void;
  enfant: any;
  vaccinations: any[];
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-50 p-6 shadow-2xl ring-1 ring-amber-200/50"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-white transition-colors hover:bg-slate-700 z-10"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="border-b-2 border-amber-200 pb-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">République du Mali</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Ministère de la Santé</p>
          <div className="mx-auto my-3 flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-emerald-500 bg-white">
            <span className="text-center text-[8px] font-bold text-emerald-600 leading-tight">PEV<br />MALI</span>
          </div>
          <h2 className="border-2 border-slate-800 py-1 text-lg font-bold uppercase tracking-wider text-slate-800">
            Carte de Vaccination
          </h2>
          <p className="mt-2 text-xs font-bold text-slate-600">
            N° <span className="text-blue-800">{enfant?.identifiant_sanitaire || '---'}</span>
          </p>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <User className="mt-0.5 h-3.5 w-3.5 text-amber-600" />
            <div>
              <span className="text-[10px] font-bold uppercase text-amber-600">Nom :</span>
              <span className="ml-1 font-bold text-blue-800">{enfant?.nom || '---'}</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <User className="mt-0.5 h-3.5 w-3.5 text-amber-600" />
            <div>
              <span className="text-[10px] font-bold uppercase text-amber-600">Prénom :</span>
              <span className="ml-1 font-bold text-blue-800">{enfant?.prenom || '---'}</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar className="mt-0.5 h-3.5 w-3.5 text-amber-600" />
            <div>
              <span className="text-[10px] font-bold uppercase text-amber-600">Date naissance :</span>
              <span className="ml-1 font-bold text-blue-800">
                {enfant?.date_naissance
                  ? new Date(enfant.date_naissance).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '---'}
              </span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <User className="mt-0.5 h-3.5 w-3.5 text-amber-600" />
            <div>
              <span className="text-[10px] font-bold uppercase text-amber-600">Sexe :</span>
              <span className="ml-1 font-bold text-blue-800">
                {enfant?.sexe === 'M' ? 'Masculin' : enfant?.sexe === 'F' ? 'Féminin' : '---'}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-start gap-2">
              <User className="mt-0.5 h-3.5 w-3.5 text-amber-600" />
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-600">Père :</span>
                <span className="ml-1 font-bold text-blue-800">{enfant?.nom_pere || '---'}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <User className="mt-0.5 h-3.5 w-3.5 text-amber-600" />
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-600">Mère :</span>
                <span className="ml-1 font-bold text-blue-800">{enfant?.nom_mere || '---'}</span>
              </div>
            </div>
          </div>
          <div className="border-t border-amber-200 pt-3">
            <p className="text-[10px] font-bold uppercase text-amber-600">Lieu de résidence</p>
            <div className="mt-1 grid grid-cols-2 gap-1 text-xs">
              <div>
                <span className="font-bold text-amber-600">Région :</span>
                <span className="ml-1 font-bold text-blue-800">{enfant?.region || '---'}</span>
              </div>
              <div>
                <span className="font-bold text-amber-600">District :</span>
                <span className="ml-1 font-bold text-blue-800">{enfant?.district || '---'}</span>
              </div>
              <div>
                <span className="font-bold text-amber-600">Commune :</span>
                <span className="ml-1 font-bold text-blue-800">{enfant?.commune || '---'}</span>
              </div>
              <div>
                <span className="font-bold text-amber-600">Village :</span>
                <span className="ml-1 font-bold text-blue-800">{enfant?.village || '---'}</span>
              </div>
            </div>
            <div className="mt-1">
              <span className="text-[10px] font-bold uppercase text-amber-600">Centre :</span>
              <span className="ml-1 font-bold text-blue-800">{enfant?.centre_sante || '---'}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 border-t-2 border-amber-200 pt-3">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
            <Syringe className="h-3.5 w-3.5" />
            Vaccinations reçues
          </h3>
          <div className="mt-2 space-y-1.5">
            {vaccinations && vaccinations.length > 0 ? (
              vaccinations.map((v, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-amber-100 bg-white/50 px-3 py-1.5 text-xs"
                >
                  <span className="font-semibold text-slate-700">{v.vaccin || 'Vaccin'}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">
                      {new Date(v.date).toLocaleDateString('fr-FR')}
                    </span>
                    {v.lot && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[8px] font-bold text-amber-700">
                        Lot {v.lot}
                      </span>
                    )}
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-xs text-slate-400">Aucune vaccination enregistrée</p>
            )}
          </div>
        </div>

        <div className="mt-4 border-t-2 border-amber-200 pt-3 text-center">
          <p className="text-[8px] uppercase tracking-wider text-amber-400">Document officiel - PEV Mali</p>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-amber-300 bg-white px-4 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-50"
          >
            <Printer className="h-3.5 w-3.5" />
            Imprimer
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-xs font-semibold text-white transition hover:shadow-lg">
            <Download className="h-3.5 w-3.5" />
            Télécharger
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// PAGE PRINCIPALE
// ============================================

export default function DossierEnfantPage() {
  const params = useParams();
  const enfantId = params.id as string;
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<DossierDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [carnetOpen, setCarnetOpen] = useState(false);
  const [pevOpen, setPevOpen] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api';

  useEffect(() => {
    if (!isAuthenticated || !enfantId) return;

    const token = localStorage.getItem('auth_token');
    setLoading(true);
    setError('');

    fetch(`${API_URL}/enfants/${enfantId}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    })
      .then(async (res) => {
        if (res.status === 404) {
          setError('Enfant introuvable. Vérifiez l\'identifiant et réessayez.');
          return null;
        }
        if (!res.ok) {
          setError('Erreur lors du chargement. Veuillez réessayer ultérieurement.');
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (json?.data) setData(json.data);
      })
      .catch(() => setError('Erreur réseau. Veuillez réessayer ultérieurement.'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, enfantId, API_URL]);

  const statutColor = (s: string) => {
    if (s === 'A_JOUR' || s === 'ADMINISTRE') return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (s === 'RETARD' || s === 'EN_RETARD') return 'text-red-600 bg-red-50 border-red-100';
    if (s === 'ELIGIBLE') return 'text-blue-600 bg-blue-50 border-blue-100';
    return 'text-amber-600 bg-amber-50 border-amber-100';
  };

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center p-6">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
          <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 border-r-blue-500 border-b-purple-500 border-l-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 max-w-lg mx-auto mt-12 text-center">
        <div className="flex items-center justify-center gap-2 text-red-600 font-bold mb-4">
          <AlertCircle className="h-5 w-5" />
          <p>{error || 'Dossier introuvable'}</p>
        </div>
        <Link href="/agent/enfants" className="text-blue-600 font-semibold hover:underline">
          ← Retour à la liste
        </Link>
      </div>
    );
  }

  const { dossier, calendrier, actes_vaccinaux, prochaine_echeance } = data;

  // Préparer les données pour le carnet
  const carnetData = {
    nom: dossier.nom,
    prenom: dossier.prenom,
    identifiant_sanitaire: dossier.identifiant_sanitaire,
    date_naissance: dossier.date_naissance,
    sexe: dossier.sexe,
    nom_pere: dossier.nom_pere || '---',
    nom_mere: dossier.nom_mere || '---',
    region: dossier.region || '---',
    district: dossier.district || '---',
    commune: dossier.commune || '---',
    village: dossier.village || '---',
    centre_sante: dossier.centre_sante?.nom || '---',
  };

  const vaccinations = actes_vaccinaux?.map((a: any) => ({
    vaccin: a.vaccin_nom || `Vaccin #${a.vaccin_id}`,
    date: a.administre_le,
    lot: a.numero_lot,
  })) || [];

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Retour */}
      <Link
        href="/agent/enfants"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 font-semibold text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Retour à la liste
      </Link>

      {/* Carte principale */}
      <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/60 sm:p-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/5 blur-2xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/5 blur-2xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl font-extrabold text-white shadow-lg shadow-blue-500/25">
              {dossier.nom?.[0]}{dossier.prenom?.[0]}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">
                {dossier.nom} {dossier.prenom}
              </h1>
              <p className="text-sm text-slate-500 font-medium">{dossier.identifiant_sanitaire}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Baby className="h-3.5 w-3.5" />
                  Né(e) le {new Date(dossier.date_naissance).toLocaleDateString('fr-FR')}
                </span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span>{dossier.sexe === 'M' ? 'Garçon' : 'Fille'}</span>
                {dossier.centre_sante?.nom && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {dossier.centre_sante.nom}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className={`text-[10px] font-black uppercase px-4 py-2 rounded-xl border ${statutColor(data.statut_vaccinal)}`}>
              {data.statut_vaccinal?.replace('_', ' ')}
            </span>
            <button
              onClick={() => setPevOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] hover:shadow-xl"
              style={{ background: 'linear-gradient(to right, #2563eb, #4f46e5)' }}
            >
              <FileText className="h-4 w-4" />
              Voir PEV
            </button>
            <button
              onClick={() => setCarnetOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.02] hover:shadow-xl"
              style={{ background: 'linear-gradient(to right, #10b981, #0d9488)' }}
            >
              <BookOpen className="h-4 w-4" />
              Carnet
            </button>
          </div>
        </div>

        {/* Prochaine échéance */}
        {prochaine_echeance && (
          <div className="relative mt-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Prochaine échéance</p>
                <p className="text-sm font-extrabold text-blue-900">
                  {prochaine_echeance.vaccin}
                </p>
                <p className="text-xs text-blue-700">
                  {new Date(prochaine_echeance.date_prevue).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="ml-auto">
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  prochaine_echeance.statut === 'A_JOUR' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  <Clock className="h-3 w-3" />
                  {prochaine_echeance.statut?.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Historique + Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Historique vaccinal */}
        <div className="rounded-2xl bg-white p-6 shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/60">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Syringe className="h-5 w-5 text-emerald-500" />
              Historique vaccinal
            </h2>
            <span className="text-xs text-slate-400">{actes_vaccinaux.length} vaccins</span>
          </div>

          {actes_vaccinaux.length === 0 ? (
            <div className="mt-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 text-center">
              <Syringe className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">Aucune vaccination enregistrée</p>
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
              {actes_vaccinaux.map((a, index) => (
                <li key={a.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm transition hover:border-emerald-200 hover:bg-emerald-50/50">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-600">
                      {index + 1}
                    </span>
                    <span className="font-medium text-slate-800">
                      {new Date(a.administre_le).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  {a.numero_lot && (
                    <span className="text-xs text-slate-400">Lot: {a.numero_lot}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Actions */}
        <div className="rounded-2xl bg-white p-6 shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/60">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-blue-500" />
            Actions
          </h2>
          <div className="space-y-3">
            <Link
              href={`/agent/vaccination?enfant=${dossier.id}`}
              className="group flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-blue-600/30 hover:scale-[1.02]"
            >
              <span className="flex items-center gap-2">
                <Syringe className="h-4 w-4" />
                Enregistrer une vaccination
              </span>
              <ChevronRight className="h-4 w-4 opacity-60 transition-transform group-hover:translate-x-1" />
            </Link>
            <button
              onClick={() => setPevOpen(true)}
              className="group flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:scale-[1.02]"
              style={{ background: 'linear-gradient(to right, #9333ea, #7c3aed)' }}
            >
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Voir le calendrier PEV
              </span>
              <ChevronRight className="h-4 w-4 opacity-60 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => setCarnetOpen(true)}
              className="group flex w-full items-center justify-between rounded-xl border-2 border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-700 transition-all hover:border-emerald-400"
              style={{ backgroundColor: '#ecfdf5' }}
            >
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Ouvrir le carnet de vaccination
              </span>
              <ChevronRight className="h-4 w-4 opacity-60 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Contact parent */}
          {(dossier.telephone_parent || dossier.email_parent) && (
            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-600 flex items-center gap-2">
                <Heart className="h-3.5 w-3.5 text-rose-500" />
                Contact parent
              </p>
              <div className="mt-1 space-y-1 text-xs text-slate-500">
                {dossier.telephone_parent && (
                  <p className="flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    {dossier.telephone_parent}
                  </p>
                )}
                {dossier.email_parent && (
                  <p className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    {dossier.email_parent}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calendrier vaccinal */}
      <div className="rounded-2xl bg-white p-6 shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/60">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            Calendrier vaccinal PEV Mali
          </h2>
          <span className="text-xs text-slate-400">
            {calendrier.filter(c => c.statut === 'ADMINISTRE').length} / {calendrier.length} vaccins
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Vaccin</th>
                <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Date prévue</th>
                <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Date administrée</th>
                <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {calendrier.map((d) => (
                <tr key={d.code} className="transition-all hover:bg-slate-50/50">
                  <td className="py-3 font-medium text-slate-800">{d.nom}</td>
                  <td className="py-3 text-slate-500">
                    {new Date(d.date_prevue).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-3 text-slate-500">
                    {d.administre_le 
                      ? new Date(d.administre_le).toLocaleDateString('fr-FR')
                      : '—'}
                  </td>
                  <td className="py-3 text-right">
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border ${statutColor(d.statut)}`}>
                      {d.statut?.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==========================================
          MODALS
          ========================================== */}
      <ModalPEV
        isOpen={pevOpen}
        onClose={() => setPevOpen(false)}
        actesVaccinaux={actes_vaccinaux}
        calendrier={calendrier}
        enfant={dossier}
      />

      <CarnetModal
        isOpen={carnetOpen}
        onClose={() => setCarnetOpen(false)}
        enfant={carnetData}
        vaccinations={vaccinations}
      />
    </div>
  );
}