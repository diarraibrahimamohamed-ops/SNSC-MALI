"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/useAuth";
import { AuthShell } from "@/components/auth/AuthShell";

export default function LoginPage() {
  const [matricule, setMatricule] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      const user = await login({ matricule: matricule.trim(), password });
      if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
        router.push("/admin/dashboard");
      } else {
        setError("Ce compte n’a pas le rôle requis pour accéder à l’administration.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Identifiants invalides.");
    }
  };

  return (
    <AuthShell
      variant="admin"
      title="Connexion administration"
      subtitle="Connectez-vous avec votre matricule administratif pour accéder aux outils de pilotage."
      footer={
        <p className="auth-switch-copy">
          Vous êtes agent de santé ?{" "}
          <Link href="/agent-auth" className="auth-inline-link">
            Accéder à l’espace Agent <ArrowRight size={14} />
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-field">
          <label htmlFor="admin-matricule">Matricule administratif</label>
          <input
            id="admin-matricule"
            name="matricule"
            type="text"
            value={matricule}
            onChange={(event) => setMatricule(event.target.value)}
            placeholder="Ex. ADM-001"
            autoComplete="username"
            autoCapitalize="characters"
            spellCheck={false}
            required
            className="auth-input"
          />
          <small className="auth-field-hint">Utilisez le matricule fourni pour votre compte administrateur.</small>
        </div>

        <div className="auth-field">
          <label htmlFor="admin-password">Mot de passe</label>
          <div className="auth-password-field">
            <input
              id="admin-password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Saisissez votre mot de passe"
              autoComplete="current-password"
              required
              className="auth-input auth-input--password"
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword((shown) => !shown)}
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="auth-error" role="alert" aria-live="polite">
            <strong>Connexion impossible</strong>
            <span>{error}</span>
          </div>
        )}

        <button type="submit" disabled={isLoading} className="auth-submit auth-submit--admin">
          {isLoading ? (
            <>
              <Loader2 size={18} className="auth-spinner" />
              Connexion en cours…
            </>
          ) : (
            <>
              Se connecter
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
