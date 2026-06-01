'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { Table } from '@/components/ui/Table';

interface CentreSante {
  id: string;
  nom: string;
  region: string;
  cercle: string;
  commune: string;
  type_etablissement: string;
}

export default function AdminCentresPage() {
  const [centres, setCentres] = useState<CentreSante[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchCentres = async () => {
      const token = localStorage.getItem('auth_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      
      try {
        const response = await fetch(`${API_URL}/centres-sante`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          setCentres(result.data || result);
        }
      } catch (error) {
        console.error('Error fetching centres:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchCentres();
    }
  }, [isAuthenticated]);

  const columns = [
    { key: 'nom', label: 'Nom du centre' },
    { key: 'type_etablissement', label: 'Type' },
    { key: 'region', label: 'Région' },
    { key: 'cercle', label: 'Cercle' },
    { key: 'commune', label: 'Commune' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Centres de Santé</h1>
          <p className="text-sm text-gray-600 mt-1">Gestion des centres de santé du Mali</p>
        </div>
        <button className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition">
          Ajouter un centre
        </button>
      </div>

      <div className="bg-white shadow rounded-xl overflow-hidden border border-gray-200">
        <Table data={centres} columns={columns} loading={loading} />
      </div>
    </div>
  );
}
