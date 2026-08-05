<?php

namespace App\Modules\Audit\Services;

use App\Models\JournalAudit;
use Illuminate\Support\Str;

class AuditService
{
    public function journaliser(string $action, string $enfantId): void
    {
        JournalAudit::create([
            'auditId' => (string) Str::uuid(),
            'action' => $action,
            'horodatage' => now(),
            'enfantId' => $enfantId,
        ]);
    }
}
