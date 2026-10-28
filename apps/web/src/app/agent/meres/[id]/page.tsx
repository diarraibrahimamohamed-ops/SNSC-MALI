'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, CalendarPlus, HeartPulse, Loader2, ShieldAlert, Stethoscope } from 'lucide-react';
import { ChronologieItem, Grossesse, labelEtat, maternalApi, Mere } from '@/lib/maternal-api';

type MereResponse = { data: Mere & { grossesses?: Grossesse[] } };
type TimelineResponse = { data: ChronologieItem[] };

export default function MereDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [mere, setMere] = useState<(Mere & { grossesses?: Grossesse[] }) | null>(null);
  const [timeline, setTimeline] = useState<ChronologieItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ date_debut_estimee: '', terme_estime: '', nombre_foetus: '1', version_protocole: '' });

  const charger = async () => {
    setLoading(true); setError(null);
    try {
      const [dossier, historique] = await Promise.all([maternalApi<MereResponse>(`/meres/${id}`), maternalApi<TimelineResponse>(`/meres/${id}/chronologie`)]);
      setMere(dossier.data); setTimeline(historique.data);
    } catch (err) { setError(err instanceof Error ? err.message : 'Impossible de charger le dossier.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (id) void charger(); }, [id]);

  const creerGrossesse = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setError(null);
    try {
      await maternalApi(`/meres/${id}/grossesses`, { method: 'POST', body: JSON.stringify({ ...form, nombre_foetus: Number(form.nombre_foetus), terme_estime: form.terme_estime || undefined, version_protocole: form.version_protocole || undefined }) });
      setForm({ date_debut_estimee: '', terme_estime: '', nombre_foetus: '1', version_protocole: '' });
      await charger();
    } catch (err) { setError(err instanceof Error ? err.message : 'La grossesse n’a pas été enregistrée.'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex min-h-[45vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-rose-600" /></div>;
  if (!mere) return <p className="text-sm text-slate-600">Dossier introuvable.</p>;

  return <div className="space-y-6">
    <Link href="/agent/meres" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-rose-700"><ArrowLeft className="h-4 w-4" />Dossiers mères</Link>
    {error && <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><ShieldAlert className="h-5 w-5 shrink-0" />{error}</div>}
    <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><div className="flex items-start gap-4"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-700"><HeartPulse className="h-7 w-7" /></span><div><p className="text-sm font-semibold text-rose-700">Dossier longitudinal</p><h1 className="text-3xl font-extrabold text-slate-900">{mere.nom} {mere.prenom}</h1><p className="mt-1 text-sm text-slate-500">{mere.identifiant_sanitaire || 'Identifiant non renseigné'} · Données cliniques à valider par un professionnel habilité.</p></div></div></header>
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_.7fr]">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5 flex items-center gap-2"><Stethoscope className="h-5 w-5 text-rose-600" /><h2 className="font-bold text-slate-900">Chronologie mère-enfant</h2></div>{timeline.length === 0 ? <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">Aucun évènement clinique enregistré. Les données manquantes ne sont pas interprétées comme normales.</p> : <ol className="space-y-4 border-l-2 border-rose-100 pl-5">{timeline.map((item) => <li key={`${item.type}-${item.id}`} className="relative"><span className="absolute -left-[30px] top-1 h-3 w-3 rounded-full bg-rose-500 ring-4 ring-white" /><div className="rounded-2xl bg-slate-50 p-4"><div className="flex flex-wrap justify-between gap-2"><p className="font-semibold text-slate-900">{labelEtat(item.type)}</p><time className="text-xs text-slate-500">{new Date(item.date).toLocaleString('fr-ML')}</time></div><p className="mt-1 text-xs text-slate-500">Statut : {labelEtat(item.statut)} · Source : {labelEtat(item.provenance)}</p>{item.prochaine_etape && <p className="mt-2 text-sm text-slate-700">Prochaine étape : {item.prochaine_etape}</p>}{item.vaccin && <p className="mt-2 text-sm text-slate-700">Vaccin enfant : {item.vaccin}</p>}</div></li>)}</ol>}</section>
      <aside className="space-y-6"><section className="rounded-3xl border border-rose-100 bg-rose-50/40 p-6"><div className="mb-4 flex items-center gap-2"><CalendarPlus className="h-5 w-5 text-rose-700" /><h2 className="font-bold text-slate-900">Débuter une grossesse</h2></div><form onSubmit={creerGrossesse} className="space-y-3"><Champ label="Début estimé" value={form.date_debut_estimee} type="date" required onChange={(date_debut_estimee) => setForm({ ...form, date_debut_estimee })} /><Champ label="Terme estimé" value={form.terme_estime} type="date" onChange={(terme_estime) => setForm({ ...form, terme_estime })} /><Champ label="Nombre de fœtus" value={form.nombre_foetus} type="number" required onChange={(nombre_foetus) => setForm({ ...form, nombre_foetus })} /><Champ label="Version du protocole validée" value={form.version_protocole} onChange={(version_protocole) => setForm({ ...form, version_protocole })} /><button disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{saving && <Loader2 className="h-4 w-4 animate-spin" />}Enregistrer</button></form></section><section className="rounded-3xl border border-slate-200 bg-white p-6"><h2 className="font-bold text-slate-900">Grossesses</h2><div className="mt-3 space-y-3">{mere.grossesses?.length ? mere.grossesses.map((grossesse) => <Link key={grossesse.id} href={`/agent/grossesses/${grossesse.id}`} className="block rounded-xl bg-slate-50 p-3 hover:bg-rose-50"><p className="font-semibold text-slate-800">{labelEtat(grossesse.statut)}</p><p className="text-xs text-slate-500">Début estimé : {new Date(grossesse.date_debut_estimee).toLocaleDateString('fr-ML')} · {grossesse.nombre_foetus} fœtus</p></Link>) : <p className="text-sm text-slate-500">Aucune grossesse enregistrée.</p>}</div></section></aside>
    </div>
  </div>;
}

function Champ({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) { return <label className="grid gap-1 text-sm font-medium text-slate-700">{label}<input type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none ring-rose-200 focus:ring-2" /></label>; }
