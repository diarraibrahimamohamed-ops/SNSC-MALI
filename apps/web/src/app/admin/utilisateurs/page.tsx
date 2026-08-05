'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { Table } from '@/components/ui/Table';

interface Utilisateur {
  id: string;
  name?: string;
  email: string;
  role?: string;
  matricule?: string;
}

export default function AdminUtilisateursPage() {
  const [users, setUsers] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('auth_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api';
      
      try {
        const response = await fetch(`${API_URL}/utilisateurs`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          setUsers(result.data || result);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  const columns = [
    { key: 'name', label: 'Nom', render: (row: any) => row.name || row.nom_complet || 'N/A' },
    { key: 'email', label: 'Email' },
    { key: 'matricule', label: 'Matricule' },
    { key: 'role', label: 'Rôle', render: (row: any) => (
        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-md text-xs font-semibold">
          {row.role || 'UTILISATEUR'}
        </span>
    ) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-sm text-gray-600 mt-1">Gestion des accès au système</p>
        </div>
        <button className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition">
          Ajouter un utilisateur
        </button>
      </div>

      <div className="bg-white shadow rounded-xl overflow-hidden border border-gray-200">
        <Table data={users} columns={columns} loading={loading} />
      </div>
    </div>
  );
}
