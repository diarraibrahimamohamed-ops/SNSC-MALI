'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/layout/PageHeader';

interface CentreSante {
  id: string;
  nom: string;
  adresse: string;
  telephone: string;
  email: string;
  ville: string;
  region: string;
}

export default function CentresPage() {
  const [centres, setCentres] = useState<CentreSante[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCentres();
  }, []);

  const fetchCentres = async () => {
    try {
      const response = await fetch('/api/centres-sante');
      const data = await response.json();
      setCentres(data);
    } catch (error) {
      console.error('Error fetching centres:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'nom', label: 'Nom' },
    { key: 'adresse', label: 'Adresse' },
    { key: 'telephone', label: 'Téléphone' },
    { key: 'email', label: 'Email' },
    { key: 'ville', label: 'Ville' },
    { key: 'region', label: 'Région' },
  ];

  return (
    <div>
      <PageHeader 
        title="Centres de Santé"
        subtitle="Gestion des centres de vaccination"
      >
        <Button onClick={() => setShowModal(true)}>
          Ajouter un centre
        </Button>
      </PageHeader>

      <div className="bg-white shadow rounded-lg">
        <Table
          data={centres}
          columns={columns}
          loading={loading}
        />
      </div>

      {showModal && (
        <Modal
          title="Ajouter un centre de santé"
          onClose={() => setShowModal(false)}
        >
          {/* Form content here */}
          <div className="p-6">
            <p>Formulaire d'ajout de centre à implémenter</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
