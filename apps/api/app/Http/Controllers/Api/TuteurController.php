<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TuteurResource;
use App\Models\Tuteur;
use Illuminate\Http\Request;

class TuteurController extends Controller
{
    public function index()
    {
        $tuteurs = Tuteur::all();
        return TuteurResource::collection($tuteurs);
    }

    public function store(Request $request)
    {
        $tuteur = Tuteur::create($request->all());
        return new TuteurResource($tuteur);
    }

    public function show(string $id)
    {
        $tuteur = Tuteur::findOrFail($id);
        return new TuteurResource($tuteur);
    }

    public function update(Request $request, string $id)
    {
        $tuteur = Tuteur::findOrFail($id);
        $tuteur->update($request->all());
        return new TuteurResource($tuteur);
    }

    public function destroy(string $id)
    {
        $tuteur = Tuteur::findOrFail($id);
        $tuteur->delete();
        return response()->json(['message' => 'Tuteur supprimé avec succès']);
    }
}
