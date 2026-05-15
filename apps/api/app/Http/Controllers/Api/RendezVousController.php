<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRendezVousRequest;
use App\Http\Resources\RendezVousResource;
use App\Models\RendezVous;
use Illuminate\Http\Request;

class RendezVousController extends Controller
{
    public function index()
    {
        $rendezVous = RendezVous::with(['enfant', 'doseCalendrierEnfant'])->get();
        return RendezVousResource::collection($rendezVous);
    }

    public function store(StoreRendezVousRequest $request)
    {
        $rendezVous = RendezVous::create($request->validated());
        return new RendezVousResource($rendezVous);
    }

    public function show(string $id)
    {
        $rendezVous = RendezVous::with(['enfant', 'doseCalendrierEnfant', 'reprogrammeDepuis'])->findOrFail($id);
        return new RendezVousResource($rendezVous);
    }

    public function update(Request $request, string $id)
    {
        $rendezVous = RendezVous::findOrFail($id);
        $rendezVous->update($request->all());
        return new RendezVousResource($rendezVous);
    }

    public function destroy(string $id)
    {
        $rendezVous = RendezVous::findOrFail($id);
        $rendezVous->delete();
        return response()->json(['message' => 'Rendez-vous supprimé avec succès']);
    }

    public function confirmer(string $id)
    {
        $rendezVous = RendezVous::findOrFail($id);
        $rendezVous->update(['statut' => 'CONFIRME']);
        return new RendezVousResource($rendezVous);
    }

    public function annuler(string $id)
    {
        $rendezVous = RendezVous::findOrFail($id);
        $rendezVous->update(['statut' => 'ANNULE']);
        return new RendezVousResource($rendezVous);
    }
}
