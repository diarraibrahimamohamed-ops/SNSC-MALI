<?php

namespace App\Policies;

use App\Models\JournalAudit;
use Illuminate\Foundation\Auth\User as Authenticatable;
use App\Models\Admin;

class JournalAuditPolicy
{
    public function viewAny(Authenticatable $user): bool
    {
        return $user instanceof Admin;
    }

    public function view(Authenticatable $user, JournalAudit $journal): bool
    {
        return $user instanceof Admin;
    }

    public function create(Authenticatable $user): bool
    {
        return false; // Only system can create
    }

    public function update(Authenticatable $user, JournalAudit $journal): bool
    {
        return false; // Immutable
    }

    public function delete(Authenticatable $user, JournalAudit $journal): bool
    {
        return false; // Immutable
    }
}
