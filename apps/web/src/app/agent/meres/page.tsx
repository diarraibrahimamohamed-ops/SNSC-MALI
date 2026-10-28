'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { HeartPulse, Loader2, Plus, Search, ShieldAlert, UserRound } from 'lucide-react';
import { maternalApi, Mere } from '@/lib/maternal-api';

type MereListResponse = { data: { data: Mere[] } | Mere[] };

const initialForm = { nom: '', prenom: '', identifiant_sanitaire: '', date_naissance: '', telephone: '', langue_preferee: 'fr' };

export default function MeresPage() {
  const [meres, setMeres] = useState<Mere[]>([]);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const charger = async (query = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await maternalApi<MereListResponse>(`/meres${query ? `?q=${encodeURIComponent(query)}` : ''}`);
      setMeres(Array.isArray(response.data) ? response.data : response.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les dossiers mères.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void charger(); }, []);

  const rechercher = (event: FormEvent) => {
    event.preventDefault();
    void charger(search);
  };

  const enregistrer = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await maternalApi('/meres', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(Object.entries(form).filter(([, value]) => value !== ''))),
      });
      setForm(initialForm);
      setShowForm(false);
      await charger(search);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Le dossier mère n’a pas été enregistré.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-gradient-to-br from-rose-700 via-rose-600 to-orange-500 p-6 text-white shadow-xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              <HeartPulse className="h-3.5 w-3.5" /> Santé maternelle et infantile
            </div>
            <h1 className="text-3xl font-extrabold">Dossiers mères</h1>
            <p className="mt-2 max-w-2xl text-sm text-rose-50">Identités minimisées, rattachées à votre structure et distinctes des dossiers tuteurs.</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-rose-700 shadow-sm hover:bg-rose-50">
            <Plus className="h-4 w-4" /> Nouvelle mère
          </button>
        </div>
      </header>

      {error && <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><ShieldAlert className="h-5 w-5 shrink-0" />{error}</div>}

      {showForm && (
        <form onSubmit={enregistrer} className="grid grid-cols-1 gap-4 rounded-3xl border border-rose-100 bg-white p-6 shadow-sm md:grid-cols-2">
          <h2 className="md:col-span-2 text-lg font-bold text-slate-900">Créer une fiche mère</h2>
          <Champ label="Nom" required value={form.nom} onChange={(nom) => setForm({ ...form, nom })} />
          <Champ label="Prénom" value={form.prenom} onChange={(prenom) => setForm({ ...form, prenom })} />
          <Champ label="Identifiant sanitaire" value={form.identifiant_sanitaire} onChange={(identifiant_sanitaire) => setForm({ ...form, identifiant_sanitaire })} />
          <Champ label="Téléphone" type="tel" value={form.telephone} onChange={(telephone) => setForm({ ...form, telephone })} />
          <Champ label="Date de naissance" type="date" value={form.date_naissance} onChange={(date_naissance) => setForm({ ...form, date_naissance })} />
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">Langue préférée
            <select value={form.langue_preferee} onChange={(event) => setForm({ ...form, langue_preferee: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-rose-200 focus:ring-2">
              <option value="fr">Français</option><option value="bm">Bamanankan</option><option value="autre">Autre</option>
            </select>
          </label>
          <div className="md:col-span-2 flex justify-end gap-3 pt-2"><button type="button" onClick={() => setShowForm(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Annuler</button><button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{saving && <Loader2 className="h-4 w-4 animate-spin" />}Enregistrer</button></div>
        </form>
      )}

      <form onSubmit={rechercher} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher par nom ou identifiant" className="min-w-0 flex-1 rounded-xl px-3 py-2 text-sm outline-none" />
        <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"><Search className="h-4 w-4" />Rechercher</button>
      </form>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4"><h2 className="font-bold text-slate-900">Mères suivies</h2><p className="text-sm text-slate-500">{meres.length} dossier{meres.length > 1 ? 's' : ''} dans le périmètre autorisé.</p></div>
        {loading ? <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-rose-500" /></div> : meres.length === 0 ? <div className="p-12 text-center text-sm text-slate-500">Aucun dossier mère à afficher.</div> : <div className="divide-y divide-slate-100">{meres.map((mere) => <Link key={mere.id} href={`/agent/meres/${mere.id}`} className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-rose-50/50"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700"><UserRound className="h-5 w-5" /></span><div><p className="font-semibold text-slate-900">{mere.nom} {mere.prenom}</p><p className="text-sm text-slate-500">{mere.identifiant_sanitaire || 'Identifiant non renseigné'} · {mere.langue_preferee || 'Langue non renseignée'}</p></div></div><span className="text-sm font-semibold text-rose-700">Ouvrir →</span></Link>)}</div>}
      </section>
    </div>
  );
}

function Champ({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <label className="grid gap-1.5 text-sm font-medium text-slate-700">{label}<input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-rose-200 focus:ring-2" /></label>;
}
