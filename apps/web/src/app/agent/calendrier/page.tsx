'use client';

import { VACCINS_MALI } from '@/constants/vaccins';
import { CalendarDays, Info } from 'lucide-react';

export default function AgentCalendrierPage() {
  const enfantsVaccins = VACCINS_MALI.filter(v => v.id.endsWith('101') || v.id.endsWith('102') || v.id.endsWith('103') || v.id.endsWith('104') || v.id.endsWith('105') || v.id.endsWith('106') || v.id.endsWith('107') || v.id.endsWith('108') || v.id.endsWith('109') || v.id.endsWith('110') || v.id.endsWith('111') || v.id.endsWith('112'));
  const fillesVaccins = VACCINS_MALI.filter(v => v.id.endsWith('118'));

  return (
    <div className="space-y-8 animate-fade-in p-6 relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[120px]"></div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Calendrier de Vaccination 📅</h1>
          <p className="text-slate-500 font-medium mt-1">Programme officiel du Mali (PEV)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enfants */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="text-2xl">👶</span> Enfants de 0 à 11 mois
          </h2>
          <div className="space-y-4">
            {enfantsVaccins.map(v => (
              <div key={v.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 gap-4">
                <div>
                  <div className="font-bold text-slate-900" style={{ color: v.couleur }}>{v.nom}</div>
                  <div className="text-sm text-slate-500 mt-1">{v.cible}</div>
                </div>
                <div className="text-sm font-semibold bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100 text-center sm:text-right min-w-[200px]">
                  {v.periode}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {/* Filles */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="text-2xl">👧</span> Jeunes Filles
            </h2>
            <div className="space-y-4">
              {fillesVaccins.map(v => (
                <div key={v.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-purple-50 border border-purple-100 gap-4">
                  <div>
                    <div className="font-bold text-purple-700">{v.nom}</div>
                    <div className="text-sm text-purple-600 mt-1">{v.cible}</div>
                  </div>
                  <div className="text-sm font-semibold bg-white px-4 py-2 rounded-lg shadow-sm border border-purple-100 text-center sm:text-right min-w-[200px] text-purple-800">
                    {v.periode}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 flex gap-4 text-blue-800">
            <Info className="h-6 w-6 flex-shrink-0" />
            <p className="text-sm font-medium leading-relaxed">
              Ce calendrier reflète le Programme Élargi de Vaccination (PEV) en vigueur au Mali. Les dates d'administration sont calculées automatiquement par le système lors de la création du dossier de l'enfant.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
