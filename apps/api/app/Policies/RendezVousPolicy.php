<?php

namespace App\Policies;

use App\Models\RendezVous;
use Illuminate\Foundation\Auth\User as Authenticatable;
use App\Models\Agent;
use App\Models\Admin;

class RendezVousPolicy
{
    public function viewAny(Authenticatable $user): bool
    {
        return true;
    }

    public function view(Authenticatable $user, RendezVous $rendezVous): bool
    {
        if ($user instanceof Admin) {
            return true;
        }

        if ($user instanceof Agent) {
            return $user->centre_sante_id === $rendezVous->enfant->centre_sante_id;
        }

        return false;
    }

    public function create(Authenticatable $user): bool
    {
        return $user instanceof Agent || $user instanceof Admin;
    }

    public function update(Authenticatable $user, RendezVous $rendezVous): bool
    {
        if ($user instanceof Admin) {
            return true;
        }

        if ($user instanceof Agent) {
            return $user->centre_sante_id === $rendezVous->enfant->centre_sante_id;
        }

        return false;
    }

    public function delete(Authenticatable $user, RendezVous $rendezVous): bool
    {
        if ($user instanceof Admin) {
            return true;
        }

        return false;
    }
}
