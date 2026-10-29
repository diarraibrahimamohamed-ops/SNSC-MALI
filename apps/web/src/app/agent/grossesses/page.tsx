'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { CalendarHeart, CalendarRange, ChevronRight, Filter, HeartPulse, Loader2, Search, ShieldAlert, Users } from 'lucide-react';
import { Grossesse, labelEtat, maternalApi } from '@/lib/maternal-api';

type GrossesseAvecMere = Grossesse & {
  mere: {
    id: string;
    nom: string;
    prenom?: string | null;
    identifiant_sanitaire?: string | null;
  };
};

type GrossessesResponse = {
  data: {
    data: GrossesseAvecMere[];
    current_page?: number;
    last_page?: number;
    total?: number;
  };
};

function formatDate(value?: string | null): string {
  if (!value) return 'Non renseigné';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Non renseigné'
    : date.toLocaleDateString('fr-ML', { day: '2-digit', month: 'short', year: 'numeric' });
}

function ageGestationnel(dateDebut: string): string {
  const start = new Date(dateDebut);
  if (Number.isNaN(start.getTime()) || start.getTime() > Date.now()) return 'Datation à vérifier';
  const days = Math.floor((Date.now() - start.getTime()) / 86_400_000);
  return `${Math.floor(days / 7)} sem. + ${days % 7} j`;
}

export default function GrossessesPage() {
  const [items, setItems] = useState<GrossesseAvecMere[]>([]);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [dateDu, setDateDu] = useState('');
  const [dateAu, setDateAu] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), per_page: '25' });
      if (query) params.set('q', query);
      if (dateDu) params.set('du', dateDu);
      if (dateAu) params.set('au', dateAu);
      const response = await maternalApi<GrossessesResponse>(`/grossesses?${params.toString()}`);
      setItems(response.data.data ?? []);
      setLastPage(response.data.last_page ?? 1);
      setTotal(response.data.total ?? response.data.data?.length ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les grossesses.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, query, dateDu, dateAu]);

  useEffect(() => {
    void charger();
  }, [charger]);

  const rechercher = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
    setQuery(search.trim());
  };

  const appliquerDates = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
    void charger();
  };

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-3xl bg-gradient-to-br from-rose-800 via-rose-700 to-orange-500 p-6 text-white shadow-xl">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              <CalendarHeart className="h-4 w-4" /> Santé maternelle
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Grossesses suivies</h1>
            <p className="mt-2 max-w-2xl text-sm text-rose-50">
              Retrouvez les dossiers de grossesse de votre structure et accédez directement à leur parcours prénatal.
            </p>
          </div>
          <Link href="/agent/meres" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-rose-800 shadow-sm transition hover:bg-rose-50">
            <Users className="h-4 w-4" /> Ouvrir les dossiers mères
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-100">Dossiers trouvés</p>
            <p className="mt-1 text-2xl font-extrabold">{loading ? '—' : total}</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-100">Sur cette page</p>
            <p className="mt-1 text-2xl font-extrabold">{loading ? '—' : items.length}</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-100">Page</p>
            <p className="mt-1 text-2xl font-extrabold">{page} / {lastPage}</p>
          </div>
        </div>
      </header>

      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <ShieldAlert className="h-5 w-5 shrink-0" />{error}
        </div>
      )}

      <section className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <form onSubmit={rechercher} className="flex flex-col gap-3 sm:flex-row">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Rechercher une mère</span>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nom, prénom ou identifiant sanitaire de la mère" className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100" />
          </label>
          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
            <Search className="h-4 w-4" /> Rechercher
          </button>
        </form>
        <form onSubmit={appliquerDates} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="grid gap-1 text-xs font-semibold text-slate-600">Début estimé à partir du
            <input type="date" value={dateDu} onChange={(event) => setDateDu(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100" />
          </label>
          <label className="grid gap-1 text-xs font-semibold text-slate-600">Début estimé jusqu'au
            <input type="date" value={dateAu} onChange={(event) => setDateAu(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100" />
          </label>
          <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            <Filter className="h-4 w-4" /> Filtrer
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="font-bold text-slate-900">Liste des grossesses</h2>
            <p className="text-sm text-slate-500">Résultats limités au périmètre de votre structure sanitaire.</p>
          </div>
          <Link href="/agent/meres" className="text-sm font-semibold text-rose-700 hover:text-rose-900">Créer une grossesse depuis un dossier mère →</Link>
        </div>

        {loading ? (
          <div className="flex justify-center p-14"><Loader2 className="h-7 w-7 animate-spin text-rose-600" /></div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarRange className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 font-semibold text-slate-800">Aucune grossesse trouvée</p>
            <p className="mt-1 text-sm text-slate-500">Modifiez la recherche ou créez d'abord un dossier mère.</p>
            <Link href="/agent/meres" className="mt-4 inline-flex rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700">Accéder aux dossiers mères</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <article key={item.id} className="flex min-h-[230px] flex-col rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700"><HeartPulse className="h-5 w-5" /></span>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-900">{item.mere.nom} {item.mere.prenom ?? ''}</p>
                      <p className="truncate text-xs text-slate-500">{item.mere.identifiant_sanitaire || 'Identifiant non renseigné'}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">{labelEtat(item.statut)}</span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Début estimé</p>
                    <p className="mt-1 font-semibold text-slate-800">{formatDate(item.date_debut_estimee)}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Terme estimé</p>
                    <p className="mt-1 font-semibold text-slate-800">{formatDate(item.terme_estime)}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>{item.date_debut_estimee ? ageGestationnel(item.date_debut_estimee) : 'Datation non renseignée'}</span>
                  <span>·</span>
                  <span>{item.nombre_foetus} fœtus</span>
                  <span>·</span>
                  <span>{labelEtat(item.statut_validation)}</span>
                </div>
                <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                  <Link href={`/agent/meres/${item.mere.id}`} className="text-xs font-semibold text-slate-600 hover:text-rose-700">Dossier mère</Link>
                  <Link href={`/agent/grossesses/${item.id}`} className="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-rose-700">
                    Ouvrir le suivi <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && lastPage > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
            <p className="text-xs text-slate-500">Page {page} sur {lastPage}</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40">Précédent</button>
              <button disabled={page >= lastPage} onClick={() => setPage((current) => Math.min(lastPage, current + 1))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40">Suivant</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
