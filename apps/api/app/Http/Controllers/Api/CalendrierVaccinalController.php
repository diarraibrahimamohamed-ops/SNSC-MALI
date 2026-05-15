<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CalendrierVaccinalResource;
use App\Models\DoseCalendrierEnfant;
use App\Models\Enfant;
use Illuminate\Http\Request;

class CalendrierVaccinalController extends Controller
{
    public function index()
    {
        $doses = DoseCalendrierEnfant::with(['enfant', 'modeleCalendrier.vaccin'])->get();
        return CalendrierVaccinalResource::collection($doses);
    }

    public function store(Request $request)
    {
        $dose = DoseCalendrierEnfant::create($request->all());
        return new CalendrierVaccinalResource($dose);
    }

    public function show(string $id)
    {
        $dose = DoseCalendrierEnfant::with(['enfant', 'modeleCalendrier.vaccin'])->findOrFail($id);
        return new CalendrierVaccinalResource($dose);
    }

    public function update(Request $request, string $id)
    {
        $dose = DoseCalendrierEnfant::findOrFail($id);
        $dose->update($request->all());
        return new CalendrierVaccinalResource($dose);
    }

    public function destroy(string $id)
    {
        $dose = DoseCalendrierEnfant::findOrFail($id);
        $dose->delete();
        return response()->json(['message' => 'Dose de calendrier supprimée avec succès']);
    }

    public function pourEnfant(string $enfantId)
    {
        $enfant = Enfant::findOrFail($enfantId);
        $doses = $enfant->dosesCalendrier()->with('modeleCalendrier.vaccin')->get();
        return CalendrierVaccinalResource::collection($doses);
    }
}
