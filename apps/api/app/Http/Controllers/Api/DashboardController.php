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
        return response()->json([
            'data' => $this->statsService->getStats(null),
        ]);
    }

    public function admin()
    {
        return response()->json([
            'data' => $this->statsService->getStats(null),
        ]);
    }
}
