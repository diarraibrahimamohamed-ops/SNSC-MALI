<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreVaccinRequest;
use App\Http\Resources\VaccinResource;
use App\Models\Vaccin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class VaccinController extends Controller
{
    use AuthorizesRequests;
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $vaccins = Vaccin::with('modelesCalendrier')->get();
        return VaccinResource::collection($vaccins);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreVaccinRequest $request)
    {
        $this->authorize('create', Vaccin::class);

        $vaccin = DB::transaction(function () use ($request) {
            return Vaccin::create($request->validated());
        });

        return new VaccinResource($vaccin);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $vaccin = Vaccin::with('modelesCalendrier')->findOrFail($id);
        $this->authorize('view', $vaccin);
        return new VaccinResource($vaccin);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $vaccin = Vaccin::findOrFail($id);
        $this->authorize('update', $vaccin);

        $vaccin = DB::transaction(function () use ($request, $vaccin) {
            $vaccin->update($request->all());
            return $vaccin;
        });

        return new VaccinResource($vaccin);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $vaccin = Vaccin::findOrFail($id);
        $this->authorize('delete', $vaccin);

        DB::transaction(function () use ($vaccin) {
            $vaccin->delete();
        });

        return response()->json(['message' => 'Vaccin supprimé avec succès']);
    }
}
