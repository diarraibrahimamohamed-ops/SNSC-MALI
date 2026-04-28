'use client';

import { useState, useEffect } from 'react';

interface DashboardStats {
  total_enfants: number;
  vaccinations_aujourd_hui: number;
  rendez_vous_aujourd_hui: number;
  relances_envoyees: number;
  enfants_a_risque: number;
  couverture_vaccinale: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler chargement des données
    setTimeout(() => {
      setStats({
        total_enfants: 1247,
        vaccinations_aujourd_hui: 89,
        rendez_vous_aujourd_hui: 156,
        relances_envoyees: 234,
        enfants_a_risque: 12,
        couverture_vaccinale: 87
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        /* Enhanced Dashboard Styles */
        .dashboard-header {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
          border: 1px solid #bbf7d0;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        
        .dashboard-header h1 {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #059669, #047857);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0 0 0.5rem 0;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .dashboard-header p {
          font-size: 1.125rem;
          color: #374151;
          margin: 0 0 1rem 0;
          font-weight: 500;
        }
        
        .dashboard-date {
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 1rem;
          background: white;
          border-radius: 8px;
          font-size: 0.875rem;
          color: #6b7280;
          border: 1px solid #d1d5db;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }
        
        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 1.75rem;
          box-shadow: 0 8px 16px rgba(0,0,0,0.08);
          border: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--color-start), var(--color-end));
        }
        
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.12);
          border-color: #d1d5db;
        }
        
        .stat-icon {
          width: 72px;
          height: 72px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          margin-right: 1.5rem;
          flex-shrink: 0;
          position: relative;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .stat-icon.blue {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          --color-start: #3b82f6;
          --color-end: #1d4ed8;
        }
        
        .stat-icon.green {
          background: linear-gradient(135deg, #10b981, #059669);
          --color-start: #10b981;
          --color-end: #059669;
        }
        
        .stat-icon.amber {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          --color-start: #f59e0b;
          --color-end: #d97706;
        }
        
        .stat-icon.purple {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          --color-start: #8b5cf6;
          --color-end: #7c3aed;
        }
        
        .stat-icon.red {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          --color-start: #ef4444;
          --color-end: #dc2626;
        }
        
        .stat-icon.teal {
          background: linear-gradient(135deg, #14b8a6, #0d9488);
          --color-start: #14b8a6;
          --color-end: #0d9488;
        }
        
        .stat-info h3 {
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0 0 0.25rem 0;
          color: #111827;
          line-height: 1;
        }
        
        .stat-info h6 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 0.25rem 0;
          color: #374151;
        }
        
        .stat-info p {
          font-size: 0.875rem;
          margin: 0;
          color: #6b7280;
        }
        
        .charts-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2.5rem;
        }
        
        .chart-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 8px 16px rgba(0,0,0,0.08);
          border: 1px solid #e5e7eb;
        }
        
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        
        .chart-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }
        
        .chart-badge {
          font-size: 0.75rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
          color: #374151;
          border-radius: 9999px;
          font-weight: 600;
          border: 1px solid #d1d5db;
        }
        
        .chart-content {
          height: 200px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 2px dashed #d1d5db;
          position: relative;
          overflow: hidden;
        }
        
        .chart-content.red {
          background: linear-gradient(135deg, #fef2f2, #fee2e2);
          border-color: #fecaca;
        }
        
        .chart-content.green {
          background: linear-gradient(135deg, #f0fdf4, #dcfce7);
          border-color: #bbf7d0;
        }
        
        .chart-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
          opacity: 0.8;
        }
        
        .chart-title-text {
          font-size: 1.125rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }
        
        .chart-subtitle {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 1.5rem;
        }
        
        .chart-stat {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          background: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          border: 1px solid #d1d5db;
        }
        
        .bottom-section {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }
        
        .actions-card, .alerts-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 8px 16px rgba(0,0,0,0.08);
          border: 1px solid #e5e7eb;
        }
        
