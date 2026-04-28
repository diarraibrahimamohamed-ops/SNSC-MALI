'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { PageHeader } from '@/components/layout/PageHeader';

interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  statut: string;
  last_login: string;
  created_at: string;
}

export default function UtilisateursPage() {
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUtilisateurs();
  }, []);

  const fetchUtilisateurs = async () => {
    try {
      const response = await fetch('/api/utilisateurs');
      const data = await response.json();
      setUtilisateurs(data);
    } catch (error) {
      console.error('Error fetching utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'nom', label: 'Nom' },
    { key: 'prenom', label: 'Prénom' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Rôle' },
    { key: 'statut', label: 'Statut' },
    { key: 'last_login', label: 'Dernière connexion' },
  ];

  return (
    <div>
      <PageHeader 
        title="Utilisateurs"
        subtitle="Gestion des comptes utilisateurs"
      >
        <Button>
          Ajouter un utilisateur
        </Button>
      </PageHeader>

      <div className="bg-white shadow rounded-lg">
        <Table
          data={utilisateurs}
          columns={columns}
          loading={loading}
        />
      </div>
    </div>
  );
}
