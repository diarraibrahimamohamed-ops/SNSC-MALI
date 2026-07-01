'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AuthUser {
  id: string;
  nom_complet?: string;
  matricule: string;
  role: string;
  centre_sante_id?: string;
  email?: string;
  nom?: string;
  prenom?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { matricule: string; password: string }) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const fetchUser = useCallback(async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      const data = await response.json();
      const userData = data.data;

      // Determine role: if no role field, check stored role
      if (!userData.role) {
        const storedRole = localStorage.getItem('auth_role');
        if (storedRole) userData.role = storedRole;
      }

      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Fetch user error:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_role');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await fetchUser(token);
      } else {
        setIsLoading(false);
      }
    };
    initAuth();
  }, [fetchUser]);

  const login = async (credentials: { matricule: string; password: string }) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Gérer les messages de verrouillage progressif
        if (response.status === 429) {
          throw new Error(errorData.message || 'Trop de tentatives. Réessayez plus tard.');
        } else if (response.status === 423) {
          throw new Error(errorData.message || 'Compte verrouillé. Contactez l\'administrateur.');
        } else if (response.status === 500) {
          throw new Error('Erreur serveur. Veuillez réessayer.');
        }
        
        throw new Error(errorData.message || 'Identifiants invalides');
      }

      const data = await response.json();
      const { access_token } = data;

      // Backend returns 'agent' key for agents, 'admin' key for admins
      const userData: AuthUser = data.agent || data.admin;
      if (!userData) {
        throw new Error('Réponse serveur invalide');
      }

      // If the user came from the admin response, ensure role is set
      if (data.admin && !userData.role) {
        userData.role = 'ADMIN';
      }

      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('auth_role', userData.role || '');
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (error) {
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const token = localStorage.getItem('auth_token');
    try {
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_role');
      setUser(null);
      setIsAuthenticated(false);
      router.push('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
