<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    public function index(): JsonResponse
    {
        $admins = Admin::with('centreSante')->get();
        return response()->json(['data' => $admins]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'email' => 'required|email|unique:admins,email',
            'password' => 'required|string|min:6',
            'telephone' => 'nullable|string|max:20',
            'role' => 'required|in:super_admin,admin_regional,admin_centre',
            'centre_sante_id' => 'nullable|uuid|exists:centres_sante,id',
            'est_actif' => 'sometimes|boolean',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $admin = Admin::create($validated);

        return response()->json(['message' => 'Admin créé', 'data' => $admin], 201);
    }

    public function show(string $id): JsonResponse
    {
        $admin = Admin::with('centreSante')->find($id);
        
        if (!$admin) {
            return response()->json(['message' => 'Introuvable'], 404);
        }

        return response()->json(['data' => $admin]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $admin = Admin::find($id);
        
        if (!$admin) {
            return response()->json(['message' => 'Introuvable'], 404);
        }

        $validated = $request->validate([
            'nom' => 'sometimes|required|string|max:100',
            'prenom' => 'sometimes|required|string|max:100',
            'email' => 'sometimes|required|email|unique:admins,email,' . $id,
            'password' => 'sometimes|nullable|string|min:6',
            'telephone' => 'sometimes|nullable|string|max:20',
            'role' => 'sometimes|required|in:super_admin,admin_regional,admin_centre',
            'centre_sante_id' => 'sometimes|nullable|uuid|exists:centres_sante,id',
            'est_actif' => 'sometimes|boolean',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $admin->update($validated);

        return response()->json(['message' => 'Admin mis à jour', 'data' => $admin->fresh()]);
    }

    public function destroy(string $id): JsonResponse
    {
        $admin = Admin::find($id);
        
        if (!$admin) {
            return response()->json(['message' => 'Introuvable'], 404);
        }

        $admin->delete();

        return response()->json(['message' => 'Admin supprimé']);
    }
}
