<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EnfantController;
use App\Http\Controllers\Api\TuteurController;
use App\Http\Controllers\Api\CentreSanteController;
use App\Http\Controllers\Api\VaccinController;
use App\Http\Controllers\Api\ActeVaccinalController;
use App\Http\Controllers\Api\AgentController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\JournalAuditController;

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

Route::prefix('auth')->group(function () {
    Route::options('/login', function() {
        return response('', 200);
    });
    Route::options('/logout', function() {
        return response('', 200);
    });
    Route::options('/me', function() {
        return response('', 200);
    });
    
    // Rate limiting: 5 requests per minute for login
    Route::middleware(['throttle:5,1'])->post('/login', [AuthController::class, 'login']);
    Route::middleware('auth:api')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

Route::middleware('auth:api')->group(function () {
    Route::get('/enfants/{enfant}/calendrier-vaccinal', [EnfantController::class, 'calendrier']);
    Route::get('/enfants/{enfant}/vaccins-eligibles', [EnfantController::class, 'vaccinsEligibles']);
    Route::apiResource('enfants', EnfantController::class);
    Route::apiResource('tuteurs', TuteurController::class);
    Route::apiResource('centres-sante', CentreSanteController::class);
    Route::apiResource('vaccins', VaccinController::class);
    Route::apiResource('actes-vaccinaux', ActeVaccinalController::class);
    Route::apiResource('agents', AgentController::class);
    Route::post('/scores-risque/evaluer', [App\Http\Controllers\Api\ScoreRisqueController::class, 'evaluer']);
    Route::get('/relances-sms', [App\Http\Controllers\Api\RelanceSmsController::class, 'index']);
    Route::post('/relances-sms/declencher', [App\Http\Controllers\Api\RelanceSmsController::class, 'declencher']);
    
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard-admin', [DashboardController::class, 'admin']);
    Route::get('/journal-audit', [JournalAuditController::class, 'index']);
    
    // Mobile Sync Routes
    Route::post('/mobile/sync', [App\Http\Controllers\Api\MobileSyncController::class, 'sync']);
    Route::get('/mobile/pull', [App\Http\Controllers\Api\MobileSyncController::class, 'pull']);
});
