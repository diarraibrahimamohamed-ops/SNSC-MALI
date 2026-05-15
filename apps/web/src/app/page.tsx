'use client';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Hero Section */}
      <nav className="h-20 flex items-center justify-between px-8 lg:px-20 border-b border-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-xl text-white">💉</div>
          <span className="text-xl font-black tracking-tight">Vaccin-Track <span className="text-emerald-600">Mali</span></span>
        </div>
        <div className="flex gap-4">
          <a href="/agent-auth" className="px-6 py-2.5 font-bold text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-all">Espace Agent</a>
          <a href="/login" className="px-6 py-2.5 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">Administration</a>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 lg:px-20 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="animate-fade-in">
            <span className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest mb-6">
              Système National de Suivi Vaccinal
            </span>
            <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] mb-8">
              Protéger chaque enfant, <br />
              <span className="text-emerald-600">partout au Mali.</span>
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed mb-10 max-w-lg">
              Une plateforme intelligente pour le suivi en temps réel de la vaccination, 
              l'analyse prédictive des risques et la gestion optimisée des centres de santé.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/agent-auth" className="px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 text-center">
                Commencer le suivi
              </a>
              <div className="flex items-center gap-4 px-6">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white"></div>
                  <div className="w-10 h-10 rounded-full bg-slate-300 border-2 border-white"></div>
                  <div className="w-10 h-10 rounded-full bg-slate-400 border-2 border-white"></div>
                </div>
                <p className="text-xs font-bold text-slate-400">Utilisé par +500 agents de santé</p>
              </div>
            </div>
          </div>

          <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="w-full aspect-square bg-slate-50 rounded-[4rem] relative overflow-hidden flex items-center justify-center border border-slate-100">
               <div className="text-[12rem]">🇲🇱</div>
            </div>
            {/* Floating stats card */}
            <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 animate-fade-in" style={{ animationDelay: '0.5s' }}>
               <p className="text-3xl font-black text-slate-900">84.2%</p>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Couverture Nationale</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
