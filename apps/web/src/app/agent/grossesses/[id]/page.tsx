'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Baby, CalendarCheck2, CircleAlert, ClipboardPlus, Loader2, Plus, Stethoscope } from 'lucide-react';
import { ExamenPrenatal, labelEtat, maternalApi } from '@/lib/maternal-api';

type Contact = {
  id: string;
  contact_le: string;
  type_contact: string;
  age_gestationnel_semaines?: number | null;
  statut_validation: string;
  prochaine_etape?: string | null;
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

type ExamensResponse = { data: { data: ExamenPrenatal[] } };

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
  version_protocole: '',
};

const initialMeasurement = {
  type_mesure: '',
  valeur: '',
  unite: '',
  mesuree_le: '',
  methode: '',
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

export default function GrossesseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [grossesse, setGrossesse] = useState<GrossesseDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contact, setContact] = useState(initialContact);
  const [measurement, setMeasurement] = useState(initialMeasurement);
  const [examens, setExamens] = useState<ExamenPrenatal[]>([]);
  const [examForm, setExamForm] = useState<FormExamen>(initialExam);
  const [accouchement, setAccouchement] = useState(initialDelivery);

  const recupererGrossesse = useCallback(async (): Promise<{ grossesse: GrossesseDetail; examens: ExamenPrenatal[] }> => {
    const [result, examensResult] = await Promise.all([
      maternalApi<{ data: GrossesseDetail }>(`/grossesses/${id}`),
      maternalApi<ExamensResponse>(`/grossesses/${id}/examens`),
    ]);
    return {
      grossesse: {
        ...result.data,
        contacts: result.data.contacts ?? [],
        mesures: result.data.mesures ?? [],
      },
      examens: examensResult.data.data ?? [],
    };
  }, [id]);

  const charger = async () => {
    try {
      const result = await recupererGrossesse();
      setGrossesse(result.grossesse);
      setExamens(result.examens);
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
          setGrossesse(data.grossesse);
          setExamens(data.examens);
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
  }, [id, recupererGrossesse]);

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
    try {
      await maternalApi(`/grossesses/${id}/mesures`, {
        method: 'POST',
        body: JSON.stringify({
          ...measurement,
          valeur: Number(measurement.valeur),
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
                </article>
              )) : <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">Aucun contact prénatal enregistré.</p>}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <ClipboardPlus className="h-5 w-5 text-blue-700" />
              <h2 className="font-bold text-slate-900">Mesures cliniques</h2>
            </div>
            <p className="mb-5 text-sm text-slate-500">Saisir la valeur et son unité telles que relevées. Aucune interprétation clinique automatique n’est effectuée ici.</p>
            <form onSubmit={ajouterMesure} className="mb-6 grid grid-cols-1 gap-3 rounded-2xl bg-blue-50/60 p-4 md:grid-cols-2">
              <Champ label="Type de mesure" value={measurement.type_mesure} required onChange={(type_mesure) => setMeasurement({ ...measurement, type_mesure })} />
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
                      <p className="font-semibold text-slate-900">{element.type_mesure}</p>
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

function Champ({ label, value, onChange, type = 'text', required = false, step }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  step?: string;
}) {
  return (
    <label className="grid gap-1 text-sm font-medium text-slate-700">
      {label}
      <input required={required} type={type} step={step} value={value} onChange={(event) => onChange(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none ring-rose-200 focus:ring-2" />
    </label>
  );
}
