'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/useAuth';

export default function LoginPage() {
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
      if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
        router.push('/admin/dashboard');
      } else {
        setError("Accès réservé aux administrateurs. Utilisez l'espace Agent.");
      }
    } catch (err: any) {
      setError(err.message || 'Identifiants invalides.');
    }
  };

  return (
    <main className="loginPage">
      <section className="hero">
        <div className="heroAccent heroAccentTop" />
        <div className="heroAccent heroAccentBottom" />

        <div className="heroContent">
          <div className="brandRow">
            <div className="brandIcon">💉</div>
            <div>
              <div className="brandTitle">Vaccin-Track</div>
              <div className="brandSubtitle">SNSC · Mali</div>
            </div>
          </div>

          <h1 className="heroTitle">
            Espace<br />
            <span>Administration</span>
          </h1>
          <p className="heroDescription">
            Accès réservé au personnel administrateur autorisé du Système National de Suivi Vaccinal.
          </p>

          <div className="statsRow">
            {[{ value: '247', label: 'Centres actifs' }, { value: '15K+', label: 'Enfants suivis' }, { value: '98%', label: 'Taux de saisie' }].map(s => (
              <div key={s.label} className="statCard">
                <div className="statValue">{s.value}</div>
                <div className="statLabel">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panelInner">
          <div className="panelHeading">
            <div className="pill">Espace Admin</div>
            <h2>Connexion sécurisée</h2>
            <p>Entrez vos identifiants administrateurs.</p>
          </div>

          <form onSubmit={handleSubmit} className="loginForm">
            <label className="fieldLabel">MATRICULE ADMINISTRATEUR</label>
            <input
              type="text"
              value={matricule}
              onChange={e => setMatricule(e.target.value)}
              placeholder="ADM-XXXXX"
              required
              className="fieldInput"
            />

            <label className="fieldLabel">MOT DE PASSE</label>
            <div className="passwordField">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="fieldInput"
              />
              <button type="button" className="toggleButton" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>

            {error && <div className="errorBanner">⚠️ {error}</div>}

            <button type="submit" disabled={isLoading} className="submitButton">
              {isLoading ? 'Authentification...' : 'Connexion Administration →'}
            </button>
          </form>

          <div className="footerLink">
            <p>Vous êtes un agent de santé ?</p>
            <a href="/agent-auth">🩺 Accéder à l'espace Agent</a>
          </div>
        </div>
      </section>

      <style jsx>{`
        .loginPage {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          background: radial-gradient(circle at top left, rgba(59,130,246,0.16), transparent 28%),
            radial-gradient(circle at bottom right, rgba(16,185,129,0.08), transparent 28%),
            linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%);
        }

        .hero,
        .panel {
          padding: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero {
          position: relative;
          overflow: hidden;
        }

        .heroAccent {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          opacity: 0.55;
        }

        .heroAccentTop {
          top: -120px;
          left: -120px;
          width: 520px;
          height: 520px;
          background: radial-gradient(circle, rgba(59,130,246,0.16) 0%, transparent 70%);
        }

        .heroAccentBottom {
          bottom: -80px;
          right: -80px;
          width: 420px;
          height: 420px;
          background: radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%);
        }

        .heroContent {
          position: relative;
          z-index: 1;
          max-width: 520px;
          width: 100%;
          color: #fff;
        }

        .brandRow {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 48px;
        }

        .brandIcon {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          display: grid;
          place-items: center;
          font-size: 24px;
          box-shadow: 0 8px 24px rgba(37,99,235,0.4);
        }

        .brandTitle {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .brandSubtitle {
          color: rgba(255,255,255,0.45);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .heroTitle {
          font-size: clamp(2.5rem, 5vw, 4.5rem);
          line-height: 1.05;
          font-weight: 900;
          letter-spacing: -1px;
          margin-bottom: 20px;
        }

        .heroTitle span {
          background: linear-gradient(90deg, #60a5fa, #34d399);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .heroDescription {
          color: rgba(255,255,255,0.78);
          font-size: 1rem;
          line-height: 1.8;
          max-width: 440px;
          margin-bottom: 42px;
        }

        .statsRow {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
        }

        .statCard {
          min-width: 130px;
        }

        .statValue {
          font-size: 2rem;
          font-weight: 800;
        }

        .statLabel {
          color: rgba(255,255,255,0.65);
          font-size: 0.85rem;
          margin-top: 6px;
          font-weight: 600;
        }

        .panel {
          background: rgba(255,255,255,0.05);
          border-left: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(20px);
        }

        .panelInner {
          width: min(100%, 460px);
        }

        .panelHeading {
          margin-bottom: 36px;
        }

        .pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(37,99,235,0.2);
          border: 1px solid rgba(37,99,235,0.4);
          border-radius: 20px;
          padding: 8px 16px;
          margin-bottom: 20px;
          color: #93c5fd;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .panelHeading h2 {
          color: #fff;
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 10px;
          letter-spacing: -0.5px;
        }

        .panelHeading p {
          color: rgba(255,255,255,0.65);
          font-size: 0.95rem;
          line-height: 1.8;
        }

        .loginForm {
          display: grid;
          gap: 16px;
        }

        .fieldLabel {
          color: rgba(255,255,255,0.74);
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .fieldInput {
          width: 100%;
          padding: 14px 16px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 12px;
          color: #fff;
          font-size: 0.95rem;
          font-weight: 600;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .fieldInput:focus {
          border-color: #3b82f6;
        }

        .passwordField {
          position: relative;
        }

        .toggleButton {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          font-size: 1rem;
          padding: 0;
        }

        .errorBanner {
          padding: 14px 16px;
          background: rgba(239,68,68,0.15);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 12px;
          color: #fca5a5;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .submitButton {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 0.95rem;
          font-weight: 800;
          cursor: pointer;
          letter-spacing: 0.5px;
          box-shadow: 0 10px 28px rgba(37,99,235,0.28);
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .submitButton:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .footerLink {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.08);
          text-align: center;
          color: rgba(255,255,255,0.55);
        }

        .footerLink p {
          margin-bottom: 12px;
          font-size: 0.9rem;
        }

        .footerLink a {
          color: #60a5fa;
          font-weight: 700;
          font-size: 0.95rem;
          text-decoration: none;
        }

        @media (max-width: 980px) {
          .loginPage {
            grid-template-columns: 1fr;
          }

          .hero,
          .panel {
            padding: 40px 32px;
          }

          .heroTitle {
            font-size: clamp(2.3rem, 6vw, 3.5rem);
          }

          .statsRow {
            gap: 18px;
          }
        }

        @media (max-width: 640px) {
          .hero,
          .panel {
            padding: 28px 20px;
          }

          .brandRow {
            gap: 12px;
          }

          .heroDescription {
            font-size: 0.95rem;
          }

          .statCard {
            min-width: 100%;
          }

          .panelInner {
            width: 100%;
          }

          .panelHeading h2 {
            font-size: 1.75rem;
          }

          .pillar,
          .pill {
            width: fit-content;
          }
        }
      `}</style>
    </main>
  );
}
