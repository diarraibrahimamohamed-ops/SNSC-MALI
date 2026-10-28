<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\RelanceSMS\Services\RelanceService;
use App\Models\DossierEnfant;
use Illuminate\Http\Request;

class RelanceSmsController extends Controller
{
    public function index(RelanceService $relanceService)
    {
        $user = auth('api')->user();
        return response()->json([
            'data' => $relanceService->listerNotifications($user?->centreId, strtoupper((string) $user?->role) === 'ADMIN'),
        ]);
    }

    public function declencher(Request $request, RelanceService $relanceService)
    {
        $data = $request->validate([
            'enfant_ids' => 'nullable|array',
            'enfant_ids.*' => 'string|exists:DossierEnfant,enfantId',
        ]);

        $user = auth('api')->user();
        if (strtoupper((string) $user?->role) !== 'ADMIN' && ! empty($data['enfant_ids'])) {
            $horsPerimetre = DossierEnfant::whereIn('enfantId', $data['enfant_ids'])
                ->where('centreId', '!=', $user?->centreId ?? '__AUCUN_CENTRE__')
                ->exists();
            if ($horsPerimetre) {
                return response()->json(['message' => 'Au moins un dossier ne relève pas de votre structure.'], 403);
            }
        }

        $resultats = $relanceService->declencherRelances(
            $data['enfant_ids'] ?? null,
            $user?->centreId,
            strtoupper((string) $user?->role) === 'ADMIN',
        );

        return response()->json([
            'message' => 'Relances déclenchées avec succès',
            'resultats' => $resultats,
        ]);
    }
}
