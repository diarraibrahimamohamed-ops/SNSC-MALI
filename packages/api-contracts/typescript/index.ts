// Types générés à partir de l'OpenAPI pour Vaccin-Track

export interface Enfant {
  id: string;
  uuid: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  sexe: 'M' | 'F';
  lieu_naissance: string;
  centre_sante_id: string;
  created_at: string;
  updated_at: string;
  tuteurs?: Tuteur[];
  actes_vaccinaux?: ActeVaccinal[];
}

export interface Tuteur {
  id: string;
  uuid: string;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  adresse?: string;
  relation: string;
  created_at: string;
  updated_at: string;
}

export interface CentreSante {
  id: string;
  uuid: string;
  nom: string;
  adresse: string;
  telephone: string;
  email?: string;
  ville: string;
  region: string;
  created_at: string;
  updated_at: string;
}

export interface Vaccin {
  id: string;
  nom: string;
  description?: string;
  type?: string;
  created_at: string;
  updated_at: string;
}

export interface ActeVaccinal {
  id: string;
  enfant_id: string;
  vaccin_id: string;
  agent_id: string;
  date_vaccination: string;
  dose: number;
  lot_vaccin?: string;
  effets_secondaires?: string;
  created_at: string;
  updated_at: string;
  enfant?: Enfant;
  vaccin?: Vaccin;
  agent?: Agent;
}

export interface Agent {
  id: string;
  uuid: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: string;
  centre_sante_id: string;
  created_at: string;
  updated_at: string;
  centre_sante?: CentreSante;
}

export interface RendezVous {
  id: string;
  uuid: string;
  enfant_id: string;
  centre_sante_id: string;
  agent_id: string;
  date_rendez_vous: string;
  motif: string;
  statut: 'planifié' | 'confirmé' | 'annulé' | 'terminé';
  notes?: string;
  created_at: string;
  updated_at: string;
  enfant?: Enfant;
  centre_sante?: CentreSante;
  agent?: Agent;
}

export interface NotificationSms {
  id: string;
  uuid: string;
  enfant_id: string;
  telephone: string;
  message: string;
  statut: 'envoyé' | 'en_attente' | 'échoué';
  date_envoi?: string;
  created_at: string;
  updated_at: string;
  enfant?: Enfant;
}

export interface ScoreRisque {
  id: string;
  uuid: string;
  enfant_id: string;
  score: number;
  niveau: 'faible' | 'moyen' | 'élevé';
  facteurs?: string;
  date_evaluation: string;
  created_at: string;
  updated_at: string;
  enfant?: Enfant;
}

export interface JournalAudit {
  id: string;
  utilisateur_id: string;
  action: string;
  ressource: string;
  ressource_id?: string;
  ip_address: string;
  user_agent: string;
  details?: string;
  created_at: string;
  utilisateur?: Agent;
}

// Types pour les requêtes API
export interface CreateEnfantRequest {
  nom: string;
  prenom: string;
  date_naissance: string;
  sexe: 'M' | 'F';
  lieu_naissance: string;
  centre_sante_id: string;
  tuteurs: Omit<Tuteur, 'id' | 'uuid' | 'created_at' | 'updated_at'>[];
}

export interface UpdateEnfantRequest {
  nom?: string;
  prenom?: string;
  date_naissance?: string;
  sexe?: 'M' | 'F';
  lieu_naissance?: string;
  centre_sante_id?: string;
}

export interface CreateActeVaccinalRequest {
  enfant_id: string;
  vaccin_id: string;
  date_vaccination: string;
  dose: number;
  lot_vaccin?: string;
  effets_secondaires?: string;
}

export interface CreateRendezVousRequest {
  enfant_id: string;
  date_rendez_vous: string;
  motif: string;
  notes?: string;
}

export interface CreateCentreSanteRequest {
  nom: string;
  adresse: string;
  telephone: string;
  email?: string;
  ville: string;
  region: string;
}

export interface CreateVaccinRequest {
  nom: string;
  description?: string;
  type?: string;
}

// Types pour les réponses API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// Types pour l'authentification
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: Agent;
  expires_at?: string;
}

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  centre_sante_id?: string;
}

// Types pour le dashboard
export interface DashboardStats {
  total_enfants: number;
  vaccinations_aujourd_hui: number;
  rendez_vous_aujourd_hui: number;
  relances_envoyees: number;
  enfants_a_risque: number;
  couverture_vaccinale: number;
}

// Types pour l'évaluation de risque
export interface RisqueEvaluationRequest {
  enfant_id: string;
  features: Record<string, any>;
}

export interface RisqueEvaluationResponse {
  enfant_id: string;
  risque_score: number;
  risque_level: 'low' | 'medium' | 'high';
  confidence: number;
  features: Record<string, any>;
  explications: Record<string, any>;
  timestamp: string;
}

// Enums
export enum Role {
  ADMIN = 'admin',
  AGENT = 'agent',
  SUPER_ADMIN = 'super_admin'
}

export enum StatutVaccinal {
  A_JOUR = 'à_jour',
  EN_RETARD = 'en_retard',
  NON_VACCINE = 'non_vacciné'
}

export enum StatutRendezVous {
  PLANIFIE = 'planifié',
  CONFIRME = 'confirmé',
  ANNULE = 'annulé',
  TERMINÉ = 'terminé'
}

export enum StatutSms {
  ENVOYE = 'envoyé',
  EN_ATTENTE = 'en_attente',
  ECHOUE = 'échoué'
}

export enum NiveauRisque {
  FAIBLE = 'faible',
  MOYEN = 'moyen',
  ÉLEVÉ = 'élevé'
}
