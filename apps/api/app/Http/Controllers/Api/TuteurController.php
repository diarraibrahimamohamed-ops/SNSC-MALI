<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TuteurResource;
use App\Models\Tuteur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class TuteurController extends Controller
{
    use AuthorizesRequests;
    public function index()
    {
        $tuteurs = Tuteur::all();
        return TuteurResource::collection($tuteurs);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Tuteur::class);

        $tuteur = DB::transaction(function () use ($request) {
            return Tuteur::create($request->all());
        });

        return new TuteurResource($tuteur);
    }

    public function show(string $id)
    {
        $tuteur = Tuteur::findOrFail($id);
        $this->authorize('view', $tuteur);
        return new TuteurResource($tuteur);
    }

    public function update(Request $request, string $id)
    {
        $tuteur = Tuteur::findOrFail($id);
        $this->authorize('update', $tuteur);

        $tuteur = DB::transaction(function () use ($request, $tuteur) {
            $tuteur->update($request->all());
            return $tuteur;
        });

        return new TuteurResource($tuteur);
    }

    public function destroy(string $id)
    {
        $tuteur = Tuteur::findOrFail($id);
        $this->authorize('delete', $tuteur);

        DB::transaction(function () use ($tuteur) {
            $tuteur->delete();
        });

        return response()->json(['message' => 'Tuteur supprimé avec succès']);
    }
}
