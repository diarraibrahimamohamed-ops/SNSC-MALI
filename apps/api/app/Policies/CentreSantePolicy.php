<?php

namespace App\Policies;

use App\Models\CentreSante;
use Illuminate\Foundation\Auth\User as Authenticatable;
use App\Models\Admin;

class CentreSantePolicy
{
    public function viewAny(Authenticatable $user): bool
    {
        return true;
    }

    public function view(Authenticatable $user, CentreSante $centreSante): bool
    {
        return true;
    }

    public function create(Authenticatable $user): bool
    {
        return $user instanceof Admin;
    }

    public function update(Authenticatable $user, CentreSante $centreSante): bool
    {
        return $user instanceof Admin;
    }

    public function delete(Authenticatable $user, CentreSante $centreSante): bool
    {
        return $user instanceof Admin;
    }
}
