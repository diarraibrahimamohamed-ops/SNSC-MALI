<?php

namespace App\Policies;

use App\Models\Agent;
use Illuminate\Foundation\Auth\User as Authenticatable;
use App\Models\Admin;

class AgentPolicy
{
    public function viewAny(Authenticatable $user): bool
    {
        return $user instanceof Admin || $user instanceof Agent;
    }

    public function view(Authenticatable $user, Agent $agent): bool
    {
        if ($user instanceof Admin) {
            return true;
        }

        if ($user instanceof Agent) {
            return $user->id === $agent->id || $user->centre_sante_id === $agent->centre_sante_id;
        }

        return false;
    }

    public function create(Authenticatable $user): bool
    {
        return $user instanceof Admin;
    }

    public function update(Authenticatable $user, Agent $agent): bool
    {
        if ($user instanceof Admin) {
            return true;
        }

        return $user instanceof Agent && $user->id === $agent->id;
    }

    public function delete(Authenticatable $user, Agent $agent): bool
    {
        return $user instanceof Admin;
    }
}
