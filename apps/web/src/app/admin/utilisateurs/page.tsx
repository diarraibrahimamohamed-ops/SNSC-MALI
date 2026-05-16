'use client';

export default function AdminUtilisateursPage() {
  return (
    <div className="space-y-8 animate-fade-in p-6 relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] rounded-full bg-purple-400/10 blur-[120px]"></div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Utilisateurs Globaux 👥</h1>
          <p className="text-slate-500 font-medium mt-1">Gestion complète des accès au système.</p>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/50 shadow-xl shadow-slate-200/40 overflow-hidden relative p-10 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-purple-100 text-4xl mb-6 shadow-inner">🚧</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Module en cours de construction</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          Interface d'administration des utilisateurs et des rôles en cours de déploiement.
        </p>
      </div>
    </div>
  );
}
