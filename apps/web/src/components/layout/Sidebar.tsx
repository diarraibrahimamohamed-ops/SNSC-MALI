import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  role: 'admin' | 'agent';
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const adminMenuItems = [
    { href: '/admin/centres', label: 'Centres de Santé', icon: '🏥' },
    { href: '/admin/agents', label: 'Agents', icon: '👥' },
    { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: '👤' },
    { href: '/admin/audit', label: 'Journal d\'Audit', icon: '📋' },
  ];

  const agentMenuItems = [
    { href: '/dashboard', label: 'Tableau de Bord', icon: '📊' },
    { href: '/enfants', label: 'Enfants', icon: '👶' },
    { href: '/rendez-vous', label: 'Rendez-vous', icon: '📅' },
    { href: '/relances', label: 'Relances SMS', icon: '💬' },
    { href: '/risque', label: 'Évaluation Risque', icon: '⚠️' },
  ];

  const menuItems = role === 'admin' ? adminMenuItems : agentMenuItems;

  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold">Vaccin-Track</h2>
        <p className="text-sm text-gray-400 mt-1">
          {role === 'admin' ? 'Administration' : 'Agent de santé'}
        </p>
      </div>
      
      <nav className="mt-8">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
              pathname === item.href
                ? 'bg-gray-900 text-white border-r-4 border-blue-500'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <span className="mr-3 text-lg">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-0 w-64 p-6">
        <div className="text-sm text-gray-400">
          <p>Version 1.0.0</p>
          <p className="mt-1">© 2024 Vaccin-Track</p>
        </div>
      </div>
    </div>
  );
}
