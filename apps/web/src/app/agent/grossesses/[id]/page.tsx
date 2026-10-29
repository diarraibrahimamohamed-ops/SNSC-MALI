'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Baby, CalendarCheck2, CircleAlert, ClipboardPlus, Loader2, Plus, Stethoscope } from 'lucide-react';
import { CatalogueMesure, CatalogueSymptome, ExamenPrenatal, labelEtat, maternalApi, RendezVousPrenatal, SymptomePrenatal } from '@/lib/maternal-api';

type Contact = {
  id: string;
  contact_le: string;
  type_contact: string;
  age_gestationnel_semaines?: number | null;
  statut_validation: string;
  prochaine_etape?: string | null;
  prochain_rendez_vous_le?: string | null;
};

type Mesure = {
  id: string;
  type_mesure: string;
  valeur: string | number;
  unite: string;
  mesuree_le: string;
  methode?: string | null;
  source_donnee?: string | null;
  statut_validation: string;
};

type ExamenAttendu = {
  id: string;
  version_protocole: string;
  code_examen: string;
  nom_examen: string;
  categorie: string;
  modalite: string;
  semaine_min?: number | null;
  semaine_max?: number | null;
  source_reference: string;
  suivi: 'RESULTAT_ENREGISTRE' | 'AUCUN_RESULTAT_ENREGISTRE' | string;
  dernier_resultat?: { statut_resultat: string; statut_validation: string; date_resultat?: string | null } | null;
};
type ExamensAttendusResponse = {
  data: ExamenAttendu[];
  meta: {
    version_protocole?: string | null;
    reference_configuree: boolean;
    age_gestationnel_estime_semaines?: number | null;
    message: string;
  };
};
type ExamensResponse = { data: { data: ExamenPrenatal[] } };
type SymptomesResponse = { data: { data: SymptomePrenatal[] } };
type CatalogueSymptomesResponse = { data: CatalogueSymptome[] };
type CatalogueMesuresResponse = { data: CatalogueMesure[] };
type RendezVousResponse = { data: { data: RendezVousPrenatal[] } };

type FormRendezVous = { prevu_le: string; type_rendez_vous: string; libelle: string; rappel_programme_le: string };
type BrouillonStatutRendezVous = { statut: string; nouvelle_date: string; nouveau_rappel_programme_le: string; motif: string };

type FormSymptome = {
  code_symptome: string;
  statut_declaration: string;
  source_declaration: string;
  declare_le: string;
  debut_estime_le: string;
  intensite_declaree: string;
  precision: string;
  observations: string;
};

type FormExamen = {
  code_examen: string;
  nom_examen: string;
  categorie: string;
  statut_resultat: string;
  resultat_texte: string;
  resultat_numerique: string;
  unite: string;
  date_prelevement: string;
  date_resultat: string;
  laboratoire: string;
};


type GrossesseDetail = {
  id: string;
  date_debut_estimee: string;
  terme_estime?: string | null;
  nombre_foetus: number;
  statut: string;
  statut_validation: string;
  mere: { id: string; nom: string; prenom?: string | null };
  contacts: Contact[];
  mesures: Mesure[];
  accouchement?: { id: string; accouchement_le: string; issue: string; type_accouchement?: string | null } | null;
};

const initialContact = {
  contact_le: '',
  type_contact: 'CPN',
  age_gestationnel_semaines: '',
  prochaine_etape: '',
  prochain_rendez_vous_le: '',
  version_protocole: '',
};

const initialMeasurement = {
  type_mesure: 'POIDS_MATERNEL',
  type_mesure_personnalisee: '',
  valeur: '',
  unite: 'kg',
  mesuree_le: '',
  methode: '',
};

const initialSymptome: FormSymptome = {
  code_symptome: 'AUTRE',
  statut_declaration: 'SIGNALE',
  source_declaration: 'DECLARE_PAR_MERE',
  declare_le: '',
  debut_estime_le: '',
  intensite_declaree: '',
  precision: '',
  observations: '',
};

const initialDelivery = {
  accouchement_le: '',
  issue: 'NAISSANCE_VIVANTE',
  type_accouchement: 'VOIE_BASSE',
  nouveau_ne_enfant_ids: '',
};

const initialExam: FormExamen = {
  code_examen: '',
  nom_examen: '',
  categorie: 'HEMATOLOGIE',
  statut_resultat: 'EN_ATTENTE',
  resultat_texte: '',
  resultat_numerique: '',
  unite: '',
  date_prelevement: '',
  date_resultat: '',
  laboratoire: '',
};

const initialRendezVous: FormRendezVous = {
  prevu_le: '',
  type_rendez_vous: 'CPN',
  libelle: 'Consultation prénatale',
  rappel_programme_le: '',
};


