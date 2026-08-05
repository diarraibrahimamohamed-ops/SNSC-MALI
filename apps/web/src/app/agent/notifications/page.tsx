'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/useAuth';

interface NotificationSms {
  id: string;
  telephone: string;
  message: string;
  statut: string;
  date_envoi: string;
  enfant: { id: string; nom: string; prenom: string } | null;
}

export default function AgentNotificationsPage() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationSms[]>([]);
  const [loading, setLoading] = useState(true);
  const [declenching, setDeclenching] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api';

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/relances-sms`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data || []);
      } else {
        setError('Impossible de charger les relances SMS.');
      }
    } catch {
      setError('Erreur réseau lors du chargement des relances.');
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    if (isAuthenticated) fetchNotifications();
  }, [isAuthenticated, fetchNotifications]);

  const declencherRelances = async () => {
    const token = localStorage.getItem('auth_token');
    setDeclenching(true);
    setMessage('');
    setError('');
    try {
      const res = await fetch(`${API_URL}/relances-sms/declencher`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) {
        const r = data.resultats || {};
        setMessage(
          `Relances traitées : ${r.envoyes ?? 0} envoyé(s), ${r.echecs ?? 0} échec(s), ${r.ignores ?? 0} ignoré(s).`
        );
        await fetchNotifications();
      } else {
        setError(data.message || 'Échec du déclenchement des relances.');
      }
    } catch {
      setError('Erreur réseau lors du déclenchement.');
    } finally {
      setDeclenching(false);
    }
  };

  const statutStyle = (statut: string) => {
    if (statut === 'ENVOYE') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (statut === 'NON_ENVOYE') return 'bg-red-50 text-red-700 border-red-100';
    return 'bg-slate-50 text-slate-600 border-slate-100';
  };

  return (
    <div className="space-y-8 animate-fade-in p-6 relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-orange-400/10 blur-[120px]" />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">SMS & Relances</h1>
          <p className="text-slate-500 font-medium mt-1">
            Suivi des notifications Telerivet envoyées aux parents (rappels vaccinaux).
          </p>
        </div>
        <button
          onClick={declencherRelances}
          disabled={declenching}
          className="px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-2xl font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60"
        >
          {declenching ? 'Envoi en cours...' : 'Déclencher les relances'}
        </button>
      </div>

      {message && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-5 py-4 text-emerald-800 text-sm font-medium">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-100 px-5 py-4 text-red-800 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/50 shadow-xl shadow-slate-200/40 overflow-hidden">
        {loading ? (
          <div className="p-24 flex flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
            <p className="text-slate-500 font-bold">Chargement des notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-3xl mb-4">📱</div>
            <p className="text-slate-600 font-bold">Aucune notification enregistrée</p>
            <p className="text-slate-400 text-sm mt-2">
              Les relances automatiques apparaîtront ici après envoi via Telerivet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                  <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest">Enfant</th>
                  <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest">Téléphone</th>
                  <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest">Statut</th>
                  <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="p-5 text-xs font-black text-slate-400 uppercase tracking-widest">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {notifications.map((n) => (
                  <tr key={n.id} className="hover:bg-white/80 transition-colors">
                    <td className="p-5">
                      {n.enfant ? (
                        <Link
                          href={`/agent/enfants/${n.enfant.id}`}
                          className="font-bold text-slate-900 hover:text-blue-600"
                        >
                          {n.enfant.nom} {n.enfant.prenom}
                        </Link>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="p-5 text-sm font-medium text-slate-600">{n.telephone || '—'}</td>
                    <td className="p-5">
                      <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border ${statutStyle(n.statut)}`}>
                        {n.statut?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-5 text-sm text-slate-500">
                      {n.date_envoi
                        ? new Date(n.date_envoi).toLocaleString('fr-FR')
                        : '—'}
                    </td>
                    <td className="p-5 text-xs text-slate-500 max-w-xs truncate" title={n.message}>
                      {n.message?.slice(0, 80)}{(n.message?.length ?? 0) > 80 ? '…' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
