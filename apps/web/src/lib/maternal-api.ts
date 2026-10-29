export type Mere = {
  id: string;
  identifiant_sanitaire?: string | null;
  nom: string;
  prenom?: string | null;
  date_naissance?: string | null;
  telephone?: string | null;
  langue_preferee?: string | null;
  centre_sante_id: string;
};

export type Grossesse = {
  id: string;
  date_debut_estimee: string;
  terme_estime?: string | null;
  nombre_foetus: number;
  statut: string;
  statut_validation: string;
  version_protocole?: string | null;
};

export type ExamenPrenatal = {
  id: string;
  code_examen: string;
  nom_examen: string;
  categorie: string;
  statut_resultat: 'EN_ATTENTE' | 'DISPONIBLE' | 'NON_REALISE' | 'NON_APPLICABLE' | string;
  resultat_texte?: string | null;
  resultat_numerique?: string | number | null;
  unite?: string | null;
  date_prelevement?: string | null;
  date_resultat?: string | null;
  laboratoire?: string | null;
  statut_validation: string;
  source_donnee?: string | null;
};

export type ChronologieItem = {
  id: string;
  type: string;
  date: string;
  statut?: string | null;
  provenance?: string | null;
  prochaine_etape?: string | null;
  orientation?: string | null;
  vaccin?: string | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export async function maternalApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = typeof window === 'undefined' ? null : localStorage.getItem('auth_token');
  const response = await fetch(`${API_URL}/v1${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || 'La requête n’a pas pu être traitée.');
  }

  return response.json() as Promise<T>;
}

export function labelEtat(statut?: string | null): string {
  if (!statut) return 'Non renseigné';
  return statut.replaceAll('_', ' ').toLowerCase().replace(/^./, (char) => char.toUpperCase());
}
