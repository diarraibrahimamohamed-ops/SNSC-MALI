<?php

namespace App\Modules\SanteMaternelle\Services;

use App\Models\AgentSante;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Auth\Access\AuthorizationException;

/**
 * Centralise le périmètre structurel des ressources de santé maternelle.
 * Une absence de centre n'accorde jamais un accès implicite.
 */
class AccesParStructureService
{
    public function utilisateur(): ?AgentSante
    {
        /** @var AgentSante|null $user */
        $user = auth('api')->user();

        return $user;
    }

    public function estAdministrateur(): bool
    {
        return strtoupper((string) $this->utilisateur()?->role) === 'ADMIN';
    }

    public function centreCourant(): ?string
    {
        return $this->utilisateur()?->centreId;
    }

    public function verifierCentre(?string $centreId): void
    {
        if ($this->estAdministrateur()) {
            return;
        }

        if (! $centreId || $centreId !== $this->centreCourant()) {
            throw new AuthorizationException('Accès refusé : la ressource n’appartient pas à votre structure.');
        }
    }

    public function appliquer(Builder $query, string $colonne = 'centre_sante_id'): Builder
    {
        if ($this->estAdministrateur()) {
            return $query;
        }

        $centreId = $this->centreCourant();
        if (! $centreId) {
            // Ne jamais transformer une configuration d'agent incomplète en accès global.
            return $query->whereRaw('1 = 0');
        }

        return $query->where($colonne, $centreId);
    }
}
