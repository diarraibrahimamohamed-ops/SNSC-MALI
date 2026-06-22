<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\RelanceSMS\Services\RelanceService;
use Illuminate\Http\Request;

class RelanceSmsController extends Controller
{
    public function index(RelanceService $relanceService)
    {
        return response()->json([
            'data' => $relanceService->listerNotifications(),
        ]);
    }

    public function declencher(Request $request, RelanceService $relanceService)
    {
        $data = $request->validate([
            'enfant_ids' => 'nullable|array',
            'enfant_ids.*' => 'string|exists:DossierEnfant,enfantId',
        ]);

        $resultats = $relanceService->declencherRelances($data['enfant_ids'] ?? null);

        return response()->json([
            'message' => 'Relances déclenchées avec succès',
            'resultats' => $resultats,
        ]);
    }
}
