<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class AgentController extends Controller
{
    use AuthorizesRequests;
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $agents = Agent::with('centreSante')->get();
        return response()->json(['data' => $agents]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', Agent::class);

        $agent = DB::transaction(function () use ($request) {
            return Agent::create($request->all());
        });

        return response()->json(['data' => $agent], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $agent = Agent::with('centreSante')->findOrFail($id);
        $this->authorize('view', $agent);
        return response()->json(['data' => $agent]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $agent = Agent::findOrFail($id);
        $this->authorize('update', $agent);

        $agent = DB::transaction(function () use ($request, $agent) {
            $agent->update($request->all());
            return $agent;
        });

        return response()->json(['data' => $agent]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $agent = Agent::findOrFail($id);
        $this->authorize('delete', $agent);

        DB::transaction(function () use ($agent) {
            $agent->delete();
        });

        return response()->json(['message' => 'Agent supprimé avec succès']);
    }
}
