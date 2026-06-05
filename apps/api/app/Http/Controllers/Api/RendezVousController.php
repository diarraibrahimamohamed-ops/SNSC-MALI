<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRendezVousRequest;
use App\Http\Resources\RendezVousResource;
use App\Models\RendezVous;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class RendezVousController extends Controller
{
    use AuthorizesRequests;
    public function index()
    {
        $rendezVous = RendezVous::with(['enfant', 'doseCalendrierEnfant'])->get();
        return RendezVousResource::collection($rendezVous);
    }

    public function store(StoreRendezVousRequest $request)
    {
        $this->authorize('create', RendezVous::class);

        $rendezVous = DB::transaction(function () use ($request) {
            return RendezVous::create($request->validated());
        });

        return new RendezVousResource($rendezVous);
    }

    public function show(string $id)
    {
        $rendezVous = RendezVous::with(['enfant', 'doseCalendrierEnfant', 'reprogrammeDepuis'])->findOrFail($id);
        $this->authorize('view', $rendezVous);
        return new RendezVousResource($rendezVous);
    }

    public function update(Request $request, string $id)
    {
        $rendezVous = RendezVous::findOrFail($id);
        $this->authorize('update', $rendezVous);

        $rendezVous = DB::transaction(function () use ($request, $rendezVous) {
            $rendezVous->update($request->all());
            return $rendezVous;
        });

        return new RendezVousResource($rendezVous);
    }

    public function destroy(string $id)
    {
        $rendezVous = RendezVous::findOrFail($id);
        $this->authorize('delete', $rendezVous);
        
        DB::transaction(function () use ($rendezVous) {
            $rendezVous->delete();
        });

        return response()->json(['message' => 'Rendez-vous supprimé avec succès']);
    }

    public function confirmer(string $id)
    {
        $rendezVous = RendezVous::findOrFail($id);
        $this->authorize('update', $rendezVous);
        
        DB::transaction(function () use ($rendezVous) {
            $rendezVous->update(['statut' => 'CONFIRME']);
        });
        
        return new RendezVousResource($rendezVous);
    }

    public function annuler(string $id)
    {
        $rendezVous = RendezVous::findOrFail($id);
        $this->authorize('update', $rendezVous);
        
        DB::transaction(function () use ($rendezVous) {
            $rendezVous->update(['statut' => 'ANNULE']);
        });
        
        return new RendezVousResource($rendezVous);
    }
}
