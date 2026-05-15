'use client';

import { useState } from 'react';

export default function AgentsPage() {
  const [showModal, setShowModal] = useState(false);

  const agents = [
    { id: '1', nom_complet: 'Dr. Oumar Konaté', matricule: 'AGT-001', centre: 'CSRéf Commune III', statut: 'Actif', role: 'MEDECIN' },
    { id: '2', nom_complet: 'Aminata Traoré', matricule: 'AGT-002', centre: 'CSCOM Badalabougou', statut: 'Actif', role: 'INFIRMIER' },
    { id: '3', nom_complet: 'Sékou Keita', matricule: 'AGT-003', centre: 'CSRéf Commune I', statut: 'Inactif', role: 'AGENT' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Gestion des Agents</h2>
          <p className="text-sm text-slate-500 font-medium">Configurez les comptes des agents de santé</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all flex items-center gap-2"
        >
          <span>➕</span> Nouvel Agent
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50">
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Agent</th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Matricule</th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Centre d'Affectation</th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Statut</th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {agents.map((agent) => (
              <tr key={agent.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                      {agent.nom_complet.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{agent.nom_complet}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{agent.role}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6 text-sm font-bold text-slate-600">{agent.matricule}</td>
                <td className="p-6 text-sm font-bold text-slate-600">{agent.centre}</td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    agent.statut === 'Actif' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {agent.statut}
                  </span>
                </td>
                <td className="p-6 text-right space-x-2">
                  <button className="p-2 text-slate-400 hover:text-emerald-600 font-bold transition-colors">✏️</button>
                  <button className="p-2 text-slate-400 hover:text-red-500 font-bold transition-colors">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
