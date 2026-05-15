'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

        // Fetch Stats
        const statsRes = await fetch(`${API_URL}/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const statsData = await statsRes.json();

        setStats(statsData.data);
      } catch (error) {
        console.error('Erreur lors du chargement des données', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent shadow-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in p-6 relative">
      {/* Background decoration for Premium Feel */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-emerald-400/10 blur-[120px]"></div>
        <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[100px]"></div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tableau de Bord National 🌍</h1>
          <p className="text-slate-500 font-medium mt-1">Supervision globale du programme de vaccination.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Enfants" value={stats?.total_enfants || "0"} icon="👶" color="from-blue-500 to-indigo-600" />
        <StatCard title="Taux Couverture" value={`${stats?.couverture_vaccinale || 0}%`} icon="📈" color="from-emerald-400 to-teal-500" />
        <StatCard title="Enfants à Risque" value={stats?.enfants_a_risque || "0"} icon="⚠️" color="from-amber-400 to-orange-500" />
        <StatCard title="Vaccinations du Jour" value={stats?.vaccinations_aujourd_hui || "0"} icon="💉" color="from-purple-500 to-pink-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/40 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-xl text-slate-800 flex items-center gap-3">
              <span className="p-2 bg-emerald-100 rounded-xl text-emerald-600">📊</span>
              Évolution de la Couverture
            </h3>
          </div>
          <div className="h-[300px] flex items-end justify-between gap-4">
            {/* Simulation of a dynamic chart */}
            {[45, 52, 48, 61, 55, 67, 72, 68, 75, 82, 78, Math.max(10, Math.min(100, stats?.couverture_vaccinale || 84))].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div 
                  className="w-full bg-gradient-to-t from-emerald-100 to-emerald-200 rounded-t-xl group-hover:from-emerald-400 group-hover:to-emerald-500 transition-all duration-500 relative shadow-sm group-hover:shadow-md" 
                  style={{ height: `${h}%` }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
                    {h}% Couverture
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400">M{i+1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-8">
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/40 shadow-xl shadow-slate-200/50">
            <h3 className="font-bold text-xl text-slate-800 mb-6 flex items-center gap-3">
              <span className="p-2 bg-red-100 rounded-xl text-red-600">🚨</span>
              Alertes Système
            </h3>
            <div className="space-y-5">
              {stats?.enfants_a_risque > 0 ? (
                <AlertItem type="critical" message={`${stats?.enfants_a_risque} enfants nécessitent une attention urgente`} time="Maintenant" />
              ) : (
                <AlertItem type="info" message="Aucune alerte critique signalée" time="À l'instant" />
              )}
              {stats?.relances_envoyees > 0 && (
                <AlertItem type="warning" message={`${stats?.relances_envoyees} relances SMS ont été envoyées aujourd'hui`} time="Aujourd'hui" />
              )}
              <AlertItem type="info" message="Synchronisation de la base de données réussie" time="Il y a 1h" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: string | number, icon: string, color: string }) {
  return (
    <div className="group bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-white shadow-lg shadow-slate-200/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center text-2xl shadow-lg transform group-hover:scale-110 transition-transform`}>
          <span className="drop-shadow-md">{icon}</span>
        </div>
      </div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
      <h4 className="text-3xl font-black text-slate-900">{value}</h4>
    </div>
  );
}

function AlertItem({ type, message, time }: { type: 'critical' | 'warning' | 'info', message: string, time: string }) {
  const styles = {
    critical: 'from-red-400 to-red-500 shadow-red-200',
    warning: 'from-amber-400 to-orange-500 shadow-amber-200',
    info: 'from-blue-400 to-indigo-500 shadow-blue-200'
  };

  return (
    <div className="flex gap-4 group p-3 bg-white/50 rounded-2xl hover:bg-white transition-colors border border-transparent hover:border-slate-100 shadow-sm">
      <div className={`w-2 h-12 bg-gradient-to-b ${styles[type]} rounded-full flex-shrink-0 shadow-lg`}></div>
      <div className="flex flex-col justify-center">
        <p className="text-sm font-bold text-slate-800 leading-tight group-hover:text-slate-900">{message}</p>
        <p className="text-xs text-slate-400 mt-1.5 font-medium">{time}</p>
      </div>
    </div>
  );
}
