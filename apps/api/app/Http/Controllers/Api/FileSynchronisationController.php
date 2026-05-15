<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FileSynchronisation;
use Illuminate\Http\Request;

class FileSynchronisationController extends Controller
{
    public function index()
    {
        $files = FileSynchronisation::where('statut_sync', 'EN_ATTENTE')->orderBy('cree_le', 'asc')->get();
        return response()->json(['data' => $files]);
    }

    public function store(Request $request)
    {
        $file = FileSynchronisation::create($request->all());
        return response()->json(['data' => $file], 201);
    }

    public function show(string $id)
    {
        $file = FileSynchronisation::findOrFail($id);
        return response()->json(['data' => $file]);
    }

    public function update(Request $request, string $id)
    {
        $file = FileSynchronisation::findOrFail($id);
        $file->update($request->all());
        return response()->json(['data' => $file]);
    }

    public function destroy(string $id)
    {
        $file = FileSynchronisation::findOrFail($id);
        $file->delete();
        return response()->json(['message' => 'File de synchronisation supprimée avec succès']);
    }
}
