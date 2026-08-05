<?php

namespace App\Policies;

use App\Models\NotificationSms;
use Illuminate\Foundation\Auth\User as Authenticatable;
use App\Models\Agent;
use App\Models\Admin;

class NotificationSmsPolicy
{
    public function viewAny(Authenticatable $user): bool
    {
        return true;
    }

    public function view(Authenticatable $user, NotificationSms $notification): bool
    {
        if ($user instanceof Admin) {
            return true;
        }

        if ($user instanceof Agent) {
            return $user->centre_sante_id === $notification->enfant->centre_sante_id;
        }

        return false;
    }

    public function create(Authenticatable $user): bool
    {
        return $user instanceof Admin || $user instanceof Agent;
    }

    public function update(Authenticatable $user, NotificationSms $notification): bool
    {
        if ($user instanceof Admin) {
            return true;
        }

        return false; // SMS logs are immutable ideally, or only updatable by system
    }

    public function delete(Authenticatable $user, NotificationSms $notification): bool
    {
        return $user instanceof Admin;
    }
}
