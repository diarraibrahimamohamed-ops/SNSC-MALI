<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCentreSanteRequest;
use App\Http\Resources\CentreSanteResource;
use App\Models\CentreSante;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class CentreSanteController extends Controller
{
    use AuthorizesRequests;
    public function index()
    {
        $centres = CentreSante::all();
        return CentreSanteResource::collection($centres);
    }

    public function store(StoreCentreSanteRequest $request)
    {
        $this->authorize('create', CentreSante::class);

        $centre = DB::transaction(function () use ($request) {
            return CentreSante::create($request->validated());
        });

        return new CentreSanteResource($centre);
    }

    public function show(string $id)
    {
        $centre = CentreSante::findOrFail($id);
        $this->authorize('view', $centre);
        return new CentreSanteResource($centre);
    }

    public function update(Request $request, string $id)
    {
        $centre = CentreSante::findOrFail($id);
        $this->authorize('update', $centre);

        $centre = DB::transaction(function () use ($request, $centre) {
            $centre->update($request->all());
            return $centre;
        });

        return new CentreSanteResource($centre);
    }

    public function destroy(string $id)
    {
        $centre = CentreSante::findOrFail($id);
        $this->authorize('delete', $centre);

        DB::transaction(function () use ($centre) {
            $centre->delete();
        });

        return response()->json(['message' => 'Centre de santé supprimé avec succès']);
    }
}
