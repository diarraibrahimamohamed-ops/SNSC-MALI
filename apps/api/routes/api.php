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
use App\Http\Controllers\Api\V1\AccouchementController;
use App\Http\Controllers\Api\V1\ConsentementController;
use App\Http\Controllers\Api\V1\ExamenPrenatalController;
use App\Http\Controllers\Api\V1\GrossesseController;
use App\Http\Controllers\Api\V1\MereController;
use App\Http\Controllers\Api\V1\MesureCliniqueController;
use App\Http\Controllers\Api\V1\PostpartumController;
use App\Http\Controllers\Api\V1\ReferenceSoinController;
use App\Http\Controllers\Api\V1\SynchronisationController;
use App\Http\Controllers\Api\V1\SymptomePrenatalController;

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
    Route::post('/mobile/sync', [App\Http\Controllers\Api\MobileSyncController::class, 'sync']);
    Route::get('/mobile/pull', [App\Http\Controllers\Api\MobileSyncController::class, 'pull']);
});

// Contrats v1 ajoutés sans modifier les routes historiques du suivi vaccinal.
Route::prefix('v1')->middleware('auth:api')->group(function () {
    Route::get('/meres', [MereController::class, 'index']);
    Route::post('/meres', [MereController::class, 'store']);
    Route::get('/meres/{mere}', [MereController::class, 'show']);
    Route::get('/meres/{mere}/chronologie', [MereController::class, 'chronologie']);
    Route::post('/meres/{mere}/grossesses', [GrossesseController::class, 'store']);
    Route::post('/meres/{mere}/suivis-postpartum', [PostpartumController::class, 'store']);

    Route::get('/grossesses/{grossesse}', [GrossesseController::class, 'show']);
    Route::post('/grossesses/{grossesse}/contacts', [GrossesseController::class, 'storeContact']);
    Route::get('/grossesses/{grossesse}/mesures', [MesureCliniqueController::class, 'index']);
    Route::get('/grossesses/{grossesse}/examens', [ExamenPrenatalController::class, 'index']);
    Route::post('/grossesses/{grossesse}/examens', [ExamenPrenatalController::class, 'store']);
    Route::get('/grossesses/{grossesse}/symptomes', [SymptomePrenatalController::class, 'index']);
    Route::post('/grossesses/{grossesse}/symptomes', [SymptomePrenatalController::class, 'store']);
    Route::get('/catalogues/symptomes-prenataux', [SymptomePrenatalController::class, 'catalogue']);
    Route::post('/grossesses/{grossesse}/mesures', [MesureCliniqueController::class, 'store']);
    Route::post('/grossesses/{grossesse}/accouchement', [AccouchementController::class, 'store']);

    Route::get('/references', [ReferenceSoinController::class, 'index']);
    Route::post('/references', [ReferenceSoinController::class, 'store']);
    Route::post('/references/{reference}/envoyer', [ReferenceSoinController::class, 'envoyer']);
    Route::post('/references/{reference}/accuse-reception', [ReferenceSoinController::class, 'accuseReception']);
    Route::patch('/references/{reference}/issue', [ReferenceSoinController::class, 'issue']);

    Route::post('/consentements', [ConsentementController::class, 'store']);
    Route::post('/consentements/{consentement}/retrait', [ConsentementController::class, 'retrait']);
    Route::post('/mobile/sync', [SynchronisationController::class, 'sync']);
});
