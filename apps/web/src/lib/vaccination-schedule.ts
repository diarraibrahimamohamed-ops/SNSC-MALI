export const PEV_SCHEDULE: Record<string, { minAgeDays: number; label: string; sex?: 'F' | 'M' }> = {
  BCG: { minAgeDays: 0, label: 'Dès la naissance' },
  PENTA_1: { minAgeDays: 42, label: "Dès l'âge de 6 semaines" },
  VPO_1: { minAgeDays: 42, label: "Dès l'âge de 6 semaines" },
  PENTA_2: { minAgeDays: 70, label: 'À partir de 10 semaines' },
  VPO_2: { minAgeDays: 70, label: 'À partir de 10 semaines' },
  PENTA_3: { minAgeDays: 98, label: 'À partir de 14 semaines' },
  VPO_3: { minAgeDays: 98, label: 'À partir de 14 semaines' },
  VPI: { minAgeDays: 98, label: 'À partir de la 14ème semaine' },
  VIT_A: { minAgeDays: 180, label: 'À partir de 6 mois' },
  VAR: { minAgeDays: 270, label: 'À partir de 9 mois' },
  VAA: { minAgeDays: 270, label: 'À partir de 9 mois' },
  MEN_A: { minAgeDays: 270, label: 'À partir de 9 mois' },
  HPV: { minAgeDays: 3285, label: '9 à 13 ans (filles)', sex: 'F' },
};

export type StatutCalendrier = 'ADMINISTRE' | 'ELIGIBLE' | 'TROP_TOT' | 'EN_RETARD' | 'A_VENIR';

export interface VaccinEligibilite {
  vaccin_id: string;
  code: string;
  nom: string;
  eligible: boolean;
  message: string;
  date_eligible?: string | null;
  periode: string;
}

export interface EntreeCalendrier {
  vaccin_id: string;
  code: string;
  nom: string;
  periode: string;
  date_prevue: string;
  date_eligible: string;
  age_minimum_jours: number;
  age_minimum_semaines: number;
  statut: StatutCalendrier;
  eligible: boolean;
  message: string;
  administre_le?: string | null;
}

export const STATUT_LABELS: Record<StatutCalendrier, { label: string; className: string }> = {
  ADMINISTRE: { label: 'Administré', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  ELIGIBLE: { label: 'Éligible', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  TROP_TOT: { label: 'Trop tôt', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  EN_RETARD: { label: 'En retard', className: 'bg-red-100 text-red-800 border-red-200' },
  A_VENIR: { label: 'À venir', className: 'bg-slate-100 text-slate-600 border-slate-200' },
};