        .section-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 1.5rem 0;
        }
        
        .actions-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        
        .action-btn {
          padding: 1rem;
          border: none;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          text-align: center;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .action-btn.blue {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
        }
        
        .action-btn.green {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }
        
        .action-btn.purple {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
        }
        
        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.2);
        }
        
        .action-btn span {
          font-size: 1.5rem;
        }
        
        .alerts-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .alert-item {
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          transition: all 0.3s ease;
        }
        
        .alert-item:hover {
          transform: translateX(4px);
        }
        
        .alert-item.red {
          background: linear-gradient(135deg, #fef2f2, #fee2e2);
          border-color: #fecaca;
          color: #991b1b;
        }
        
        .alert-item.amber {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          border-color: #fde68a;
          color: #92400e;
        }
        
        .alert-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }
        
        .alert-content h6 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 0.25rem 0;
        }
        
        .alert-content p {
          font-size: 0.875rem;
          margin: 0;
          opacity: 0.8;
        }
        
        @media (max-width: 1024px) {
          .charts-section {
            grid-template-columns: 1fr;
          }
          
          .bottom-section {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .actions-grid {
            grid-template-columns: 1fr;
          }
          
          .dashboard-header h1 {
            font-size: 2rem;
          }
        }
      `}</style>
      
      <div>
        {/* Header amélioré */}
        <div className="dashboard-header">
          <h1>Tableau de bord Administrateur</h1>
          <p>Vue d'ensemble du système de vaccination</p>
          <div className="dashboard-date">
            📅 {new Date().toLocaleDateString('fr-ML', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Statistiques principales améliorées */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">👶</div>
            <div className="stat-info">
              <h3>{stats?.total_enfants || 0}</h3>
              <h6>Total Enfants</h6>
              <p>Enregistrés dans le système</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">💉</div>
            <div className="stat-info">
              <h3>{stats?.vaccinations_aujourd_hui || 0}</h3>
              <h6>Vaccinations Aujourd'hui</h6>
              <p>Séances complétées</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon amber">📅</div>
            <div className="stat-info">
              <h3>{stats?.rendez_vous_aujourd_hui || 0}</h3>
              <h6>Rendez-vous Aujourd'hui</h6>
              <p>Planifiés</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">📧</div>
            <div className="stat-info">
              <h3>{stats?.relances_envoyees || 0}</h3>
              <h6>Relances Envoyées</h6>
              <p>SMS envoyés aujourd'hui</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon red">⚠️</div>
            <div className="stat-info">
              <h3>{stats?.enfants_a_risque || 0}</h3>
              <h6>Enfants à Risque</h6>
              <p>Nécessitent une attention</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon teal">📊</div>
            <div className="stat-info">
              <h3>{stats?.couverture_vaccinale || 0}%</h3>
              <h6>Couverture Vaccinale</h6>
              <p>Taux national</p>
            </div>
          </div>
        </div>

        {/* Graphiques et Analyses améliorés */}
        <div className="charts-section">
          <div className="chart-card">
            <div className="chart-header">
              <h4 className="chart-title">Distribution des Risques</h4>
              <span className="chart-badge">Analyse IA</span>
            </div>
            <div className="chart-content red">
              <div className="chart-icon">⚠️</div>
              <div className="chart-title-text">Graphique des risques</div>
              <div className="chart-subtitle">Analyse prédictive en cours</div>
              <div className="chart-stat">🔴 {stats?.enfants_a_risque || 0} enfants à risque élevé</div>
            </div>
          </div>
          
          <div className="chart-card">
            <div className="chart-header">
              <h4 className="chart-title">Couverture Vaccinale</h4>
              <span className="chart-badge">National</span>
            </div>
            <div className="chart-content green">
              <div className="chart-icon">✅</div>
              <div className="chart-title-text">Taux de couverture</div>
              <div className="chart-subtitle">Objectif OMS: 95%</div>
              <div className="chart-stat">{stats?.couverture_vaccinale || 0}%</div>
            </div>
          </div>
        </div>

        {/* Actions Rapides et Alertes améliorés */}
        <div className="bottom-section">
          <div className="actions-card">
            <h4 className="section-title">Actions Rapides</h4>
            <div className="actions-grid">
              <button className="action-btn blue">
                <span>➕</span>
                Nouvel Enfant
              </button>
              
              <button className="action-btn green">
                <span>📅</span>
                Planifier RDV
              </button>
              
              <button className="action-btn purple">
                <span>📧</span>
                Envoyer SMS
              </button>
            </div>
          </div>

          <div className="alerts-card">
            <h4 className="section-title">Alertes Critiques</h4>
            <div className="alerts-list">
              <div className="alert-item red">
                <span className="alert-icon">⚠️</span>
                <div className="alert-content">
                  <h6>Stock vaccins faible</h6>
                  <p>BCG - 15 doses restantes</p>
                </div>
              </div>
              
              <div className="alert-item amber">
                <span className="alert-icon">⏰</span>
                <div className="alert-content">
                  <h6>RDV manqués</h6>
                  <p>12 aujourd'hui</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
