'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { CalendarClock, CalendarDays, ChevronRight, Clock3, Filter, Loader2, ShieldAlert } from 'lucide-react';
import { labelEtat, maternalApi, RendezVousPrenatal } from '@/lib/maternal-api';

type RendezVousAvecGrossesse = RendezVousPrenatal & {
  grossesse?: {
    id: string;
    mere?: { id: string; nom: string; prenom?: string | null } | null;
  };
};

type RendezVousResponse = {
  data: {
    data: RendezVousAvecGrossesse[];
    current_page?: number;
    last_page?: number;
    total?: number;
  };
};

const STATUTS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'PLANIFIE', label: 'Planifiés' },
  { value: 'REALISE', label: 'Réalisés' },
  { value: 'MANQUE', label: 'Manqués' },
  { value: 'REPORTE', label: 'Reportés' },
  { value: 'ANNULE', label: 'Annulés' },
];

export default function RendezVousPrenatauxPage() {
  const [items, setItems] = useState<RendezVousAvecGrossesse[]>([]);
  const [statut, setStatut] = useState('PLANIFIE');
  const [du, setDu] = useState('');
  const [au, setAu] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), per_page: '50' });
      if (statut) params.set('statut', statut);
      if (du) params.set('du', du);
      if (au) params.set('au', au);
      const response = await maternalApi<RendezVousResponse>(`/rendez-vous-prenataux?${params.toString()}`);
      setItems(response.data.data ?? []);
      setLastPage(response.data.last_page ?? 1);
      setTotal(response.data.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les rendez-vous prénataux.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, statut, du, au]);

  useEffect(() => { void charger(); }, [charger]);

  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-gradient-to-br from-indigo-800 via-violet-700 to-rose-600 p-6 text-white shadow-xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              <CalendarClock className="h-4 w-4" /> Santé maternelle
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Rendez-vous prénataux</h1>
            <p className="mt-2 max-w-2xl text-sm text-indigo-100">
              Vue transversale des rendez-vous de grossesse de votre périmètre. Le calendrier vaccinal des enfants reste dans son espace dédié.
            </p>
          </div>
          <Link href="/agent/grossesses" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-indigo-800 hover:bg-indigo-50">
            <CalendarDays className="h-4 w-4" /> Voir les grossesses
          </Link>
        </div>
        <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-100">Rendez-vous correspondant aux filtres</p>
          <p className="mt-1 text-3xl font-extrabold">{loading ? '—' : total}</p>
        </div>
      </header>

      {error && <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><ShieldAlert className="h-5 w-5 shrink-0" />{error}</div>}

      <section className="grid grid-cols-1 gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3">
        <label className="grid gap-1 text-xs font-semibold text-slate-600">Statut
          <select value={statut} onChange={(event) => { setStatut(event.target.value); setPage(1); }} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
            {STATUTS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-semibold text-slate-600">Du
          <input type="date" value={du} onChange={(event) => { setDu(event.target.value); setPage(1); }} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
        </label>
        <label className="grid gap-1 text-xs font-semibold text-slate-600">Au
          <input type="date" value={au} onChange={(event) => { setAu(event.target.value); setPage(1); }} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
        </label>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <h2 className="font-bold text-slate-900">Agenda prénatal</h2>
          <p className="text-sm text-slate-500">Les coordonnées et informations cliniques ne sont pas affichées dans cette vue globale.</p>
        </div>
        {loading ? (
          <div className="flex justify-center p-14"><Loader2 className="h-7 w-7 animate-spin text-indigo-600" /></div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 font-semibold text-slate-800">Aucun rendez-vous pour ces filtres</p>
            <p className="mt-1 text-sm text-slate-500">Les rendez-vous peuvent être planifiés depuis le dossier de chaque grossesse.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <article key={item.id} className="flex flex-col justify-between gap-3 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:px-6">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><Clock3 className="h-5 w-5" /></span>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{item.libelle}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {item.grossesse?.mere ? `${item.grossesse.mere.nom} ${item.grossesse.mere.prenom ?? ''}` : 'Dossier mère'}
                      {' · '}{labelEtat(item.type_rendez_vous)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Prévu le {new Date(item.prevu_le).toLocaleDateString('fr-ML')}
                      {' · '}Rappel : {labelEtat(item.rappel_statut)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.statut === 'PLANIFIE' ? 'bg-indigo-50 text-indigo-800' : item.statut === 'REALISE' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>{labelEtat(item.statut)}</span>
                  {item.grossesse?.id && <Link href={`/agent/grossesses/${item.grossesse.id}#rendez-vous`} className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-700 hover:text-indigo-900">Ouvrir <ChevronRight className="h-4 w-4" /></Link>}
                </div>
              </article>
            ))}
          </div>
        )}
        {!loading && lastPage > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
            <p className="text-xs text-slate-500">Page {page} sur {lastPage}</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40">Précédent</button>
              <button disabled={page >= lastPage} onClick={() => setPage((current) => Math.min(lastPage, current + 1))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40">Suivant</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
