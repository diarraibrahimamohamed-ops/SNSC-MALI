<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Health check endpoint
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'Vaccin-Track API is running',
        'timestamp' => now()->toISOString(),
        'version' => '1.0.0'
    ]);
});

// Authentication routes
Route::prefix('auth')->group(function () {
    Route::post('/login', [App\Http\Controllers\Api\AuthController::class, 'login'])->middleware('throttle:5,1');
    
    Route::middleware('auth:api')->group(function () {
        Route::post('/logout', [App\Http\Controllers\Api\AuthController::class, 'logout']);
        Route::get('/me', [App\Http\Controllers\Api\AuthController::class, 'me']);
    });
});

// Protected routes
Route::middleware('auth:api')->group(function () {
    
    // Dashboard statistics
    Route::get('/dashboard/stats', [App\Http\Controllers\Api\DashboardController::class, 'stats']);
    Route::get('/dashboard-admin', [App\Http\Controllers\Api\DashboardAdminController::class, 'index']);

    // Enfants routes
    Route::apiResource('enfants', App\Http\Controllers\Api\EnfantController::class);
    Route::get('/enfants/{enfant}/vaccinations', [App\Http\Controllers\Api\EnfantController::class, 'vaccinations']);
    Route::get('/enfants/{enfant}/rendez-vous', [App\Http\Controllers\Api\EnfantController::class, 'rendezVous']);

    // Tuteurs routes
    Route::apiResource('tuteurs', App\Http\Controllers\Api\TuteurController::class);

    // Centres de santé routes
    Route::apiResource('centres-sante', App\Http\Controllers\Api\CentreSanteController::class);

    // Vaccins routes
    Route::apiResource('vaccins', App\Http\Controllers\Api\VaccinController::class);

    // Actes vaccinaux routes
    Route::apiResource('actes-vaccinaux', App\Http\Controllers\Api\ActeVaccinalController::class);

    // Rendez-vous routes
    Route::apiResource('rendez-vous', App\Http\Controllers\Api\RendezVousController::class);
    Route::post('/rendez-vous/{rendezVous}/confirmer', [App\Http\Controllers\Api\RendezVousController::class, 'confirmer']);
    Route::post('/rendez-vous/{rendezVous}/annuler', [App\Http\Controllers\Api\RendezVousController::class, 'annuler']);

    // Relances SMS routes
    Route::apiResource('relances-sms', App\Http\Controllers\Api\NotificationSmsController::class);
    Route::post('/relances-sms/declencher', [App\Http\Controllers\Api\NotificationSmsController::class, 'declencher']);

    // Scores de risque routes
    Route::apiResource('scores-risque', App\Http\Controllers\Api\ScoreRisqueController::class);
    Route::post('/scores-risque/evaluer', [App\Http\Controllers\Api\ScoreRisqueController::class, 'evaluer']);

    // Agents routes
    Route::apiResource('agents', App\Http\Controllers\Api\AgentController::class);

    // Journal d'audit routes
    Route::apiResource('journal-audit', App\Http\Controllers\Api\JournalAuditController::class);

    // File synchronization routes
    Route::apiResource('file-sync', App\Http\Controllers\Api\FileSynchronisationController::class);

    // Utilisateurs (User/Agent)
    Route::apiResource('utilisateurs', App\Http\Controllers\Api\UtilisateurController::class);

    // Admins routes
    Route::apiResource('admins', App\Http\Controllers\Api\AdminController::class);
});
