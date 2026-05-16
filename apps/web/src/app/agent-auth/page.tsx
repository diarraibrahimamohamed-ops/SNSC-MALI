'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/useAuth';

export default function AgentLoginPage() {
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login({ matricule, password });
      if (user.role === 'AGENT' || user.role === 'INFIRMIER' || user.role === 'MEDECIN') {
        router.push('/agent/dashboard');
      } else {
        setError('Accès réservé aux agents de santé.');
      }
    } catch (err: any) {
      setError(err.message || 'Identifiants invalides. Vérifiez votre matricule.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1b3e 50%, #0a0f1e 100%)' }}>
      
      {/* Left Panel — Branding */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '64px', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative circle */}
        <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', bottom: '-50px', right: '-50px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '64px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', boxShadow: '0 8px 24px rgba(59,130,246,0.4)' }}>💉</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: '18px', letterSpacing: '-0.5px' }}>Vaccin-Track</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>SNSC · Mali</div>
            </div>
          </div>

          {/* Headline */}
          <h1 style={{ color: '#fff', fontSize: '42px', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-1px', marginBottom: '20px' }}>
            Plateforme de<br />
            <span style={{ background: 'linear-gradient(90deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>suivi vaccinal</span><br />
            au Mali.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px', lineHeight: 1.7, maxWidth: '380px' }}>
            Suivez en temps réel la couverture vaccinale des enfants de 0 à 5 ans dans votre zone sanitaire.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '32px', marginTop: '48px' }}>
            {[
              { value: '15K+', label: 'Enfants suivis' },
              { value: '98%', label: 'Taux de saisie' },
              { value: '247', label: 'Centres actifs' },
            ].map(stat => (
              <div key={stat.label}>
                <div style={{ color: '#fff', fontSize: '24px', fontWeight: 800 }}>{stat.value}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 600, marginTop: '2px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div style={{ width: '460px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px', background: 'rgba(255,255,255,0.04)', borderLeft: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
        <div style={{ width: '100%' }}>
          
          <div style={{ marginBottom: '36px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '20px', padding: '6px 14px', marginBottom: '20px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }}></span>
              <span style={{ color: '#93c5fd', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Espace Agent</span>
            </div>
            <h2 style={{ color: '#fff', fontSize: '28px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.5px' }}>Connexion sécurisée</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Entrez vos identifiants professionnels pour accéder à votre espace.</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Matricule */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.5px' }}>
                MATRICULE PROFESSIONNEL
              </label>
              <input
                type="text"
                value={matricule}
                onChange={e => setMatricule(e.target.value)}
                placeholder="AGT-XXXXX"
                required
                style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', color: '#fff', fontSize: '15px', fontWeight: 600, outline: 'none', boxSizing: 'border-box', letterSpacing: '1px' }}
                onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.5px' }}>
                MOT DE PASSE
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ width: '100%', padding: '14px 48px 14px 16px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', color: '#fff', fontSize: '15px', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '16px', padding: 0 }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#fca5a5', fontSize: '13px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              style={{ width: '100%', padding: '16px', background: isLoading ? 'rgba(59,130,246,0.5)' : 'linear-gradient(135deg, #3b82f6, #6366f1)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '15px', fontWeight: 800, cursor: isLoading ? 'not-allowed' : 'pointer', letterSpacing: '0.5px', boxShadow: '0 8px 24px rgba(59,130,246,0.35)', transition: 'all 0.2s' }}
            >
              {isLoading ? 'Authentification en cours...' : 'Se connecter →'}
            </button>
          </form>

          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', marginBottom: '12px' }}>Vous êtes administrateur ?</p>
            <a href="/login" style={{ color: '#60a5fa', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
              🛡️ Accéder à l'espace admin
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
