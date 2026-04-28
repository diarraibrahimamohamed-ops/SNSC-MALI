'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { PageHeader } from '@/components/layout/PageHeader';

interface AuditLog {
  id: string;
  utilisateur: {
    nom: string;
    prenom: string;
  };
  action: string;
  ressource: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date_debut: '',
    date_fin: '',
    utilisateur: '',
    action: ''
  });

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(`/api/audit?${queryParams}`);
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'utilisateur.nom', label: 'Utilisateur' },
    { key: 'action', label: 'Action' },
    { key: 'ressource', label: 'Ressource' },
    { key: 'ip_address', label: 'Adresse IP' },
    { key: 'created_at', label: 'Date' },
  ];

  return (
    <div>
      <PageHeader 
        title="Journal d'Audit"
        subtitle="Historique des actions du système"
      >
        <Button onClick={() => window.print()}>
          Exporter
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="date"
            placeholder="Date début"
            className="px-3 py-2 border border-gray-300 rounded-md"
            value={filters.date_debut}
            onChange={(e) => setFilters({...filters, date_debut: e.target.value})}
          />
          <input
            type="date"
            placeholder="Date fin"
            className="px-3 py-2 border border-gray-300 rounded-md"
            value={filters.date_fin}
            onChange={(e) => setFilters({...filters, date_fin: e.target.value})}
          />
          <input
            type="text"
            placeholder="Utilisateur"
            className="px-3 py-2 border border-gray-300 rounded-md"
            value={filters.utilisateur}
            onChange={(e) => setFilters({...filters, utilisateur: e.target.value})}
          />
          <select
            className="px-3 py-2 border border-gray-300 rounded-md"
            value={filters.action}
            onChange={(e) => setFilters({...filters, action: e.target.value})}
          >
            <option value="">Toutes les actions</option>
            <option value="CREATE">Création</option>
            <option value="UPDATE">Modification</option>
            <option value="DELETE">Suppression</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <Table
          data={logs}
          columns={columns}
          loading={loading}
        />
      </div>
    </div>
  );
}
