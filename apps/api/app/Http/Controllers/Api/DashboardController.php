<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardStatsService;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardStatsService $statsService
    ) {}

    public function stats()
    {
        $user = auth('api')->user();
        $centreId = $user && $user->role !== 'ADMIN' ? $user->centreId : null;

        return response()->json([
            'data' => $this->statsService->getStats($centreId),
        ]);
    }

    public function admin()
    {
        return response()->json([
            'data' => $this->statsService->getStats(null),
        ]);
    }
}
