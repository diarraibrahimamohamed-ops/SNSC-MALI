<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreActeVaccinalRequest;
use App\Http\Resources\ActeVaccinalResource;
use App\Models\ActeVaccinal;
use Illuminate\Http\Request;

class ActeVaccinalController extends Controller
{
    public function index()
    {
        $actes = ActeVaccinal::with(['enfant', 'vaccin', 'agent', 'centreSante'])->get();
        return ActeVaccinalResource::collection($actes);
    }

    public function store(StoreActeVaccinalRequest $request)
    {
        $acte = ActeVaccinal::create($request->validated());
        
        if ($request->has('dose_calendrier_enfant_id')) {
            $dose = $acte->doseCalendrierEnfant;
            if ($dose) {
                $dose->update([
                    'statut' => 'ADMINISTREE',
                    'administree_le' => now(),
                ]);
            }
        }
        
        return new ActeVaccinalResource($acte->load(['enfant', 'vaccin', 'agent', 'doseCalendrierEnfant']));
    }

    public function show(string $id)
    {
        $acte = ActeVaccinal::with(['enfant', 'vaccin', 'agent', 'centreSante', 'doseCalendrierEnfant'])->findOrFail($id);
        return new ActeVaccinalResource($acte);
    }

    public function update(Request $request, string $id)
    {
        $acte = ActeVaccinal::findOrFail($id);
        $acte->update($request->all());
        return new ActeVaccinalResource($acte);
    }

    public function destroy(string $id)
    {
        $acte = ActeVaccinal::findOrFail($id);
        $acte->delete();
        return response()->json(['message' => 'Acte vaccinal supprimé avec succès']);
    }
}
