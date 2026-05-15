<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ScoreRisqueResource;
use App\Models\Enfant;
use App\Models\ScoreRisque;
use Illuminate\Http\Request;

class ScoreRisqueController extends Controller
{
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
        $score = ScoreRisque::create($request->all());
        return new ScoreRisqueResource($score);
    }

    public function show(string $id)
    {
        $score = ScoreRisque::with(['enfant', 'rendezVous'])->findOrFail($id);
        return new ScoreRisqueResource($score);
    }

    public function update(Request $request, string $id)
    {
        $score = ScoreRisque::findOrFail($id);
        $score->update($request->all());
        return new ScoreRisqueResource($score);
    }

    public function destroy(string $id)
    {
        $score = ScoreRisque::findOrFail($id);
        $score->delete();
        return response()->json(['message' => 'Score de risque supprimé avec succès']);
    }

    public function evaluer(Request $request)
    {
        return response()->json([
            'data' => [
                'niveau_risque' => rand(0, 1) > 0.5 ? 'ELEVE' : 'FAIBLE',
                'confiance' => rand(70, 99) / 100,
                'facteurs_explicatifs' => ['facteur1' => 'valeur1', 'facteur2' => 'valeur2'],
            ]
        ]);
    }
}
