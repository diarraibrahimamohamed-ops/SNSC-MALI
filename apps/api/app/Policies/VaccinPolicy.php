<?php

namespace App\Policies;

use App\Models\Vaccin;
use Illuminate\Foundation\Auth\User as Authenticatable;
use App\Models\Admin;

class VaccinPolicy
{
    public function viewAny(Authenticatable $user): bool
    {
        return true;
    }

    public function view(Authenticatable $user, Vaccin $vaccin): bool
    {
        return true;
    }

    public function create(Authenticatable $user): bool
    {
        return $user instanceof Admin;
    }

    public function update(Authenticatable $user, Vaccin $vaccin): bool
    {
        return $user instanceof Admin;
    }

    public function delete(Authenticatable $user, Vaccin $vaccin): bool
    {
        return $user instanceof Admin;
    }
}
