<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'matricule' => 'required|string',
            'password' => 'required|string',
        ]);

        if (!$token = auth('api')->attempt($credentials)) {
            return response()->json(['message' => 'Identifiants invalides'], 401);
        }

        $agent = auth('api')->user();

        if (!$agent->est_actif) {
            auth('api')->logout();
            return response()->json(['message' => 'Compte désactivé'], 403);
        }

        return $this->respondWithToken($token);
    }

    public function logout()
    {
        auth('api')->logout();
        return response()->json(['message' => 'Déconnexion réussie']);
    }

    public function register(Request $request)
    {
        $request->validate([
            'nom_complet' => 'required|string',
            'matricule' => 'required|string|unique:agents',
            'password' => 'required|string|min:8',
            'centre_sante_id' => 'required|uuid',
            'role' => 'required|string',
        ]);

        $agent = Agent::create([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'nom_complet' => $request->nom_complet,
            'matricule' => $request->matricule,
            'password' => Hash::make($request->password),
            'centre_sante_id' => $request->centre_sante_id,
            'role' => $request->role,
            'telephone' => $request->telephone,
            'est_actif' => true,
        ]);

        return response()->json(['data' => $agent], 201);
    }

    public function me()
    {
        return response()->json(['data' => auth('api')->user()]);
    }

    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
            'agent' => auth('api')->user()
        ]);
    }
}
