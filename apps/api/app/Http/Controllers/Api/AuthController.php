<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\AgentSante;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'matricule' => 'required|string',
            'password' => 'required|string',
        ]);

        $credentials = $request->only('matricule', 'password');

        if (! $token = auth('api')->attempt($credentials)) {
            return response()->json(['message' => 'Identifiants invalides'], 401);
        }

        return $this->respondWithToken($token);
    }

    public function me()
    {
        $user = auth('api')->user();
        if ($user) {
            $user->load('centreSante');
            // Format to match frontend expectations with 'data' wrapper
            return response()->json([
                'data' => [
                    'id' => $user->agentId,
                    'nom' => $user->nom,
                    'role' => $user->role,
                    'matricule' => $user->matricule,
                    'centre_sante_id' => $user->centreId,
                    'centreSante' => $user->centreSante
                ]
            ]);
        }
        return response()->json(['message' => 'Non authentifié'], 401);
    }

    public function logout()
    {
        auth('api')->logout();
        return response()->json(['message' => 'Déconnexion réussie']);
    }

    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
            'user' => $this->me()->original
        ]);
    }
}
