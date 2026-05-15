'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/useAuth';

export default function AgentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [rendezVous, setRendezVous] = useState<any[]>([]);
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
        
        // Fetch Rendez-vous
        const rdvRes = await fetch(`${API_URL}/rendez-vous`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const rdvData = await rdvRes.json();

        setStats(statsData.data);
        setRendezVous(rdvData.data?.slice(0, 5) || []);
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
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent shadow-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in p-6 relative">
      {/* Background decoration for Premium Feel */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 blur-[120px]"></div>
        <div className="absolute top-[30%] -right-[10%] w-[40%] h-[40%] rounded-full bg-emerald-400/20 blur-[100px]"></div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Bonjour, {user?.nom_complet || 'Agent'} 👋</h1>
          <p className="text-slate-500 font-medium mt-1">Voici le résumé de votre activité sanitaire pour aujourd'hui.</p>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ActionCard 
          title="Rendez-vous" 
          count={stats?.rendez_vous_aujourd_hui || "0"} 
          icon="📅" 
          color="from-blue-500 to-indigo-600" 
          description="Enfants attendus aujourd'hui"
        />
        <ActionCard 
          title="Relances SMS" 
          count={stats?.relances_envoyees || "0"} 
          icon="📱" 
          color="from-amber-400 to-orange-500" 
          description="Envoyées ce jour"
        />
        <ActionCard 
          title="Vaccinations" 
          count={stats?.vaccinations_aujourd_hui || "0"} 
          icon="✅" 
          color="from-emerald-400 to-teal-500" 
          description="Réalisées aujourd'hui"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Appointments Table */}
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/40 shadow-xl shadow-slate-200/50 relative overflow-hidden transition-all hover:shadow-2xl hover:shadow-blue-900/5">
          <h3 className="font-bold text-xl text-slate-900 mb-6 flex items-center gap-3">
            <span className="p-2 bg-blue-100 rounded-xl text-blue-600">🚀</span> 
            Prochaines Vaccinations
          </h3>
          <div className="space-y-3">
            {rendezVous && rendezVous.length > 0 ? (
               rendezVous.map((rdv: any, idx: number) => (
                  <PatientRow 
                    key={rdv.id || idx}
                    name={rdv.enfant?.nom ? `${rdv.enfant.prenom} ${rdv.enfant.nom}` : "Enfant non spécifié"} 
                    vaccine={rdv.motif || "Vaccination standard"} 
                    status={rdv.statut === 'en retard' ? 'urgent' : 'normal'} 
                    time={new Date(rdv.date_rendez_vous).toLocaleDateString()} 
                  />
               ))
            ) : (
              <p className="text-sm text-slate-500 font-medium text-center py-6">Aucun rendez-vous planifié aujourd'hui.</p>
            )}
          </div>
          <button className="w-full mt-6 py-3.5 bg-gradient-to-r from-slate-800 to-slate-900 text-white font-bold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg text-sm">
            Voir tout le planning
          </button>
        </div>

        {/* Risk Monitor & Stats */}
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/40 shadow-xl shadow-slate-200/50">
          <h3 className="font-bold text-xl text-slate-900 mb-6 flex items-center gap-3">
            <span className="p-2 bg-purple-100 rounded-xl text-purple-600">🧠</span> 
            Couverture & Alertes
          </h3>
          
          {stats?.enfants_a_risque > 0 && (
            <div className="p-5 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-red-100/50 mb-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex gap-3 items-center mb-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <p className="text-red-800 font-bold text-sm">Alerte : {stats.enfants_a_risque} enfants à risque élevé</p>
              </div>
              <p className="text-red-600/80 text-xs font-medium">Une attention immédiate est requise pour assurer le suivi de ces enfants.</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 border border-slate-200/50">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Enfants</p>
              <p className="text-3xl font-black text-slate-800">{stats?.total_enfants || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 border border-slate-200/50">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Couverture</p>
              <p className="text-3xl font-black text-slate-800">{stats?.couverture_vaccinale || 0}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ title, count, icon, color, description }: { title: string, count: string, icon: string, color: string, description: string }) {
  return (
    <div className="group bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-white shadow-lg shadow-slate-200/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center gap-5 mb-4">
        <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center text-2xl shadow-lg transform group-hover:rotate-6 transition-transform`}>
          <span className="drop-shadow-md">{icon}</span>
        </div>
        <div>
          <h4 className="text-3xl font-black text-slate-800">{count}</h4>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</p>
        </div>
      </div>
      <p className="text-sm text-slate-600 font-medium">{description}</p>
    </div>
  );
}

function PatientRow({ name, vaccine, status, time }: { name: string, vaccine: string, status: 'urgent' | 'normal' | 'retard', time: string }) {
  const statusStyles = {
    urgent: 'bg-red-50 text-red-600 border-red-100',
    normal: 'bg-blue-50 text-blue-600 border-blue-100',
    retard: 'bg-amber-50 text-amber-600 border-amber-100'
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white hover:bg-slate-50 rounded-2xl transition-all cursor-pointer border border-slate-100 shadow-sm hover:shadow">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 bg-gradient-to-tr from-slate-100 to-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 shadow-inner">
          {name[0]}
        </div>
        <div>
          <p className="font-bold text-slate-800 text-sm">{name}</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{vaccine}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-slate-400">{time}</span>
        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${statusStyles[status]}`}>
          {status}
        </span>
      </div>
    </div>
  );
}
