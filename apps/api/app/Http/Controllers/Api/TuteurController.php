<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTuteurRequest;
use App\Http\Requests\UpdateTuteurRequest;
use App\Http\Resources\TuteurResource;
use App\Models\Tuteur;

class TuteurController extends Controller
{
    public function index()
    {
        $tuteurs = Tuteur::all();
        return TuteurResource::collection($tuteurs);
    }

    public function store(StoreTuteurRequest $request)
    {
        $data = $request->validated();
        if (!isset($data['id'])) {
            $data['id'] = (string) \Illuminate\Support\Str::uuid();
        }
        if (!isset($data['cree_le'])) {
            $data['cree_le'] = now();
        }

        $tuteur = Tuteur::create($data);
        return new TuteurResource($tuteur);
    }

    public function show(string $id)
    {
        $tuteur = Tuteur::findOrFail($id);
        return new TuteurResource($tuteur);
    }

    public function update(UpdateTuteurRequest $request, string $id)
    {
        $tuteur = Tuteur::findOrFail($id);
        $tuteur->update($request->validated());
        return new TuteurResource($tuteur);
    }

    public function destroy(string $id)
    {
        $tuteur = Tuteur::findOrFail($id);
        $tuteur->delete();
        return response()->json(['message' => 'Tuteur supprimé avec succès']);
    }
}
