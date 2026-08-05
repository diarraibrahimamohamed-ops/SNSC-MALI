<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JournalAudit;

class JournalAuditController extends Controller
{
    public function index()
    {
        $logs = JournalAudit::with('dossierEnfant')
            ->orderByDesc('horodatage')
            ->limit(100)
            ->get()
            ->map(fn ($log) => [
                'id' => $log->auditId,
                'action' => $log->action,
                'created_at' => $log->horodatage,
                'model_type' => 'DossierEnfant',
                'user_id' => $log->enfantId,
                'details' => [
                    'enfant' => $log->dossierEnfant
                        ? trim(($log->dossierEnfant->nom ?? '') . ' ' . ($log->dossierEnfant->prenom ?? ''))
                        : null,
                ],
            ]);

        return response()->json(['data' => $logs]);
    }
}
