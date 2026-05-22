<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEnfantRequest;
use App\Http\Requests\UpdateEnfantRequest;
use App\Http\Resources\EnfantResource;
use App\Models\Enfant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class EnfantController extends Controller
{
    use AuthorizesRequests;
    protected $vaccinationService;

    public function __construct(\App\Services\VaccinationService $vaccinationService)
    {
        $this->vaccinationService = $vaccinationService;
    }

    public function index()
    {
        $enfants = Enfant::with(['tuteurPrincipal', 'centreSante', 'tuteurs'])->get();
        return EnfantResource::collection($enfants);
    }

    public function store(StoreEnfantRequest $request)
    {
        $this->authorize('create', Enfant::class);

        $enfant = DB::transaction(function () use ($request) {
            $data = $request->validated();
            $data['id'] = (string) \Illuminate\Support\Str::uuid();
            
            $enfant = Enfant::create($data);
            
            if ($request->has('tuteurs')) {
                foreach ($request->input('tuteurs') as $tuteurData) {
                    $enfant->tuteurs()->attach($tuteurData['tuteur_id'], [
                        'type_relation' => $tuteurData['type_relation'] ?? null,
                        'est_principal' => $tuteurData['est_principal'] ?? false,
                    ]);
                }
            }

            // Logique métier : Générer calendrier et évaluer risque
            $this->vaccinationService->genererCalendrierInitial($enfant);
            $this->vaccinationService->evaluerRisque($enfant);
            $this->vaccinationService->planifierRendezVous($enfant);

            return $enfant;
        });
        
        return new EnfantResource($enfant->load(['tuteurs', 'dosesCalendrier', 'scoresRisque']));
    }

    public function show(string $id)
    {
        $enfant = Enfant::with(['tuteurPrincipal', 'centreSante', 'tuteurs', 'dosesCalendrier', 'actesVaccinaux', 'rendezVous', 'scoresRisque'])->findOrFail($id);
        $this->authorize('view', $enfant);
        return new EnfantResource($enfant);
    }

    public function update(UpdateEnfantRequest $request, string $id)
    {
        $enfant = Enfant::findOrFail($id);
        $this->authorize('update', $enfant);

        $enfant = DB::transaction(function () use ($request, $enfant) {
            $enfant->update($request->validated());
            
            if ($request->has('tuteurs')) {
                $enfant->tuteurs()->sync([]);
                foreach ($request->input('tuteurs') as $tuteurData) {
                    $enfant->tuteurs()->attach($tuteurData['tuteur_id'], [
                        'type_relation' => $tuteurData['type_relation'] ?? null,
                        'est_principal' => $tuteurData['est_principal'] ?? false,
                    ]);
                }
            }

            $this->vaccinationService->evaluerRisque($enfant);

            return $enfant;
        });
        
        return new EnfantResource($enfant->load(['tuteurs', 'scoresRisque']));
    }

    public function destroy(string $id)
    {
        $enfant = Enfant::findOrFail($id);
        $this->authorize('delete', $enfant);
        $enfant->delete();
        return response()->json(['message' => 'Enfant supprimé avec succès']);
    }

    public function vaccinations(string $id)
    {
        $enfant = Enfant::findOrFail($id);
        $vaccinations = $enfant->actesVaccinaux()->with(['vaccin', 'agent', 'centreSante'])->get();
        return response()->json(['data' => $vaccinations]);
    }

    public function rendezVous(string $id)
    {
        $enfant = Enfant::findOrFail($id);
        $rendezVous = $enfant->rendezVous()->with(['doseCalendrierEnfant'])->get();
        return response()->json(['data' => $rendezVous]);
    }
}
