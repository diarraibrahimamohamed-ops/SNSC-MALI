'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { Table } from '@/components/ui/Table';

interface AuditLog {
  id: string;
  action: string;
  model_type: string;
  user_id: string;
  created_at: string;
  details: any;
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchAudit = async () => {
      const token = localStorage.getItem('auth_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      
      try {
        const response = await fetch(`${API_URL}/journal-audit`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          setLogs(result.data || result);
        }
      } catch (error) {
        console.error('Error fetching audit logs:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchAudit();
    }
  }, [isAuthenticated]);

  const columns = [
    { key: 'created_at', label: 'Date', render: (row: any) => new Date(row.created_at).toLocaleString('fr-FR') },
    { key: 'action', label: 'Action', render: (row: any) => (
        <span className={`px-2 py-1 text-xs font-bold rounded-md ${
            row.action === 'CREATED' ? 'bg-emerald-100 text-emerald-800' :
            row.action === 'UPDATED' ? 'bg-blue-100 text-blue-800' :
            row.action === 'DELETED' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
        }`}>
            {row.action}
        </span>
    ) },
    { key: 'model_type', label: 'Entité', render: (row: any) => {
        const parts = String(row.model_type).split('\\');
        return parts[parts.length - 1];
    } },
    { key: 'user_id', label: 'Utilisateur ID' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Journal d'Audit</h1>
          <p className="text-sm text-gray-600 mt-1">Traçabilité des actions sur la plateforme</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-xl overflow-hidden border border-gray-200">
        <Table data={logs} columns={columns} loading={loading} />
      </div>
    </div>
  );
}