export default function GrossesseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [grossesse, setGrossesse] = useState<GrossesseDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contact, setContact] = useState(initialContact);
  const [measurement, setMeasurement] = useState(initialMeasurement);
  const [examens, setExamens] = useState<ExamenPrenatal[]>([]);
  const [examensAttendus, setExamensAttendus] = useState<ExamenAttendu[]>([]);
  const [metaExamenAttendus, setMetaExamenAttendus] = useState<ExamensAttendusResponse['meta'] | null>(null);
  const [examForm, setExamForm] = useState<FormExamen>(initialExam);
  const [symptomes, setSymptomes] = useState<SymptomePrenatal[]>([]);
  const [catalogueSymptomes, setCatalogueSymptomes] = useState<CatalogueSymptome[]>([]);
  const [catalogueMesures, setCatalogueMesures] = useState<CatalogueMesure[]>([]);
  const [symptomeForm, setSymptomeForm] = useState<FormSymptome>(initialSymptome);
  const [rendezVous, setRendezVous] = useState<RendezVousPrenatal[]>([]);
  const [rendezVousForm, setRendezVousForm] = useState<FormRendezVous>(initialRendezVous);
  const [statutBrouillons, setStatutBrouillons] = useState<Record<string, BrouillonStatutRendezVous>>({});
  const [accouchement, setAccouchement] = useState(initialDelivery);

  const recupererGrossesse = useCallback(async (): Promise<{
    grossesse: GrossesseDetail;
    examens: ExamenPrenatal[];
    examensAttendus: ExamenAttendu[];
    metaExamenAttendus: ExamensAttendusResponse['meta'];
    symptomes: SymptomePrenatal[];
    rendezVous: RendezVousPrenatal[];
    catalogueSymptomes: CatalogueSymptome[];
    catalogueMesures: CatalogueMesure[];
  }> => {
    const [result, examensResult, examensAttendusResult, symptomesResult, rendezVousResult, catalogueSymptomesResult, catalogueMesuresResult] = await Promise.all([
      maternalApi<{ data: GrossesseDetail }>(`/grossesses/${id}`),
      maternalApi<ExamensResponse>(`/grossesses/${id}/examens`),
      maternalApi<ExamensAttendusResponse>(`/grossesses/${id}/examens-attendus`),
      maternalApi<SymptomesResponse>(`/grossesses/${id}/symptomes`),
      maternalApi<RendezVousResponse>(`/grossesses/${id}/rendez-vous`),
      maternalApi<CatalogueSymptomesResponse>('/catalogues/symptomes-prenataux'),
      maternalApi<CatalogueMesuresResponse>('/catalogues/mesures-cliniques'),
    ]);
    return {
      grossesse: {
        ...result.data,
        contacts: result.data.contacts ?? [],
        mesures: result.data.mesures ?? [],
      },
      examens: examensResult.data.data ?? [],
      examensAttendus: examensAttendusResult.data ?? [],
      metaExamenAttendus: examensAttendusResult.meta,
      symptomes: symptomesResult.data.data ?? [],
      rendezVous: rendezVousResult.data.data ?? [],
      catalogueSymptomes: catalogueSymptomesResult.data ?? [],
      catalogueMesures: catalogueMesuresResult.data ?? [],
    };
  }, [id]);

  const appliquerDossier = useCallback((result: Awaited<ReturnType<typeof recupererGrossesse>>) => {
    setGrossesse(result.grossesse);
    setExamens(result.examens);
    setExamensAttendus(result.examensAttendus);
    setMetaExamenAttendus(result.metaExamenAttendus);
    setSymptomes(result.symptomes);
    setRendezVous(result.rendezVous);
    setCatalogueSymptomes(result.catalogueSymptomes);
    setCatalogueMesures(result.catalogueMesures);
    setMeasurement((current) => {
      if (current.type_mesure === 'AUTRE') return current;
      const selected = result.catalogueMesures.find((item) => item.code === current.type_mesure)
        ?? result.catalogueMesures[0];
      return selected ? { ...current, type_mesure: selected.code, unite: selected.unite } : current;
    });
  }, []);

  const charger = async () => {
    try {
      const result = await recupererGrossesse();
      appliquerDossier(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger la grossesse.');
    }
  };

  useEffect(() => {
    let active = true;

    const chargerInitial = async () => {
      try {
        const data = await recupererGrossesse();
        if (active) {
          appliquerDossier(data);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Impossible de charger la grossesse.');
          setGrossesse(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    if (id) void chargerInitial();
    return () => {
      active = false;
    };
  }, [id, recupererGrossesse, appliquerDossier]);

  const ajouterContact = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await maternalApi(`/grossesses/${id}/contacts`, {
        method: 'POST',
        body: JSON.stringify({
          ...contact,
          age_gestationnel_semaines: contact.age_gestationnel_semaines
            ? Number(contact.age_gestationnel_semaines)
            : undefined,
          prochaine_etape: contact.prochaine_etape || undefined,
          prochain_rendez_vous_le: contact.prochain_rendez_vous_le || undefined,
          version_protocole: contact.version_protocole || undefined,
        }),
      });
      setContact(initialContact);
      await charger();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Le contact n’a pas été enregistré.');
    } finally {
      setSaving(false);
    }
  };

  const ajouterMesure = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const typeMesure = measurement.type_mesure === 'AUTRE'
      ? measurement.type_mesure_personnalisee.trim()
      : measurement.type_mesure;
    if (!typeMesure) {
      setError('Précisez le type de mesure lorsque « Autre » est choisi.');
      setSaving(false);
      return;
    }
    try {
      await maternalApi(`/grossesses/${id}/mesures`, {
        method: 'POST',
        body: JSON.stringify({
          type_mesure: typeMesure,
          valeur: Number(measurement.valeur),
          unite: measurement.unite.trim(),
          mesuree_le: measurement.mesuree_le,
          methode: measurement.methode || undefined,
        }),
      });
      setMeasurement(initialMeasurement);
      await charger();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'La mesure clinique n’a pas été enregistrée.');
    } finally {
      setSaving(false);
    }
  };

  const ajouterRendezVous = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await maternalApi(`/grossesses/${id}/rendez-vous`, {
        method: 'POST',
        body: JSON.stringify({
          prevu_le: rendezVousForm.prevu_le,
          type_rendez_vous: rendezVousForm.type_rendez_vous,
          libelle: rendezVousForm.libelle.trim(),
          rappel_programme_le: rendezVousForm.rappel_programme_le || undefined,
        }),
      });
      setRendezVousForm(initialRendezVous);
      await charger();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Le rendez-vous n’a pas été enregistré.');
    } finally {
      setSaving(false);
    }
  };

  const modifierStatutRendezVous = async (event: FormEvent, item: RendezVousPrenatal) => {
    event.preventDefault();
    const draft = statutBrouillons[item.id] ?? {
      statut: 'REALISE',
      nouvelle_date: '',
      nouveau_rappel_programme_le: '',
      motif: '',
    };

    if (draft.statut === 'REPORTE' && !draft.nouvelle_date) {
      setError('Choisissez la nouvelle date pour reporter le rendez-vous.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await maternalApi(`/rendez-vous-prenataux/${item.id}/statut`, {
        method: 'PATCH',
        body: JSON.stringify({
          statut: draft.statut,
          nouvelle_date: draft.statut === 'REPORTE' ? draft.nouvelle_date : undefined,
          nouveau_rappel_programme_le: draft.statut === 'REPORTE' && draft.nouveau_rappel_programme_le
            ? draft.nouveau_rappel_programme_le
            : undefined,
          motif: draft.motif.trim() || undefined,
        }),
      });
      setStatutBrouillons((previous) => {
        const next = { ...previous };
        delete next[item.id];
        return next;
      });
      await charger();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Le statut du rendez-vous n’a pas été mis à jour.');
    } finally {
      setSaving(false);
    }
  };

  const ajouterSymptome = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    if (symptomeForm.code_symptome === 'AUTRE' && !symptomeForm.precision.trim()) {
      setError('Précisez le symptôme lorsque « Autre » est choisi.');
      setSaving(false);
      return;
    }

    try {
      await maternalApi(`/grossesses/${id}/symptomes`, {
        method: 'POST',
        body: JSON.stringify({
          code_symptome: symptomeForm.code_symptome,
          statut_declaration: symptomeForm.statut_declaration,
          source_declaration: symptomeForm.source_declaration,
          declare_le: symptomeForm.declare_le,
          debut_estime_le: symptomeForm.debut_estime_le || undefined,
          intensite_declaree: symptomeForm.statut_declaration === 'SIGNALE' && symptomeForm.intensite_declaree !== ''
            ? Number(symptomeForm.intensite_declaree)
            : undefined,
          precision: symptomeForm.precision.trim() || undefined,
          observations: symptomeForm.observations.trim() || undefined,
        }),
      });
      setSymptomeForm(initialSymptome);
      await charger();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Le symptôme déclaré n’a pas été enregistré.');
    } finally {
      setSaving(false);
    }
  };

  const ajouterExamen = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    if (
      examForm.statut_resultat === 'DISPONIBLE'
      && !examForm.resultat_texte.trim()
      && !examForm.resultat_numerique.trim()
    ) {
      setError('Pour un examen disponible, renseignez le résultat textuel ou numérique.');
      setSaving(false);
      return;
    }

    try {
      await maternalApi(`/grossesses/${id}/examens`, {
        method: 'POST',
        body: JSON.stringify({
          code_examen: examForm.code_examen.trim(),
          nom_examen: examForm.nom_examen.trim(),
          categorie: examForm.categorie,
          statut_resultat: examForm.statut_resultat,
          resultat_texte: examForm.resultat_texte.trim() || undefined,
          resultat_numerique: examForm.resultat_numerique.trim()
            ? Number(examForm.resultat_numerique)
            : undefined,
          unite: examForm.unite.trim() || undefined,
          date_prelevement: examForm.date_prelevement || undefined,
          date_resultat: examForm.date_resultat || undefined,
          laboratoire: examForm.laboratoire.trim() || undefined,
        }),
      });
      setExamForm(initialExam);
      await charger();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Le résultat d’examen n’a pas été enregistré.');
    } finally {
      setSaving(false);
    }
  };

  const enregistrerAccouchement = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await maternalApi(`/grossesses/${id}/accouchement`, {
        method: 'POST',
        body: JSON.stringify({
          accouchement_le: accouchement.accouchement_le,
          issue: accouchement.issue,
          type_accouchement: accouchement.type_accouchement,
          nouveau_ne_enfant_ids: accouchement.nouveau_ne_enfant_ids
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean),
        }),
      });
      await charger();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'L’accouchement n’a pas été enregistré.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-[45vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-rose-600" /></div>;
  }

  if (!grossesse) return <p className="text-sm text-slate-600">Grossesse introuvable.</p>;

  return (
    <div className="space-y-6">
      <Link href={`/agent/meres/${grossesse.mere.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-rose-700">
        <ArrowLeft className="h-4 w-4" />{grossesse.mere.nom} {grossesse.mere.prenom}
      </Link>

      {error && (
        <div role="alert" className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <CircleAlert className="h-5 w-5 shrink-0" />{error}
        </div>
      )}

      <header className="rounded-3xl bg-gradient-to-br from-rose-700 to-orange-500 p-6 text-white shadow-xl">
        <p className="text-sm font-semibold text-rose-100">Parcours prénatal</p>
        <h1 className="mt-1 text-3xl font-extrabold">Grossesse · {labelEtat(grossesse.statut)}</h1>
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-rose-50">
          <span>Début estimé : {new Date(grossesse.date_debut_estimee).toLocaleDateString('fr-ML')}</span>
          <span>·</span>
          <span>Terme : {grossesse.terme_estime ? new Date(grossesse.terme_estime).toLocaleDateString('fr-ML') : 'non renseigné'}</span>
          <span>·</span>
          <span>{grossesse.nombre_foetus} fœtus</span>
        </div>
        <p className="mt-3 text-xs text-rose-50">Les observations et mesures restent à vérifier par un professionnel habilité. Cette page ne pose aucun diagnostic.</p>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-rose-600" />
              <h2 className="font-bold text-slate-900">Contacts prénataux</h2>
            </div>
            <form onSubmit={ajouterContact} className="mb-6 grid grid-cols-1 gap-3 rounded-2xl bg-rose-50/60 p-4 md:grid-cols-2">
              <Champ label="Date et heure" type="datetime-local" value={contact.contact_le} required onChange={(contact_le) => setContact({ ...contact, contact_le })} />
              <label className="grid gap-1 text-sm font-medium text-slate-700">Type de contact
                <select value={contact.type_contact} onChange={(event) => setContact({ ...contact, type_contact: event.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none ring-rose-200 focus:ring-2">
                  <option value="CPN">CPN</option><option value="VISITE_DOMICILE">Visite à domicile</option><option value="TELECONSULTATION">Téléconsultation</option><option value="AUTRE">Autre</option>
                </select>
              </label>
              <Champ label="Âge gestationnel (semaines)" type="number" value={contact.age_gestationnel_semaines} onChange={(age_gestationnel_semaines) => setContact({ ...contact, age_gestationnel_semaines })} />
              <Champ label="Prochaine étape" value={contact.prochaine_etape} onChange={(prochaine_etape) => setContact({ ...contact, prochaine_etape })} />
              <Champ label="Prochain rendez-vous (date prévue)" type="date" value={contact.prochain_rendez_vous_le} onChange={(prochain_rendez_vous_le) => setContact({ ...contact, prochain_rendez_vous_le })} />
              <Champ label="Version du protocole" value={contact.version_protocole} onChange={(version_protocole) => setContact({ ...contact, version_protocole })} />
              <div className="flex items-end">
                <button disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">
                  <Plus className="h-4 w-4" />Ajouter le contact
                </button>
              </div>
            </form>
            <div className="space-y-3">
              {grossesse.contacts.length ? grossesse.contacts.map((element) => (
                <article key={element.id} className="rounded-2xl border border-slate-100 p-4">
                  <div className="flex flex-wrap justify-between gap-3">
                    <p className="font-semibold text-slate-900">{labelEtat(element.type_contact)}</p>
                    <time className="text-xs text-slate-500">{new Date(element.contact_le).toLocaleString('fr-ML')}</time>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">Âge gestationnel : {element.age_gestationnel_semaines ?? 'non renseigné'} semaines · {labelEtat(element.statut_validation)}</p>
                  {element.prochaine_etape && <p className="mt-2 text-sm text-slate-700">Étape suivante : {element.prochaine_etape}</p>}
                  {element.prochain_rendez_vous_le && <p className="mt-2 text-sm font-semibold text-rose-700">Prochain rendez-vous prévu : {new Date(element.prochain_rendez_vous_le).toLocaleDateString('fr-ML')}</p>}
                </article>
              )) : <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">Aucun contact prénatal enregistré.</p>}
            </div>
          </section>

          <section className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <CalendarCheck2 className="h-5 w-5 text-indigo-700" />
              <h2 className="font-bold text-slate-900">Calendrier des rendez-vous</h2>
            </div>
            <p className="mb-5 text-sm text-slate-600">
              Cette liste suit les rendez-vous planifiés et leurs changements de statut. Un rappel SMS n’est envoyé que si un consentement actif pour cette finalité existe et si le fournisseur SMS est configuré.
            </p>
            <form onSubmit={ajouterRendezVous} className="mb-6 grid grid-cols-1 gap-3 rounded-2xl bg-indigo-50/60 p-4 md:grid-cols-2">
              <Champ label="Date prévue" type="date" value={rendezVousForm.prevu_le} required onChange={(prevu_le) => setRendezVousForm({ ...rendezVousForm, prevu_le })} />
              <label className="grid gap-1 text-sm font-medium text-slate-700">Type
                <select value={rendezVousForm.type_rendez_vous} onChange={(event) => setRendezVousForm({ ...rendezVousForm, type_rendez_vous: event.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none ring-indigo-200 focus:ring-2">
                  <option value="CPN">Consultation prénatale</option><option value="EXAMEN">Examen</option><option value="ECHOGRAPHIE">Échographie</option><option value="POSTPARTUM">Post-partum</option><option value="AUTRE">Autre</option>
                </select>
              </label>
              <Champ label="Libellé" value={rendezVousForm.libelle} required onChange={(libelle) => setRendezVousForm({ ...rendezVousForm, libelle })} />
              <Champ label="Date et heure du rappel (facultatif)" type="datetime-local" value={rendezVousForm.rappel_programme_le} onChange={(rappel_programme_le) => setRendezVousForm({ ...rendezVousForm, rappel_programme_le })} />
              <div className="md:col-span-2">
                <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">
                  <Plus className="h-4 w-4" />Planifier le rendez-vous
                </button>
              </div>
            </form>
            <div className="space-y-3">
              {rendezVous.length ? rendezVous.map((item) => {
                const draft = statutBrouillons[item.id] ?? {
                  statut: 'REALISE',
                  nouvelle_date: '',
                  nouveau_rappel_programme_le: '',
                  motif: '',
                };
                return (
                  <article key={item.id} className="rounded-2xl border border-slate-100 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{item.libelle}</p>
                        <p className="mt-1 text-sm text-slate-600">{labelEtat(item.type_rendez_vous)} · {new Date(item.prevu_le).toLocaleDateString('fr-ML')}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.statut === 'PLANIFIE' ? 'bg-indigo-50 text-indigo-800' : item.statut === 'REALISE' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>{labelEtat(item.statut)}</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">Rappel : {labelEtat(item.rappel_statut)}{item.rappel_envoye_le ? ` · Envoyé le ${new Date(item.rappel_envoye_le).toLocaleString('fr-ML')}` : ''}{item.rappel_tentatives ? ` · Tentatives : ${item.rappel_tentatives}` : ''}</p>
                    {item.statut === 'PLANIFIE' && (
                      <form onSubmit={(event) => modifierStatutRendezVous(event, item)} className="mt-4 grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-3 md:grid-cols-2">
                        <label className="grid gap-1 text-sm font-medium text-slate-700">Mettre à jour le statut
                          <select value={draft.statut} onChange={(event) => setStatutBrouillons((previous) => ({ ...previous, [item.id]: { ...draft, statut: event.target.value } }))} className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none ring-indigo-200 focus:ring-2">
                            <option value="REALISE">Réalisé</option><option value="MANQUE">Manqué</option><option value="ANNULE">Annulé</option><option value="REPORTE">Reporter</option>
                          </select>
                        </label>
                        {draft.statut === 'REPORTE' && <Champ label="Nouvelle date" type="date" value={draft.nouvelle_date} required onChange={(nouvelle_date) => setStatutBrouillons((previous) => ({ ...previous, [item.id]: { ...draft, nouvelle_date } }))} />}
                        {draft.statut === 'REPORTE' && <Champ label="Rappel du nouveau rendez-vous (facultatif)" type="datetime-local" value={draft.nouveau_rappel_programme_le} onChange={(nouveau_rappel_programme_le) => setStatutBrouillons((previous) => ({ ...previous, [item.id]: { ...draft, nouveau_rappel_programme_le } }))} />}
                        <label className="grid gap-1 text-sm font-medium text-slate-700 md:col-span-2">Motif / note facultative
                          <textarea value={draft.motif} onChange={(event) => setStatutBrouillons((previous) => ({ ...previous, [item.id]: { ...draft, motif: event.target.value } }))} rows={2} maxLength={1000} className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none ring-indigo-200 focus:ring-2" />
                        </label>
                        <div className="md:col-span-2"><button disabled={saving} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">Enregistrer le statut</button></div>
                      </form>
                    )}
                    {item.statut !== 'PLANIFIE' && item.motif && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">Note : {item.motif}</p>}
                  </article>
                );
              }) : <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">Aucun rendez-vous planifié dans cette grossesse.</p>}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-rose-700" />
              <h2 className="font-bold text-slate-900">Symptômes déclarés</h2>
            </div>
            <p className="mb-4 text-sm text-slate-600">
              Enregistrez ce qui a été déclaré ou observé, avec la source. Cet historique ne confirme pas un diagnostic et aucun score automatique n’est calculé.
            </p>
            <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Une déclaration de symptôme ne doit pas être filtrée par un score informatique. En présence d’un signe inquiétant, contactez sans attendre une structure de santé ou un professionnel compétent.
            </div>
            <form onSubmit={ajouterSymptome} className="mb-6 grid grid-cols-1 gap-3 rounded-2xl bg-rose-50/60 p-4 md:grid-cols-2">
              <label className="grid gap-1 text-sm font-medium text-slate-700">Symptôme
                <select value={symptomeForm.code_symptome} onChange={(event) => setSymptomeForm({ ...symptomeForm, code_symptome: event.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none ring-rose-200 focus:ring-2">
                  {catalogueSymptomes.map((item) => <option key={item.code} value={item.code}>{item.libelle}</option>)}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-medium text-slate-700">État de la déclaration
                <select value={symptomeForm.statut_declaration} onChange={(event) => setSymptomeForm({ ...symptomeForm, statut_declaration: event.target.value, intensite_declaree: event.target.value === 'SIGNALE' ? symptomeForm.intensite_declaree : '' })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none ring-rose-200 focus:ring-2">
                  <option value="SIGNALE">Signalé présent</option><option value="NON_SIGNALE">Non signalé</option><option value="NON_EVALUE">Non évalué</option>
                </select>
              </label>
              <label className="grid gap-1 text-sm font-medium text-slate-700">Source
                <select value={symptomeForm.source_declaration} onChange={(event) => setSymptomeForm({ ...symptomeForm, source_declaration: event.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none ring-rose-200 focus:ring-2">
                  <option value="DECLARE_PAR_MERE">Déclaré par la mère</option><option value="DECLARE_PAR_ACCOMPAGNANT">Déclaré par un accompagnant</option><option value="OBSERVE_PAR_AGENT">Observé par un agent</option><option value="TRANSCRIT_DOSSIER">Transcrit depuis le dossier</option>
                </select>
              </label>
              <Champ label="Date et heure de déclaration" type="datetime-local" value={symptomeForm.declare_le} required onChange={(declare_le) => setSymptomeForm({ ...symptomeForm, declare_le })} />
              <Champ label="Début estimé (facultatif)" type="datetime-local" value={symptomeForm.debut_estime_le} onChange={(debut_estime_le) => setSymptomeForm({ ...symptomeForm, debut_estime_le })} />
              {symptomeForm.statut_declaration === 'SIGNALE' && <Champ label="Intensité déclarée (0 à 10, facultatif)" type="number" min={0} max={10} value={symptomeForm.intensite_declaree} onChange={(intensite_declaree) => setSymptomeForm({ ...symptomeForm, intensite_declaree })} />}
              {symptomeForm.code_symptome === 'AUTRE' && <Champ label="Précision sur le symptôme" value={symptomeForm.precision} required onChange={(precision) => setSymptomeForm({ ...symptomeForm, precision })} />}
              <label className="grid gap-1 text-sm font-medium text-slate-700 md:col-span-2">Observation facultative
                <textarea value={symptomeForm.observations} onChange={(event) => setSymptomeForm({ ...symptomeForm, observations: event.target.value })} rows={2} className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none ring-rose-200 focus:ring-2" />
              </label>
              <div className="flex items-end">
                <button disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">
                  <Plus className="h-4 w-4" />Enregistrer la déclaration
                </button>
              </div>
            </form>
            <div className="space-y-3">
              {symptomes.length ? symptomes.map((element) => (
                <article key={element.id} className="rounded-2xl border border-slate-100 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{element.libelle_symptome}</p>
                      {element.precision && <p className="mt-1 text-sm text-slate-600">{element.precision}</p>}
                      <p className="mt-1 text-xs text-slate-500">Source : {labelEtat(element.source_declaration)} · À vérifier : {labelEtat(element.statut_validation)}</p>
                    </div>
                    <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-800">{labelEtat(element.statut_declaration)}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Déclaré le {new Date(element.declare_le).toLocaleString('fr-ML')}
                    {element.debut_estime_le ? ` · Début déclaré : ${new Date(element.debut_estime_le).toLocaleString('fr-ML')}` : ''}
                    {element.intensite_declaree !== null && element.intensite_declaree !== undefined ? ` · Intensité déclarée : ${element.intensite_declaree}/10` : ''}
                  </p>
                  {element.observations && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{element.observations}</p>}
                </article>
              )) : <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">Aucune déclaration de symptôme enregistrée.</p>}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <ClipboardPlus className="h-5 w-5 text-blue-700" />
              <h2 className="font-bold text-slate-900">Mesures cliniques</h2>
            </div>
            <p className="mb-5 text-sm text-slate-500">Saisir la valeur et son unité telles que relevées. Aucune interprétation clinique automatique n’est effectuée ici.</p>
            <form onSubmit={ajouterMesure} className="mb-6 grid grid-cols-1 gap-3 rounded-2xl bg-blue-50/60 p-4 md:grid-cols-2">
              <label className="grid gap-1 text-sm font-medium text-slate-700">Type de mesure
                <select value={measurement.type_mesure} required onChange={(event) => {
                  const type_mesure = event.target.value;
                  const selected = catalogueMesures.find((item) => item.code === type_mesure);
                  setMeasurement({ ...measurement, type_mesure, unite: selected?.unite ?? (type_mesure === 'AUTRE' ? '' : measurement.unite) });
                }} className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none ring-blue-200 focus:ring-2">
                  {catalogueMesures.map((item) => <option key={item.code} value={item.code}>{item.libelle}</option>)}
                  <option value="AUTRE">Autre mesure</option>
                </select>
              </label>
              {measurement.type_mesure === 'AUTRE' && <Champ label="Nom de la mesure" value={measurement.type_mesure_personnalisee} required onChange={(type_mesure_personnalisee) => setMeasurement({ ...measurement, type_mesure_personnalisee })} />}
              <Champ label="Valeur mesurée" type="number" step="any" value={measurement.valeur} required onChange={(valeur) => setMeasurement({ ...measurement, valeur })} />
              <Champ label="Unité" value={measurement.unite} required onChange={(unite) => setMeasurement({ ...measurement, unite })} />
              <Champ label="Date et heure" type="datetime-local" value={measurement.mesuree_le} required onChange={(mesuree_le) => setMeasurement({ ...measurement, mesuree_le })} />
              <Champ label="Méthode (facultatif)" value={measurement.methode} onChange={(methode) => setMeasurement({ ...measurement, methode })} />
              <div className="flex items-end">
                <button disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">
                  <Plus className="h-4 w-4" />Enregistrer la mesure
                </button>
              </div>
            </form>
            <div className="space-y-3">
              {grossesse.mesures.length ? grossesse.mesures.map((element) => (
                <article key={element.id} className="rounded-2xl border border-slate-100 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{catalogueMesures.find((item) => item.code === element.type_mesure)?.libelle ?? element.type_mesure}</p>
                      <p className="mt-1 text-lg font-bold text-slate-800">{element.valeur} {element.unite}</p>
                    </div>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">{labelEtat(element.statut_validation)}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{new Date(element.mesuree_le).toLocaleString('fr-ML')}{element.methode ? ` · Méthode : ${element.methode}` : ''}</p>
                </article>
              )) : <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">Aucune mesure enregistrée pour cette grossesse.</p>}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <ClipboardPlus className="h-5 w-5 text-teal-700" />
              <h2 className="font-bold text-slate-900">Examens prénataux</h2>
            </div>
            <p className="mb-5 text-sm text-slate-500">
              Enregistrez les résultats reçus ou l’état d’un examen. Les champs saisis sont conservés comme données à vérifier; cette page n’interprète pas les résultats.
            </p>
            <div className="mb-6 rounded-2xl border border-teal-100 bg-teal-50/60 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-900">Référentiel du protocole configuré</h3>
                  <p className="mt-1 text-xs text-slate-600">
                    Version : {metaExamenAttendus?.version_protocole || 'non renseignée'}
                    {metaExamenAttendus?.age_gestationnel_estime_semaines !== null && metaExamenAttendus?.age_gestationnel_estime_semaines !== undefined
                      ? ` · Âge gestationnel estimé à partir de la date de début : ${metaExamenAttendus.age_gestationnel_estime_semaines} semaines`
                      : ''}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${metaExamenAttendus?.reference_configuree ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
                  {metaExamenAttendus?.reference_configuree ? 'Référentiel trouvé' : 'Référentiel non configuré'}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-700">{metaExamenAttendus?.message || 'Chargement du référentiel…'}</p>
              {examensAttendus.length > 0 && (
                <div className="mt-4 space-y-2">
                  {examensAttendus.map((item) => (
                    <article key={item.id} className="rounded-xl border border-teal-100 bg-white p-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-900">{item.nom_examen} <span className="text-xs text-slate-500">({item.code_examen})</span></p>
                          <p className="mt-1 text-xs text-slate-500">
                            {labelEtat(item.modalite)} · Semaines : {item.semaine_min ?? 'non définie'}–{item.semaine_max ?? 'non définie'} · Source : {item.source_reference}
                          </p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.suivi === 'RESULTAT_ENREGISTRE' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                          {item.suivi === 'RESULTAT_ENREGISTRE' ? 'Résultat enregistré' : 'Aucun résultat enregistré'}
                        </span>
                      </div>
                      {item.dernier_resultat && <p className="mt-2 text-xs text-slate-500">Statut : {labelEtat(item.dernier_resultat.statut_resultat)} · Vérification : {labelEtat(item.dernier_resultat.statut_validation)}</p>}
                    </article>
                  ))}
                </div>
              )}
            </div>
            <form onSubmit={ajouterExamen} className="mb-6 grid grid-cols-1 gap-3 rounded-2xl bg-teal-50/60 p-4 md:grid-cols-2">
              <Champ label="Code de l’examen" value={examForm.code_examen} required onChange={(code_examen) => setExamForm({ ...examForm, code_examen })} />
              <Champ label="Nom de l’examen" value={examForm.nom_examen} required onChange={(nom_examen) => setExamForm({ ...examForm, nom_examen })} />
              <label className="grid gap-1 text-sm font-medium text-slate-700">Catégorie
                <select value={examForm.categorie} onChange={(event) => setExamForm({ ...examForm, categorie: event.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none ring-teal-200 focus:ring-2">
                  <option value="HEMATOLOGIE">Hématologie</option>
                  <option value="INFECTIOLOGIE">Infectiologie</option>
                  <option value="URINES">Urines</option>
                  <option value="GLYCEMIE">Glycémie</option>
                  <option value="ECHOGRAPHIE">Échographie</option>
                  <option value="IMMUNOLOGIE">Immunologie</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </label>
              <label className="grid gap-1 text-sm font-medium text-slate-700">État du résultat
                <select value={examForm.statut_resultat} onChange={(event) => setExamForm({ ...examForm, statut_resultat: event.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none ring-teal-200 focus:ring-2">
                  <option value="EN_ATTENTE">En attente</option>
                  <option value="DISPONIBLE">Disponible</option>
                  <option value="NON_REALISE">Non réalisé</option>
                  <option value="NON_APPLICABLE">Non applicable</option>
                </select>
              </label>
              <Champ label="Résultat numérique (facultatif)" type="number" step="any" value={examForm.resultat_numerique} onChange={(resultat_numerique) => setExamForm({ ...examForm, resultat_numerique })} />
              <Champ label="Unité (facultatif)" value={examForm.unite} onChange={(unite) => setExamForm({ ...examForm, unite })} />
              <label className="grid gap-1 text-sm font-medium text-slate-700 md:col-span-2">Résultat textuel (facultatif)
                <textarea value={examForm.resultat_texte} onChange={(event) => setExamForm({ ...examForm, resultat_texte: event.target.value })} rows={2} className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none ring-teal-200 focus:ring-2" />
              </label>
              <Champ label="Date et heure du prélèvement/examen" type="datetime-local" value={examForm.date_prelevement} onChange={(date_prelevement) => setExamForm({ ...examForm, date_prelevement })} />
              <Champ label="Date et heure du résultat" type="datetime-local" value={examForm.date_resultat} onChange={(date_resultat) => setExamForm({ ...examForm, date_resultat })} />
              <Champ label="Laboratoire ou source (facultatif)" value={examForm.laboratoire} onChange={(laboratoire) => setExamForm({ ...examForm, laboratoire })} />
              <div className="flex items-end">
                <button disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">
                  <Plus className="h-4 w-4" />Enregistrer l’examen
                </button>
              </div>
            </form>
            <div className="space-y-3">
              {examens.length ? examens.map((element) => (
                <article key={element.id} className="rounded-2xl border border-slate-100 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{element.nom_examen} <span className="text-xs text-slate-500">({element.code_examen})</span></p>
                      <p className="mt-1 text-sm text-slate-600">
                        {element.resultat_texte || (element.resultat_numerique !== null && element.resultat_numerique !== undefined ? `${element.resultat_numerique} ${element.unite || ''}`.trim() : 'Résultat non renseigné')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">{labelEtat(element.statut_resultat)}</span>
                      <p className="mt-2 text-xs text-slate-500">Validation : {labelEtat(element.statut_validation)}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {element.date_prelevement ? new Date(element.date_prelevement).toLocaleString('fr-ML') : 'Date non renseignée'}
                    {element.date_resultat ? ` · Résultat reçu le ${new Date(element.date_resultat).toLocaleString('fr-ML')}` : ''}
                    {element.laboratoire ? ` · Source : ${element.laboratoire}` : ''}
                  </p>
                </article>
              )) : <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">Aucun examen prénatal enregistré.</p>}
            </div>
          </section>
        </div>

        <aside>
          <section className="rounded-3xl border border-orange-100 bg-orange-50/60 p-6">
            <div className="mb-4 flex items-center gap-2">
              <Baby className="h-5 w-5 text-orange-700" /><h2 className="font-bold text-slate-900">Accouchement</h2>
            </div>
            {grossesse.accouchement ? (
              <div className="rounded-2xl bg-white p-4 text-sm text-slate-700">
                <p className="font-bold text-slate-900">{labelEtat(grossesse.accouchement.issue)}</p>
                <p className="mt-1">{new Date(grossesse.accouchement.accouchement_le).toLocaleString('fr-ML')} · {labelEtat(grossesse.accouchement.type_accouchement)}</p>
              </div>
            ) : (
              <form onSubmit={enregistrerAccouchement} className="space-y-3">
                <Champ label="Date et heure" type="datetime-local" value={accouchement.accouchement_le} required onChange={(accouchement_le) => setAccouchement({ ...accouchement, accouchement_le })} />
                <label className="grid gap-1 text-sm font-medium text-slate-700">Issue
                  <select value={accouchement.issue} onChange={(event) => setAccouchement({ ...accouchement, issue: event.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none ring-orange-200 focus:ring-2">
                    <option value="NAISSANCE_VIVANTE">Naissance vivante</option><option value="MORT_NEE">Mort née</option><option value="INTERRUPTION">Interruption</option><option value="AUTRE">Autre</option>
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-medium text-slate-700">Type d’accouchement
                  <select value={accouchement.type_accouchement} onChange={(event) => setAccouchement({ ...accouchement, type_accouchement: event.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none ring-orange-200 focus:ring-2">
                    <option value="VOIE_BASSE">Voie basse</option><option value="CESARIENNE">Césarienne</option><option value="AUTRE">Autre</option><option value="INCONNU">Inconnu</option>
                  </select>
                </label>
                <Champ label="ID(s) nouveau-né déjà créé(s), séparés par virgule" value={accouchement.nouveau_ne_enfant_ids} onChange={(nouveau_ne_enfant_ids) => setAccouchement({ ...accouchement, nouveau_ne_enfant_ids })} />
                <p className="text-xs text-slate-500">Les liens mère-enfant sont vérifiés et créés pour chaque dossier existant indiqué.</p>
                <button disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">
                  <CalendarCheck2 className="h-4 w-4" />Enregistrer l’épisode
                </button>
              </form>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

function Champ({ label, value, onChange, type = 'text', required = false, step, min, max }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  step?: string;
  min?: number;
  max?: number;
}) {
  return (
    <label className="grid gap-1 text-sm font-medium text-slate-700">
      {label}
      <input required={required} type={type} step={step} min={min} max={max} value={value} onChange={(event) => onChange(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none ring-rose-200 focus:ring-2" />
    </label>
  );
}
