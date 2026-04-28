'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardStats {
  total_enfants: number;
  vaccinations_aujourd_hui: number;
  rendez_vous_aujourd_hui: number;
  relances_envoyees: number;
  enfants_a_risque: number;
  couverture_vaccinale: number;
  enfants_en_retard: number;
  vaccins_disponibles: number;
}

interface RecentActivity {
  id: number;
  type: 'vaccination' | 'rendez_vous' | 'alerte';
  titre: string;
  description: string;
  heure: string;
  statut: 'success' | 'warning' | 'info';
}

export default function AgentDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [agentInfo, setAgentInfo] = useState<any>(null);

  useEffect(() => {
    // Récupérer les infos de l'agent
    const storedAgent = localStorage.getItem('agentInfo');
    if (storedAgent) {
      setAgentInfo(JSON.parse(storedAgent));
    }

    // Simuler chargement des données
    setTimeout(() => {
      setStats({
        total_enfants: 156,
        vaccinations_aujourd_hui: 12,
        rendez_vous_aujourd_hui: 8,
        relances_envoyees: 24,
        enfants_a_risque: 3,
        couverture_vaccinale: 87,
        enfants_en_retard: 5,
        vaccins_disponibles: 45
      });
      setLoading(false);
    }, 1000);
  }, []);

  const recentActivities: RecentActivity[] = [
    {
      id: 1,
      type: 'vaccination',
      titre: 'Vaccination BCG',
      description: 'Traoré Aïssata - 2 mois',
      heure: '10:30',
      statut: 'success'
    },
    {
      id: 2,
      type: 'rendez_vous',
      titre: 'Rendez-vous manqué',
      description: 'Konaté Mohamed - VPO',
      heure: '09:15',
      statut: 'warning'
    },
    {
      id: 3,
      type: 'alerte',
      titre: 'Stock faible',
      description: 'Vaccin ROR - 10 doses restantes',
      heure: '08:45',
      statut: 'info'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre espace de travail...</p>
        </div>
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'vaccination': return '💉';
      case 'rendez_vous': return '📅';
      case 'alerte': return '⚠️';
      default: return '📋';
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <>
      <style>{`
        /* Agent Dashboard Styles */
        .agent-layout {
          display: flex;
          min-height: 100vh;
          background: #f8fafc;
        }
        
        .agent-sidebar {
          width: 250px;
          background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%);
          min-height: 100vh;
          color: white;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 1000;
          box-shadow: 2px 0 10px rgba(0,0,0,0.1);
        }
        
        .agent-main-content {
          margin-left: 250px;
          flex: 1;
          min-height: 100vh;
        }
        
        .agent-sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.2);
        }
        
        .agent-sidebar-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .agent-sidebar-logo-icon {
          width: 40px;
          height: 40px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }
        
        .agent-sidebar-logo-text h1 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0;
          color: white;
        }
        
        .agent-sidebar-logo-text p {
          font-size: 0.75rem;
          margin: 0;
          color: rgba(255,255,255,0.7);
        }
        
        .agent-sidebar-nav {
          padding: 1rem;
        }
        
        .agent-nav-link {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          color: rgba(255,255,255,0.8);
          text-decoration: none;
          border-radius: 8px;
          margin-bottom: 4px;
          transition: all 0.3s ease;
        }
        
        .agent-nav-link:hover {
          background: rgba(255,255,255,0.1);
          color: white;
        }
        
        .agent-nav-link.active {
          background: rgba(255,255,255,0.2);
          color: white;
        }
        
        .agent-nav-divider {
          border-top: 1px solid rgba(255,255,255,0.2);
          margin: 1rem 0;
        }
        
        .agent-sidebar-footer {
          padding: 1rem;
          border-top: 1px solid rgba(255,255,255,0.2);
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
        }
        
        .agent-user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        
        .agent-user-avatar {
          width: 32px;
          height: 32px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 0.75rem;
        }
        
        .agent-user-info h4 {
          font-size: 0.875rem;
          font-weight: 500;
          margin: 0;
          color: white;
        }
        
        .agent-user-info p {
          font-size: 0.75rem;
          margin: 0;
          color: rgba(255,255,255,0.7);
        }
        
        .agent-logout-btn {
          width: 100%;
          padding: 0.5rem 1rem;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .agent-logout-btn:hover {
          background: rgba(255,255,255,0.2);
        }
        
        .agent-header {
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border-bottom: 1px solid #e5e7eb;
          padding: 1rem 2rem;
        }
        
        .agent-header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .agent-header-title h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0;
          color: #111827;
        }
        
        .agent-header-title p {
          font-size: 0.875rem;
          margin: 0;
          color: #6b7280;
        }
        
        .agent-header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .agent-welcome-text {
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .agent-notification-btn {
          position: relative;
          padding: 0.5rem;
          background: transparent;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          cursor: pointer;
          color: #6b7280;
          transition: all 0.3s ease;
        }
        
        .agent-notification-btn:hover {
          color: #374151;
        }
        
        .agent-notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 16px;
          height: 16px;
          background: #dc3545;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.625rem;
          font-weight: bold;
        }
        
        .agent-main {
          padding: 2rem;
        }
        
        @media (max-width: 768px) {
          .agent-sidebar {
            width: 100%;
            position: relative;
          }
          
          .agent-main-content {
            margin-left: 0;
          }
        }
      `}</style>
      
      <div className="agent-layout">
        {/* Sidebar */}
        <div className="agent-sidebar">
          {/* Logo */}
          <div className="agent-sidebar-header">
            <div className="agent-sidebar-logo">
              <div className="agent-sidebar-logo-icon">👨‍⚕️</div>
              <div className="agent-sidebar-logo-text">
                <h1>Vaccin-Track</h1>
                <p>Espace Agent</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="agent-sidebar-nav">
            <Link
              href="/agent"
              className="agent-nav-link active"
            >
              🏠 Tableau de bord
            </Link>
            
            <Link
              href="/agent/enfants"
              className="agent-nav-link"
            >
              👶 Enfants
            </Link>
            
            <Link
              href="/agent/rendez-vous"
              className="agent-nav-link"
            >
              📅 Rendez-vous
            </Link>
            
            <Link
              href="/agent/vaccinations"
              className="agent-nav-link"
            >
              💉 Vaccinations
            </Link>
            
            <Link
              href="/agent/rapports"
              className="agent-nav-link"
            >
              📊 Rapports
            </Link>
            
            <div className="agent-nav-divider"></div>
            
            <Link
              href="/agent/profile"
              className="agent-nav-link"
            >
              👤 Mon profil
            </Link>
          </nav>

          {/* User Profile */}
          <div className="agent-sidebar-footer">
            <div className="agent-user-profile">
              <div className="agent-user-avatar">
                {agentInfo ? `${agentInfo.prenom[0]}${agentInfo.nom[0]}` : 'AG'}
              </div>
              <div className="agent-user-info">
                <h4>{agentInfo ? `${agentInfo.prenom} ${agentInfo.nom}` : 'Agent'}</h4>
                <p>{agentInfo?.email || 'agent@vaccintrack.ml'}</p>
              </div>
            </div>
            <button 
              onClick={() => {
                localStorage.removeItem('agentInfo');
                window.location.href = '/agent-auth';
              }} 
              className="agent-logout-btn"
            >
              🚪 Déconnexion
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="agent-main-content">
          {/* Top Bar */}
          <header className="agent-header">
            <div className="agent-header-content">
              <div className="agent-header-title">
                <h2>Espace Agent</h2>
                <p className="agent-welcome-text">
                  Bienvenue {agentInfo ? `${agentInfo.prenom}` : 'Agent'} - {agentInfo?.centre || 'Centre de santé'}
                </p>
              </div>
              <div className="agent-header-actions">
                <button className="agent-notification-btn">
                  🔔
                  <span className="agent-notification-badge">3</span>
                </button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="agent-main">
            <div>
              {/* Welcome Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
                <p className="text-gray-600 mt-2">
                  Bienvenue {agentInfo?.prenom || 'Agent'} - Voici votre activité du jour
                </p>
                <div className="mt-4 text-sm text-gray-500">
                  {new Date().toLocaleDateString('fr-ML', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>

              {/* Statistiques principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 shadow-lg">
                      <span className="text-3xl text-white">👶</span>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Enfants suivis</dt>
                        <dd className="text-2xl font-bold text-gray-900">{stats?.total_enfants || 0}</dd>
                        <dd className="text-xs text-gray-500 mt-1">Dans votre centre</dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 shadow-lg">
                      <span className="text-3xl text-white">💉</span>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Vaccinations aujourd'hui</dt>
                        <dd className="text-2xl font-bold text-gray-900">{stats?.vaccinations_aujourd_hui || 0}</dd>
                        <dd className="text-xs text-gray-500 mt-1">Séances complétées</dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-4 shadow-lg">
                      <span className="text-3xl text-white">📅</span>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Rendez-vous aujourd'hui</dt>
                        <dd className="text-2xl font-bold text-gray-900">{stats?.rendez_vous_aujourd_hui || 0}</dd>
                        <dd className="text-xs text-gray-500 mt-1">Planifiés</dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 shadow-lg">
                      <span className="text-3xl text-white">📧</span>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Relances envoyées</dt>
                        <dd className="text-2xl font-bold text-gray-900">{stats?.relances_envoyees || 0}</dd>
                        <dd className="text-xs text-gray-500 mt-1">SMS aujourd'hui</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alertes et Actions rapides */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Activités récentes</h3>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className={`p-4 rounded-lg border ${getStatusColor(activity.statut)}`}>
                        <div className="flex items-start">
                          <div className="flex-shrink-0 text-2xl">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium">{activity.titre}</h4>
                              <span className="text-xs text-gray-500">{activity.heure}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Actions rapides</h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200">
                      <span className="mr-2">➕</span>
                      Nouvelle vaccination
                    </button>
                    
                    <button className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200">
                      <span className="mr-2">📅</span>
                      Planifier RDV
                    </button>
                    
                    <button className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200">
                      <span className="mr-2">👶</span>
                      Ajouter un enfant
                    </button>
                    
                    <button className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-200">
                      <span className="mr-2">📧</span>
                      Envoyer rappels
                    </button>
                  </div>
                </div>
              </div>

              {/* Statistiques détaillées */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-500">Enfants en retard</h4>
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <div className="text-3xl font-bold text-red-600">{stats?.enfants_en_retard || 0}</div>
                  <p className="text-sm text-gray-600 mt-2">Nécessitent une attention</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-500">Stock de vaccins</h4>
                    <span className="text-2xl">💉</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-600">{stats?.vaccins_disponibles || 0}</div>
                  <p className="text-sm text-gray-600 mt-2">Doses disponibles</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-500">Couverture vaccinale</h4>
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="text-3xl font-bold text-green-600">{stats?.couverture_vaccinale || 0}%</div>
                  <p className="text-sm text-gray-600 mt-2">Taux actuel</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
