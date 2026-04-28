'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [adminInfo, setAdminInfo] = useState<any>(null);

  useEffect(() => {
    // Récupérer les infos de l'admin depuis localStorage
    const storedAdmin = localStorage.getItem('adminInfo');
    if (storedAdmin) {
      setAdminInfo(JSON.parse(storedAdmin));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminInfo');
    window.location.href = '/login';
  };

  return (
    <>
      <style>{`
        /* Admin Layout Styles */
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: #f8fafc;
        }
        
        .admin-sidebar {
          width: 250px;
          background: linear-gradient(180deg, #10b981 0%, #14b8a6 100%);
          min-height: 100vh;
          color: white;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 1000;
          box-shadow: 2px 0 10px rgba(0,0,0,0.1);
        }
        
        .admin-main-content {
          margin-left: 250px;
          flex: 1;
          min-height: 100vh;
        }
        
        .admin-sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.2);
        }
        
        .admin-sidebar-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .admin-sidebar-logo-icon {
          width: 40px;
          height: 40px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }
        
        .admin-sidebar-logo-text h1 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0;
          color: white;
        }
        
        .admin-sidebar-logo-text p {
          font-size: 0.75rem;
          margin: 0;
          color: rgba(255,255,255,0.7);
        }
        
        .admin-sidebar-nav {
          padding: 1rem;
        }
        
        .admin-nav-link {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          color: rgba(255,255,255,0.8);
          text-decoration: none;
          border-radius: 8px;
          margin-bottom: 4px;
          transition: all 0.3s ease;
        }
        
        .admin-nav-link:hover {
          background: rgba(255,255,255,0.1);
          color: white;
        }
        
        .admin-nav-link.active {
          background: rgba(255,255,255,0.2);
          color: white;
        }
        
        .admin-nav-divider {
          border-top: 1px solid rgba(255,255,255,0.2);
          margin: 1rem 0;
        }
        
        .admin-sidebar-footer {
          padding: 1rem;
          border-top: 1px solid rgba(255,255,255,0.2);
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
        }
        
        .admin-user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        
        .admin-user-avatar {
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
        
        .admin-user-info h4 {
          font-size: 0.875rem;
          font-weight: 500;
          margin: 0;
          color: white;
        }
        
        .admin-user-info p {
          font-size: 0.75rem;
          margin: 0;
          color: rgba(255,255,255,0.7);
        }
        
        .admin-logout-btn {
          width: 100%;
          padding: 0.5rem 1rem;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .admin-logout-btn:hover {
          background: rgba(255,255,255,0.2);
        }
        
        .admin-header {
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border-bottom: 1px solid #e5e7eb;
          padding: 1rem 2rem;
        }
        
        .admin-header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .admin-header-title h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0;
          color: #111827;
        }
        
        .admin-header-title p {
          font-size: 0.875rem;
          margin: 0;
          color: #6b7280;
        }
        
        .admin-header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .admin-welcome-text {
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .admin-notification-btn {
          position: relative;
          padding: 0.5rem;
          background: transparent;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          cursor: pointer;
          color: #6b7280;
          transition: all 0.3s ease;
        }
        
        .admin-notification-btn:hover {
          color: #374151;
        }
        
        .admin-notification-badge {
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
        
        .admin-main {
          padding: 2rem;
        }
        
        @media (max-width: 768px) {
          .admin-sidebar {
            width: 100%;
            position: relative;
          }
          
          .admin-main-content {
            margin-left: 0;
          }
        }
      `}</style>
      
      <div className="admin-layout">
        {/* Sidebar */}
        <div className="admin-sidebar">
          {/* Logo */}
          <div className="admin-sidebar-header">
            <div className="admin-sidebar-logo">
              <div className="admin-sidebar-logo-icon">🏥</div>
              <div className="admin-sidebar-logo-text">
                <h1>Vaccin-Track</h1>
                <p>Espace Admin</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="admin-sidebar-nav">
            <Link
              href="/admin/dashboard"
              className="admin-nav-link active"
            >
              🏠 Tableau de bord
            </Link>
            
            <Link
              href="/admin/agents"
              className="admin-nav-link"
            >
              👤 Agents
            </Link>
            
            <Link
              href="/admin/centres"
              className="admin-nav-link"
            >
              🏥 Centres de santé
            </Link>
            
            <Link
              href="/admin/audit"
              className="admin-nav-link"
            >
              📊 Audit
            </Link>
            
            <Link
              href="/admin/utilisateurs"
              className="admin-nav-link"
            >
              👥 Utilisateurs
            </Link>
            
            <div className="admin-nav-divider"></div>
            
            <Link
              href="/admin/profile"
              className="admin-nav-link"
            >
              👤 Mon profil
            </Link>
          </nav>

          {/* User Profile */}
          <div className="admin-sidebar-footer">
            <div className="admin-user-profile">
              <div className="admin-user-avatar">
                {adminInfo ? 'AD' : 'AD'}
              </div>
              <div className="admin-user-info">
                <h4>{adminInfo ? 'Administrateur' : 'Admin'}</h4>
                <p>{adminInfo?.email || 'admin@vaccintrack.ml'}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="admin-logout-btn">
              🚪 Déconnexion
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="admin-main-content">
          {/* Top Bar */}
          <header className="admin-header">
            <div className="admin-header-content">
              <div className="admin-header-title">
                <h2>Espace Administrateur</h2>
                <p className="admin-welcome-text">
                  Bienvenue administrateur - Panneau de contrôle
                </p>
              </div>
              <div className="admin-header-actions">
                <button className="admin-notification-btn">
                  🔔
                  <span className="admin-notification-badge">5</span>
                </button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="admin-main">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}