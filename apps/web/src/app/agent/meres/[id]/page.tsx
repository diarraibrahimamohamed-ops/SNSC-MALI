'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, CalendarPlus, ClipboardPlus, HeartPulse, Loader2, ShieldAlert, Stethoscope } from 'lucide-react';
import { AntecedentObstetrical, CatalogueAntecedent, ChronologieItem, Grossesse, labelEtat, maternalApi, Mere } from '@/lib/maternal-api';

type MereResponse = { data: Mere & { grossesses?: Grossesse[] } };
type TimelineResponse = { data: ChronologieItem[] };
type AntecedentsResponse = { data: { data: AntecedentObstetrical[] } };
type CatalogueAntecedentsResponse = { data: CatalogueAntecedent[] };

type FormAntecedent = {
  code_antecedent: string;
  date_evenement: string;
  source_declaration: string;
  precision: string;
  observations: string;
};

export default function MereDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [mere, setMere] = useState<(Mere & { grossesses?: Grossesse[] }) | null>(null);
  const [timeline, setTimeline] = useState<ChronologieItem[]>([]);
  const [antecedents, setAntecedents] = useState<AntecedentObstetrical[]>([]);
  const [catalogueAntecedents, setCatalogueAntecedents] = useState<CatalogueAntecedent[]>([]);
  const [antecedentForm, setAntecedentForm] = useState<FormAntecedent>({
    code_antecedent: 'CESARIENNE',
    date_evenement: '',
    source_declaration: 'DECLARE_PAR_MERE',
    precision: '',
    observations: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ date_debut_estimee: '', terme_estime: '', nombre_foetus: '1', version_protocole: '' });
  const [postpartumForm, setPostpartumForm] = useState({ suivi_le: '', type_contact: 'POSTPARTUM_VISITE', resume: '', orientation: '', prochain_rendez_vous_le: '' });

  const recupererDossier = useCallback(async () => {
    const [dossier, historique, antecedentsResult, catalogueResult] = await Promise.all([
      maternalApi<MereResponse>(`/meres/${id}`),
      maternalApi<TimelineResponse>(`/meres/${id}/chronologie`),
      maternalApi<AntecedentsResponse>(`/meres/${id}/antecedents-obstetricaux`),
      maternalApi<CatalogueAntecedentsResponse>('/catalogues/antecedents-obstetricaux'),
    ]);
    return {
      mere: dossier.data,
      timeline: historique.data,
      antecedents: antecedentsResult.data.data ?? [],
      catalogueAntecedents: catalogueResult.data ?? [],
    };
  }, [id]);

  const charger = async () => {
    try {
      const result = await recupererDossier();
      setMere(result.mere);
      setTimeline(result.timeline);
      setAntecedents(result.antecedents);
      setCatalogueAntecedents(result.catalogueAntecedents);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger le dossier.');
    }
  };

  useEffect(() => {
    let active = true;

    const chargerInitial = async () => {
      try {
        const result = await recupererDossier();
        if (active) {
          setMere(result.mere);
          setTimeline(result.timeline);
          setAntecedents(result.antecedents);
          setCatalogueAntecedents(result.catalogueAntecedents);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Impossible de charger le dossier.');
          setMere(null);
          setTimeline([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    if (id) void chargerInitial();
    return () => {
      active = false;
    };
  }, [id, recupererDossier]);

  const creerGrossesse = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setError(null);
    try {
      await maternalApi(`/meres/${id}/grossesses`, { method: 'POST', body: JSON.stringify({ ...form, nombre_foetus: Number(form.nombre_foetus), terme_estime: form.terme_estime || undefined, version_protocole: form.version_protocole || undefined }) });
      setForm({ date_debut_estimee: '', terme_estime: '', nombre_foetus: '1', version_protocole: '' });
      await charger();
    } catch (err) { setError(err instanceof Error ? err.message : 'La grossesse n’a pas été enregistrée.'); }
    finally { setSaving(false); }
  };

  const ajouterAntecedent = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    if (antecedentForm.code_antecedent === 'AUTRE' && !antecedentForm.precision.trim()) {
      setError('Précisez l’antécédent lorsque « Autre » est choisi.');
      setSaving(false);
      return;
    }

    try {
      await maternalApi(`/meres/${id}/antecedents-obstetricaux`, {
        method: 'POST',
        body: JSON.stringify({
          code_antecedent: antecedentForm.code_antecedent,
          date_evenement: antecedentForm.date_evenement || undefined,
          source_declaration: antecedentForm.source_declaration,
          precision: antecedentForm.precision.trim() || undefined,
          observations: antecedentForm.observations.trim() || undefined,
        }),
      });
      setAntecedentForm({
        code_antecedent: 'CESARIENNE',
        date_evenement: '',
        source_declaration: 'DECLARE_PAR_MERE',
        precision: '',
        observations: '',
      });
      await charger();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'L’antécédent n’a pas été enregistré.');
    } finally {
      setSaving(false);
    }
  };

  const enregistrerSuiviPostpartum = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await maternalApi(`/meres/${id}/suivis-postpartum`, {
        method: 'POST',
        body: JSON.stringify({
          suivi_le: postpartumForm.suivi_le,
          type_contact: postpartumForm.type_contact,
          observations: postpartumForm.resume.trim() ? { resume: postpartumForm.resume.trim() } : undefined,
          orientation: postpartumForm.orientation.trim() || undefined,
          prochain_rendez_vous_le: postpartumForm.prochain_rendez_vous_le || undefined,
        }),
      });
      setPostpartumForm({ suivi_le: '', type_contact: 'POSTPARTUM_VISITE', resume: '', orientation: '', prochain_rendez_vous_le: '' });
      await charger();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Le suivi post-partum n’a pas été enregistré.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex min-h-[45vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-rose-600" /></div>;
  if (!mere) return <p className="text-sm text-slate-600">Dossier introuvable.</p>;

  return <div className="space-y-6">
    <Link href="/agent/meres" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-rose-700"><ArrowLeft className="h-4 w-4" />Dossiers mères</Link>
    {error && <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><ShieldAlert className="h-5 w-5 shrink-0" />{error}</div>}
    <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><div className="flex items-start gap-4"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-700"><HeartPulse className="h-7 w-7" /></span><div><p className="text-sm font-semibold text-rose-700">Dossier longitudinal</p><h1 className="text-3xl font-extrabold text-slate-900">{mere.nom} {mere.prenom}</h1><p className="mt-1 text-sm text-slate-500">{mere.identifiant_sanitaire || 'Identifiant non renseigné'} · Données cliniques à valider par un professionnel habilité.</p></div></div></header>
    <section className="rounded-3xl border border-amber-100 bg-amber-50/40 p-6 shadow-sm">
      <div className="mb-2 flex items-center gap-2"><ClipboardPlus className="h-5 w-5 text-amber-700" /><h2 className="font-bold text-slate-900">Antécédents obstétricaux déclarés</h2></div>
      <p className="mb-4 text-sm text-slate-600">Enregistrez les antécédents rapportés ou présents dans un dossier. Les données restent à vérifier; elles ne permettent pas, à elles seules, de conclure sur la grossesse actuelle.</p>
      <form onSubmit={ajouterAntecedent} className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium text-slate-700">Antécédent
          <select value={antecedentForm.code_antecedent} onChange={(event) => setAntecedentForm({ ...antecedentForm, code_antecedent: event.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none ring-amber-200 focus:ring-2">
            {catalogueAntecedents.map((item) => <option key={item.code} value={item.code}>{item.libelle}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium text-slate-700">Source de l’information
          <select value={antecedentForm.source_declaration} onChange={(event) => setAntecedentForm({ ...antecedentForm, source_declaration: event.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none ring-amber-200 focus:ring-2">
            <option value="DECLARE_PAR_MERE">Déclaré par la mère</option><option value="DECLARE_PAR_ACCOMPAGNANT">Déclaré par un accompagnant</option><option value="DOSSIER_MEDICAL">Dossier médical consulté</option><option value="INCONNU">Source inconnue</option>
          </select>
        </label>
        <Champ label="Date de l’événement (facultatif)" value={antecedentForm.date_evenement} type="date" onChange={(date_evenement) => setAntecedentForm({ ...antecedentForm, date_evenement })} />
        {antecedentForm.code_antecedent === 'AUTRE' && <Champ label="Précisez l’antécédent" value={antecedentForm.precision} required onChange={(precision) => setAntecedentForm({ ...antecedentForm, precision })} />}
        <label className="grid gap-1 text-sm font-medium text-slate-700 md:col-span-2">Précision complémentaire (facultative)
          <textarea value={antecedentForm.observations} onChange={(event) => setAntecedentForm({ ...antecedentForm, observations: event.target.value })} rows={2} maxLength={2000} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none ring-amber-200 focus:ring-2" />
        </label>
        <div><button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{saving && <Loader2 className="h-4 w-4 animate-spin" />}Enregistrer l’antécédent</button></div>
      </form>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {antecedents.length ? antecedents.map((item) => (
          <article key={item.id} className="rounded-2xl border border-amber-100 bg-white p-4">
            <div className="flex flex-wrap justify-between gap-2">
              <p className="font-semibold text-slate-900">{catalogueAntecedents.find((entry) => entry.code === item.code_antecedent)?.libelle ?? labelEtat(item.code_antecedent)}</p>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">{labelEtat(item.statut_validation)}</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">Source : {labelEtat(item.source_declaration)}{item.date_evenement ? ` · Date : ${new Date(item.date_evenement).toLocaleDateString('fr-ML')}` : ''}</p>
            {item.precision && <p className="mt-2 text-sm text-slate-700">{item.precision}</p>}
            {item.observations && <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{item.observations}</p>}
          </article>
        )) : <p className="rounded-2xl bg-white/70 p-4 text-sm text-slate-500">Aucun antécédent enregistré. Cela ne signifie pas qu’il n’en existe aucun.</p>}
      </div>
    </section>
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_.7fr]">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5 flex items-center gap-2"><Stethoscope className="h-5 w-5 text-rose-600" /><h2 className="font-bold text-slate-900">Chronologie mère-enfant</h2></div>{timeline.length === 0 ? <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">Aucun évènement clinique enregistré. Les données manquantes ne sont pas interprétées comme normales.</p> : <ol className="space-y-4 border-l-2 border-rose-100 pl-5">{timeline.map((item) => <li key={`${item.type}-${item.id}`} className="relative"><span className="absolute -left-[30px] top-1 h-3 w-3 rounded-full bg-rose-500 ring-4 ring-white" /><div className="rounded-2xl bg-slate-50 p-4"><div className="flex flex-wrap justify-between gap-2"><p className="font-semibold text-slate-900">{labelEtat(item.type)}</p><time className="text-xs text-slate-500">{new Date(item.date).toLocaleString('fr-ML')}</time></div><p className="mt-1 text-xs text-slate-500">Statut : {labelEtat(item.statut)} · Source : {labelEtat(item.provenance)}</p>{item.libelle && <p className="mt-2 text-sm text-slate-700">{catalogueAntecedents.find((antecedent) => antecedent.code === item.libelle)?.libelle ?? item.libelle}</p>}{item.rappel_statut && <p className="mt-1 text-xs text-slate-600">Rappel : {labelEtat(item.rappel_statut)}</p>}{item.prochaine_etape && <p className="mt-2 text-sm text-slate-700">Prochaine étape : {item.prochaine_etape}</p>}{item.prochain_rendez_vous_le && <p className="mt-2 text-sm font-semibold text-rose-700">Rendez-vous prévu : {new Date(item.prochain_rendez_vous_le).toLocaleDateString('fr-ML')}</p>}{item.vaccin && <p className="mt-2 text-sm text-slate-700">Vaccin enfant : {item.vaccin}</p>}</div></li>)}</ol>}</section>
      <aside className="space-y-6"><section className="rounded-3xl border border-rose-100 bg-rose-50/40 p-6"><div className="mb-4 flex items-center gap-2"><CalendarPlus className="h-5 w-5 text-rose-700" /><h2 className="font-bold text-slate-900">Débuter une grossesse</h2></div><form onSubmit={creerGrossesse} className="space-y-3"><Champ label="Début estimé" value={form.date_debut_estimee} type="date" required onChange={(date_debut_estimee) => setForm({ ...form, date_debut_estimee })} /><Champ label="Terme estimé" value={form.terme_estime} type="date" onChange={(terme_estime) => setForm({ ...form, terme_estime })} /><Champ label="Nombre de fœtus" value={form.nombre_foetus} type="number" required onChange={(nombre_foetus) => setForm({ ...form, nombre_foetus })} /><Champ label="Version du protocole validée" value={form.version_protocole} onChange={(version_protocole) => setForm({ ...form, version_protocole })} /><button disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{saving && <Loader2 className="h-4 w-4 animate-spin" />}Enregistrer</button></form></section><section className="rounded-3xl border border-slate-200 bg-white p-6"><h2 className="font-bold text-slate-900">Grossesses</h2><div className="mt-3 space-y-3">{mere.grossesses?.length ? mere.grossesses.map((grossesse) => <Link key={grossesse.id} href={`/agent/grossesses/${grossesse.id}`} className="block rounded-xl bg-slate-50 p-3 hover:bg-rose-50"><p className="font-semibold text-slate-800">{labelEtat(grossesse.statut)}</p><p className="text-xs text-slate-500">Début estimé : {new Date(grossesse.date_debut_estimee).toLocaleDateString('fr-ML')} · {grossesse.nombre_foetus} fœtus</p></Link>) : <p className="text-sm text-slate-500">Aucune grossesse enregistrée.</p>}</div></section>
        <section className="rounded-3xl border border-teal-100 bg-teal-50/40 p-6">
          <div className="mb-2 flex items-center gap-2"><ClipboardPlus className="h-5 w-5 text-teal-700" /><h2 className="font-bold text-slate-900">Suivi post-partum</h2></div>
          <p className="mb-4 text-sm text-slate-600">Consignez le contact, l’orientation et le prochain rendez-vous. Les observations restent à vérifier par un professionnel habilité.</p>
          <form onSubmit={enregistrerSuiviPostpartum} className="space-y-3">
            <Champ label="Date et heure du suivi" value={postpartumForm.suivi_le} type="datetime-local" required onChange={(suivi_le) => setPostpartumForm({ ...postpartumForm, suivi_le })} />
            <label className="grid gap-1 text-sm font-medium text-slate-700">Type de contact
              <select value={postpartumForm.type_contact} onChange={(event) => setPostpartumForm({ ...postpartumForm, type_contact: event.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none ring-teal-200 focus:ring-2">
                <option value="POSTPARTUM_VISITE">Visite</option><option value="POSTPARTUM_APPEL">Appel</option><option value="AUTRE">Autre</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm font-medium text-slate-700">Note de suivi (facultatif)
              <textarea value={postpartumForm.resume} onChange={(event) => setPostpartumForm({ ...postpartumForm, resume: event.target.value })} rows={3} maxLength={2000} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none ring-teal-200 focus:ring-2" placeholder="Résumé factuel, sans conclure à un diagnostic." />
            </label>
            <Champ label="Orientation / action prévue" value={postpartumForm.orientation} onChange={(orientation) => setPostpartumForm({ ...postpartumForm, orientation })} />
            <Champ label="Prochain rendez-vous" value={postpartumForm.prochain_rendez_vous_le} type="date" onChange={(prochain_rendez_vous_le) => setPostpartumForm({ ...postpartumForm, prochain_rendez_vous_le })} />
            <button disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{saving && <Loader2 className="h-4 w-4 animate-spin" />}Enregistrer le suivi</button>
          </form>
        </section></aside>
    </div>
  </div>;
}

function Champ({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) { return <label className="grid gap-1 text-sm font-medium text-slate-700">{label}<input type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none ring-rose-200 focus:ring-2" /></label>; }
