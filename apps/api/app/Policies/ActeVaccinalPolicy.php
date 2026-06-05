<?php

namespace App\Policies;

use App\Models\ActeVaccinal;
use Illuminate\Foundation\Auth\User as Authenticatable;
use App\Models\Agent;
use App\Models\Admin;

class ActeVaccinalPolicy
{
    public function viewAny(Authenticatable $user): bool
    {
        return true;
    }

    public function view(Authenticatable $user, ActeVaccinal $acte): bool
    {
        if ($user instanceof Admin) {
            return true;
        }

        if ($user instanceof Agent) {
            return $user->centre_sante_id === $acte->centre_sante_id;
        }

        return false;
    }

    public function create(Authenticatable $user): bool
    {
        return $user instanceof Agent || $user instanceof Admin;
    }

    public function update(Authenticatable $user, ActeVaccinal $acte): bool
    {
        if ($user instanceof Admin) {
            return true;
        }

        if ($user instanceof Agent) {
            return $user->centre_sante_id === $acte->centre_sante_id;
        }

        return false;
    }

    public function delete(Authenticatable $user, ActeVaccinal $acte): bool
    {
        if ($user instanceof Admin) {
            return true;
        }

        return false;
    }
}
