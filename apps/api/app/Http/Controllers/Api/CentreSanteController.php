<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCentreSanteRequest;
use App\Http\Resources\CentreSanteResource;
use App\Models\CentreSante;
use Illuminate\Http\Request;

class CentreSanteController extends Controller
{
    public function index()
    {
        $centres = CentreSante::all();
        return CentreSanteResource::collection($centres);
    }

    public function store(StoreCentreSanteRequest $request)
    {
        $centre = CentreSante::create($request->validated());
        return new CentreSanteResource($centre);
    }

    public function show(string $id)
    {
        $centre = CentreSante::findOrFail($id);
        return new CentreSanteResource($centre);
    }

    public function update(Request $request, string $id)
    {
        $centre = CentreSante::findOrFail($id);
        $centre->update($request->all());
        return new CentreSanteResource($centre);
    }

    public function destroy(string $id)
    {
        $centre = CentreSante::findOrFail($id);
        $centre->delete();
        return response()->json(['message' => 'Centre de santé supprimé avec succès']);
    }
}
