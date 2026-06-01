'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { PageHeader } from '@/components/layout/PageHeader';
import { Table } from '@/components/ui/Table';

interface Agent {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: string;
  centre_sante?: {
    nom: string;
  };
}

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchAgents = async () => {
      const token = localStorage.getItem('auth_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      
      try {
        const response = await fetch(`${API_URL}/agents`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          setAgents(result.data || result);
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchAgents();
    }
  }, [isAuthenticated]);

  const columns = [
    { key: 'nom', label: 'Nom' },
    { key: 'prenom', label: 'Prénom' },
    { key: 'email', label: 'Email' },
    { key: 'telephone', label: 'Téléphone' },
    { key: 'role', label: 'Rôle' },
    { key: 'centre_sante.nom', label: 'Centre' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agents de Santé</h1>
          <p className="text-sm text-gray-600 mt-1">Gestion des agents du système</p>
        </div>
        <button className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition">
          Ajouter un agent
        </button>
      </div>

      <div className="bg-white shadow rounded-xl overflow-hidden border border-gray-200">
        <Table data={agents} columns={columns} loading={loading} />
      </div>
    </div>
  );
}
