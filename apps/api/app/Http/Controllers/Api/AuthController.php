<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agent;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'matricule' => 'required|string',
            'password' => 'required|string',
        ]);

        // Try agent authentication first
        if ($token = auth('api')->attempt($credentials)) {
            $agent = auth('api')->user();
            if (!$agent->est_actif) {
                auth('api')->logout();
                return response()->json(['message' => 'Compte désactivé'], 403);
            }
            return $this->respondWithToken($token);
        }

        // If agent auth fails, try admin table (matricule based)
        $admin = Admin::where('matricule', $request->string('matricule'))->first();
        if ($admin && Hash::check($request->string('password'), $admin->password)) {
            if (! $admin->est_actif) {
                return response()->json(['message' => 'Compte administrateur désactivé'], 403);
            }
            $token = JWTAuth::fromUser($admin);
            // Return in same format as agent for frontend consistency
            return response()->json([
                'access_token' => $token,
                'token_type' => 'bearer',
                'expires_in' => auth('api')->factory()->getTTL() * 60,
                'admin' => $admin->toArray(),
            ]);
        }

        return response()->json(['message' => 'Identifiants invalides'], 401);
    }

    public function logout()
    {
        auth('api')->logout();
        return response()->json(['message' => 'Déconnexion réussie']);
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
