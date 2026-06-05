<?php

namespace App\Traits;

use App\Models\JournalAudit;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

trait Auditable
{
    public static function bootAuditable()
    {
        static::created(function ($model) {
            $model->auditAction('CREATION');
        });

        static::updated(function ($model) {
            $model->auditAction('MISE_A_JOUR');
        });

        static::deleted(function ($model) {
            $model->auditAction('SUPPRESSION');
        });
    }

    protected function auditAction($action)
    {
        // Try to find the agent_id from the authenticated user
        // Assuming the auth user could be an admin or agent
        $user = Auth::user();
        $agentId = null;
        
        if ($user && method_exists($user, 'agent') && $user->agent) {
            $agentId = $user->agent->id;
        }

        $metadonnees = null;
        if ($action === 'MISE_A_JOUR') {
            $metadonnees = json_encode([
                'original' => $this->getOriginal(),
                'changes'  => $this->getChanges(),
            ]);
        } elseif ($action === 'CREATION') {
            $metadonnees = json_encode($this->getAttributes());
        }

        JournalAudit::create([
            'id' => (string) Str::uuid(),
            'agent_id' => $agentId,
            'action' => $action,
            'type_cible' => get_class($this),
            'id_cible' => $this->id,
            'resultat' => 'SUCCES',
            'metadonnees' => $metadonnees,
        ]);
    }
}
