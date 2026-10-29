"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/features/auth/useAuth";
import { AuthShell } from "@/components/auth/AuthShell";

const REMEMBERED_MATRICULE_KEY = "snsc_mali_remembered_agent_matricule";

export default function AgentLoginPage() {
  const [matricule, setMatricule] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberIdentifier, setRememberIdentifier] = useState(false);
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const rememberedMatricule = window.localStorage.getItem(REMEMBERED_MATRICULE_KEY);
    if (!rememberedMatricule) return;

    // Defer hydration of the browser-only preference until after the effect has mounted.
    const frame = window.requestAnimationFrame(() => {
      setMatricule(rememberedMatricule);
      setRememberIdentifier(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const normalizedMatricule = matricule.trim();

    try {
      const user = await login({ matricule: normalizedMatricule, password });

      if (rememberIdentifier) {
        window.localStorage.setItem(REMEMBERED_MATRICULE_KEY, normalizedMatricule);
      } else {
        window.localStorage.removeItem(REMEMBERED_MATRICULE_KEY);
      }

      if (["AGENT", "INFIRMIER", "MEDECIN"].includes(user.role)) {
        router.push("/agent/dashboard");
      } else {
        setError("Ce compte n’a pas le rôle requis pour accéder à l’espace Agent.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Identifiants invalides.");
    }
  };

  return (
    <AuthShell
      variant="agent"
      title="Connexion"
      subtitle="Accédez à votre espace agent de santé."
      footer={
        <p className="vt-auth-switch-copy">
          Vous êtes administrateur ?{" "}
          <Link href="/login" className="vt-auth-inline-link">
            Accéder à l’administration <ArrowRight size={15} />
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="vt-auth-form">
        <div className="vt-auth-field">
          <label htmlFor="agent-matricule">Identifiant professionnel</label>
          <div className="vt-auth-input-wrap">
            <UserRound className="vt-auth-input-icon" size={19} aria-hidden="true" />
            <input
              id="agent-matricule"
              name="matricule"
              type="text"
              value={matricule}
              onChange={(event) => setMatricule(event.target.value)}
              placeholder="Ex. AGT-001"
              autoComplete="username"
              autoCapitalize="characters"
              spellCheck={false}
              required
              className="vt-auth-input vt-auth-input--with-icon"
            />
          </div>
          <small className="vt-auth-field-hint">Saisissez le matricule associé à votre compte agent.</small>
        </div>

        <div className="vt-auth-field">
          <label htmlFor="agent-password">Mot de passe</label>
          <div className="vt-auth-input-wrap">
            <LockKeyhole className="vt-auth-input-icon" size={19} aria-hidden="true" />
            <input
              id="agent-password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Saisissez votre mot de passe"
              autoComplete="current-password"
              required
              className="vt-auth-input vt-auth-input--with-icon vt-auth-input--password"
            />
            <button
              type="button"
              className="vt-auth-password-toggle"
              onClick={() => setShowPassword((shown) => !shown)}
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error ? (
          <div className="vt-auth-error" role="alert" aria-live="polite">
            <strong>Connexion impossible</strong>
            <span>{error}</span>
          </div>
        ) : null}

        <div className="vt-auth-form-options">
          <label className="vt-auth-remember">
            <input
              type="checkbox"
              checked={rememberIdentifier}
              onChange={(event) => setRememberIdentifier(event.target.checked)}
            />
            <span>Mémoriser mon identifiant</span>
          </label>
          <Link href="/aide" className="vt-auth-forgot-link">
            Mot de passe oublié ?
          </Link>
        </div>

        <button type="submit" disabled={isLoading} className="vt-auth-submit">
          {isLoading ? (
            <>
              <Loader2 size={18} className="vt-auth-spinner" />
              Connexion en cours…
            </>
          ) : (
            <>
              <ArrowRight size={18} />
              Se connecter
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
