<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ModeleCalendrier;
use Illuminate\Http\Request;

class ModeleCalendrierController extends Controller
{
    public function index()
    {
        $modeles = ModeleCalendrier::with('vaccin')->get();
        return response()->json(['data' => $modeles]);
    }

    public function store(Request $request)
    {
        $modele = ModeleCalendrier::create($request->all());
        return response()->json(['data' => $modele], 201);
    }

    public function show(string $id)
    {
        $modele = ModeleCalendrier::with('vaccin')->findOrFail($id);
        return response()->json(['data' => $modele]);
    }

    public function update(Request $request, string $id)
    {
        $modele = ModeleCalendrier::findOrFail($id);
        $modele->update($request->all());
        return response()->json(['data' => $modele]);
    }

    public function destroy(string $id)
    {
        $modele = ModeleCalendrier::findOrFail($id);
        $modele->delete();
        return response()->json(['message' => 'Modèle de calendrier supprimé avec succès']);
    }
}
