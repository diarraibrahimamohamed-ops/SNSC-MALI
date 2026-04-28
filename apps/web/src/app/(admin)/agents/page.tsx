'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { PageHeader } from '@/components/layout/PageHeader';

interface Agent {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: string;
  centre_sante: {
    nom: string;
  };
  created_at: string;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      const data = await response.json();
      setAgents(data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'nom', label: 'Nom' },
    { key: 'prenom', label: 'Prénom' },
    { key: 'email', label: 'Email' },
    { key: 'telephone', label: 'Téléphone' },
    { key: 'role', label: 'Rôle' },
    { key: 'centre_sante.nom', label: 'Centre' },
  ];

  return (
    <div>
      <PageHeader 
        title="Agents de Santé"
        subtitle="Gestion des agents du système"
      >
        <Button>
          Ajouter un agent
        </Button>
      </PageHeader>

      <div className="bg-white shadow rounded-lg">
        <Table
          data={agents}
          columns={columns}
          loading={loading}
        />
      </div>
    </div>
  );
}
