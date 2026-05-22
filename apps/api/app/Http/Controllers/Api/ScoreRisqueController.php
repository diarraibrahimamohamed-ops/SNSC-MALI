<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ScoreRisqueResource;
use App\Models\Enfant;
use App\Models\ScoreRisque;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ScoreRisqueController extends Controller
{
    use AuthorizesRequests;
    protected $vaccinationService;

    public function __construct(\App\Services\VaccinationService $vaccinationService)
    {
        $this->vaccinationService = $vaccinationService;
    }

    public function index()
    {
        $scores = ScoreRisque::with(['enfant', 'rendezVous'])->get();
        return ScoreRisqueResource::collection($scores);
    }

    public function store(Request $request)
    {
        $this->authorize('create', ScoreRisque::class);

        $score = DB::transaction(function () use ($request) {
            return ScoreRisque::create($request->all());
        });

        return new ScoreRisqueResource($score);
    }

    public function show(string $id)
    {
        $score = ScoreRisque::with(['enfant', 'rendezVous'])->findOrFail($id);
        $this->authorize('view', $score);
        return new ScoreRisqueResource($score);
    }

    public function update(Request $request, string $id)
    {
        $score = ScoreRisque::findOrFail($id);
        $this->authorize('update', $score);

        $score = DB::transaction(function () use ($request, $score) {
            $score->update($request->all());
            return $score;
        });

        return new ScoreRisqueResource($score);
    }

    public function destroy(string $id)
    {
        $score = ScoreRisque::findOrFail($id);
        $this->authorize('delete', $score);

        DB::transaction(function () use ($score) {
            $score->delete();
        });

        return response()->json(['message' => 'Score de risque supprimé avec succès']);
    }

    public function evaluer(Request $request)
    {
        $request->validate([
            'enfant_id' => 'required|uuid|exists:enfants,id',
        ]);

        $enfant = Enfant::findOrFail($request->enfant_id);
        $this->authorize('view', $enfant);

        DB::transaction(function () use ($enfant) {
            $this->vaccinationService->evaluerRisque($enfant);
        });

        $score = $enfant->scoresRisque()->latest('calcule_le')->first();

        return new ScoreRisqueResource($score);
    }
}
