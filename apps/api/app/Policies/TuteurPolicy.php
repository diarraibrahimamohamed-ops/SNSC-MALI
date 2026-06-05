<?php

namespace App\Policies;

use App\Models\Tuteur;
use Illuminate\Foundation\Auth\User as Authenticatable;
use App\Models\Agent;
use App\Models\Admin;

class TuteurPolicy
{
    public function viewAny(Authenticatable $user): bool
    {
        return true;
    }

    public function view(Authenticatable $user, Tuteur $tuteur): bool
    {
        return true;
    }

    public function create(Authenticatable $user): bool
    {
        return $user instanceof Agent || $user instanceof Admin;
    }

    public function update(Authenticatable $user, Tuteur $tuteur): bool
    {
        return $user instanceof Agent || $user instanceof Admin;
    }

    public function delete(Authenticatable $user, Tuteur $tuteur): bool
    {
        return $user instanceof Admin;
    }
}
