'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing session on mount
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchUser();
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      const { token, user: userData } = data;

      localStorage.setItem('auth_token', token);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      const userData = await response.json();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Fetch user error:', error);
      localStorage.removeItem('auth_token');
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
  };
}
