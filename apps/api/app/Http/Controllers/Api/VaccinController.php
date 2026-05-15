<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreVaccinRequest;
use App\Http\Resources\VaccinResource;
use App\Models\Vaccin;
use Illuminate\Http\Request;

class VaccinController extends Controller
{
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
        $vaccin = Vaccin::create($request->validated());
        return new VaccinResource($vaccin);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $vaccin = Vaccin::with('modelesCalendrier')->findOrFail($id);
        return new VaccinResource($vaccin);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $vaccin = Vaccin::findOrFail($id);
        $vaccin->update($request->all());
        return new VaccinResource($vaccin);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $vaccin = Vaccin::findOrFail($id);
        $vaccin->delete();
        return response()->json(['message' => 'Vaccin supprimé avec succès']);
    }
}
