<?php

namespace App\Policies;

use App\Models\Enfant;
use Illuminate\Foundation\Auth\User as Authenticatable;
use App\Models\Agent;
use App\Models\Admin;

class EnfantPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(Authenticatable $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(Authenticatable $user, Enfant $enfant): bool
    {
        if ($user instanceof Admin) {
            return true;
        }

        if ($user instanceof Agent) {
            return $user->centre_sante_id === $enfant->centre_sante_id;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(Authenticatable $user): bool
    {
        return $user instanceof Agent || $user instanceof Admin;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(Authenticatable $user, Enfant $enfant): bool
    {
        if ($user instanceof Admin) {
            return true;
        }

        if ($user instanceof Agent) {
            return $user->centre_sante_id === $enfant->centre_sante_id;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(Authenticatable $user, Enfant $enfant): bool
    {
        if ($user instanceof Admin) {
            return true;
        }

        // Only admins can delete, or maybe agent if it was a mistake? Let's restrict to Admin for security.
        return false;
    }
}
